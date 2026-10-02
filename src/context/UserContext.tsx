import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Answers } from '../data/questions';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  birthDate: string; // ISO date, e.g. "1998-04-21"
  language: string; // language code, e.g. "en", "ar", "fr"
}

interface UserContextValue {
  user: UserProfile | null;
  /** Answers to the onboarding questionnaire (partial until it is finished). */
  answers: Answers;
  /** True once the questionnaire has been completed. */
  onboardingDone: boolean;
  /** True until everything saved has been read from storage. */
  loading: boolean;
  register: (profile: UserProfile) => Promise<void>;
  /** Saves progress while the questionnaire is still in progress. */
  saveAnswers: (answers: Answers) => Promise<void>;
  /** Saves the final answers and opens the main app. */
  completeOnboarding: (answers: Answers) => Promise<void>;
  signOut: () => Promise<void>;
}

const STORAGE_KEY = '@health_app/user_profile';
const ANSWERS_KEY = '@health_app/answers';
const DONE_KEY = '@health_app/onboarding_done';

const UserContext = createContext<UserContextValue | undefined>(undefined);

/**
 * Holds the registered user and their questionnaire answers. Data is saved on this device only.
 * TODO (later phase): replace with a real backend / auth provider.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [loading, setLoading] = useState(true);

  // On launch, restore the profile and questionnaire progress saved on this device.
  useEffect(() => {
    (async () => {
      try {
        const [savedUser, savedAnswers, savedDone] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ANSWERS_KEY),
          AsyncStorage.getItem(DONE_KEY),
        ]);
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
        setOnboardingDone(savedDone === '1');
      } catch (e) {
        console.warn('Could not read saved data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const register = useCallback(async (profile: UserProfile) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile); // RootNavigator reacts to this and opens the questionnaire
  }, []);

  const saveAnswers = useCallback(async (next: Answers) => {
    setAnswers(next);
    try {
      await AsyncStorage.setItem(ANSWERS_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Could not save answers', e);
    }
  }, []);

  const completeOnboarding = useCallback(async (final: Answers) => {
    await AsyncStorage.multiSet([
      [ANSWERS_KEY, JSON.stringify(final)],
      [DONE_KEY, '1'],
    ]);
    setAnswers(final);
    setOnboardingDone(true); // RootNavigator reacts to this and opens the main app
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY, ANSWERS_KEY, DONE_KEY]);
    setUser(null);
    setAnswers({});
    setOnboardingDone(false); // RootNavigator returns to Welcome > Register
  }, []);

  const value = useMemo(
    () => ({
      user,
      answers,
      onboardingDone,
      loading,
      register,
      saveAnswers,
      completeOnboarding,
      signOut,
    }),
    [user, answers, onboardingDone, loading, register, saveAnswers, completeOnboarding, signOut]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}
