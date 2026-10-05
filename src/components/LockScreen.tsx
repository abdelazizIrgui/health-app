import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import PinPad from './PinPad';
import { useLock } from '../context/LockContext';
import { useUser } from '../context/UserContext';
import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme';

/**
 * Covers the whole app while it is locked. Rendered above the navigation, so nothing
 * of her data is visible until she enters the PIN (or uses fingerprint / face).
 */
export default function LockScreen() {
  const { t, dir } = useI18n();
  const { deleteAllData } = useUser();
  const { loading, locked, biometricsOn, secondsLeft, verifyPin, unlockWithBiometrics, reset } =
    useLock();
  const [error, setError] = useState<string | null>(null);

  const visible = loading || locked;

  // Ask for fingerprint / face as soon as the lock appears.
  useEffect(() => {
    setError(null);
    if (visible && !loading && biometricsOn) unlockWithBiometrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, loading, biometricsOn]);

  if (!visible) return null;

  // While the saved lock is being read, show an empty screen so nothing flashes.
  if (loading) return <View style={styles.cover} />;

  const onComplete = async (pin: string) => {
    const ok = await verifyPin(pin);
    setError(ok ? null : t('lock.wrong'));
  };

  const confirmForgot = () => {
    Alert.alert(t('lock.forgotTitle'), t('lock.forgotMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('lock.forgotConfirm'),
        style: 'destructive',
        onPress: async () => {
          await deleteAllData();
          await reset();
        },
      },
    ]);
  };

  const message = secondsLeft > 0 ? t('lock.tooMany', { sec: secondsLeft }) : error;

  return (
    <SafeAreaView style={styles.cover}>
      <View style={styles.center}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={34} color={colors.rose} />
        </View>
        <Text style={[styles.title, { writingDirection: dir.writing }]}>{t('lock.enterPin')}</Text>

        <PinPad
          onComplete={onComplete}
          error={message}
          disabled={secondsLeft > 0}
          extraKey={
            biometricsOn ? (
              <TouchableOpacity
                onPress={unlockWithBiometrics}
                accessibilityRole="button"
                accessibilityLabel={t('lock.useBiometric')}
              >
                <Ionicons name="finger-print" size={34} color={colors.rose} />
              </TouchableOpacity>
            ) : null
          }
        />

        <TouchableOpacity style={styles.forgot} onPress={confirmForgot} accessibilityRole="button">
          <Text style={styles.forgotText}>{t('lock.forgot')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: colors.cream,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peachSoft,
  },
  title: { marginTop: 16, marginBottom: 20, fontSize: 22, fontWeight: '700', color: colors.text },
  forgot: { marginTop: 8, padding: 12 },
  forgotText: { fontSize: 15, fontWeight: '600', color: colors.muted },
});