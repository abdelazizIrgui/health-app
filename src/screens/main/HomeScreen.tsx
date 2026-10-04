import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import LogSheet from '../../components/LogSheet';
import { useCycle } from '../../context/CycleContext';
import type { LogKind } from '../../data/logOptions';
import { useUser } from '../../context/UserContext';
import { useI18n } from '../../i18n/I18nContext';
import { cardShadow, colors } from '../../theme';
import { getCycleProfile } from '../../utils/cycleFromAnswers';
import { buildForecast, toIsoDate } from '../../utils/forecast';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const QUICK_ACTIONS: { id: LogKind; labelKey: string; icon: IconName }[] = [
  { id: 'flow', labelKey: 'home.logFlow', icon: 'water' },
  { id: 'symptoms', labelKey: 'home.logSymptoms', icon: 'heart-pulse' },
  { id: 'mood', labelKey: 'home.logMood', icon: 'emoticon-happy' },
];

export default function HomeScreen() {
  const { user, answers } = useUser();
  const { periods, logs, startPeriod, endPeriod, undoToday } = useCycle();
  const [logKind, setLogKind] = useState<LogKind | null>(null);
  const { t, dir, formatDate } = useI18n();
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;

  const profile = getCycleProfile(answers);
  const paused = !profile.ready && profile.reason === 'pregnant';
  const forecast = paused ? null : buildForecast(periods, profile.ready ? profile.settings : null);

  const firstName = user?.name.trim().split(' ')[0];
  const dateText = formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' });
  const shortDate = (d: Date) => formatDate(d, { day: 'numeric', month: 'short' });
  const dateRange = (a: Date, b: Date) => `${shortDate(a)} – ${shortDate(b)}`;

  // Undo is offered only for what she logged today (a wrong tap).
  const todayIso = toIsoDate(new Date());
  const lastLogged = periods[periods.length - 1];
  const canUndo = !!lastLogged && (lastLogged.start === todayIso || lastLogged.end === todayIso);

  // One big button: "started today" or, while a period is open, "ended today".
  const showMainButton = !paused && (!forecast || !forecast.onPeriod || forecast.openPeriod);
  const mainIsEnd = !!forecast && forecast.openPeriod;
  const onMainPress = () => {
    if (mainIsEnd) endPeriod();
    else startPeriod();
  };

  // A filled circle on a quick-log button means something is already logged today.
  const todayLog = logs[todayIso];
  const isLoggedToday = (kind: LogKind) =>
    kind === 'flow' ? !!todayLog?.flow : kind === 'mood' ? !!todayLog?.mood : !!todayLog?.symptoms?.length;

  const ringColor =
    forecast?.phase === 'menstrual'
      ? colors.rose
      : forecast?.phase === 'fertile'
        ? colors.lilac
        : colors.peach;
  const haloColor = forecast?.phase === 'fertile' ? colors.lilacSoft : colors.peachSoft;

  const statusText = (() => {
    if (!forecast) return '';
    if (forecast.onPeriod) return t('home.periodDay', { day: forecast.day });
    if (forecast.daysLate > 0) return t('cycle.late', { n: forecast.daysLate });
    if (forecast.phase === 'fertile') return t('home.fertile');
    if (forecast.daysUntilPeriod > 0) return t('home.periodIn', { n: forecast.daysUntilPeriod });
    return t('cycle.anyDay');
  })();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header: greeting, date and current mode */}
        <View style={styles.header}>
          <Text style={[styles.greeting, text]}>
            {firstName ? t('home.greeting', { name: firstName }) : t('home.greetingAnon')}
          </Text>
          <Text style={[styles.date, text]}>{dateText}</Text>
          <View
            style={[
              styles.badge,
              { flexDirection: dir.row, alignSelf: dir.row === 'row' ? 'flex-start' : 'flex-end' },
            ]}
          >
            <MaterialCommunityIcons name="water" size={16} color={colors.rose} />
            <Text style={styles.badgeText}>{t('home.mode')}</Text>
          </View>
        </View>

        {/* Central tracker card */}
        <View style={styles.trackerCard}>
          {forecast ? (
            <>
              <View style={[styles.halo, { backgroundColor: haloColor }]}>
                <View style={[styles.ring, { borderColor: ringColor }]}>
                  <Text style={styles.dayLabel}>{t('home.day')}</Text>
                  <Text style={styles.dayNumber}>{forecast.day}</Text>
                  <Text style={styles.dayOf}>{t('home.dayOf', { n: forecast.cycleLength })}</Text>
                </View>
              </View>

              <View style={[styles.statusPill, { backgroundColor: ringColor }]}>
                <Text
                  style={[
                    styles.statusText,
                    forecast.phase === 'menstrual' && { color: colors.white },
                  ]}
                >
                  {statusText}
                </Text>
              </View>
              <Text style={styles.phase}>{t(`phase.${forecast.phase}`)}</Text>
            </>
          ) : (
            <Text style={styles.waiting}>
              {t(`home.waiting.${profile.ready ? 'no_date' : profile.reason}`)}
            </Text>
          )}
        </View>

        {/* Main action: log the start / end of the period */}
        {showMainButton && (
          <TouchableOpacity
            style={[styles.mainButton, { flexDirection: dir.row }]}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t(mainIsEnd ? 'cycle.endToday' : 'cycle.startToday')}
            onPress={onMainPress}
          >
            <MaterialCommunityIcons
              name={mainIsEnd ? 'check-circle-outline' : 'water-plus'}
              size={24}
              color={colors.white}
            />
            <Text style={styles.mainButtonText}>
              {t(mainIsEnd ? 'cycle.endToday' : 'cycle.startToday')}
            </Text>
          </TouchableOpacity>
        )}
        {canUndo && !paused && (
          <TouchableOpacity
            style={styles.undo}
            accessibilityRole="button"
            accessibilityLabel={t('cycle.undo')}
            onPress={undoToday}
          >
            <Text style={styles.undoText}>{t('cycle.undo')}</Text>
          </TouchableOpacity>
        )}

        {/* Predictions */}
        {forecast && (
          <View style={styles.infoCard}>
            <View style={[styles.infoRow, { flexDirection: dir.row }]}>
              <View style={[styles.infoLabelWrap, { flexDirection: dir.row }]}>
                <MaterialCommunityIcons name="calendar-heart" size={20} color={colors.rose} />
                <Text style={styles.infoLabel}>{t('cycle.nextPeriod')}</Text>
              </View>
              <Text style={styles.infoValue}>
                {forecast.irregular
                  ? dateRange(forecast.earliestStart, forecast.latestStart)
                  : shortDate(forecast.nextStart)}
              </Text>
            </View>

            {!forecast.irregular && (
              <View style={[styles.infoRow, { flexDirection: dir.row }]}>
                <View style={[styles.infoLabelWrap, { flexDirection: dir.row }]}>
                  <MaterialCommunityIcons name="flower-tulip" size={20} color={colors.lilac} />
                  <Text style={styles.infoLabel}>{t('home.fertile')}</Text>
                </View>
                <Text style={styles.infoValue}>
                  {dateRange(forecast.fertileStart, forecast.fertileEnd)}
                </Text>
              </View>
            )}

            <Text style={[styles.note, text]}>
              {forecast.cyclesUsed > 0
                ? t('cycle.basedOnCycles', { n: forecast.cyclesUsed })
                : t('cycle.earlyEstimate')}
            </Text>
            {forecast.irregular && <Text style={[styles.note, text]}>{t('cycle.irregular')}</Text>}
          </View>
        )}

        {/* Quick log buttons (horizontal scroll) */}
        <Text style={[styles.sectionTitle, text]}>{t('home.quickLog')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.actionsScroll}
          contentContainerStyle={[styles.actionsContent, { flexDirection: dir.row, flexGrow: 1 }]}
        >
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t(action.labelKey)}
              onPress={() => setLogKind(action.id)}
            >
              <View style={[styles.actionIcon, isLoggedToday(action.id) && styles.actionIconOn]}>
                <MaterialCommunityIcons name={action.icon} size={30} color={colors.rose} />
              </View>
              <Text style={styles.actionLabel}>{t(action.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.disclaimer, text]}>{t('cycle.disclaimer')}</Text>
      </ScrollView>

      <LogSheet kind={logKind} onClose={() => setLogKind(null)} />
    </SafeAreaView>
  );
}

