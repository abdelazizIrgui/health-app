import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useUser } from '../../context/UserContext';
import { cardShadow, colors } from '../../theme';

/** Profile card and sign out. The mode switcher is added in a later phase. */
export default function SettingsScreen() {
  const { user, signOut } = useUser();
  const initial = user?.name.trim().charAt(0).toUpperCase() || '?';

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'Your profile will be removed from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.signOut}
          activeOpacity={0.8}
          onPress={confirmSignOut}
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.rose} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: 20, paddingTop: 12 },
  title: { fontSize: 30, fontWeight: '700', color: colors.text, marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.white,
    ...cardShadow,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peach,
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: colors.text },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  email: { marginTop: 2, fontSize: 14, color: colors.muted },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    height: 52,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.rose,
  },
  signOutText: { fontSize: 16, fontWeight: '600', color: colors.rose },
});
