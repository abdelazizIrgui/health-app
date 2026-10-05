import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useI18n } from '../i18n/I18nContext';
import { cardShadow, colors } from '../theme';
import { PIN_LENGTH } from '../utils/pinLock';

interface Props {
  /** Called with the digits when she has typed all of them. */
  onComplete: (pin: string) => void | Promise<void>;
  subtitle?: string;
  error?: string | null;
  /** Stops the keys (for example while she has to wait). */
  disabled?: boolean;
  /** Shown at the bottom left, for example the fingerprint button. */
  extraKey?: React.ReactNode;
}

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

/** Dots + number keys. The keypad is never mirrored, also in right-to-left languages. */
export default function PinPad({ onComplete, subtitle, error, disabled, extraKey }: Props) {
  const { t, dir } = useI18n();
  const [pin, setPin] = useState('');
  const text = { textAlign: 'center', writingDirection: dir.writing } as const;

  const press = (digit: string) => {
    if (disabled || pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      // A short pause so she sees the last dot fill before the pad clears.
      setTimeout(async () => {
        try {
          await onComplete(next);
        } finally {
          setPin('');
        }
      }, 120);
    }
  };

  const erase = () => {
    if (!disabled) setPin(pin.slice(0, -1));
  };

  const key = (label: string) => (
    <TouchableOpacity
      key={label}
      style={styles.key}
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => press(label)}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.keyText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrap}>
      {subtitle ? <Text style={[styles.subtitle, text]}>{subtitle}</Text> : null}

      <View style={styles.dots} accessibilityLabel={`${pin.length}/${PIN_LENGTH}`}>
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotOn]} />
        ))}
      </View>

      <Text style={[styles.error, text]}>{error ?? ' '}</Text>

      {ROWS.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map(key)}
        </View>
      ))}
      <View style={styles.row}>
        <View style={styles.keySpace}>{extraKey}</View>
        {key('0')}
        <TouchableOpacity
          style={styles.keySpace}
          onPress={erase}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t('lock.erase')}
        >
          <Ionicons name="backspace-outline" size={28} color={colors.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const KEY = 72;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  subtitle: { marginBottom: 16, fontSize: 14, lineHeight: 20, color: colors.muted },
  dots: { flexDirection: 'row', gap: 18, marginVertical: 8 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.rose,
  },
  dotOn: { backgroundColor: colors.rose },
  error: { minHeight: 22, marginVertical: 10, fontSize: 14, fontWeight: '600', color: colors.rose },
  row: { flexDirection: 'row', gap: 22, marginBottom: 14 },
  key: {
    width: KEY,
    height: KEY,
    borderRadius: KEY / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    ...cardShadow,
  },
  keyText: { fontSize: 28, fontWeight: '600', color: colors.text },
  keySpace: { width: KEY, height: KEY, alignItems: 'center', justifyContent: 'center' },
});