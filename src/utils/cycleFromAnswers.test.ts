import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ageInYears, expectedSpread, getCycleProfile } from './cycleFromAnswers';

const today = new Date(2026, 9, 8); // 8 Oct 2026

test('age is counted in whole years and a wrong date gives null', () => {
  assert.equal(ageInYears('2000-10-09', today), 25); // birthday is tomorrow
  assert.equal(ageInYears('2000-10-08', today), 26);
  assert.equal(ageInYears('nonsense', today), null);
  assert.equal(ageInYears(undefined, today), null);
});

test('regularity sets the starting spread', () => {
  assert.equal(expectedSpread({ regularity: 'always' }, today), 4);
  assert.equal(expectedSpread({ regularity: 'mostly' }, today), 6);
  assert.equal(expectedSpread({ regularity: 'rarely' }, today), 14);
  assert.equal(expectedSpread({ regularity: 'unknown' }, today), 6);
});

test('PCOS, postpartum, exclusive breastfeeding and perimenopause widen the range', () => {
  assert.equal(expectedSpread({ regularity: 'always', diagnosis: ['pcos'] }, today), 14);
  assert.equal(expectedSpread({ regularity: 'always', status: ['postpartum'] }, today), 14);
  assert.equal(expectedSpread({ regularity: 'always', breastfeeding: 'exclusive' }, today), 14);
  assert.equal(expectedSpread({ regularity: 'always', status: ['perimenopause'] }, today), 14);
  assert.equal(expectedSpread({ regularity: 'always', recentChange: 'yes' }, today), 10);
});

test('the first two years after the first period, and age 45+, widen the range', () => {
  // 15 years old, first period at 13
  assert.equal(
    expectedSpread({ regularity: 'always', birthDate: '2011-01-01', firstPeriodAge: 13 }, today),
    14
  );
  // 27 years old, first period at 12: nothing special
  assert.equal(
    expectedSpread({ regularity: 'always', birthDate: '1999-01-01', firstPeriodAge: 12 }, today),
    4
  );
  assert.equal(expectedSpread({ regularity: 'always', birthDate: '1979-01-01' }, today), 10); // 47
  assert.equal(expectedSpread({ regularity: 'always', birthDate: '1985-01-01' }, today), 8); // 41 years
});

test('pill and ring keep a calm range, injection and implant are unpredictable', () => {
  const base = { regularity: 'rarely', status: ['hormonal'] };
  assert.equal(expectedSpread({ ...base, hormonalType: 'pill' }, today), 4);
  assert.equal(expectedSpread({ ...base, hormonalType: 'ringPatch' }, today), 4);
  assert.equal(expectedSpread({ ...base, hormonalType: 'injection' }, today), 14);
  assert.equal(expectedSpread({ ...base, hormonalType: 'implant' }, today), 14);
  assert.equal(expectedSpread({ ...base, hormonalType: 'iud' }, today), 14);
  assert.equal(expectedSpread(base, today), 14); // type not given: be careful
});

test('hormonal contraception turns the fertile window off', () => {
  const p = getCycleProfile(
    { lastPeriodStart: '2026-09-20', status: ['hormonal'], hormonalType: 'pill' },
    today
  );
  assert.ok(p.ready);
  assert.equal(p.settings.noFertileWindow, true);
  const q = getCycleProfile({ lastPeriodStart: '2026-09-20', status: ['none'] }, today);
  assert.ok(q.ready);
  assert.equal(q.settings.noFertileWindow, false);
});

test('pregnancy and "no period yet" still stop the forecast', () => {
  assert.deepEqual(getCycleProfile({ hasHadPeriod: 'no' }, today), { ready: false, reason: 'not_started' });
  assert.deepEqual(getCycleProfile({ status: ['pregnant'] }, today), { ready: false, reason: 'pregnant' });
  assert.deepEqual(getCycleProfile({ lastPeriodStart: 'unknown' }, today), { ready: false, reason: 'no_date' });
});