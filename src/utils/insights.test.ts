import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildInsights } from './insights';

const periods = [
  { start: '2026-06-01', end: '2026-06-05' },
  { start: '2026-06-29', end: '2026-07-03' }, // 28
  { start: '2026-07-28', end: '2026-08-01' }, // 29
  { start: '2026-08-27', end: '2026-08-31' }, // 30
  { start: '2026-09-30' }, // 34
];

test('cycle numbers: average, shortest, longest and regularity', () => {
  const r = buildInsights(periods, null, {});
  assert.deepEqual(r.recent, [28, 29, 30, 34]);
  assert.equal(r.averageCycle, 30);
  assert.equal(r.shortest, 28);
  assert.equal(r.longest, 34);
  assert.equal(r.regular, true); // spread of 6 days
  assert.equal(r.averagePeriod, 5);
});

test('cycles that differ by more than 7 days are irregular', () => {
  const r = buildInsights(
    [{ start: '2026-01-01' }, { start: '2026-01-23' }, { start: '2026-03-01' }, { start: '2026-03-27' }],
    null,
    {}
  );
  assert.equal(r.regular, false);
});

test('fewer than 3 cycles: regularity is not decided yet', () => {
  const r = buildInsights(periods.slice(0, 3), null, {});
  assert.equal(r.regular, null);
});

test('no data gives empty numbers, not zeros', () => {
  const r = buildInsights([], null, {});
  assert.equal(r.averageCycle, null);
  assert.equal(r.averagePeriod, null);
  assert.deepEqual(r.topSymptoms, []);
  assert.equal(r.daysLogged, 0);
});

test('symptoms and moods are counted and sorted', () => {
  const r = buildInsights([], null, {
    '2026-09-30': { symptoms: ['cramps', 'headache'], mood: 'sad' },
    '2026-10-01': { symptoms: ['cramps'], mood: 'sad' },
    '2026-10-02': { mood: 'calm' },
  });
  assert.deepEqual(r.topSymptoms[0], { id: 'cramps', count: 2 });
  assert.deepEqual(r.topMoods[0], { id: 'sad', count: 2 });
  assert.equal(r.daysLogged, 3);
});