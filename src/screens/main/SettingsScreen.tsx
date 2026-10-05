import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import LanguageSheet from '../../components/LanguageSheet';
import PinSheet, { PinMode } from '../../components/PinSheet';
import RestoreSheet from '../../components/RestoreSheet';
import { useLock } from '../../context/LockContext';
import { useBackup } from '../../context/useBackup';
import { useUser } from '../../context/UserContext';
import { useI18n } from '../../i18n/I18nContext';
import { cardShadow, colors } from '../../theme';

/** Profile card, language, backup, app lock, sign out and delete all data. */
export default function SettingsScreen() {
  const { user, signOut, deleteAllData } = useUser();
  const { t, dir, language, languageInfo, setLanguage } = useI18n();
  const { exportText } = useBackup();
  const [showLanguages, setShowLanguages] = useState(false);
  const [showRestore, setShowRestore] = useState(false);
  const { enabled, biometricsAvailable, biometricsOn, setBiometrics } = useLock();
  const [pinMode, setPinMode] = useState<PinMode | null>(null);
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;
  const initial = user?.name.trim().charAt(0).toUpperCase() || '?';

  const confirmSignOut = () => {
    Alert.alert(t('settings.signOutTitle'), t('settings.signOutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.signOut'), style: 'destructive', onPress: signOut },
    ]);
  };

  const doExport = async () => {
    const data = exportText();
    if (!data) return;
    try {
      await Share.share({ message: data, title: t('backup.shareTitle') });
    } catch (e) {
      console.warn('Could not share the backup', e);
    }
  };

  const confirmExport = () => {
    Alert.alert(t('settings.exportTitle'), t('settings.exportMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.exportConfirm'), onPress: doExport },
    ]);
  };

  const confirmDeleteAll = () => {
    Alert.alert(t('settings.deleteAllTitle'), t('settings.deleteAllMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.deleteAllConfirm'), style: 'destructive', onPress: deleteAllData },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          style={[styles.row, { flexDirection: dir.row }]}
          activeOpacity={0.8}
          onPress={confirmExport}
          accessibilityRole="button"
        >
          <Ionicons name="share-outline" size={22} color={colors.rose} />
          <Text style={[styles.rowLabel, text]}>{t('settings.export')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.row, { flexDirection: dir.row }]}
          activeOpacity={0.8}
          onPress={() => setShowRestore(true)}
          accessibilityRole="button"
        >
          <Ionicons name="download-outline" size={22} color={colors.rose} />
          <Text style={[styles.rowLabel, text]}>{t('settings.restore')}</Text>
        </TouchableOpacity>

        {/* App lock */}
        <View style={[styles.row, { flexDirection: dir.row }]}>
          <Ionicons name="lock-closed-outline" size={22} color={colors.rose} />
          <Text style={[styles.rowLabel, text]}>{t('lock.pinRow')}</Text>
          <Switch
            value={enabled}
            onValueChange={(on) => setPinMode(on ? 'create' : 'disable')}
            trackColor={{ false: colors.peach, true: colors.rose }}
            thumbColor={colors.white}
            accessibilityLabel={t('lock.pinRow')}
          />
        </View>
        {!enabled && <Text style={[styles.hint, text]}>{t('lock.pinHint')}</Text>}

        {enabled && (
          <TouchableOpacity
            style={[styles.row, { flexDirection: dir.row }]}
            activeOpacity={0.8}
            onPress={() => setPinMode('change')}
            accessibilityRole="button"
          >
            <Ionicons name="key-outline" size={22} color={colors.rose} />
            <Text style={[styles.rowLabel, text]}>{t('lock.change')}</Text>
          </TouchableOpacity>
        )}

        {enabled && biometricsAvailable && (
          <View style={[styles.row, { flexDirection: dir.row }]}>
            <Ionicons name="finger-print-outline" size={22} color={colors.rose} />
            <Text style={[styles.rowLabel, text]}>{t('lock.biometricRow')}</Text>
            <Switch
              value={biometricsOn}
              onValueChange={(on) => {
                setBiometrics(on);
              }}
              trackColor={{ false: colors.peach, true: colors.rose }}
              thumbColor={colors.white}
              accessibilityLabel={t('lock.biometricRow')}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.signOut}
          activeOpacity={0.8}
          onPress={confirmSignOut}
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.rose} />
          <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteAll}
          activeOpacity={0.8}
          onPress={confirmDeleteAll}
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={20} color={colors.muted} />
          <Text style={styles.deleteAllText}>{t('settings.deleteAll')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <PinSheet
        visible={pinMode !== null}
        mode={pinMode ?? 'create'}
        onClose={() => setPinMode(null)}
      />

      <RestoreSheet visible={showRestore} onClose={() => setShowRestore(false)} confirmReplace />

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
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
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
  hint: { marginTop: 8, marginHorizontal: 8, fontSize: 13, lineHeight: 20, color: colors.muted },
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
  deleteAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    height: 52,
  },
  deleteAllText: { fontSize: 15, fontWeight: '600', color: colors.muted },
});