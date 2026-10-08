import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme';
import BottomSheet from './BottomSheet';

interface Props {
  visible: boolean;
  /** Oldest day she can choose (the day after her last logged period began). */
  earliest?: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

/** A period never lasts longer than about 10 days, so we offer the last 10 days. */
const MAX_DAYS_BACK = 10;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** "When did your period start?" for someone who installs the app in the middle of it. */
export default function StartDateSheet({ visible, earliest, onSelect, onClose }: Props) {
  const { t, dir, formatDate } = useI18n();
  const today = startOfDay(new Date());

  const options = Array.from({ length: MAX_DAYS_BACK }, (_, i) => {
    const daysAgo = i + 1;
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo);
    return { daysAgo, date };
  }).filter((o) => !earliest || o.date.getTime() >= startOfDay(earliest).getTime());

  return (
    <BottomSheet visible={visible} title={t('cycle.startedTitle')} onClose={onClose}>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {options.map(({ daysAgo, date }) => (
          <TouchableOpacity
            key={daysAgo}
            style={[styles.option, { flexDirection: dir.row }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            onPress={() => onSelect(date)}
          >
            <Text style={styles.date}>
              {formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Text style={styles.hint}>
              {daysAgo === 1 ? t('cycle.yesterday') : t('cycle.daysAgo', { n: daysAgo })}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: { maxHeight: 420 },
  option: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(44, 37, 45, 0.12)',
  },
  date: { flexShrink: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  hint: { fontSize: 13, color: colors.muted },
});