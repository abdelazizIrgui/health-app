import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useCycle } from '../context/CycleContext';
import { useUser } from '../context/UserContext';
import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme';
import { getCycleProfile } from '../utils/cycleFromAnswers';
import { buildHealthAlerts } from '../utils/healthAlerts';

/** Gentle "worth mentioning to a doctor" notes. Renders nothing when there is nothing to say. */
export default function HealthAlerts() {
  const { user, answers } = useUser();
  const { periods, logs } = useCycle();
  const { t, dir } = useI18n();
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;

  const profile = getCycleProfile(answers);
  if (!profile.ready && profile.reason === 'pregnant') return null;

  const alerts = buildHealthAlerts({
    periods,
    logs,
    seed: profile.ready ? profile.settings : null,
    birthDate: user?.birthDate,
  });
  if (alerts.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={[styles.header, { flexDirection: dir.row }]}>
        <MaterialCommunityIcons name="heart-pulse" size={22} color={colors.rose} />
        <Text style={styles.title}>{t('alerts.title')}</Text>
      </View>
      {alerts.map((a) => (
        <Text key={a.id} style={[styles.message, text]}>
          {t(`alerts.${a.id}`, a.params)}
        </Text>
      ))}
      <Text style={[styles.footer, text]}>{t('alerts.footer')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.lilacSoft,
    borderWidth: 1,
    borderColor: colors.lilac,
  },
  header: { alignItems: 'center', gap: 8, marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  message: { marginTop: 8, fontSize: 14, lineHeight: 22, color: colors.text },
  footer: { marginTop: 12, fontSize: 12, lineHeight: 18, color: colors.muted },
});