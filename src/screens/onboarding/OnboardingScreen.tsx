import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { useUser } from '../../context/UserContext';
import { Answer, Answers, Question, UNKNOWN, visibleQuestions } from '../../data/questions';
import { useI18n } from '../../i18n/I18nContext';
import { cardShadow, colors } from '../../theme';

// ---------- Date helpers ----------

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const daysAgo = (n: number) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
};

const DATE_SHORTCUTS = [
  { labelKey: 'onb.today', days: 0 },
  { labelKey: 'onb.yesterday', days: 1 },
  { labelKey: 'onb.weekAgo', days: 7 },
];

// ---------- Question body + footer ----------

const initialDraft = (q: Question, saved: Answer | undefined): Answer => {
  if (q.type === 'number') return typeof saved === 'number' ? saved : (q.defaultValue ?? q.min ?? 0);
  if (q.type === 'multi') return Array.isArray(saved) ? saved : [];
  return typeof saved === 'string' && saved !== UNKNOWN ? saved : null;
};

const isValid = (q: Question, draft: Answer) => {
  if (q.type === 'number') return typeof draft === 'number';
  if (q.type === 'multi') return Array.isArray(draft) && draft.length > 0;
  return typeof draft === 'string';
};

interface QuestionViewProps {
  question: Question;
  saved: Answer | undefined;
  isLast: boolean;
  onSubmit: (value: Answer) => void;
}

