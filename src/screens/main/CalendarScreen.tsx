import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import BottomSheet from '../../components/BottomSheet';
import LogSheet from '../../components/LogSheet';
import { useCycle } from '../../context/CycleContext';
import { useUser } from '../../context/UserContext';
import {
  FLOW_OPTIONS,
  LogKind,
  LogOption,
  MOOD_OPTIONS,
  SYMPTOM_OPTIONS,
} from '../../data/logOptions';
import { useI18n } from '../../i18n/I18nContext';
import { cardShadow, colors } from '../../theme';
import { buildMarks } from '../../utils/calendarDays';
import { getCycleProfile } from '../../utils/cycleFromAnswers';
import { buildForecast, toIsoDate } from '../../utils/forecast';

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const QUICK_KINDS: { id: LogKind; labelKey: string; icon: string }[] = [
  { id: 'flow', labelKey: 'home.logFlow', icon: 'water' },
  { id: 'symptoms', labelKey: 'home.logSymptoms', icon: 'heart-pulse' },
  { id: 'mood', labelKey: 'home.logMood', icon: 'emoticon-happy' },
];

/** Month calendar: periods, predictions, fertile window and what she logged. */
export default function CalendarScreen() {
  const { answers } = useUser();
  const { periods, logs, startPeriod, endPeriod } = useCycle();
  const { t, dir, isRTL, language, formatDate } = useI18n();
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [detail, setDetail] = useState<Date | null>(null);
  const [logTarget, setLogTarget] = useState<{ kind: LogKind; date: Date } | null>(null);

  // Same data as the Home screen, so both screens always agree.
  const profile = getCycleProfile(answers);
  const paused = !profile.ready && profile.reason === 'pregnant';
  const seed = profile.ready ? profile.settings : null;
  const forecast = paused ? null : buildForecast(periods, seed);
  const marks = buildMarks(periods, seed, forecast);

  const todayIso = toIsoDate(new Date());

  // ---- month grid ----
  const weekStart = language === 'en' ? 0 : 1; // Sunday for English, Monday for the others
  const sunday = new Date(2023, 0, 1); // any known Sunday, used only to get weekday names
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    formatDate(addDays(sunday, (weekStart + i) % 7), { weekday: 'short' })
  );

  const year = month.getFullYear();
  const mon = month.getMonth();
  const offset = (month.getDay() - weekStart + 7) % 7;
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, mon, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  // The "previous" arrow points the other way in right-to-left languages.
  const prevIcon = isRTL ? 'chevron-forward' : 'chevron-back';
  const nextIcon = isRTL ? 'chevron-back' : 'chevron-forward';
  const isCurrentMonth = toIsoDate(month) === toIsoDate(startOfMonth(new Date()));

  // ---- day details ----
  const labelOf = (options: LogOption[], id: string) => {
    const found = options.find((o) => o.id === id);
    return found ? t(found.labelKey) : id;
  };

  const openLog = (kind: LogKind) => {
    if (!detail) return;
    setLogTarget({ kind, date: detail });
    setDetail(null); // two sheets at the same time do not work well, so close this one first
  };

  const renderDetail = (date: Date) => {
    const iso = toIsoDate(date);
    const dayMarks = marks[iso] ?? {};
    const dayLog = logs[iso];
    const isFuture = iso > todayIso;

    const last = periods[periods.length - 1];
    const canStart = !isFuture && !dayMarks.period && !periods.some((p) => p.start === iso);
    const canEnd = !!last && !last.end && iso >= last.start && !isFuture;

    const statuses: string[] = [];
    if (dayMarks.period) statuses.push(t('calendar.periodDay'));
    if (dayMarks.predicted) statuses.push(t('calendar.expectedPeriod'));
    if (dayMarks.fertile) statuses.push(t('calendar.fertileDay'));

    const rowsToShow: { label: string; value: string }[] = [];
    if (dayLog?.flow) {
      rowsToShow.push({ label: t('calendar.flow'), value: labelOf(FLOW_OPTIONS, dayLog.flow) });
    }
    if (dayLog?.symptoms?.length) {
      rowsToShow.push({
        label: t('calendar.symptoms'),
        value: dayLog.symptoms.map((id) => labelOf(SYMPTOM_OPTIONS, id)).join(', '),
      });
    }
    if (dayLog?.mood) {
      rowsToShow.push({ label: t('calendar.mood'), value: labelOf(MOOD_OPTIONS, dayLog.mood) });
    }

    return (
      <View>
        {statuses.map((s) => (
          <Text key={s} style={[styles.status, text]}>
            {s}
          </Text>
        ))}

        {rowsToShow.length > 0 ? (
          rowsToShow.map((r) => (
            <View key={r.label} style={[styles.detailRow, { flexDirection: dir.row }]}>
              <Text style={[styles.detailLabel, text]}>{r.label}</Text>
              <Text style={[styles.detailValue, text]}>{r.value}</Text>
            </View>
          ))
        ) : (
          <Text style={[styles.empty, text]}>{t('calendar.nothingLogged')}</Text>
        )}

        {!isFuture && (
          <View style={[styles.kindRow, { flexDirection: dir.row }]}>
            {QUICK_KINDS.map((k) => (
              <TouchableOpacity
                key={k.id}
                style={styles.kindButton}
                activeOpacity={0.8}
                onPress={() => openLog(k.id)}
                accessibilityRole="button"
                accessibilityLabel={t(k.labelKey)}
              >
                <MaterialCommunityIcons
                  name={k.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                  size={26}
                  color={colors.rose}
                />
                <Text style={styles.kindText}>{t(k.labelKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {canStart && (
          <TouchableOpacity
            style={styles.periodButton}
            activeOpacity={0.85}
            onPress={() => {
              startPeriod(date);
              setDetail(null);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.periodButtonText}>{t('calendar.startedThisDay')}</Text>
          </TouchableOpacity>
        )}
        {canEnd && (
          <TouchableOpacity
            style={styles.periodButton}
            activeOpacity={0.85}
            onPress={() => {
              endPeriod(date);
              setDetail(null);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.periodButtonText}>{t('calendar.endedThisDay')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, text]}>{t('calendar.title')}</Text>

        {/* Month header with previous / next */}
        <View style={[styles.monthRow, { flexDirection: dir.row }]}>
          <TouchableOpacity
            style={styles.arrow}
            onPress={() => setMonth(addMonths(month, -1))}
            accessibilityRole="button"
            accessibilityLabel={t('calendar.prevMonth')}
          >
            <Ionicons name={prevIcon} size={22} color={colors.rose} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.monthCenter}
            disabled={isCurrentMonth}
            onPress={() => setMonth(startOfMonth(new Date()))}
            accessibilityRole="button"
            accessibilityLabel={t('calendar.goToday')}
          >
            <Text style={styles.monthText}>{formatDate(month, { month: 'long', year: 'numeric' })}</Text>
            {!isCurrentMonth && <Text style={styles.todayLink}>{t('calendar.goToday')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.arrow}
            onPress={() => setMonth(addMonths(month, 1))}
            accessibilityRole="button"
            accessibilityLabel={t('calendar.nextMonth')}
          >
            <Ionicons name={nextIcon} size={22} color={colors.rose} />
          </TouchableOpacity>
        </View>

        {/* Calendar card */}
        <View style={styles.card}>
          <View style={{ flexDirection: dir.row }}>
            {weekdays.map((w, i) => (
              <View key={i} style={styles.cellWrap}>
                <Text style={styles.weekday} numberOfLines={1}>
                  {w}
                </Text>
              </View>
            ))}
          </View>

          {rows.map((row, r) => (
            <View key={r} style={{ flexDirection: dir.row }}>
              {row.map((date, c) => {
                if (!date) return <View key={c} style={styles.cellWrap} />;
                const iso = toIsoDate(date);
                const m = marks[iso] ?? {};
                const isToday = iso === todayIso;
                const hasLog = !!logs[iso];
                return (
                  <View key={c} style={styles.cellWrap}>
                    <TouchableOpacity
                      style={[
                        styles.cell,
                        m.fertile && styles.cellFertile,
                        m.predicted && styles.cellPredicted,
                        m.period && styles.cellPeriod,
                        isToday && styles.cellToday,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setDetail(date)}
                      accessibilityRole="button"
                      accessibilityLabel={formatDate(date, {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    >
                      <Text
                        style={[
                          styles.cellText,
                          m.period && styles.cellTextOn,
                          isToday && !m.period && styles.cellTextToday,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                      {hasLog && <View style={[styles.dot, m.period && styles.dotOn]} />}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={[styles.legend, { flexDirection: dir.row }]}>
          <View style={[styles.legendItem, { flexDirection: dir.row }]}>
            <View style={[styles.legendSwatch, { backgroundColor: colors.rose }]} />
            <Text style={styles.legendText}>{t('calendar.legendPeriod')}</Text>
          </View>
          <View style={[styles.legendItem, { flexDirection: dir.row }]}>
            <View style={[styles.legendSwatch, styles.legendDashed]} />
            <Text style={styles.legendText}>{t('calendar.legendPredicted')}</Text>
          </View>
          <View style={[styles.legendItem, { flexDirection: dir.row }]}>
            <View style={[styles.legendSwatch, { backgroundColor: colors.lilacSoft }]} />
            <Text style={styles.legendText}>{t('calendar.legendFertile')}</Text>
          </View>
        </View>

        <Text style={[styles.disclaimer, text]}>{t('cycle.disclaimer')}</Text>
      </ScrollView>

      <BottomSheet
        visible={!!detail}
        title={
          detail ? formatDate(detail, { weekday: 'long', day: 'numeric', month: 'long' }) : ''
        }
        onClose={() => setDetail(null)}
      >
        {detail ? renderDetail(detail) : null}
      </BottomSheet>

      <LogSheet
        kind={logTarget?.kind ?? null}
        date={logTarget?.date}
        onClose={() => setLogTarget(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  title: { fontSize: 30, fontWeight: '700', color: colors.text, marginBottom: 16 },

  // Month header
  monthRow: { alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    ...cardShadow,
  },
  monthCenter: { alignItems: 'center', flex: 1 },
  monthText: { fontSize: 18, fontWeight: '700', color: colors.text },
  todayLink: { marginTop: 2, fontSize: 13, fontWeight: '600', color: colors.rose },

  // Grid
  card: { padding: 12, borderRadius: 24, backgroundColor: colors.white, ...cardShadow },
  cellWrap: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  weekday: { textAlign: 'center', fontSize: 11, fontWeight: '600', color: colors.muted },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cellPeriod: { backgroundColor: colors.rose, borderColor: colors.rose },
  cellPredicted: { borderColor: colors.rose, borderStyle: 'dashed' },
  cellFertile: { backgroundColor: colors.lilacSoft },
  cellToday: { borderColor: colors.text, borderStyle: 'solid' },
  cellText: { fontSize: 15, fontWeight: '500', color: colors.text },
  cellTextOn: { color: colors.white, fontWeight: '700' },
  cellTextToday: { fontWeight: '800' },
  dot: {
    position: 'absolute',
    bottom: 5,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.rose,
  },
  dotOn: { backgroundColor: colors.white },

  // Legend
  legend: { justifyContent: 'center', gap: 20, marginTop: 16 },
  legendItem: { alignItems: 'center', gap: 6 },
  legendSwatch: { width: 16, height: 16, borderRadius: 8 },
  legendDashed: { borderWidth: 1.5, borderColor: colors.rose, borderStyle: 'dashed' },
  legendText: { fontSize: 13, color: colors.muted },

  disclaimer: { marginTop: 20, fontSize: 12, lineHeight: 18, color: colors.muted },

  // Day details
  status: { marginBottom: 6, fontSize: 14, fontWeight: '600', color: colors.rose },
  detailRow: { gap: 12, paddingVertical: 6 },
  detailLabel: { width: 90, fontSize: 14, color: colors.muted },
  detailValue: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  empty: { marginVertical: 8, fontSize: 14, color: colors.muted },
  kindRow: { gap: 10, marginTop: 16 },
  kindButton: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: colors.white,
    ...cardShadow,
  },
  kindText: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center' },
  periodButton: {
    marginTop: 14,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.rose,
  },
  periodButtonText: { fontSize: 15, fontWeight: '600', color: colors.rose },
});