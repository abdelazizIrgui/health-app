import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { useI18n } from '../i18n/I18nContext';
import {
  AttemptState,
  afterRightPin,
  afterWrongPin,
  freshAttempts,
  safeEqual,
  secondsLeft as secondsLeftOf,
} from '../utils/pinLock';
import { useUser } from './UserContext';

const LOCK_KEY = 'rosy_app_lock';
const GRACE_MS = 10_000; // leaving the app for less than this does not lock it again

/** What is kept in the phone's secure storage. The PIN itself is never stored, only a hash. */
interface LockConfig extends AttemptState {
  salt: string;
  hash: string;
  biometrics: boolean;
}

interface LockContextValue {
  loading: boolean;
  enabled: boolean;
  locked: boolean;
  biometricsAvailable: boolean;
  biometricsOn: boolean;
  /** Seconds she still has to wait after too many wrong PINs (0 = she can try). */
  secondsLeft: number;
  /** Creates the lock, or changes the PIN. */
  setPin: (pin: string) => Promise<void>;
  /** True when the PIN is right (and unlocks). Counts wrong tries. */
  verifyPin: (pin: string) => Promise<boolean>;
  /** Turns the lock off. Ask for the PIN before calling it. */
  disable: () => Promise<void>;
  setBiometrics: (on: boolean) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  /** Removes the lock without asking (used when all the data is erased). */
  reset: () => Promise<void>;
}

const LockContext = createContext<LockContextValue | undefined>(undefined);

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const hashPin = (pin: string, salt: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);

/** Reads the saved text; anything unexpected counts as "no lock". */
function parseConfig(raw: string | null): LockConfig | null {
  if (!raw) return null;
  try {
    const c = JSON.parse(raw);
    if (
      typeof c.salt === 'string' &&
      typeof c.hash === 'string' &&
      typeof c.biometrics === 'boolean' &&
      typeof c.failed === 'number' &&
      typeof c.rounds === 'number' &&
      typeof c.lockedUntil === 'number'
    ) {
      return c as LockConfig;
    }
  } catch {
    // fall through
  }
  return null;
}

/** Must be placed inside <I18nProvider> and <UserProvider>. */
export function LockProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const { user, loading: userLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<LockConfig | null>(null);
  const [locked, setLocked] = useState(true); // closed until we know there is no lock
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [now, setNow] = useState(Date.now());
  const backgroundAt = useRef<number | null>(null);

  const enabled = config !== null;

  // Read the saved lock and check the phone's fingerprint / face support.
  useEffect(() => {
    (async () => {
      try {
        const saved = parseConfig(await SecureStore.getItemAsync(LOCK_KEY));
        setConfig(saved);
        setLocked(saved !== null);
      } catch (e) {
        console.warn('Could not read the app lock', e);
        setLocked(false);
      }
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = hasHardware && (await LocalAuthentication.isEnrolledAsync());
        setBiometricsAvailable(enrolled);
      } catch {
        setBiometricsAvailable(false);
      }
      setLoading(false);
    })();
  }, []);

  const save = useCallback(async (next: LockConfig) => {
    setConfig(next);
    try {
      await SecureStore.setItemAsync(LOCK_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Could not save the app lock', e);
    }
  }, []);

  const reset = useCallback(async () => {
    setConfig(null);
    setLocked(false);
    try {
      await SecureStore.deleteItemAsync(LOCK_KEY);
    } catch (e) {
      console.warn('Could not remove the app lock', e);
    }
  }, []);

  // All data erased: the lock goes with it, so a new profile does not inherit an old PIN.
  useEffect(() => {
    if (!userLoading && !user && enabled) reset();
  }, [user, userLoading, enabled, reset]);

  // Lock again when she comes back after more than a few seconds away.
  // Lock again when she comes back after more than a few seconds away.
  useEffect(() => {
    if (!enabled) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        if (backgroundAt.current === null) backgroundAt.current = Date.now();
      } else if (state === 'active') {
        const away = backgroundAt.current;
        backgroundAt.current = null;
        if (away !== null && Date.now() - away > GRACE_MS) setLocked(true);
      }
    });
    return () => sub.remove();
  }, [enabled]);

  // Count down the waiting time once per second.
  const lockedUntil = config?.lockedUntil ?? 0;
  useEffect(() => {
    if (lockedUntil <= Date.now()) return;
    setNow(Date.now());
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lockedUntil) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const secondsLeft = config ? secondsLeftOf(config, now) : 0;

  const setPin = useCallback(
    async (pin: string) => {
      const salt = toHex(await Crypto.getRandomBytesAsync(16));
      const hash = await hashPin(pin, salt);
      await save({
        salt,
        hash,
        biometrics: config?.biometrics ?? false,
        ...freshAttempts(),
      });
      setLocked(false); // she just set it, so do not lock her out right now
    },
    [config, save]
  );

  const verifyPin = useCallback(
    async (pin: string) => {
      if (!config) return false;
      const time = Date.now();
      if (config.lockedUntil > time) return false; // still waiting
      const hash = await hashPin(pin, config.salt);
      if (safeEqual(hash, config.hash)) {
        await save({ ...config, ...afterRightPin() });
        setLocked(false);
        return true;
      }
      await save({ ...config, ...afterWrongPin(config, time) });
      setNow(time);
      return false;
    },
    [config, save]
  );

  const disable = useCallback(async () => {
    await reset();
  }, [reset]);

  const askBiometrics = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('lock.biometricPrompt'),
        cancelLabel: t('common.cancel'),
        disableDeviceFallback: true, // the PIN of this app is the fallback
      });
      return result.success;
    } catch {
      return false;
    }
  }, [t]);

  const setBiometrics = useCallback(
    async (on: boolean) => {
      if (!config) return false;
      if (on && !(await askBiometrics())) return false; // prove that it works before turning it on
      await save({ ...config, biometrics: on });
      return true;
    },
    [config, save, askBiometrics]
  );

  const unlockWithBiometrics = useCallback(async () => {
    if (!config || !config.biometrics || config.lockedUntil > Date.now()) return false;
    if (!(await askBiometrics())) return false;
    setLocked(false);
    return true;
  }, [config, askBiometrics]);

  const value = useMemo<LockContextValue>(
    () => ({
      loading,
      enabled,
      locked: enabled && locked,
      biometricsAvailable,
      biometricsOn: !!config?.biometrics,
      secondsLeft,
      setPin,
      verifyPin,
      disable,
      setBiometrics,
      unlockWithBiometrics,
      reset,
    }),
    [
      loading,
      enabled,
      locked,
      biometricsAvailable,
      config,
      secondsLeft,
      setPin,
      verifyPin,
      disable,
      setBiometrics,
      unlockWithBiometrics,
      reset,
    ]
  );

  return <LockContext.Provider value={value}>{children}</LockContext.Provider>;
}

export function useLock(): LockContextValue {
  const ctx = useContext(LockContext);
  if (!ctx) throw new Error('useLock must be used inside <LockProvider>');
  return ctx;
}