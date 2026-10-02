import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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

import { useUser } from '../../context/UserContext';
import { colors } from '../../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// ---------- Constants ----------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s\-()]+$/;
const DEFAULT_BIRTH = new Date(2000, 0, 1); // where the picker starts

const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'ar', native: 'العربية', english: 'Arabic' },
  { code: 'fr', native: 'Français', english: 'French' },
  { code: 'es', native: 'Español', english: 'Spanish' },
  { code: 'de', native: 'Deutsch', english: 'German' },
  { code: 'pt', native: 'Português', english: 'Portuguese' },
];

// ---------- Helpers ----------

/** "YYYY-MM-DD" from local date parts (avoids timezone shifts from toISOString). */
const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

// ---------- Small UI pieces ----------

interface FieldProps extends TextInputProps {
  label: string;
  icon: IconName;
  error?: string;
  inputRef?: React.Ref<TextInput>;
  rightSlot?: React.ReactNode;
}

/** Labeled text input with a leading icon and an inline error message. */
function Field({ label, icon, error, inputRef, rightSlot, ...inputProps }: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <Ionicons name={icon} size={20} color={colors.muted} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholderTextColor={colors.muted}
          {...inputProps}
        />
        {rightSlot}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

interface SelectFieldProps {
  label: string;
  icon: IconName;
  value?: string;
  placeholder: string;
  error?: string;
  onPress: () => void;
}

/** Looks like an input, but opens a picker when tapped. */
function SelectField({ label, icon, value, placeholder, error, onPress }: SelectFieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputRow, error ? styles.inputRowError : null]}
        activeOpacity={0.8}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ?? placeholder}`}
      >
        <Ionicons name={icon} size={20} color={colors.muted} />
        <Text style={[styles.input, styles.selectText, !value && styles.placeholder]}>
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

/** Simple bottom sheet used for the language list and the iOS date picker. */
function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        {children}
      </View>
    </Modal>
  );
}

// ---------- Screen ----------

type Errors = {
  name?: string;
  email?: string;
  phone?: string;
  birth?: string;
  language?: string;
  password?: string;
};

export default function RegisterScreen() {
  const { register } = useUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birth, setBirth] = useState<Date | null>(null);
  const [languageCode, setLanguageCode] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const [showIosDate, setShowIosDate] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const language = LANGUAGES.find((l) => l.code === languageCode);

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
    const phoneDigits = phone.replace(/\D/g, '');

    if (name.trim().length < 2) next.name = 'Enter your name';
    if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address';
    if (!PHONE_PATTERN.test(phone.trim()) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      next.phone = 'Enter a valid phone number';
    }
    if (!birth) next.birth = 'Select your birth date';
    if (!languageCode) next.language = 'Select your language';
    if (password.length < 8) next.password = 'Use at least 8 characters';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting || !validate() || !birth || !languageCode) return;
    setSubmitting(true);
    try {
      // Saves the profile; the root navigator then opens the main app.
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        birthDate: toIsoDate(birth),
        language: languageCode,
      });
    } catch {
      setErrors({ email: 'Could not save your account. Please try again.' });
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="heart" size={28} color={colors.rose} />
          </View>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Set up your profile to start tracking your health.</Text>

          <Field
            label="Name"
            icon="person-outline"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            error={errors.name}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          <Field
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            inputRef={emailRef}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
          />
          <Field
            label="Phone number"
            icon="call-outline"
            placeholder="+212 6 00 00 00 00"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            inputRef={phoneRef}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
          <SelectField
            label="Birth date"
            icon="calendar-outline"
            value={birth ? formatDate(birth) : undefined}
            placeholder="Select your birth date"
            error={errors.birth}
            onPress={openDatePicker}
          />
          <SelectField
            label="Language"
            icon="language-outline"
            value={language?.native}
            placeholder="Select your language"
            error={errors.language}
            onPress={() => setShowLanguages(true)}
          />
          <Field
            label="Password"
            icon="lock-closed-outline"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            inputRef={passwordRef}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            rightSlot={
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
            }
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
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>Your health data stays on this device.</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* iOS date picker (Android uses its native dialog above) */}
      {Platform.OS === 'ios' && (
        <BottomSheet visible={showIosDate} title="Birth date" onClose={() => setShowIosDate(false)}>
          <DateTimePicker
            value={birth ?? DEFAULT_BIRTH}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            themeVariant="light"
            onChange={(_, date) => date && setBirth(date)}
          />
          <TouchableOpacity style={styles.button} onPress={() => setShowIosDate(false)}>
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </BottomSheet>
      )}

      {/* Language list */}
      <BottomSheet visible={showLanguages} title="Language" onClose={() => setShowLanguages(false)}>
        {LANGUAGES.map((l) => {
          const selected = l.code === languageCode;
          return (
            <TouchableOpacity
              key={l.code}
              style={styles.option}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                setLanguageCode(l.code);
                setShowLanguages(false);
              }}
            >
              <View>
                <Text style={styles.optionNative}>{l.native}</Text>
                <Text style={styles.optionEnglish}>{l.english}</Text>
              </View>
              {selected && <Ionicons name="checkmark-circle" size={22} color={colors.rose} />}
            </TouchableOpacity>
          );
        })}
      </BottomSheet>
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

  fieldWrap: { marginBottom: 18 },
  label: { marginBottom: 8, fontSize: 14, fontWeight: '600', color: colors.text },
  inputRow: {
    flexDirection: 'row',
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

  // Bottom sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(44, 37, 45, 0.35)' },
  sheet: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.cream,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
    backgroundColor: 'rgba(44, 37, 45, 0.15)',
  },
  sheetTitle: { marginBottom: 8, fontSize: 20, fontWeight: '700', color: colors.text },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(44, 37, 45, 0.12)',
  },
  optionNative: { fontSize: 17, fontWeight: '600', color: colors.text },
  optionEnglish: { marginTop: 2, fontSize: 13, color: colors.muted },
});
