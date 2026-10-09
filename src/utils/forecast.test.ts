import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildForecast, toIsoDate } from './forecast';

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

// Four periods exactly 28 days apart: 1 Jan, 29 Jan, 26 Feb, 26 Mar.
const regular = [
  { start: '2026-01-01', end: '2026-01-05' },
  { start: '2026-01-29', end: '2026-02-02' },
  { start: '2026-02-26', end: '2026-03-02' },
  { start: '2026-03-26', end: '2026-03-30' },
];

test('regular cycles: average of 28 days and one single predicted day', () => {
  const f = buildForecast(regular, null, day(2026, 4, 5));
  assert.ok(f);
  assert.equal(f.cycleLength, 28);
  assert.equal(f.irregular, false);
  assert.equal(toIsoDate(f.nextStart), '2026-04-23');
  assert.equal(f.cyclesUsed, 3);
});

test('regular cycles: the cycle day counts from the first day of the last period', () => {
  const f = buildForecast(regular, null, day(2026, 4, 5));
  assert.ok(f);
  assert.equal(f.day, 11); // 26 Mar is day 1, so 5 Apr is day 11
});

test('irregular cycles (more than 7 days apart) give a range and no fertile window decision', () => {
  const periods = [
    { start: '2026-01-01' },
    { start: '2026-01-25' }, // 24 days
    { start: '2026-03-01' }, // 35 days
    { start: '2026-03-27' }, // 26 days
  ];
  const f = buildForecast(periods, null, day(2026, 4, 5));
  assert.ok(f);
  assert.equal(f.irregular, true);
  assert.ok(f.earliestStart.getTime() < f.latestStart.getTime());
});

test('a gap shorter than 15 days is ignored (probably spotting or a wrong tap)', () => {
  const periods = [
    { start: '2026-01-01' },
    { start: '2026-01-08' }, // 7 days: ignored
    { start: '2026-01-29' }, // 21 days from the 8th, 28 from the 1st
  ];
  const f = buildForecast(periods, null, day(2026, 2, 5));
  assert.ok(f);
  assert.equal(f.cyclesUsed, 1);
  assert.equal(f.cycleLength, 21);
});

test('a period that is still open counts as bleeding today', () => {
  const periods = [...regular.slice(0, 3), { start: '2026-03-26' }];
  const f = buildForecast(periods, null, day(2026, 3, 27));
  assert.ok(f);
  assert.equal(f.onPeriod, true);
  assert.equal(f.openPeriod, true);
});

test('long after the expected range the forecast says the period is late', () => {
  const f = buildForecast(regular, null, day(2026, 5, 10));
  assert.ok(f);
  assert.ok(f.daysLate > 0);
});

test('no logged period and no questionnaire answer gives no forecast', () => {
  assert.equal(buildForecast([], null, day(2026, 4, 5)), null);
});

test('the questionnaire answer is the starting point when nothing is logged', () => {
  const f = buildForecast(
    [],
    { lastPeriodStart: day(2026, 3, 26), cycleLength: 30, periodLength: 5 },
    day(2026, 4, 5)
  );
  assert.ok(f);
  assert.equal(f.cycleLength, 30);
  assert.equal(toIsoDate(f.nextStart), '2026-04-25');
});

test('questionnaire says rarely regular: a range from day one, not a single day', () => {
  const f = buildForecast(
    [],
    { lastPeriodStart: day(2026, 3, 26), cycleLength: 30, periodLength: 5, spreadDays: 14 },
    day(2026, 4, 5)
  );
  assert.ok(f);
  assert.equal(f.irregular, true);
  assert.equal(toIsoDate(f.earliestStart), '2026-04-18');
  assert.equal(toIsoDate(f.latestStart), '2026-05-02');
});

test('one measured cycle is blended with the questionnaire answer', () => {
  const f = buildForecast(
    [{ start: '2026-03-21' }],
    { lastPeriodStart: day(2026, 3, 1), cycleLength: 30, periodLength: 5 },
    day(2026, 4, 1)
  );
  assert.ok(f);
  assert.equal(f.cycleLength, 27); // (20 + 2 * 30) / 3
  assert.equal(toIsoDate(f.nextStart), '2026-04-17');
});

test('hormonal contraception: the fertile phase never appears', () => {
  const seed = {
    lastPeriodStart: day(2026, 3, 1),
    cycleLength: 28,
    periodLength: 5,
    noFertileWindow: true,
  };
  // Cycle day 13 is normally "fertile" for a 28-day cycle.
  const f = buildForecast([], seed, day(2026, 3, 13));
  assert.ok(f);
  assert.equal(f.noFertile, true);
  assert.notEqual(f.phase, 'fertile');
});