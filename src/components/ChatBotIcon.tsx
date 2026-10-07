import React from 'react';
import { StyleSheet, View } from 'react-native';

import { cardShadow, colors } from '../theme';

interface Props {
  /** Which side the little speech-bubble tail points to. */
  tail?: 'left' | 'right';
}

/**
 * Small robot inside a speech bubble, drawn with plain views (no image, no extra package).
 * Everything is placed on a 56 x 56 grid so the shapes are easy to adjust.
 */
export default function ChatBotIcon({ tail = 'left' }: Props) {
  return (
    <View style={styles.box} pointerEvents="none">
      {/* bubble: a circle and a small tilted square for the tail */}
      <View style={[styles.tail, tail === 'left' ? { left: 6 } : { right: 6 }]} />
      <View style={styles.bubble} />

      {/* robot: antenna, ear pieces, head, dark face and two glowing eyes */}
      <View style={styles.antennaStem} />
      <View style={styles.antennaDot} />
      <View style={[styles.ear, { left: 8 }]} />
      <View style={[styles.ear, { left: 39 }]} />
      <View style={styles.head} />
      <View style={styles.face} />
      <View style={[styles.eyeGlow, { left: 16.5 }]} />
      <View style={[styles.eyeGlow, { left: 28.5 }]} />
      <View style={[styles.eye, { left: 18.5 }]} />
      <View style={[styles.eye, { left: 30.5 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 56, height: 56 },

  bubble: {
    position: 'absolute',
    left: 2,
    top: 0,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.rose,
    ...cardShadow,
  },
  tail: {
    position: 'absolute',
    top: 38,
    width: 10,
    height: 10,
    backgroundColor: colors.rose,
    transform: [{ rotate: '45deg' }],
  },

  antennaStem: {
    position: 'absolute',
    left: 27,
    top: 8,
    width: 2,
    height: 6,
    backgroundColor: colors.white,
  },
  antennaDot: {
    position: 'absolute',
    left: 25,
    top: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  ear: {
    position: 'absolute',
    top: 21,
    width: 7,
    height: 11,
    borderRadius: 3.5,
    backgroundColor: colors.white,
    opacity: 0.9,
  },
  head: {
    position: 'absolute',
    left: 11,
    top: 14,
    width: 34,
    height: 25,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  face: {
    position: 'absolute',
    left: 14,
    top: 17.5,
    width: 28,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.text,
  },
  eyeGlow: {
    position: 'absolute',
    top: 22.5,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.peach,
    opacity: 0.85,
  },
  eye: {
    position: 'absolute',
    top: 24.5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.white,
  },
});