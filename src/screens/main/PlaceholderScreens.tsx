import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useI18n } from '../../i18n/I18nContext';
import { colors } from '../../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/** Shared empty-state layout for tabs that are built in later phases. */
function PlaceholderScreen({ title, icon, hint }: { title: string; icon: IconName; hint: string }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={36} color={colors.rose} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </SafeAreaView>
  );
}

export const InsightsScreen = () => {
  const { t } = useI18n();
  return (
    <PlaceholderScreen
      title={t('insights.title')}
      icon="stats-chart-outline"
      hint={t('insights.hint')}
    />
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peachSoft,
  },
  title: { marginTop: 16, fontSize: 22, fontWeight: '700', color: colors.text },
  hint: { marginTop: 6, fontSize: 15, textAlign: 'center', color: colors.muted },
});