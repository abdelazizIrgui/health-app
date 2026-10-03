import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useI18n } from '../i18n/I18nContext';
import { LANGUAGES, LanguageCode } from '../i18n/languages';
import { colors } from '../theme';
import BottomSheet from './BottomSheet';

interface Props {
  visible: boolean;
  selected: LanguageCode | null;
  onSelect: (code: LanguageCode) => void;
  onClose: () => void;
}

/** List of supported languages, each written in its own language. */
export default function LanguageSheet({ visible, selected, onSelect, onClose }: Props) {
  const { t, dir } = useI18n();
  return (
    <BottomSheet visible={visible} title={t('register.language')} onClose={onClose}>
      {LANGUAGES.map((l) => {
        const isSelected = l.code === selected;
        return (
          <TouchableOpacity
            key={l.code}
            style={[styles.option, { flexDirection: dir.row }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(l.code)}
          >
            <View>
              <Text style={[styles.native, { textAlign: dir.align }]}>{l.native}</Text>
              <Text style={[styles.english, { textAlign: dir.align }]}>{l.english}</Text>
            </View>
            {isSelected && <Ionicons name="checkmark-circle" size={22} color={colors.rose} />}
          </TouchableOpacity>
        );
      })}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  option: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(44, 37, 45, 0.12)',
  },
  native: { fontSize: 17, fontWeight: '600', color: colors.text },
  english: { marginTop: 2, fontSize: 13, color: colors.muted },
});