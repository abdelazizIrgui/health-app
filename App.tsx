import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import RootNavigator from './src/navigation/RootNavigator';
import { UserProvider } from './src/context/UserContext';
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
          <NavigationContainer theme={navTheme}>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </UserProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}