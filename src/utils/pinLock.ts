/** Rules of the PIN lock. No phone code in here, so they can be tested. */

export const PIN_LENGTH = 4;

const MAX_ATTEMPTS = 5; // wrong PINs in a row before the app makes her wait
const BASE_LOCKOUT_SECONDS = 30; // first wait; it doubles every time it happens again
const MAX_LOCKOUT_SECONDS = 15 * 60;

export interface AttemptState {
  failed: number; // wrong PINs since the last wait or the last right PIN
  rounds: number; // how many times she had to wait (makes the next wait longer)
  lockedUntil: number; // time in milliseconds, 0 = not waiting
}

export const freshAttempts = (): AttemptState => ({ failed: 0, rounds: 0, lockedUntil: 0 });

export const isValidPin = (pin: string) => new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);

export const lockoutSeconds = (rounds: number) =>
  Math.min(BASE_LOCKOUT_SECONDS * 2 ** rounds, MAX_LOCKOUT_SECONDS);

/** What to remember after a wrong PIN. */
export function afterWrongPin(state: AttemptState, now: number): AttemptState {
  const failed = state.failed + 1;
  if (failed < MAX_ATTEMPTS) return { ...state, failed };
  return {
    failed: 0,
    rounds: state.rounds + 1,
    lockedUntil: now + lockoutSeconds(state.rounds) * 1000,
  };
}

/** A right PIN clears everything. */
export const afterRightPin = freshAttempts;

/** Seconds she still has to wait (0 when she can try). */
export const secondsLeft = (state: AttemptState, now: number) =>
  Math.max(0, Math.ceil((state.lockedUntil - now) / 1000));

/** Compares two texts without stopping at the first difference. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}