import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import Avatar from '../../components/Avatar';
import BottomSheet from '../../components/BottomSheet';
import CountrySheet from '../../components/CountrySheet';
import LanguageSheet from '../../components/LanguageSheet';
import RestoreLink from '../../components/RestoreLink';
import { useUser } from '../../context/UserContext';
import { useI18n } from '../../i18n/I18nContext';
import { colors } from '../../theme';
import { deletePhotoFile, pickProfilePhoto } from '../../utils/profilePhoto';
import {
  DEFAULT_COUNTRY,
  detectCountry,
  formatAsTyped,
  getCountry,
  countryName,
  phonePlaceholder,
  toInternational,
} from '../../utils/countries';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// ---------- Constants ----------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_BIRTH = new Date(2000, 0, 1); // where the picker starts

// ---------- Helpers ----------

/** "YYYY-MM-DD" from local date parts (avoids timezone shifts from toISOString). */
const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ---------- Small UI pieces ----------

interface FieldProps extends TextInputProps {
  label: string;
  icon: IconName;
  error?: string;
  inputRef?: React.Ref<TextInput>;
  rightSlot?: React.ReactNode;
  /** Shown before the text, e.g. the calling code "+212". */
  prefix?: string;
}

/** Labeled text input with a leading icon and an inline error message. */
function Field({ label, icon, error, inputRef, rightSlot, prefix, ...inputProps }: FieldProps) {
  const { dir } = useI18n();
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, text]}>{label}</Text>
      <View
        style={[styles.inputRow, { flexDirection: dir.row }, error ? styles.inputRowError : null]}
      >
        <Ionicons name={icon} size={20} color={colors.muted} />
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          ref={inputRef}
          style={[styles.input, { textAlign: dir.align }]}
          placeholderTextColor={colors.muted}
          {...inputProps}
        />
        {rightSlot}
      </View>
      {error ? <Text style={[styles.error, text]}>{error}</Text> : null}
    </View>
  );
}

interface SelectFieldProps {
  label: string;
  icon: IconName;
  /** Replaces the icon (used for the country flag). */
  leading?: string;
  value?: string;
  placeholder: string;
  error?: string;
  onPress: () => void;
}

