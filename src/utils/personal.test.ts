import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isPmsWindow, lateReasons, usualPmsSymptoms } from './personal';

test('PMS symptoms: "none" is not a symptom', () => {
  assert.deepEqual(usualPmsSymptoms({ pmsSymptoms: ['mood', 'acne'] }), ['mood', 'acne']);
  assert.deepEqual(usualPmsSymptoms({ pmsSymptoms: ['none'] }), []);
  assert.deepEqual(usualPmsSymptoms({}), []);
});

test('late reasons come from the lifestyle answer', () => {
  assert.deepEqual(lateReasons({ lifestyle: ['stress', 'exercise'] }), ['stress', 'exercise']);
  assert.deepEqual(lateReasons({ lifestyle: ['none'] }), []);
  assert.deepEqual(lateReasons({ lifestyle: null }), []);
});

test('the PMS note is shown only in the last 5 days before the period', () => {
  const base = { onPeriod: false, daysLate: 0 };
  assert.equal(isPmsWindow({ ...base, daysUntilPeriod: 5 }), true);
  assert.equal(isPmsWindow({ ...base, daysUntilPeriod: 1 }), true);
  assert.equal(isPmsWindow({ ...base, daysUntilPeriod: 6 }), false);
  assert.equal(isPmsWindow({ ...base, daysUntilPeriod: 0 }), false);
  assert.equal(isPmsWindow({ onPeriod: true, daysLate: 0, daysUntilPeriod: 3 }), false);
  assert.equal(isPmsWindow({ onPeriod: false, daysLate: 2, daysUntilPeriod: -2 }), false);
});