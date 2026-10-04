import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useUser } from '../../context/UserContext';
import { useI18n } from '../../i18n/I18nContext';
import { cardShadow, colors } from '../../theme';

/**
 * Shown after "Sign out" when her data is still saved on this device.
 * One tap brings her back to everything she had.
 */
export default function SignInScreen() {
  const { user, signIn, deleteAllData } = useUser();
  const { t } = useI18n();
  const firstName = user?.name.trim().split(' ')[0];

  const confirmNewProfile = () => {
    Alert.alert(t('account.newProfileTitle'), t('account.newProfileMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('account.newProfileConfirm'), style: 'destructive', onPress: deleteAllData },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.iconCircle}>
          <Ionicons name="heart" size={40} color={colors.rose} />
        </View>
        <Text style={styles.title}>
          {firstName ? t('account.welcomeBack', { name: firstName }) : t('account.welcomeBackAnon')}
        </Text>
        <Text style={styles.hint}>{t('account.welcomeBackHint')}</Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={signIn}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{t('account.continue')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={confirmNewProfile}
          accessibilityRole="button"
        >
          <Text style={styles.linkText}>{t('account.notYou')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peachSoft,
    marginBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, textAlign: 'center' },
  hint: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 36,
    borderRadius: 28,
    backgroundColor: colors.rose,
    ...cardShadow,
  },
  buttonText: { fontSize: 17, fontWeight: '700', color: colors.white },
  link: { marginTop: 20, paddingVertical: 10, paddingHorizontal: 16 },
  linkText: { fontSize: 15, fontWeight: '600', color: colors.rose },
});