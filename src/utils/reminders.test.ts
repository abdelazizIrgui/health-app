import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DEFAULT_REMINDERS, formatTime, parseReminders, periodReminderDates } from './reminders';

const d = (y: number, m: number, day: number, h = 0) => new Date(y, m - 1, day, h, 0, 0);

test('parseReminders: nothing saved gives the defaults (everything off)', () => {
  assert.deepEqual(parseReminders(null), DEFAULT_REMINDERS);
  assert.equal(DEFAULT_REMINDERS.period, false);
  assert.equal(DEFAULT_REMINDERS.daily, false);
});

test('parseReminders: damaged text gives the defaults', () => {
  assert.deepEqual(parseReminders('not json'), DEFAULT_REMINDERS);
  assert.deepEqual(parseReminders('42'), DEFAULT_REMINDERS);
  assert.deepEqual(parseReminders('null'), DEFAULT_REMINDERS);
});

test('parseReminders: keeps good values and fixes bad ones one by one', () => {
  const saved = JSON.stringify({
    period: true,
    periodDaysBefore: 9,
    daily: true,
    hour: 7,
    minute: 75,
  });
  assert.deepEqual(parseReminders(saved), {
    period: true,
    periodDaysBefore: DEFAULT_REMINDERS.periodDaysBefore, // 9 is out of range
    daily: true,
    hour: 7,
    minute: DEFAULT_REMINDERS.minute, // 75 is out of range
  });
});

test('periodReminderDates: N days before the expected start, at 09:00', () => {
  const forecast = { earliestStart: d(2026, 10, 20), cycleLength: 28 };
  const dates = periodReminderDates(forecast, 2, d(2026, 10, 5, 12));
  assert.equal(dates.length, 3);
  assert.deepEqual(dates[0], d(2026, 10, 18, 9));
  assert.deepEqual(dates[1], d(2026, 11, 15, 9)); // next cycle, 28 days later
  assert.deepEqual(dates[2], d(2026, 12, 13, 9));
});

test('periodReminderDates: a date that already passed is skipped', () => {
  const forecast = { earliestStart: d(2026, 10, 20), cycleLength: 28 };
  // 19 Oct: the 18 Oct heads-up is gone, the next cycle ones remain.
  const dates = periodReminderDates(forecast, 2, d(2026, 10, 19, 8));
  assert.equal(dates.length, 2);
  assert.deepEqual(dates[0], d(2026, 11, 15, 9));
});

test('periodReminderDates: same day but 09:00 not reached yet is still sent', () => {
  const forecast = { earliestStart: d(2026, 10, 20), cycleLength: 28 };
  const dates = periodReminderDates(forecast, 2, d(2026, 10, 18, 7));
  assert.deepEqual(dates[0], d(2026, 10, 18, 9));
});

test('formatTime pads with zeros', () => {
  assert.equal(formatTime(7, 5), '07:05');
  assert.equal(formatTime(21, 0), '21:00');
});