/** Remounted for every question (via `key`), so each one starts with a fresh draft. */
function QuestionView({ question: q, saved, isLast, onSubmit }: QuestionViewProps) {
  const { t, has, dir, language, formatDate } = useI18n();
  const [draft, setDraft] = useState<Answer>(() => initialDraft(q, saved));
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;

  const toggleMulti = (value: string, exclusive?: boolean) => {
    const current = Array.isArray(draft) ? draft : [];
    if (current.includes(value)) return setDraft(current.filter((v) => v !== value));
    if (exclusive) return setDraft([value]);
    const withoutExclusive = current.filter(
      (v) => !q.options?.find((o) => o.value === v)?.exclusive
    );
    setDraft([...withoutExclusive, value]);
  };

  const openAndroidDate = () =>
    DateTimePickerAndroid.open({
      value: typeof draft === 'string' ? fromIso(draft) : new Date(),
      mode: 'date',
      maximumDate: new Date(),
      minimumDate: daysAgo(365),
      onChange: (event, date) => {
        if (event.type === 'set' && date) setDraft(toIso(date));
      },
    });

  const step = (delta: number) => {
    const n = typeof draft === 'number' ? draft : (q.defaultValue ?? 0);
    setDraft(Math.min(q.max ?? n + delta, Math.max(q.min ?? n + delta, n + delta)));
  };

  const subtitleKey = `q.${q.id}.subtitle`;

  return (
    <>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {q.reassurance ? (
          <View
            style={[
              styles.reassurance,
              {
                flexDirection: dir.row,
                alignSelf: dir.row === 'row' ? 'flex-start' : 'flex-end',
              },
            ]}
          >
            <Ionicons name="lock-closed" size={14} color={colors.rose} />
            <Text style={styles.reassuranceText}>{t('onb.privacy')}</Text>
          </View>
        ) : null}

        <Text style={[styles.title, text]}>{t(`q.${q.id}.title`)}</Text>
        {has(subtitleKey) ? <Text style={[styles.subtitle, text]}>{t(subtitleKey)}</Text> : null}

        {/* Single / multi choice */}
        {(q.type === 'single' || q.type === 'multi') &&
          q.options?.map((opt) => {
            const selected =
              q.type === 'single'
                ? draft === opt.value
                : Array.isArray(draft) && draft.includes(opt.value);
            const label = t(`q.${q.id}.o.${opt.value}`);
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.option,
                  { flexDirection: dir.row },
                  selected && styles.optionSelected,
                ]}
                activeOpacity={0.85}
                onPress={() =>
                  q.type === 'single' ? setDraft(opt.value) : toggleMulti(opt.value, opt.exclusive)
                }
                accessibilityRole={q.type === 'single' ? 'radio' : 'checkbox'}
                accessibilityState={{ selected, checked: selected }}
                accessibilityLabel={label}
              >
                <View
                  style={[
                    q.type === 'single' ? styles.radio : styles.checkbox,
                    selected && styles.indicatorOn,
                  ]}
                >
                  {selected ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
                </View>
                <Text style={[styles.optionText, text]}>{label}</Text>
              </TouchableOpacity>
            );
          })}

        {/* Number stepper */}
        {q.type === 'number' && (
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => step(-1)}
              accessibilityLabel={t('onb.decrease')}
              hitSlop={8}
            >
              <Ionicons name="remove" size={28} color={colors.rose} />
            </TouchableOpacity>
            <View style={styles.stepValueWrap}>
              <Text style={styles.stepValue}>{typeof draft === 'number' ? draft : ''}</Text>
              {q.unit ? <Text style={styles.stepUnit}>{t(`unit.${q.unit}`)}</Text> : null}
            </View>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => step(1)}
              accessibilityLabel={t('onb.increase')}
              hitSlop={8}
            >
              <Ionicons name="add" size={28} color={colors.rose} />
            </TouchableOpacity>
          </View>
        )}

        {/* Date: quick shortcuts + full picker */}
        {q.type === 'date' && (
          <>
            <View style={[styles.chips, { flexDirection: dir.row }]}>
              {DATE_SHORTCUTS.map((s) => {
                const iso = toIso(daysAgo(s.days));
                const on = draft === iso;
                return (
                  <TouchableOpacity
                    key={s.labelKey}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => setDraft(iso)}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{t(s.labelKey)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {Platform.OS === 'android' ? (
              <TouchableOpacity
                style={[styles.dateButton, { flexDirection: dir.row }]}
                onPress={openAndroidDate}
                accessibilityRole="button"
              >
                <Ionicons name="calendar-outline" size={20} color={colors.muted} />
                <Text
                  style={[styles.dateText, text, typeof draft !== 'string' && { color: colors.muted }]}
                >
                  {typeof draft === 'string' ? formatDate(fromIso(draft)) : t('onb.otherDate')}
                </Text>
              </TouchableOpacity>
            ) : (
              <DateTimePicker
                value={typeof draft === 'string' ? fromIso(draft) : new Date()}
                mode="date"
                display="spinner"
                locale={language}
                maximumDate={new Date()}
                minimumDate={daysAgo(365)}
                onChange={(_, date) => date && setDraft(toIso(date))}
              />
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primary, !isValid(q, draft) && styles.primaryDisabled]}
          activeOpacity={0.85}
          disabled={!isValid(q, draft)}
          onPress={() => onSubmit(draft)}
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>{isLast ? t('common.finish') : t('common.next')}</Text>
        </TouchableOpacity>

        {q.allowUnknown || q.skippable ? (
          <View style={[styles.secondaryRow, { flexDirection: dir.row }]}>
            {q.allowUnknown ? (
              <TouchableOpacity
                onPress={() => onSubmit(UNKNOWN)}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryText}>{t('common.unknown')}</Text>
              </TouchableOpacity>
            ) : null}
            {q.skippable ? (
              <TouchableOpacity onPress={() => onSubmit(null)} hitSlop={8} accessibilityRole="button">
                <Text style={styles.secondaryText}>{t('common.skip')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
    </>
  );
}

// ---------- Screen ----------

/**
 * Shown once after registration, in the language she chose. Progress is saved after every
 * answer, so she can resume later.
 */
export default function OnboardingScreen() {
  const { answers: saved, saveAnswers, completeOnboarding } = useUser();
  const { t, dir, isRTL } = useI18n();
  const [answers, setAnswers] = useState<Answers>(saved);

  // Resume at the first unanswered question (or the last one if everything was answered).
  const [currentId, setCurrentId] = useState(() => {
    const list = visibleQuestions(saved);
    return (list.find((q) => !(q.id in saved)) ?? list[list.length - 1]).id;
  });

  const list = visibleQuestions(answers);
  const index = Math.max(
    0,
    list.findIndex((q) => q.id === currentId)
  );
  const question = list[index];
  const progress = ((index + 1) / list.length) * 100;

  const submit = (value: Answer) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    saveAnswers(next);

    const nextList = visibleQuestions(next);
    const i = nextList.findIndex((q) => q.id === question.id);
    if (i >= nextList.length - 1) {
      // Drop answers to questions that no longer apply, then open the app.
      const ids = new Set(nextList.map((q) => q.id));
      const final = Object.fromEntries(Object.entries(next).filter(([id]) => ids.has(id)));
      completeOnboarding(final);
    } else {
      setCurrentId(nextList[i + 1].id);
    }
  };

  const goBack = () => {
    if (index > 0) setCurrentId(list[index - 1].id);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={[styles.headerTop, { flexDirection: dir.row }]}>
          {index > 0 ? (
            <TouchableOpacity
              onPress={goBack}
              hitSlop={10}
              style={styles.back}
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
            >
              <Ionicons
                name={isRTL ? 'arrow-forward' : 'arrow-back'}
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.back} />
          )}
          <Text style={styles.phase}>
            {t('onb.phase', { n: question.phase, title: t(`onb.phase.${question.phase}`) })}
          </Text>
          <Text style={styles.counter}>
            {index + 1}/{list.length}
          </Text>
        </View>
        <View style={[styles.track, { flexDirection: dir.row }]}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
      </View>

      <QuestionView
        key={question.id}
        question={question}
        saved={answers[question.id]}
        isLast={index === list.length - 1}
        onSubmit={submit}
      />
    </SafeAreaView>
  );
}

// Direction-dependent bits (row order, text alignment) are applied inline from useI18n().dir.
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 8 },
  headerTop: { alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  phase: { fontSize: 14, fontWeight: '600', color: colors.muted },
  counter: { width: 40, fontSize: 13, color: colors.muted, textAlign: 'center' },
  track: {
    height: 6,
    marginTop: 8,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.peachSoft,
  },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.rose },

  // Body
  body: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 },
  reassurance: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.peachSoft,
  },
  reassuranceText: { flexShrink: 1, fontSize: 12, fontWeight: '600', color: colors.text },
  title: { fontSize: 26, lineHeight: 38, fontWeight: '700', color: colors.text },
  subtitle: { marginTop: 8, marginBottom: 4, fontSize: 15, lineHeight: 24, color: colors.muted },

  // Options
  option: {
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: colors.white,
    ...cardShadow,
  },
  optionSelected: { borderColor: colors.rose, backgroundColor: colors.peachSoft },
  optionText: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorOn: { borderColor: colors.rose, backgroundColor: colors.rose },

  // Number stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 40,
  },
  stepBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    ...cardShadow,
  },
  stepValueWrap: { minWidth: 110, alignItems: 'center' },
  stepValue: { fontSize: 64, lineHeight: 72, fontWeight: '700', color: colors.text },
  stepUnit: { fontSize: 16, color: colors.muted },

  // Date
  chips: { flexWrap: 'wrap', gap: 10, marginTop: 20 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.peach,
  },
  chipOn: { backgroundColor: colors.rose, borderColor: colors.rose },
  chipText: { fontSize: 15, fontWeight: '600', color: colors.text },
  chipTextOn: { color: colors.white },
  dateButton: {
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 18,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.white,
    ...cardShadow,
  },
  dateText: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },

  // Footer
  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  primary: {
    height: 54,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peach,
  },
  primaryDisabled: { opacity: 0.4 },
  primaryText: { fontSize: 17, fontWeight: '700', color: colors.text },
  secondaryRow: { justifyContent: 'center', gap: 28, marginTop: 16 },
  secondaryText: { fontSize: 15, fontWeight: '600', color: colors.muted },
});