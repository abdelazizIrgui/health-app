import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useUser } from '../../context/UserContext';
import { cardShadow, colors } from '../../theme';
import { getCycleStatus } from '../../utils/cycle';
import { getCycleProfile } from '../../utils/cycleFromAnswers';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// TODO (Phase 2): load the current mode from storage.
const APP_MODE = 'Cycle Tracking';

// Shown instead of the tracker when we can't calculate the cycle yet.
const WAITING_MESSAGES = {
  not_started: 'سنعرض توقعات دورتك هنا بمجرد أن تبدأ أول دورة.',
  pregnant: 'توقعات الدورة متوقفة أثناء الحمل.',
  no_date: 'سجّلي تاريخ بداية آخر دورة لنعرض لك توقعاتك.',
} as const;

const QUICK_ACTIONS: { id: string; label: string; icon: IconName }[] = [
  { id: 'flow', label: 'Log Flow', icon: 'water' },
  { id: 'symptoms', label: 'Log Symptoms', icon: 'heart-pulse' },
  { id: 'mood', label: 'Log Mood', icon: 'emoticon-happy' },
];

export default function HomeScreen() {
  const { user, answers } = useUser();
  const profile = getCycleProfile(answers);
  const firstName = user?.name.trim().split(' ')[0];
  const status = profile.ready ? getCycleStatus(profile.settings) : null;
  const dateText = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header: greeting, date and current mode */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{firstName ? `Hello, ${firstName}!` : 'Hello there!'}</Text>
          <Text style={styles.date}>{dateText}</Text>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="water" size={16} color={colors.rose} />
            <Text style={styles.badgeText}>{APP_MODE}</Text>
          </View>
        </View>

        {/* Central tracker card */}
        <View style={styles.trackerCard}>
          {profile.ready && status ? (
            <>
              <View style={styles.halo}>
                <View style={styles.ring}>
                  <Text style={styles.dayLabel}>Day</Text>
                  <Text style={styles.dayNumber}>{status.day}</Text>
                  <Text style={styles.dayOf}>of {profile.settings.cycleLength}</Text>
                </View>
              </View>

              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{status.message}</Text>
              </View>
              <Text style={styles.phase}>{status.phase}</Text>
            </>
          ) : (
            <Text style={styles.waiting}>
              {WAITING_MESSAGES[profile.ready ? 'no_date' : profile.reason]}
            </Text>
          )}
        </View>

        {/* Quick log buttons (horizontal scroll) */}
        <Text style={styles.sectionTitle}>Quick log</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.actionsScroll}
          contentContainerStyle={styles.actionsContent}
        >
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => {
                // TODO (Phase 2): open the matching logging sheet.
              }}
            >
              <View style={styles.actionIcon}>
                <MaterialCommunityIcons name={action.icon} size={30} color={colors.rose} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
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
  actionLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
});
