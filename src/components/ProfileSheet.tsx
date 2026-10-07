import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useUser } from '../context/UserContext';
import { useI18n } from '../i18n/I18nContext';
import { colors } from '../theme';
import { describePhone, getCountry, countryName } from '../utils/countries';
import { deletePhotoFile, pickProfilePhoto } from '../utils/profilePhoto';
import Avatar from './Avatar';
import BottomSheet from './BottomSheet';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  visible: boolean;
  onClose: () => void;
}

/** "YYYY-MM-DD" -> Date in local time. */
const fromIsoDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const ageOf = (birth: Date) => {
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return Math.max(0, age);
};

/** Shows everything she entered at registration, and lets her change or remove her photo. */
export default function ProfileSheet({ visible, onClose }: Props) {
  const { user, updateProfile } = useUser();
  const { t, dir, language, languageInfo, formatDate } = useI18n();
  const { height } = useWindowDimensions();
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;

  if (!user) return null;

  const birth = fromIsoDate(user.birthDate);
  const phone = describePhone(user.phone);
  const country = phone.iso ? getCountry(phone.iso) : null;

  const changePhoto = async () => {
    try {
      const uri = await pickProfilePhoto();
      if (!uri) return;
      deletePhotoFile(user.photoUri);
      await updateProfile({ photoUri: uri });
    } catch (e) {
      console.warn('Could not change the photo', e);
      Alert.alert(t('profile.photoError'));
    }
  };

  const removePhoto = async () => {
    deletePhotoFile(user.photoUri);
    await updateProfile({ photoUri: undefined });
  };

  const rows: { icon: IconName; label: string; value: string }[] = [
    { icon: 'person-outline', label: t('register.name'), value: user.name },
    { icon: 'mail-outline', label: t('register.email'), value: user.email },
    { icon: 'call-outline', label: t('register.phone'), value: phone.text },
    ...(country
      ? [
          {
            icon: 'globe-outline' as IconName,
            label: t('register.country'),
            value: `${country.flag} ${countryName(country, language)}`,
          },
        ]
      : []),
    { icon: 'calendar-outline', label: t('register.birth'), value: formatDate(birth) },
    {
      icon: 'hourglass-outline',
      label: t('profile.age'),
      value: t('profile.years', { n: ageOf(birth) }),
    },
    { icon: 'language-outline', label: t('register.language'), value: languageInfo.native },
  ];

  return (
    <BottomSheet visible={visible} title={t('settings.myProfile')} onClose={onClose}>
      <ScrollView style={{ maxHeight: height * 0.7 }} showsVerticalScrollIndicator={false}>
        <View style={styles.photoBlock}>
          <Avatar
            uri={user.photoUri}
            name={user.name}
            size={96}
            onPress={changePhoto}
            accessibilityLabel={t(user.photoUri ? 'profile.changePhoto' : 'profile.addPhoto')}
          />
          <TouchableOpacity onPress={changePhoto} accessibilityRole="button">
            <Text style={styles.link}>
              {t(user.photoUri ? 'profile.changePhoto' : 'profile.addPhoto')}
            </Text>
          </TouchableOpacity>
          {user.photoUri ? (
            <TouchableOpacity onPress={removePhoto} accessibilityRole="button">
              <Text style={styles.linkMuted}>{t('profile.removePhoto')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {rows.map((r) => (
          <View key={r.label} style={[styles.row, { flexDirection: dir.row }]}>
            <View style={styles.iconCircle}>
              <Ionicons name={r.icon} size={20} color={colors.rose} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, text]}>{r.label}</Text>
              <Text style={[styles.rowValue, text]}>{r.value}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  photoBlock: { alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 16 },
  link: { fontSize: 15, fontWeight: '600', color: colors.rose },
  linkMuted: { fontSize: 14, color: colors.muted },
  row: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(44, 37, 45, 0.12)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peachSoft,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 13, color: colors.muted },
  rowValue: { marginTop: 2, fontSize: 16, fontWeight: '600', color: colors.text },
});