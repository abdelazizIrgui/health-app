/** Rules of the notification inbox. No phone code in here, so they can be tested. */

import { ReminderForecast, ReminderSettings, periodReminderDates } from './reminders';
import { toIsoDate } from './forecast';

export type InboxKind = 'daily' | 'period';

/** One message that reached her as a notification. The text is made from `kind` when shown. */
export interface InboxItem {
  id: string; // "daily-2026-10-06": the same notification is never stored twice
  kind: InboxKind;
  at: number; // when it was delivered (ms)
  read: boolean;
}

export interface InboxState {
  items: InboxItem[];
  /** Up to this moment, due reminders were already added to the inbox. */
  checkedAt: number;
}

export const MAX_ITEMS = 100;
/** If the app was closed for a long time, only the last days are brought back. */
export const MAX_BACKFILL_DAYS = 14;

export const EMPTY_INBOX = (now: number): InboxState => ({ items: [], checkedAt: now });

const isKind = (v: unknown): v is InboxKind => v === 'daily' || v === 'period';

/** Reads the saved text. Anything unexpected is dropped, item by item. */
export function parseInbox(raw: string | null, now: number): InboxState {
  if (!raw) return EMPTY_INBOX(now);
  try {
    const r = JSON.parse(raw);
    if (typeof r !== 'object' || r === null) return EMPTY_INBOX(now);
    const items: InboxItem[] = Array.isArray(r.items)
      ? r.items.filter(
          (i: unknown): i is InboxItem =>
            typeof i === 'object' &&
            i !== null &&
            typeof (i as InboxItem).id === 'string' &&
            isKind((i as InboxItem).kind) &&
            typeof (i as InboxItem).at === 'number' &&
            typeof (i as InboxItem).read === 'boolean'
        )
      : [];
    return {
      items: sortAndCap(items),
      checkedAt: typeof r.checkedAt === 'number' ? r.checkedAt : now,
    };
  } catch {
    return EMPTY_INBOX(now);
  }
}

const sortAndCap = (items: InboxItem[]) =>
  [...items].sort((a, b) => b.at - a.at).slice(0, MAX_ITEMS);

/** Adds new items; one that is already there keeps its "read" state. */
export function mergeItems(current: InboxItem[], incoming: InboxItem[]): InboxItem[] {
  const known = new Set(current.map((i) => i.id));
  const fresh = incoming.filter((i, idx) => !known.has(i.id) && incoming.findIndex((x) => x.id === i.id) === idx);
  return fresh.length === 0 ? current : sortAndCap([...current, ...fresh]);
}

export const unreadCount = (items: InboxItem[]) => items.filter((i) => !i.read).length;

export const markRead = (items: InboxItem[], id: string): InboxItem[] =>
  items.map((i) => (i.id === id && !i.read ? { ...i, read: true } : i));

export const markAllRead = (items: InboxItem[]): InboxItem[] =>
  unreadCount(items) === 0 ? items : items.map((i) => (i.read ? i : { ...i, read: true }));

export const makeItem = (kind: InboxKind, at: Date): InboxItem => ({
  id: `${kind}-${toIsoDate(at)}`,
  kind,
  at: at.getTime(),
  read: false,
});

/**
 * The reminders that should have been delivered between `since` (excluded) and `now` (included),
 * following her current settings. This is how messages are found even if the phone showed the
 * notification while the app was closed and she swiped it away.
 */
export function dueReminders(
  settings: ReminderSettings,
  forecast: ReminderForecast | null,
  since: number,
  now: number
): InboxItem[] {
  const out: InboxItem[] = [];
  const earliest = Math.max(since, now - MAX_BACKFILL_DAYS * 24 * 60 * 60 * 1000);
  if (earliest >= now) return out;

  if (settings.daily) {
    const first = new Date(earliest);
    for (let k = 0; k <= MAX_BACKFILL_DAYS + 1; k++) {
      const when = new Date(
        first.getFullYear(),
        first.getMonth(),
        first.getDate() + k,
        settings.hour,
        settings.minute,
        0
      );
      if (when.getTime() > now) break;
      if (when.getTime() > earliest) out.push(makeItem('daily', when));
    }
  }

  if (settings.period && forecast) {
    // periodReminderDates only returns dates after the "now" it is given.
    for (const when of periodReminderDates(forecast, settings.periodDaysBefore, new Date(earliest))) {
      if (when.getTime() <= now) out.push(makeItem('period', when));
    }
  }
  return out;
}