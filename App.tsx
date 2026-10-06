import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import RootNavigator from './src/navigation/RootNavigator';
import { UserProvider } from './src/context/UserContext';
import { CycleProvider } from './src/context/CycleContext';
import { LockProvider } from './src/context/LockContext';
import { ReminderProvider } from './src/context/ReminderContext';
import LockScreen from './src/components/LockScreen';
import { I18nProvider } from './src/i18n/I18nContext';
import { colors } from './src/theme';

// Map our palette onto React Navigation's theme so no default white/blue leaks through.
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.rose,
    background: colors.cream,
    card: colors.white,
    text: colors.text,
    border: 'transparent',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <UserProvider>
          <CycleProvider>
            <ReminderProvider>
              <LockProvider>
                <View style={{ flex: 1 }}>
                  <NavigationContainer theme={navTheme}>
                    <StatusBar style="dark" />
                    <RootNavigator />
                  </NavigationContainer>
                  {/* Covers everything while the app is locked */}
                  <LockScreen />
                </View>
              </LockProvider>
            </ReminderProvider>
          </CycleProvider>
        </UserProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}