import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildMarks } from './calendarDays';
import { buildForecast } from './forecast';

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

const periods = [
  { start: '2026-01-01', end: '2026-01-05' },
  { start: '2026-01-29', end: '2026-02-02' },
  { start: '2026-02-26', end: '2026-03-02' },
  { start: '2026-03-26', end: '2026-03-30' },
];
const today = day(2026, 4, 5);

test('logged period days are marked as period', () => {
  const marks = buildMarks(periods, null, buildForecast(periods, null, today), today);
  assert.equal(marks['2026-03-26']?.period, true);
  assert.equal(marks['2026-03-30']?.period, true);
  assert.equal(marks['2026-03-31']?.period, undefined);
});

test('the next period is predicted only on days after today', () => {
  const marks = buildMarks(periods, null, buildForecast(periods, null, today), today);
  assert.equal(marks['2026-04-23']?.predicted, true);
  assert.equal(marks['2026-03-28']?.predicted, undefined); // past days are never predicted
});

test('the fertile window is marked before the next period', () => {
  const marks = buildMarks(periods, null, buildForecast(periods, null, today), today);
  // Next period 23 Apr, ovulation about 9 Apr: fertile from 4 Apr to 10 Apr, today (5 Apr) included.
  assert.equal(marks['2026-04-09']?.fertile, true);
});

test('without a forecast only real periods are painted', () => {
  const marks = buildMarks(periods, null, null, today);
  assert.equal(marks['2026-03-26']?.period, true);
  assert.equal(marks['2026-04-23'], undefined);
});