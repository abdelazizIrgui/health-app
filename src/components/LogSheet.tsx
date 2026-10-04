import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import BottomSheet from './BottomSheet';
import { useCycle } from '../context/CycleContext';
import {
  FLOW_OPTIONS,
  LogKind,
  LogOption,
  MOOD_OPTIONS,
  SYMPTOM_OPTIONS,
} from '../data/logOptions';
import { useI18n } from '../i18n/I18nContext';
import { toIsoDate } from '../utils/forecast';
import { colors } from '../theme';

interface Props {
  /** Which log to show; null keeps the sheet closed. */
  kind: LogKind | null;
  /** Which day to log; today when missing. */
  date?: Date;
  onClose: () => void;
}

const CONFIG: Record<LogKind, { titleKey: string; dayTitleKey: string; options: LogOption[] }> = {
  flow: { titleKey: 'log.flowTitle', dayTitleKey: 'log.flowTitleDay', options: FLOW_OPTIONS },
  symptoms: {
    titleKey: 'log.symptomsTitle',
    dayTitleKey: 'log.symptomsTitleDay',
    options: SYMPTOM_OPTIONS,
  },
  mood: { titleKey: 'log.moodTitle', dayTitleKey: 'log.moodTitleDay', options: MOOD_OPTIONS },
};

/** Bottom sheet for the flow, symptoms or mood of one day. Every tap is saved right away. */
export default function LogSheet({ kind, date, onClose }: Props) {
  const { t, dir } = useI18n();
  const { logs, saveLog } = useCycle();

  const day = date ?? new Date();
  const isToday = toIsoDate(day) === toIsoDate(new Date());
  const dayLog = logs[toIsoDate(day)] ?? {};

  const isSelected = (id: string) => {
    if (kind === 'flow') return dayLog.flow === id;
    if (kind === 'mood') return dayLog.mood === id;
    return !!dayLog.symptoms?.includes(id);
  };

  const onPick = (id: string) => {
    if (kind === 'flow') saveLog({ flow: dayLog.flow === id ? undefined : id }, day);
    else if (kind === 'mood') saveLog({ mood: dayLog.mood === id ? undefined : id }, day);
    else {
      const current = dayLog.symptoms ?? [];
      saveLog(
        { symptoms: current.includes(id) ? current.filter((s) => s !== id) : [...current, id] },
        day
      );
    }
  };

  const config = kind ? CONFIG[kind] : null;
  const title = config ? t(isToday ? config.titleKey : config.dayTitleKey) : '';

  return (
    <BottomSheet visible={!!kind} title={title} onClose={onClose}>
      <View style={[styles.grid, { flexDirection: dir.row }]}>
        {config?.options.map((o) => {
          const selected = isSelected(o.id);
          return (
            <TouchableOpacity
              key={o.id}
              style={[styles.chip, selected && styles.chipOn, { flexDirection: dir.row }]}
              activeOpacity={0.8}
              onPress={() => onPick(o.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={t(o.labelKey)}
            >
              <MaterialCommunityIcons
                name={o.icon}
                size={20}
                color={selected ? colors.white : colors.rose}
              />
              <Text style={[styles.chipText, selected && styles.chipTextOn]}>{t(o.labelKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.done} activeOpacity={0.85} onPress={onClose}>
        <Text style={styles.doneText}>{t('common.done')}</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  grid: { flexWrap: 'wrap', gap: 10, marginTop: 8 },
  chip: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.peach,
    backgroundColor: colors.white,
  },
  chipOn: { backgroundColor: colors.rose, borderColor: colors.rose },
  chipText: { fontSize: 15, fontWeight: '600', color: colors.text },
  chipTextOn: { color: colors.white },
  done: {
    marginTop: 24,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.rose,
  },
  doneText: { fontSize: 16, fontWeight: '700', color: colors.white },
});