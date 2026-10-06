import type { DayLog } from '../data/logOptions';
import { MOOD_OPTIONS, SYMPTOM_OPTIONS } from '../data/logOptions';
import type { CycleSettings } from './cycle';
import { buildForecast, fromIsoDate, PeriodEntry, toIsoDate } from './forecast';
import { HealthAlert, buildHealthAlerts } from './healthAlerts';
import { Insights, buildInsights } from './insights';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_ROWS = 12; // the last 12 periods fit on one or two pages
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const diffDays = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);

export interface ReportRow {
  start: Date;
  end: Date | null; // null while the period is still going on
  bleedingDays: number | null;
  /** Days from the previous period's start to this one (null for the first row). */
  cycleDays: number | null;
}

export interface ReportData {
  name: string;
  age: number | null;
  createdAt: Date;
  insights: Insights;
  lastStart: Date | null;
  /** Expected start of the next period; `to` differs from `from` only for irregular cycles. */
  nextPeriod: { from: Date; to: Date } | null;
  /** Newest first. */
  rows: ReportRow[];
  heavyDays: number;
  alerts: HealthAlert[];
}

interface Input {
  name: string;
  birthDate?: string;
  periods: PeriodEntry[];
  logs: Record<string, DayLog>;
  seed: CycleSettings | null;
  /** True while predictions are paused (pregnancy): no next period, no health notes. */
  paused?: boolean;
  today?: Date;
}

/** Collects everything the report shows. No text here: the HTML builder adds the wording. */
export function buildReportData({
  name,
  birthDate,
  periods,
  logs,
  seed,
  paused = false,
  today = new Date(),
}: Input): ReportData {
  // Logged periods plus the questionnaire's last period if she has not logged it.
  const entries: PeriodEntry[] = [...periods];
  if (seed && !entries.some((p) => p.start === toIsoDate(seed.lastPeriodStart))) {
    const end = new Date(
      seed.lastPeriodStart.getFullYear(),
      seed.lastPeriodStart.getMonth(),
      seed.lastPeriodStart.getDate() + seed.periodLength - 1
    );
    entries.push({ start: toIsoDate(seed.lastPeriodStart), end: toIsoDate(end) });
  }
  entries.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

  const rows: ReportRow[] = entries.map((p, i) => {
    const start = fromIsoDate(p.start);
    const end = p.end ? fromIsoDate(p.end) : null;
    const bleeding = end ? diffDays(start, end) + 1 : null;
    return {
      start,
      end,
      bleedingDays: bleeding !== null && bleeding >= 1 ? bleeding : null,
      cycleDays: i > 0 ? diffDays(fromIsoDate(entries[i - 1].start), start) : null,
    };
  });

  const forecast = paused ? null : buildForecast(periods, seed, today);

  let age: number | null = null;
  if (birthDate) {
    const b = fromIsoDate(birthDate);
    age = today.getFullYear() - b.getFullYear();
    const hadBirthday =
      today.getMonth() > b.getMonth() ||
      (today.getMonth() === b.getMonth() && today.getDate() >= b.getDate());
    if (!hadBirthday) age -= 1;
    if (age < 0 || age > 120) age = null;
  }

  return {
    name,
    age,
    createdAt: today,
    insights: buildInsights(periods, seed, logs),
    lastStart: rows.length ? rows[rows.length - 1].start : null,
    nextPeriod: forecast ? { from: forecast.earliestStart, to: forecast.latestStart } : null,
    rows: rows.slice(-MAX_ROWS).reverse(),
    heavyDays: Object.values(logs).filter((l) => l.flow === 'heavy').length,
    alerts: paused ? [] : buildHealthAlerts({ periods, logs, seed, birthDate, today }),
  };
}

// ---------------------------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------------------------

type T = (key: string, params?: Record<string, string | number>) => string;
type FormatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => string;

export interface ReportContext {
  t: T;
  formatDate: FormatDate;
  language: string; // "en", "ar", ...
  rtl: boolean;
}

/** Everything that comes from the user or from translations goes through this. */
export const escapeHtml = (value: unknown): string =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const CSS = `
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #2B1E2E;
         font-size: 12px; line-height: 1.5; }
  h1 { margin: 0; font-size: 24px; color: #D6336C; }
  h2 { margin: 22px 0 8px; font-size: 14px; color: #D6336C; border-bottom: 1px solid #F1D3DE; padding-bottom: 4px; }
  .meta { margin-top: 6px; color: #7C6B80; }
  .grid { display: table; width: 100%; border-collapse: separate; border-spacing: 0 6px; }
  .item { display: table-row; }
  .item .k { display: table-cell; width: 45%; color: #7C6B80; padding-inline-end: 12px; }
  .item .v { display: table-cell; font-weight: 600; }
  table.data { width: 100%; border-collapse: collapse; }
  table.data th, table.data td { padding: 6px 8px; border-bottom: 1px solid #F1D3DE; text-align: start; }
  table.data th { background: #FFF0F5; font-weight: 600; }
  ul { margin: 0; padding-inline-start: 18px; }
  li { margin: 2px 0; }
  .note { margin: 4px 0; padding: 8px 10px; background: #FFF0F5; border-radius: 6px; }
  .disclaimer { margin-top: 26px; padding-top: 10px; border-top: 1px solid #F1D3DE; color: #7C6B80; font-size: 11px; }
  .footer { margin-top: 6px; color: #7C6B80; font-size: 10px; }
`;

