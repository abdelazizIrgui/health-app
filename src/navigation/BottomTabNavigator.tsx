import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/main/HomeScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import { CalendarScreen, InsightsScreen } from '../screens/main/PlaceholderScreens';
import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme';

export type TabParamList = {
  Home: undefined;
  Calendar: undefined;
  Insights: undefined;
  Settings: undefined;
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Filled icon when the tab is active, outline when inactive.
const TAB_ICONS: Record<keyof TabParamList, { active: IconName; inactive: IconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Calendar: { active: 'calendar', inactive: 'calendar-outline' },
  Insights: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function BottomTabNavigator() {
  const { t } = useI18n();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.rose,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          paddingTop: 6,
          elevation: 12,
          shadowColor: colors.text,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tabs.home') }} />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: t('tabs.calendar') }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ title: t('tabs.insights') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('tabs.settings') }}
      />
    </Tab.Navigator>
  );
}