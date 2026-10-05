import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { DayLog } from '../data/logOptions';
import { buildHealthAlerts } from './healthAlerts';

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const ids = (alerts: { id: string }[]) => alerts.map((a) => a.id);
const noLogs: Record<string, DayLog> = {};

test('a normal 28-day cycle gives no alert', () => {
  const alerts = buildHealthAlerts({
    periods: [
      { start: '2026-03-01', end: '2026-03-05' },
      { start: '2026-03-29', end: '2026-04-02' },
    ],
    logs: noLogs,
    seed: null,
    today: day(2026, 4, 5),
  });
  assert.deepEqual(alerts, []);
});

test('a cycle shorter than 21 days is mentioned', () => {
  const alerts = buildHealthAlerts({
    periods: [{ start: '2026-03-01' }, { start: '2026-03-19' }], // 18 days
    logs: noLogs,
    seed: null,
    today: day(2026, 3, 25),
  });
  assert.deepEqual(ids(alerts), ['shortCycle']);
  assert.equal(alerts[0].params.n, 18);
});

test('a cycle longer than 35 days is mentioned for an adult', () => {
  const alerts = buildHealthAlerts({
    periods: [{ start: '2026-02-01', end: '2026-02-05' }, { start: '2026-03-13', end: '2026-03-17' }], // 40 days
    logs: noLogs,
    seed: null,
    birthDate: '1995-05-05',
    today: day(2026, 3, 20),
  });
  assert.deepEqual(ids(alerts), ['longCycle']);
});

test('the same 40-day cycle is fine for a teenager (limit is 45)', () => {
  const alerts = buildHealthAlerts({
    periods: [{ start: '2026-02-01', end: '2026-02-05' }, { start: '2026-03-13', end: '2026-03-17' }],
    logs: noLogs,
    seed: null,
    birthDate: '2011-05-05',
    today: day(2026, 3, 20),
  });
  assert.deepEqual(alerts, []);
});

test('heavy flow on 3 of the last 7 days is mentioned', () => {
  const logs: Record<string, DayLog> = {
    '2026-03-03': { flow: 'heavy' },
    '2026-03-04': { flow: 'heavy' },
    '2026-03-05': { flow: 'heavy' },
  };
  const alerts = buildHealthAlerts({
    periods: [{ start: '2026-03-01' }],
    logs,
    seed: null,
    today: day(2026, 3, 5),
  });
  assert.ok(ids(alerts).includes('heavyFlow'));
});

test('heavy flow on only 2 days is not mentioned', () => {
  const logs: Record<string, DayLog> = {
    '2026-03-04': { flow: 'heavy' },
    '2026-03-05': { flow: 'heavy' },
  };
  const alerts = buildHealthAlerts({
    periods: [{ start: '2026-03-01' }],
    logs,
    seed: null,
    today: day(2026, 3, 5),
  });
  assert.ok(!ids(alerts).includes('heavyFlow'));
});

test('no period for 90 days or more is mentioned, and nothing else is added', () => {
  const alerts = buildHealthAlerts({
    periods: [{ start: '2026-01-01' }],
    logs: noLogs,
    seed: null,
    today: day(2026, 4, 5),
  });
  assert.deepEqual(ids(alerts), ['missed']);
});

test('bleeding for more than 7 days is mentioned', () => {
  const alerts = buildHealthAlerts({
    periods: [{ start: '2026-03-01', end: '2026-03-09' }], // 9 days
    logs: noLogs,
    seed: null,
    today: day(2026, 3, 12),
  });
  assert.deepEqual(ids(alerts), ['longPeriod']);
  assert.equal(alerts[0].params.n, 9);
});

test('nothing logged gives no alert', () => {
  const alerts = buildHealthAlerts({ periods: [], logs: noLogs, seed: null, today: day(2026, 4, 5) });
  assert.deepEqual(alerts, []);
});