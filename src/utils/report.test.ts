import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildReportData, buildReportHtml, escapeHtml } from './report';

const today = new Date(2026, 9, 5); // 5 Oct 2026
const t = (key: string, params?: Record<string, string | number>) =>
  params ? `${key}(${Object.values(params).join(',')})` : key;
const formatDate = (d: Date) => d.toISOString().slice(0, 10);
const ctx = { t, formatDate, language: 'en', rtl: false };

const periods = [
  { start: '2026-07-01', end: '2026-07-05' },
  { start: '2026-07-30', end: '2026-08-03' },
  { start: '2026-08-28', end: '2026-09-01' },
  { start: '2026-09-26', end: '2026-09-30' },
];

test('escapeHtml escapes the characters that can break the page', () => {
  assert.equal(
    escapeHtml(`<b>"Sara" & 'Co'</b>`),
    '&lt;b&gt;&quot;Sara&quot; &amp; &#39;Co&#39;&lt;/b&gt;'
  );
});

test('buildReportData: rows are newest first with cycle and bleeding lengths', () => {
  const data = buildReportData({ name: 'Sara', periods, logs: {}, seed: null, today });
  assert.equal(data.rows.length, 4);
  assert.equal(data.rows[0].start.getMonth(), 8); // September, the newest
  assert.equal(data.rows[0].cycleDays, 29);
  assert.equal(data.rows[0].bleedingDays, 5);
  assert.equal(data.rows[3].cycleDays, null); // the oldest has no previous period
  assert.equal(data.lastStart?.getDate(), 26);
});

test('buildReportData: age counts the birthday only once it has passed', () => {
  const before = buildReportData({
    name: 'S',
    birthDate: '2000-10-06',
    periods,
    logs: {},
    seed: null,
    today,
  });
  const after = buildReportData({
    name: 'S',
    birthDate: '2000-10-05',
    periods,
    logs: {},
    seed: null,
    today,
  });
  assert.equal(before.age, 25);
  assert.equal(after.age, 26);
});

test('buildReportData: an open period has no end and no bleeding length', () => {
  const data = buildReportData({
    name: 'S',
    periods: [{ start: '2026-10-03' }],
    logs: {},
    seed: null,
    today,
  });
  assert.equal(data.rows[0].end, null);
  assert.equal(data.rows[0].bleedingDays, null);
});

test('buildReportData: counts heavy flow days and keeps only the last 12 periods', () => {
  const many = Array.from({ length: 20 }, (_, i) => ({
    start: `2025-${String(1 + Math.floor(i / 2)).padStart(2, '0')}-${i % 2 ? '20' : '01'}`,
  }));
  const data = buildReportData({
    name: 'S',
    periods: many,
    logs: { '2026-09-27': { flow: 'heavy' }, '2026-09-28': { flow: 'light' } },
    seed: null,
    today,
  });
  assert.equal(data.rows.length, 12);
  assert.equal(data.heavyDays, 1);
});

test('buildReportData: paused (pregnancy) shows no next period and no health notes', () => {
  const data = buildReportData({ name: 'S', periods, logs: {}, seed: null, paused: true, today });
  assert.equal(data.nextPeriod, null);
  assert.deepEqual(data.alerts, []);
});

test('buildReportHtml: the name is escaped, so it cannot inject markup', () => {
  const data = buildReportData({
    name: '<script>alert(1)</script>',
    periods,
    logs: {},
    seed: null,
    today,
  });
  const html = buildReportHtml(data, ctx);
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('buildReportHtml: right-to-left languages set dir and lang', () => {
  const data = buildReportData({ name: 'S', periods, logs: {}, seed: null, today });
  const html = buildReportHtml(data, { ...ctx, language: 'ar', rtl: true });
  assert.ok(html.includes('<html lang="ar" dir="rtl">'));
});

test('buildReportHtml: with no periods it says so instead of showing an empty table', () => {
  const data = buildReportData({ name: 'S', periods: [], logs: {}, seed: null, today });
  const html = buildReportHtml(data, ctx);
  assert.ok(html.includes('report.noPeriods'));
  assert.ok(!html.includes('<table'));
});