import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useCycle } from '../../context/CycleContext';
import { useUser } from '../../context/UserContext';
import { LogOption, MOOD_OPTIONS, SYMPTOM_OPTIONS } from '../../data/logOptions';
import { useI18n } from '../../i18n/I18nContext';
import { cardShadow, colors } from '../../theme';
import { getCycleProfile } from '../../utils/cycleFromAnswers';
import { CountItem, buildInsights } from '../../utils/insights';

const BAR_AREA = 110; // height of the tallest bar

/** Cycle statistics and the symptoms / moods she logs most. */
export default function InsightsScreen() {
  const { answers } = useUser();
  const { periods, logs } = useCycle();
  const { t, dir } = useI18n();
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;

  const profile = getCycleProfile(answers);
  const insights = buildInsights(periods, profile.ready ? profile.settings : null, logs);
  const { recent, averageCycle, averagePeriod, regular } = insights;

  const maxLen = recent.length ? Math.max(...recent) : 1;

  /** Horizontal bars for the most common symptoms or moods. */
  const renderCounts = (items: CountItem[], options: LogOption[]) => {
    const top = items[0]?.count ?? 1;
    return items.map((item) => {
      const option = options.find((o) => o.id === item.id);
      return (
        <View key={item.id} style={[styles.countRow, { flexDirection: dir.row }]}>
          <MaterialCommunityIcons
            name={option?.icon ?? 'circle-small'}
            size={20}
            color={colors.rose}
          />
          <Text style={[styles.countLabel, text]} numberOfLines={1}>
            {option ? t(option.labelKey) : item.id}
          </Text>
          <View style={[styles.track, { flexDirection: dir.row }]}>
            <View style={[styles.fill, { width: `${(item.count / top) * 100}%` }]} />
          </View>
          <Text style={styles.countNumber}>{item.count}</Text>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, text]}>{t('insights.title')}</Text>

        {/* Cycle numbers */}
        {averageCycle === null ? (
          <View style={styles.card}>
            <Text style={[styles.empty, text]}>{t('insights.noCycles')}</Text>
          </View>
        ) : (
          <>
            <View style={[styles.statsRow, { flexDirection: dir.row }]}>
              <View style={[styles.card, styles.stat]}>
                <Text style={[styles.statLabel, text]}>{t('insights.avgCycle')}</Text>
                <Text style={[styles.statValue, text]}>
                  {t('insights.days', { n: averageCycle })}
                </Text>
              </View>
              <View style={[styles.card, styles.stat]}>
                <Text style={[styles.statLabel, text]}>{t('insights.avgPeriod')}</Text>
                <Text style={[styles.statValue, text]}>
                  {averagePeriod === null ? '–' : t('insights.days', { n: averagePeriod })}
                </Text>
              </View>
            </View>

            <View style={[styles.card, styles.block]}>
              <View style={[styles.regularRow, { flexDirection: dir.row }]}>
                <Text style={[styles.statLabel, text]}>{t('insights.regularity')}</Text>
                <View
                  style={[
                    styles.pill,
                    regular === null && styles.pillNeutral,
                    regular === false && styles.pillWarn,
                  ]}
                >
                  <Text style={styles.pillText}>
                    {regular === null
                      ? t('insights.needMore')
                      : regular
                        ? t('insights.regular')
                        : t('insights.irregular')}
                  </Text>
                </View>
              </View>
              {regular !== null && (
                <Text style={[styles.hint, text]}>
                  {regular ? t('insights.regularHint') : t('insights.irregularHint')}
                </Text>
              )}
              <Text style={[styles.hint, text]}>
                {t('insights.range', { min: insights.shortest ?? '-', max: insights.longest ?? '-' })}
              </Text>
              <Text style={[styles.hint, text]}>
                {t('cycle.basedOnCycles', { n: recent.length })}
              </Text>
            </View>

            {/* Bars: one per cycle, oldest first */}
            <Text style={[styles.sectionTitle, text]}>{t('insights.lastCycles')}</Text>
            <View style={[styles.card, styles.block]}>
              <View style={[styles.bars, { flexDirection: dir.row }]}>
                {recent.map((len, i) => (
                  <View key={i} style={styles.barCol}>
                    <Text style={styles.barValue}>{len}</Text>
                    <View style={[styles.bar, { height: Math.max(8, (len / maxLen) * BAR_AREA) }]} />
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Symptoms and moods */}
        {insights.topSymptoms.length === 0 && insights.topMoods.length === 0 ? (
          <View style={[styles.card, styles.block]}>
            <Text style={[styles.empty, text]}>{t('insights.noSymptoms')}</Text>
          </View>
        ) : (
          <>
            {insights.topSymptoms.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, text]}>{t('insights.commonSymptoms')}</Text>
                <View style={[styles.card, styles.block]}>
                  {renderCounts(insights.topSymptoms, SYMPTOM_OPTIONS)}
                </View>
              </>
            )}
            {insights.topMoods.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, text]}>{t('insights.commonMoods')}</Text>
                <View style={[styles.card, styles.block]}>
                  {renderCounts(insights.topMoods, MOOD_OPTIONS)}
                </View>
              </>
            )}
            <Text style={[styles.hint, styles.footer, text]}>
              {t('insights.daysLogged', { n: insights.daysLogged })}
            </Text>
          </>
        )}

        <Text style={[styles.disclaimer, text]}>{t('cycle.disclaimer')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  title: { fontSize: 30, fontWeight: '700', color: colors.text, marginBottom: 16 },

  card: { padding: 18, borderRadius: 24, backgroundColor: colors.white, ...cardShadow },
  block: { marginTop: 14 },
  empty: { fontSize: 15, lineHeight: 24, color: colors.muted },

  // Numbers
  statsRow: { gap: 14 },
  stat: { flex: 1 },
  statLabel: { fontSize: 14, color: colors.muted },
  statValue: { marginTop: 6, fontSize: 22, fontWeight: '700', color: colors.text },
  regularRow: { alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.peach,
  },
  pillNeutral: { backgroundColor: colors.peachSoft },
  pillWarn: { backgroundColor: colors.lilac },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.text },
  hint: { marginTop: 8, fontSize: 13, lineHeight: 20, color: colors.muted },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 2,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

  // Bars
  bars: { alignItems: 'flex-end', justifyContent: 'center', gap: 10, minHeight: BAR_AREA + 24 },
  barCol: { flex: 1, maxWidth: 48, alignItems: 'center', justifyContent: 'flex-end' },
  barValue: { marginBottom: 4, fontSize: 12, fontWeight: '700', color: colors.text },
  bar: { width: '100%', borderRadius: 10, backgroundColor: colors.peach },

  // Counts
  countRow: { alignItems: 'center', gap: 10, paddingVertical: 7 },
  countLabel: { width: 96, fontSize: 14, fontWeight: '600', color: colors.text },
  track: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.peachSoft },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.rose },
  countNumber: { width: 24, textAlign: 'center', fontSize: 13, fontWeight: '700', color: colors.muted },

  footer: { marginTop: 14 },
  disclaimer: { marginTop: 24, fontSize: 12, lineHeight: 18, color: colors.muted },
});