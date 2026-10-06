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
  /** False after "Sign out": the data stays on the device, she just has to sign in again. */
  signedIn: boolean;
  register: (profile: UserProfile) => Promise<void>;
  /** Saves progress while the questionnaire is still in progress. */
  saveAnswers: (answers: Answers) => Promise<void>;
  /** Saves the final answers and opens the main app. */
  completeOnboarding: (answers: Answers) => Promise<void>;
  /** Signs out WITHOUT deleting anything. */
  signOut: () => Promise<void>;
  /** Signs back in to the profile saved on this device. */
  signIn: () => Promise<void>;
  /** Permanently deletes the profile, answers, periods and daily logs from this device. */
    deleteAllData: () => Promise<void>;
  /** Puts back a profile and answers read from a backup, and signs her in. */
  restoreUser: (profile: UserProfile, answers: Answers, onboardingDone: boolean) => Promise<void>;
}


const STORAGE_KEY = '@health_app/user_profile';
const ANSWERS_KEY = '@health_app/answers';
const DONE_KEY = '@health_app/onboarding_done';
const SIGNED_IN_KEY = '@health_app/signed_in';

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
  const [signedIn, setSignedIn] = useState(true);

  // On launch, restore the profile and questionnaire progress saved on this device.
  useEffect(() => {
    (async () => {
      try {
        const [savedUser, savedAnswers, savedDone, savedSignedIn] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ANSWERS_KEY),
          AsyncStorage.getItem(DONE_KEY),
          AsyncStorage.getItem(SIGNED_IN_KEY),
        ]);
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));
        setOnboardingDone(savedDone === '1');
        setSignedIn(savedSignedIn !== '0'); // nothing saved yet = signed in (older installs)
      } catch (e) {
        console.warn('Could not read saved data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const register = useCallback(async (profile: UserProfile) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEY, JSON.stringify(profile)],
      [SIGNED_IN_KEY, '1'],
    ]);
    setSignedIn(true);
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

  // Sign out only closes the session. The profile, answers, periods and logs stay on the device.
  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.setItem(SIGNED_IN_KEY, '0');
    } catch (e) {
      console.warn('Could not save the sign-out', e);
    }
    setSignedIn(false); // RootNavigator shows the "Welcome back" screen
  }, []);

  const signIn = useCallback(async () => {
    try {
      await AsyncStorage.setItem(SIGNED_IN_KEY, '1');
    } catch (e) {
      console.warn('Could not save the sign-in', e);
    }
    setSignedIn(true);
  }, []);

  // The only place where data is deleted. CycleProvider clears periods and logs when user is null.
  const deleteAllData = useCallback(async () => {
        await AsyncStorage.multiRemove([
      STORAGE_KEY,
      ANSWERS_KEY,
      DONE_KEY,
      SIGNED_IN_KEY,
      '@health_app/chat_consent', // the chat agreement goes with the rest of her data
    ]);
    setUser(null);
    setAnswers({});
    setOnboardingDone(false);
    setSignedIn(true); // RootNavigator goes back to Welcome > Register
  }, []);

    const restoreUser = useCallback(
    async (profile: UserProfile, restoredAnswers: Answers, done: boolean) => {
      await AsyncStorage.multiSet([
        [STORAGE_KEY, JSON.stringify(profile)],
        [ANSWERS_KEY, JSON.stringify(restoredAnswers)],
        [DONE_KEY, done ? '1' : '0'],
        [SIGNED_IN_KEY, '1'],
      ]);
      setAnswers(restoredAnswers);
      setOnboardingDone(done);
      setSignedIn(true);
      setUser(profile); // RootNavigator reacts and opens the app (or the questionnaire)
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      answers,
      onboardingDone,
      loading,
      signedIn,
      register,
      saveAnswers,
      completeOnboarding,
      signOut,
      signIn,
      deleteAllData,
      restoreUser,
    }),
    [
      user,
      answers,
      onboardingDone,
      loading,
      signedIn,
      register,
      saveAnswers,
      completeOnboarding,
      signOut,
      signIn,
      deleteAllData,
            restoreUser,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}