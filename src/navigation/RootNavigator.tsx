import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BottomTabNavigator from './BottomTabNavigator';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import ChatScreen from '../screens/main/ChatScreen';
import { useUser } from '../context/UserContext';
import { colors } from '../theme';

export type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  SignIn: undefined;
  Onboarding: undefined;
  Main: undefined;
  Chat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * First launch:  Welcome (animated hello)  ->  Register  ->  Onboarding (questions)  ->  Main (tabs)
 * Later launches: straight to Main, because the profile and answers are saved on the device.
 * If the app is closed mid-questionnaire, it reopens on Onboarding and resumes where she stopped.
 */
export default function RootNavigator() {
  const { user, onboardingDone, loading, signedIn } = useUser();

  // Wait for the saved profile to load so the welcome screen never flashes for returning users.
  if (loading) return <View style={{ flex: 1, backgroundColor: colors.cream }} />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {user && !signedIn ? (
        // Signed out but her data is still on the device: ask her to continue.
        <Stack.Screen name="SignIn" component={SignInScreen} />
      ) : user && onboardingDone ? (
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
        </>
      ) : user ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ gestureEnabled: false }}
        />
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ gestureEnabled: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}