/** Looks like an input, but opens a picker when tapped. */
function SelectField({
  label,
  icon,
  leading,
  value,
  placeholder,
  error,
  onPress,
}: SelectFieldProps) {
  const { dir } = useI18n();
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, text]}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputRow, { flexDirection: dir.row }, error ? styles.inputRowError : null]}
        activeOpacity={0.8}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ?? placeholder}`}
      >
        {leading ? (
          <Text style={styles.flag}>{leading}</Text>
        ) : (
          <Ionicons name={icon} size={20} color={colors.muted} />
        )}
        <Text style={[styles.input, styles.selectText, text, !value && styles.placeholder]}>
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </TouchableOpacity>
      {error ? <Text style={[styles.error, text]}>{error}</Text> : null}
    </View>
  );
}

// ---------- Screen ----------

/** Each error is a translation key, so it re-translates if the language changes. */
type Errors = {
  name?: string;
  email?: string;
  phone?: string;
  birth?: string;
};

export default function RegisterScreen() {
  const { register } = useUser();
  const { t, dir, language, languageInfo, setLanguage, formatDate } = useI18n();
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(DEFAULT_COUNTRY); // ISO code
  const [phone, setPhone] = useState(''); // national number, without the calling code
  const [birth, setBirth] = useState<Date | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const [showIosDate, setShowIosDate] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showCountries, setShowCountries] = useState(false);

  const selectedCountry = getCountry(country);

  const onPhoneChange = (value: string) => {
    // Pasted a full international number? Switch to its country automatically.
    const detected = detectCountry(value);
    if (detected && detected !== country) {
      setCountry(detected);
      setPhone(formatAsTyped(detected, value).replace(/^\+\d+\s*/, ''));
      return;
    }
    setPhone(formatAsTyped(country, value));
  };

  const choosePhoto = async () => {
    try {
      const uri = await pickProfilePhoto();
      if (!uri) return;
      deletePhotoFile(photoUri); // she changed her mind: remove the previous copy
      setPhotoUri(uri);
    } catch (e) {
      console.warn('Could not pick the photo', e);
      Alert.alert(t('profile.photoError'));
    }
  };

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const err = (key?: string) => (key ? t(key) : undefined);

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      // Android shows its own calendar dialog.
      DateTimePickerAndroid.open({
        value: birth ?? DEFAULT_BIRTH,
        mode: 'date',
        maximumDate: new Date(),
        onChange: (event, date) => {
          if (event.type === 'set' && date) setBirth(date);
        },
      });
    } else {
      if (!birth) setBirth(DEFAULT_BIRTH); // so "Done" without scrolling still saves a date
      setShowIosDate(true);
    }
  };

  const validate = () => {
    const next: Errors = {};

    if (name.trim().length < 2) next.name = 'register.errName';
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'register.errEmail';
    if (!toInternational(country, phone.trim())) next.phone = 'register.errPhone';
    if (!birth) next.birth = 'register.errBirth';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting || !validate() || !birth) return;
    setSubmitting(true);
    try {
      // Saves the profile; the root navigator then opens the questionnaire.
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: toInternational(country, phone.trim()) ?? phone.trim(), // e.g. +212612345678
        birthDate: toIsoDate(birth),
        language, // the app and the questions continue in this language
        photoUri,
      });
    } catch {
      setErrors({ email: 'register.errSave' });
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.iconCircle,
              { alignSelf: dir.row === 'row' ? 'flex-start' : 'flex-end' },
            ]}
          >
            <Ionicons name="heart" size={28} color={colors.rose} />
          </View>
          <Text style={[styles.title, text]}>{t('register.title')}</Text>
          <Text style={[styles.subtitle, text]}>{t('register.subtitle')}</Text>

          {/* Optional profile photo */}
          <View style={styles.photoWrap}>
            <Avatar
              uri={photoUri}
              name={name}
              size={88}
              onPress={choosePhoto}
              accessibilityLabel={t(photoUri ? 'profile.changePhoto' : 'profile.addPhoto')}
            />
            <Text style={styles.photoHint}>
              {t(photoUri ? 'profile.changePhoto' : 'profile.addPhoto')} ({t('profile.optional')})
            </Text>
          </View>

          {/* Language first: the whole form switches to it as soon as she picks one. */}
          <SelectField
            label={t('register.language')}
            icon="language-outline"
            value={languageInfo.native}
            placeholder=""
            onPress={() => setShowLanguages(true)}
          />
          <Field
            label={t('register.name')}
            icon="person-outline"
            placeholder={t('register.namePlaceholder')}
            value={name}
            onChangeText={setName}
            error={err(errors.name)}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          <Field
            label={t('register.email')}
            icon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            error={err(errors.email)}
            inputRef={emailRef}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
          />
          <SelectField
            label={t('register.country')}
            icon="globe-outline"
            leading={selectedCountry.flag}
            value={`${countryName(selectedCountry, language)} (+${selectedCountry.dial})`}
            placeholder=""
            onPress={() => setShowCountries(true)}
          />
          <Field
            label={t('register.phone')}
            icon="call-outline"
            prefix={`+${selectedCountry.dial}`}
            placeholder={phonePlaceholder(country)}
            value={phone}
            onChangeText={onPhoneChange}
            error={err(errors.phone)}
            inputRef={phoneRef}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <SelectField
            label={t('register.birth')}
            icon="calendar-outline"
            value={birth ? formatDate(birth) : undefined}
            placeholder={t('register.birthPlaceholder')}
            error={err(errors.birth)}
            onPress={openDatePicker}
          />

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
            accessibilityRole="button"
          >
            {submitting ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.buttonText}>{t('register.submit')}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>{t('register.note')}</Text>
          <RestoreLink />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* iOS date picker (Android uses its native dialog above) */}
      {Platform.OS === 'ios' && (
        <BottomSheet
          visible={showIosDate}
          title={t('register.birth')}
          onClose={() => setShowIosDate(false)}
        >
          <DateTimePicker
            value={birth ?? DEFAULT_BIRTH}
            mode="date"
            display="spinner"
            locale={language}
            maximumDate={new Date()}
            themeVariant="light"
            onChange={(_, date) => date && setBirth(date)}
          />
          <TouchableOpacity style={styles.button} onPress={() => setShowIosDate(false)}>
            <Text style={styles.buttonText}>{t('common.done')}</Text>
          </TouchableOpacity>
        </BottomSheet>
      )}

      <CountrySheet
        visible={showCountries}
        selected={country}
        onSelect={(c) => {
          setCountry(c.iso);
          setPhone(''); // a number typed for another country would not match
          setErrors((e) => ({ ...e, phone: undefined }));
          setShowCountries(false);
          setTimeout(() => phoneRef.current?.focus(), 300);
        }}
        onClose={() => setShowCountries(false)}
      />

      <LanguageSheet
        visible={showLanguages}
        selected={language}
        onSelect={(code) => {
          setLanguage(code); // switches the whole screen to this language immediately
          setShowLanguages(false);
        }}
        onClose={() => setShowLanguages(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peachSoft,
  },
  title: { marginTop: 20, fontSize: 30, fontWeight: '700', color: colors.text },
  subtitle: { marginTop: 6, marginBottom: 28, fontSize: 15, color: colors.muted },

  photoWrap: { alignItems: 'center', gap: 8, marginBottom: 24 },
  photoHint: { fontSize: 14, color: colors.muted },

  fieldWrap: { marginBottom: 18 },
  label: { marginBottom: 8, fontSize: 14, fontWeight: '600', color: colors.text },
  inputRow: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(44, 37, 45, 0.08)',
    backgroundColor: colors.white,
  },
  inputRowError: { borderColor: colors.rose },
  input: { flex: 1, fontSize: 16, color: colors.text },
  flag: { fontSize: 20 },
  prefix: { fontSize: 16, fontWeight: '600', color: colors.text },
  selectText: { paddingVertical: 0 },
  placeholder: { color: colors.muted },
  error: { marginTop: 6, fontSize: 13, color: colors.rose },

  button: {
    marginTop: 12,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peach,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 17, fontWeight: '700', color: colors.text },
  note: { marginTop: 16, fontSize: 13, textAlign: 'center', color: colors.muted },
});