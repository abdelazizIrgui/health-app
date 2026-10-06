import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useInbox } from '../../context/InboxContext';
import { useI18n } from '../../i18n/I18nContext';
import { colors } from '../../theme';
import type { InboxItem } from '../../utils/inbox';

/** Tab with every notification message she received. Unread ones are highlighted. */
export default function InboxScreen() {
  const { t, dir, formatDate } = useI18n();
  const { items, unread, markRead, markAllRead, clear } = useInbox();
  const text = { textAlign: dir.align, writingDirection: dir.writing } as const;

  const when = (ms: number) => {
    const d = new Date(ms);
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${formatDate(d, { day: 'numeric', month: 'long' })} · ${time}`;
  };

  const renderItem = (item: InboxItem) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.8}
      onPress={() => markRead(item.id)}
      style={[styles.item, !item.read && styles.itemUnread, { flexDirection: dir.row }]}
      accessibilityRole="button"
      accessibilityLabel={`${t(`reminders.notif.${item.kind}`)}, ${
        item.read ? t('inbox.read') : t('inbox.unread')
      }`}
    >
      <View style={[styles.iconWrap, !item.read && styles.iconWrapUnread]}>
        <Ionicons
          name={item.kind === 'period' ? 'calendar' : 'heart'}
          size={20}
          color={item.read ? colors.muted : colors.rose}
        />
      </View>
      <View style={styles.body}>
        <Text style={[styles.itemTitle, item.read && styles.itemTitleRead, text]}>
          {t('reminders.notif.title')}
        </Text>
        <Text style={[styles.itemText, text]}>{t(`reminders.notif.${item.kind}`)}</Text>
        <Text style={[styles.itemTime, text]}>{when(item.at)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, text]}>{t('inbox.title')}</Text>

        {items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="notifications-off-outline" size={40} color={colors.muted} />
            <Text style={styles.empty}>{t('inbox.empty')}</Text>
          </View>
        ) : (
          <>
            <View style={[styles.actions, { flexDirection: dir.row }]}>
              <Text style={styles.summary}>
                {unread > 0 ? t('inbox.unreadCount', { n: unread }) : t('inbox.allRead')}
              </Text>
              <View style={{ flexDirection: dir.row, gap: 16 }}>
                {unread > 0 && (
                  <TouchableOpacity onPress={markAllRead} accessibilityRole="button">
                    <Text style={styles.action}>{t('inbox.markAllRead')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={clear} accessibilityRole="button">
                  <Text style={styles.action}>{t('inbox.clear')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {items.map(renderItem)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  title: { fontSize: 30, fontWeight: '700', color: colors.text, marginBottom: 16 },
  actions: { alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  summary: { fontSize: 13, color: colors.muted },
  action: { fontSize: 13, fontWeight: '700', color: colors.rose },
  item: {
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 10,
    borderRadius: 18,
    backgroundColor: colors.white,
  },
  itemUnread: { backgroundColor: colors.peachSoft, borderWidth: 1, borderColor: colors.peach },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
  },
  iconWrapUnread: { backgroundColor: colors.white },
  body: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  itemTitleRead: { fontWeight: '600', color: colors.muted },
  itemText: { marginTop: 2, fontSize: 14, lineHeight: 20, color: colors.text },
  itemTime: { marginTop: 4, fontSize: 12, color: colors.muted },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.rose },
  emptyWrap: { alignItems: 'center', gap: 10, paddingVertical: 60 },
  empty: { fontSize: 14, color: colors.muted, textAlign: 'center' },
});