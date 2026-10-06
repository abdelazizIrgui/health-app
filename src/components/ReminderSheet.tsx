import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import BottomSheet from './BottomSheet';
import { UpdateResult, useReminders } from '../context/ReminderContext';
import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme';
import { MAX_DAYS_BEFORE, MIN_DAYS_BEFORE } from '../utils/reminders';

interface Props {
  visible: boolean;
  onClose: () => void;
}

/** Bottom sheet with the two reminders: before the period, and a daily check-in. */
export default function ReminderSheet({ visible, onClose }: Props) {
  const { t, dir } = useI18n();
  const { settings, hasForecast, update } = useReminders();
  const [showPicker, setShowPicker] = useState(false);
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;

  const change = async (patch: Parameters<typeof update>[0]) => {
    const result: UpdateResult = await update(patch);
    if (result === 'denied') {
      Alert.alert(t('reminders.deniedTitle'), t('reminders.deniedMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('reminders.openSettings'), onPress: () => Linking.openSettings() },
      ]);
    }
  };

  const time = new Date();
  time.setHours(settings.hour, settings.minute, 0, 0);
  const timeLabel = time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  const step = (delta: number) => {
    const n = settings.periodDaysBefore + delta;
    if (n >= MIN_DAYS_BEFORE && n <= MAX_DAYS_BEFORE) change({ periodDaysBefore: n });
  };

  return (
    <BottomSheet visible={visible} title={t('reminders.title')} onClose={onClose}>
      {/* Before the period */}
      <View style={[styles.row, { flexDirection: dir.row }]}>
        <View style={styles.rowText}>
          <Text style={[styles.label, text]}>{t('reminders.period')}</Text>
          <Text style={[styles.hint, text]}>{t('reminders.periodHint')}</Text>
        </View>
        <Switch
          value={settings.period}
          onValueChange={(on) => change({ period: on })}
          trackColor={{ false: colors.peach, true: colors.rose }}
          thumbColor={colors.white}
          accessibilityLabel={t('reminders.period')}
        />
      </View>
      {settings.period && (
        <>
          <View style={[styles.stepper, { flexDirection: dir.row }]}>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => step(-1)}
              disabled={settings.periodDaysBefore <= MIN_DAYS_BEFORE}
              accessibilityRole="button"
              accessibilityLabel="-"
            >
              <Ionicons name="remove" size={20} color={colors.rose} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>
              {t('reminders.daysBefore', { n: settings.periodDaysBefore })}
            </Text>
            <TouchableOpacity
              style={styles.stepButton}
              onPress={() => step(1)}
              disabled={settings.periodDaysBefore >= MAX_DAYS_BEFORE}
              accessibilityRole="button"
              accessibilityLabel="+"
            >
              <Ionicons name="add" size={20} color={colors.rose} />
            </TouchableOpacity>
          </View>
          {!hasForecast && <Text style={[styles.hint, text]}>{t('reminders.noForecast')}</Text>}
        </>
      )}

      <View style={styles.divider} />

      {/* Daily check-in */}
      <View style={[styles.row, { flexDirection: dir.row }]}>
        <View style={styles.rowText}>
          <Text style={[styles.label, text]}>{t('reminders.daily')}</Text>
          <Text style={[styles.hint, text]}>{t('reminders.dailyHint')}</Text>
        </View>
        <Switch
          value={settings.daily}
          onValueChange={(on) => change({ daily: on })}
          trackColor={{ false: colors.peach, true: colors.rose }}
          thumbColor={colors.white}
          accessibilityLabel={t('reminders.daily')}
        />
      </View>
      {settings.daily && (
        <TouchableOpacity
          style={[styles.timeRow, { flexDirection: dir.row }]}
          onPress={() => setShowPicker((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={`${t('reminders.time')}: ${timeLabel}`}
        >
          <Ionicons name="time-outline" size={20} color={colors.rose} />
          <Text style={[styles.label, styles.timeLabel, text]}>{t('reminders.time')}</Text>
          <Text style={styles.timeValue}>{timeLabel}</Text>
        </TouchableOpacity>
      )}
      {settings.daily && showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, picked) => {
            if (Platform.OS === 'android') setShowPicker(false);
            if (event.type === 'set' && picked) {
              change({ hour: picked.getHours(), minute: picked.getMinutes() });
            }
          }}
        />
      )}

      <Text style={[styles.note, text]}>{t('reminders.discreet')}</Text>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', gap: 12, marginTop: 12 },
  rowText: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', color: colors.text },
  hint: { marginTop: 2, fontSize: 13, lineHeight: 19, color: colors.muted },
  stepper: { alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 14 },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peachSoft,
  },
  stepValue: {
    minWidth: 120,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  divider: { height: 1, marginTop: 18, backgroundColor: 'rgba(44, 37, 45, 0.08)' },
  timeRow: { alignItems: 'center', gap: 10, marginTop: 14, paddingVertical: 8 },
  timeLabel: { flex: 1 },
  timeValue: { fontSize: 16, fontWeight: '700', color: colors.rose },
  note: { marginTop: 18, fontSize: 12, lineHeight: 18, color: colors.muted },
});