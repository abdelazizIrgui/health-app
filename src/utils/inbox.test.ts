import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  EMPTY_INBOX,
  dueReminders,
  makeItem,
  markAllRead,
  markRead,
  mergeItems,
  parseInbox,
  unreadCount,
} from './inbox';
import { DEFAULT_REMINDERS } from './reminders';

const at = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m - 1, d, h, min, 0);

test('parseInbox: nothing saved or damaged text gives an empty inbox', () => {
  assert.deepEqual(parseInbox(null, 5), EMPTY_INBOX(5));
  assert.deepEqual(parseInbox('not json', 5), EMPTY_INBOX(5));
  assert.deepEqual(parseInbox('42', 5), EMPTY_INBOX(5));
});

test('parseInbox: drops broken items and keeps the newest first', () => {
  const a = makeItem('daily', at(2026, 10, 1, 21));
  const b = makeItem('daily', at(2026, 10, 2, 21));
  const raw = JSON.stringify({ items: [a, { id: 1 }, b], checkedAt: 99 });
  const parsed = parseInbox(raw, 5);
  assert.deepEqual(parsed.items.map((i) => i.id), [b.id, a.id]);
  assert.equal(parsed.checkedAt, 99);
});

test('mergeItems: never stores the same message twice and keeps its read state', () => {
  const a = { ...makeItem('daily', at(2026, 10, 1, 21)), read: true };
  const again = makeItem('daily', at(2026, 10, 1, 21));
  const merged = mergeItems([a], [again]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].read, true);
});

test('read / unread helpers', () => {
  const a = makeItem('daily', at(2026, 10, 1, 21));
  const b = makeItem('period', at(2026, 10, 2, 9));
  assert.equal(unreadCount([a, b]), 2);
  assert.equal(unreadCount(markRead([a, b], a.id)), 1);
  assert.equal(unreadCount(markAllRead([a, b])), 0);
});

test('dueReminders: nothing when both reminders are off', () => {
  const out = dueReminders(DEFAULT_REMINDERS, null, at(2026, 10, 1).getTime(), at(2026, 10, 5).getTime());
  assert.equal(out.length, 0);
});

test('dueReminders: one daily message for each day whose time has passed', () => {
  const settings = { ...DEFAULT_REMINDERS, daily: true, hour: 21, minute: 0 };
  // Oct 1 22:00 -> Oct 4 10:00: the 21:00 messages of Oct 2 and Oct 3 are due.
  const out = dueReminders(settings, null, at(2026, 10, 1, 22).getTime(), at(2026, 10, 4, 10).getTime());
  assert.deepEqual(out.map((i) => i.id).sort(), ['daily-2026-10-02', 'daily-2026-10-03']);
});

test('dueReminders: a message at exactly the checked time is not repeated', () => {
  const settings = { ...DEFAULT_REMINDERS, daily: true, hour: 21, minute: 0 };
  const out = dueReminders(settings, null, at(2026, 10, 1, 21).getTime(), at(2026, 10, 1, 23).getTime());
  assert.equal(out.length, 0);
});

test('dueReminders: only the last two weeks come back after a long absence', () => {
  const settings = { ...DEFAULT_REMINDERS, daily: true };
  const out = dueReminders(settings, null, at(2026, 1, 1).getTime(), at(2026, 10, 5, 23).getTime());
  assert.ok(out.length <= 15 && out.length >= 14);
});

test('dueReminders: the period heads-up arrives once its day and hour have passed', () => {
  const settings = { ...DEFAULT_REMINDERS, period: true, periodDaysBefore: 2 };
  const forecast = { earliestStart: at(2026, 10, 10), cycleLength: 28 };
  // Heads-up is Oct 8 at 09:00.
  const before = dueReminders(settings, forecast, at(2026, 10, 7).getTime(), at(2026, 10, 8, 8).getTime());
  const after = dueReminders(settings, forecast, at(2026, 10, 7).getTime(), at(2026, 10, 8, 10).getTime());
  assert.equal(before.length, 0);
  assert.deepEqual(after.map((i) => i.id), ['period-2026-10-08']);
});