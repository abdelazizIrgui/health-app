import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme';

interface Props {
  /** Photo uri. Without it the first letter of the name is shown. */
  uri?: string;
  name?: string;
  size?: number;
  /** When given, the avatar is tappable and shows a small camera badge. */
  onPress?: () => void;
  accessibilityLabel?: string;
}

/** Round profile picture (or initial) used on the registration and settings screens. */
export default function Avatar({ uri, name, size = 56, onPress, accessibilityLabel }: Props) {
  const initial = name?.trim().charAt(0).toUpperCase() || '?';
  const circle = { width: size, height: size, borderRadius: size / 2 };

  const content = (
    <View style={[styles.circle, circle]}>
      {uri ? (
        <Image key={uri} source={{ uri }} style={circle} />
      ) : (
        <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
      )}
      {onPress && (
        <View style={styles.badge}>
          <Ionicons name="camera" size={Math.max(12, size * 0.18)} color={colors.white} />
        </View>
      )}
    </View>
  );

  if (!onPress) return content;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.peach,
  },
  initial: { fontWeight: '700', color: colors.text },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.rose,
    borderWidth: 2,
    borderColor: colors.cream,
  },
});