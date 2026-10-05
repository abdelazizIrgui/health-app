import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildBackup, parseBackup } from './backup';

const user = {
  name: 'Sara',
  email: 'sara@example.com',
  phone: '+212600000000',
  birthDate: '1998-04-12',
  language: 'ar',
};

const data = {
  user,
  answers: { lastPeriod: '2026-03-01', pregnant: 'no', symptoms: ['cramps', 'headache'] },
  onboardingDone: true,
  periods: [{ start: '2026-03-01', end: '2026-03-05' }, { start: '2026-03-29' }],
  logs: { '2026-03-02': { flow: 'heavy', symptoms: ['cramps'], mood: 'sad' } },
};

test('export then import gives back the same data', () => {
  const parsed = parseBackup(buildBackup(data));
  assert.ok(parsed);
  assert.deepEqual(parsed.user, user);
  assert.deepEqual(parsed.periods, data.periods);
  assert.deepEqual(parsed.logs, data.logs);
  assert.deepEqual(parsed.answers, data.answers);
  assert.equal(parsed.onboardingDone, true);
});

test('text that is not JSON is refused', () => {
  assert.equal(parseBackup('hello'), null);
  assert.equal(parseBackup(''), null);
});

test('JSON from another app is refused', () => {
  assert.equal(parseBackup(JSON.stringify({ app: 'other', version: 1 })), null);
});

test('a wrong version is refused', () => {
  const backup = JSON.parse(buildBackup(data));
  backup.version = 99;
  assert.equal(parseBackup(JSON.stringify(backup)), null);
});

test('an impossible date is refused (31 February)', () => {
  const backup = JSON.parse(buildBackup(data));
  backup.periods[0].start = '2026-02-31';
  assert.equal(parseBackup(JSON.stringify(backup)), null);
});

test('a period that ends before it starts is refused', () => {
  const backup = JSON.parse(buildBackup(data));
  backup.periods[0] = { start: '2026-03-10', end: '2026-03-05' };
  assert.equal(parseBackup(JSON.stringify(backup)), null);
});

test('a log with the wrong type is refused', () => {
  const backup = JSON.parse(buildBackup(data));
  backup.logs['2026-03-02'].symptoms = 'cramps';
  assert.equal(parseBackup(JSON.stringify(backup)), null);
});

test('periods are sorted after import', () => {
  const backup = JSON.parse(buildBackup(data));
  backup.periods.reverse();
  const parsed = parseBackup(JSON.stringify(backup));
  assert.ok(parsed);
  assert.equal(parsed.periods[0].start, '2026-03-01');
});