const HALO = 240;
const RING = 196;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },

  // Header
  header: { marginBottom: 24 },
  greeting: { fontSize: 30, fontWeight: '700', color: colors.text },
  date: { fontSize: 15, color: colors.muted, marginTop: 4 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.peachSoft,
  },
  badgeText: { fontSize: 13, fontWeight: '600', color: colors.text },

  // Tracker card
  trackerCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: colors.white,
    ...cardShadow,
  },
  halo: {
    width: HALO,
    height: HALO,
    borderRadius: HALO / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peachSoft,
  },
  ring: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 10,
    borderColor: colors.peach,
  },
  dayLabel: { fontSize: 16, color: colors.muted, fontWeight: '500' },
  dayNumber: { fontSize: 60, lineHeight: 68, fontWeight: '700', color: colors.text },
  dayOf: { fontSize: 14, color: colors.muted },
  statusPill: {
    marginTop: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.peach,
  },
  statusText: { fontSize: 15, fontWeight: '700', color: colors.text },
  phase: { marginTop: 10, fontSize: 14, color: colors.muted },
  waiting: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    color: colors.muted,
    paddingVertical: 24,
  },

  // Main button + undo
  mainButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 56,
    marginTop: 20,
    paddingHorizontal: 20,
    borderRadius: 28,
    backgroundColor: colors.rose,
    ...cardShadow,
  },
  mainButtonText: { fontSize: 17, fontWeight: '700', color: colors.white },
  undo: { alignSelf: 'center', marginTop: 8, paddingVertical: 8, paddingHorizontal: 16 },
  undoText: { fontSize: 15, fontWeight: '600', color: colors.rose },

  // Predictions
  infoCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.white,
    ...cardShadow,
  },
  infoRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  infoLabelWrap: { flexShrink: 1, alignItems: 'center', gap: 8 },
  infoLabel: { flexShrink: 1, fontSize: 15, color: colors.muted },
  infoValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  note: { marginTop: 8, fontSize: 13, lineHeight: 20, color: colors.muted },

  // Quick actions
  sectionTitle: {
    marginTop: 28,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  actionsScroll: { marginHorizontal: -20 }, // let the row scroll edge to edge
  actionsContent: { paddingHorizontal: 20, paddingVertical: 8, gap: 12 },
  actionButton: {
    width: 116,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    ...cardShadow,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: colors.peachSoft,
  },
  actionIconOn: { backgroundColor: colors.peach },
  actionLabel: { fontSize: 14, fontWeight: '600', color: colors.text },

  disclaimer: { marginTop: 24, fontSize: 12, lineHeight: 18, color: colors.muted },
});