/** The report as a page of HTML, ready for expo-print. */
export function buildReportHtml(
  data: ReportData,
  { t, formatDate, language, rtl }: ReportContext
): string {
  const days = (n: number) => t('insights.days', { n });
  const date = (d: Date) => formatDate(d, { day: 'numeric', month: 'short', year: 'numeric' });
  const e = escapeHtml;

  const item = (k: string, v: string) =>
    `<div class="item"><span class="k">${e(k)}</span><span class="v">${e(v)}</span></div>`;

  const { insights } = data;

  // ----- header
  const meta = [
    data.name ? `${t('report.name')}: ${data.name}` : '',
    data.age !== null ? `${t('report.age')}: ${data.age}` : '',
    `${t('report.created')}: ${date(data.createdAt)}`,
  ]
    .filter(Boolean)
    .map(e)
    .join(' &nbsp;·&nbsp; ');

  // ----- summary
  const regularity =
    insights.regular === null
      ? t('insights.needMore')
      : insights.regular
        ? t('insights.regular')
        : t('insights.irregular');
  const summary: string[] = [];
  summary.push(
    item(t('insights.avgCycle'), insights.averageCycle !== null ? days(insights.averageCycle) : '—')
  );
  summary.push(
    item(
      t('insights.avgPeriod'),
      insights.averagePeriod !== null ? days(insights.averagePeriod) : '—'
    )
  );
  summary.push(item(t('insights.regularity'), regularity));
  if (insights.shortest !== null && insights.longest !== null) {
    summary.push(item('', t('insights.range', { min: insights.shortest, max: insights.longest })));
  }
  summary.push(item(t('report.lastPeriod'), data.lastStart ? date(data.lastStart) : '—'));
  if (data.nextPeriod) {
    const { from, to } = data.nextPeriod;
    const same = from.getTime() === to.getTime();
    summary.push(item(t('report.nextPeriod'), same ? date(from) : `${date(from)} – ${date(to)}`));
  }
  summary.push(item(t('report.heavyDays'), String(data.heavyDays)));
  summary.push(item('', t('insights.daysLogged', { n: insights.daysLogged })));

  // ----- history
  const history = data.rows.length
    ? `<table class="data"><thead><tr>
        <th>${e(t('report.colStart'))}</th><th>${e(t('report.colEnd'))}</th>
        <th>${e(t('report.colBleeding'))}</th><th>${e(t('report.colCycle'))}</th>
      </tr></thead><tbody>${data.rows
        .map(
          (r) => `<tr>
        <td>${e(date(r.start))}</td>
        <td>${e(r.end ? date(r.end) : t('report.ongoing'))}</td>
        <td>${e(r.bleedingDays !== null ? days(r.bleedingDays) : '—')}</td>
        <td>${e(r.cycleDays !== null ? days(r.cycleDays) : '—')}</td>
      </tr>`
        )
        .join('')}</tbody></table>`
    : `<p>${e(t('report.noPeriods'))}</p>`;

  // ----- symptoms and moods
  const counts = (
    items: { id: string; count: number }[],
    options: { id: string; labelKey: string }[]
  ) =>
    items.length
      ? `<ul>${items
          .map((i) => {
            const option = options.find((o) => o.id === i.id);
            return `<li>${e(option ? t(option.labelKey) : i.id)} — ${e(days(i.count))}</li>`;
          })
          .join('')}</ul>`
      : '';
  const symptoms = counts(insights.topSymptoms, SYMPTOM_OPTIONS);
  const moods = counts(insights.topMoods, MOOD_OPTIONS);

  // ----- health notes
  const notes = data.alerts.length
    ? data.alerts.map((a) => `<div class="note">${e(t(`alerts.${a.id}`, a.params))}</div>`).join('')
    : `<p>${e(t('report.noNotes'))}</p>`;

  return `<!DOCTYPE html>
<html lang="${e(language)}" dir="${rtl ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"><title>${e(t('report.title'))}</title><style>${CSS}</style></head>
<body>
  <h1>${e(t('report.title'))}</h1>
  <div class="meta">${meta}</div>

  <h2>${e(t('report.summary'))}</h2>
  <div class="grid">${summary.join('')}</div>

  <h2>${e(t('report.history'))}</h2>
  ${history}
  ${symptoms ? `<h2>${e(t('insights.commonSymptoms'))}</h2>${symptoms}` : ''}
  ${moods ? `<h2>${e(t('insights.commonMoods'))}</h2>${moods}` : ''}

  <h2>${e(t('report.notes'))}</h2>
  ${notes}

  <div class="disclaimer">${e(t('report.disclaimer'))}</div>
  <div class="footer">${e(t('report.footer'))}</div>
</body>
</html>`;
}