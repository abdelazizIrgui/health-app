import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme';
import RestoreSheet from './RestoreSheet';

/** "I have a backup" link for the registration screen (for example on a new phone). */
export default function RestoreLink() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.link} onPress={() => setOpen(true)} accessibilityRole="button">
        <Text style={styles.linkText}>{t('restore.link')}</Text>
      </TouchableOpacity>
      <RestoreSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  link: { alignSelf: 'center', marginTop: 12, paddingVertical: 10, paddingHorizontal: 16 },
  linkText: { fontSize: 15, fontWeight: '600', color: colors.rose },
});