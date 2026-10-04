import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useBackup } from '../context/useBackup';
import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Ask before replacing the data that is already on the device (used from Settings). */
  confirmReplace?: boolean;
}

/** Full-screen sheet where she pastes the backup text and restores everything from it. */
export default function RestoreSheet({ visible, onClose, confirmReplace = false }: Props) {
  const { t, dir } = useI18n();
  const { restoreFromText } = useBackup();
  const [text, setText] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const rowStyle = { flexDirection: dir.row } as const;
  const textStyle = { textAlign: dir.align, writingDirection: dir.writing } as const;

  const close = () => {
    setText('');
    setError(false);
    onClose();
  };

  const run = async () => {
    setBusy(true);
    try {
      const ok = await restoreFromText(text);
      if (ok) close();
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  const onRestore = () => {
    if (!confirmReplace) {
      run();
      return;
    }
    Alert.alert(t('restore.confirmTitle'), t('restore.confirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('restore.confirmButton'), style: 'destructive', onPress: run },
    ]);
  };

  const disabled = busy || text.trim().length === 0;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={[styles.header, rowStyle]}>
              <Text style={[styles.title, textStyle]}>{t('restore.title')}</Text>
              <TouchableOpacity
                onPress={close}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
              >
                <Ionicons name="close" size={26} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.hint, textStyle]}>{t('restore.hint')}</Text>

            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={text}
              onChangeText={(v) => {
                setText(v);
                setError(false);
              }}
              placeholder={t('restore.placeholder')}
              placeholderTextColor={colors.muted}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              textAlignVertical="top"
            />
            {error && <Text style={[styles.error, textStyle]}>{t('restore.errInvalid')}</Text>}

            <TouchableOpacity
              style={[styles.button, disabled && styles.buttonDisabled]}
              activeOpacity={0.85}
              onPress={onRestore}
              disabled={disabled}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>{t('restore.button')}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  content: { padding: 20 },
  header: { alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontSize: 24, fontWeight: '700', color: colors.text },
  hint: { marginTop: 12, fontSize: 15, lineHeight: 22, color: colors.muted },
  input: {
    marginTop: 20,
    minHeight: 180,
    maxHeight: 280,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.peach,
    backgroundColor: colors.white,
    fontSize: 14,
    color: colors.text,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  inputError: { borderColor: colors.rose },
  error: { marginTop: 10, fontSize: 14, lineHeight: 20, color: colors.rose },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 24,
    borderRadius: 28,
    backgroundColor: colors.rose,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 17, fontWeight: '700', color: colors.white },
});