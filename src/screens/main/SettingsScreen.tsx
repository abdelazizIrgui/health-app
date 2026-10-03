import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import LanguageSheet from '../../components/LanguageSheet';
import { useUser } from '../../context/UserContext';
import { useI18n } from '../../i18n/I18nContext';
import { cardShadow, colors } from '../../theme';

/** Profile card, language and sign out. */
export default function SettingsScreen() {
  const { user, signOut } = useUser();
  const { t, dir, language, languageInfo, setLanguage } = useI18n();
  const [showLanguages, setShowLanguages] = useState(false);
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;
  const initial = user?.name.trim().charAt(0).toUpperCase() || '?';

  const confirmSignOut = () => {
    Alert.alert(t('settings.signOutTitle'), t('settings.signOutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.signOut'), style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, text]}>{t('settings.title')}</Text>

        <View style={[styles.card, { flexDirection: dir.row }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, text]}>{user?.name}</Text>
            <Text style={[styles.email, text]}>{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.row, { flexDirection: dir.row }]}
          activeOpacity={0.8}
          onPress={() => setShowLanguages(true)}
          accessibilityRole="button"
          accessibilityLabel={`${t('settings.language')}: ${languageInfo.native}`}
        >
          <Ionicons name="language-outline" size={22} color={colors.rose} />
          <Text style={[styles.rowLabel, text]}>{t('settings.language')}</Text>
          <Text style={styles.rowValue}>{languageInfo.native}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOut}
          activeOpacity={0.8}
          onPress={confirmSignOut}
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.rose} />
          <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
        </TouchableOpacity>
      </View>

      <LanguageSheet
        visible={showLanguages}
        selected={language}
        onSelect={(code) => {
          setLanguage(code);
          setShowLanguages(false);
        }}
        onClose={() => setShowLanguages(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: 20, paddingTop: 12 },
  title: { fontSize: 30, fontWeight: '700', color: colors.text, marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.white,
    ...cardShadow,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peach,
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.text },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  email: { marginTop: 2, fontSize: 14, color: colors.muted },
  row: {
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
    paddingHorizontal: 20,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.white,
    ...cardShadow,
  },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  rowValue: { fontSize: 15, color: colors.muted },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    height: 52,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.rose,
  },
  signOutText: { fontSize: 16, fontWeight: '600', color: colors.rose },
});