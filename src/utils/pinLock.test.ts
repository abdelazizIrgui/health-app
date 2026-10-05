import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  afterRightPin,
  afterWrongPin,
  freshAttempts,
  isValidPin,
  lockoutSeconds,
  safeEqual,
  secondsLeft,
} from './pinLock';

test('only exactly 4 digits are a valid PIN', () => {
  assert.equal(isValidPin('1234'), true);
  assert.equal(isValidPin('123'), false);
  assert.equal(isValidPin('12345'), false);
  assert.equal(isValidPin('12a4'), false);
  assert.equal(isValidPin(''), false);
});

test('the first 4 wrong PINs do not lock', () => {
  let s = freshAttempts();
  for (let i = 0; i < 4; i++) s = afterWrongPin(s, 1000);
  assert.equal(s.failed, 4);
  assert.equal(s.lockedUntil, 0);
});

test('the 5th wrong PIN makes her wait 30 seconds', () => {
  let s = freshAttempts();
  for (let i = 0; i < 5; i++) s = afterWrongPin(s, 1000);
  assert.equal(s.lockedUntil, 1000 + 30_000);
  assert.equal(s.failed, 0);
  assert.equal(s.rounds, 1);
  assert.equal(secondsLeft(s, 1000), 30);
  assert.equal(secondsLeft(s, 1000 + 29_001), 1);
  assert.equal(secondsLeft(s, 1000 + 31_000), 0);
});

test('the wait doubles each time and stops at 15 minutes', () => {
  assert.equal(lockoutSeconds(0), 30);
  assert.equal(lockoutSeconds(1), 60);
  assert.equal(lockoutSeconds(2), 120);
  assert.equal(lockoutSeconds(10), 15 * 60);
});

test('a right PIN clears the failed attempts and the waits', () => {
  let s = freshAttempts();
  for (let i = 0; i < 3; i++) s = afterWrongPin(s, 1000);
  assert.deepEqual(afterRightPin(), freshAttempts());
});

test('safeEqual compares texts', () => {
  assert.equal(safeEqual('abc', 'abc'), true);
  assert.equal(safeEqual('abc', 'abd'), false);
  assert.equal(safeEqual('abc', 'abcd'), false);
});