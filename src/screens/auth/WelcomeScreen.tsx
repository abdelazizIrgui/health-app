import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useI18n } from '../../i18n/I18nContext';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { cardShadow, colors } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

/**
 * Shown on first launch: soft breathing rings, "Hello" fades in,
 * then the whole screen fades out and we move to Register.
 */
export default function WelcomeScreen({ navigation }: Props) {
  const { t } = useI18n();
  const helloOpacity = useRef(new Animated.Value(0)).current;
  const helloShift = useRef(new Animated.Value(18)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle "breathing" loop for the rings behind the icon.
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();

    // Main sequence: Hello in -> subtitle in -> pause -> fade out -> go to Register.
    const intro = Animated.sequence([
      Animated.parallel([
        Animated.timing(helloOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(helloShift, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.delay(1100),
      Animated.timing(screenOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]);
    intro.start(({ finished }) => {
      if (finished) navigation.replace('Register');
    });

    return () => {
      breathing.stop();
      intro.stop();
    };
  }, [breathe, helloOpacity, helloShift, subtitleOpacity, screenOpacity, navigation]);

  const outerScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });
  const innerScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1.08, 0.96] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.center, { opacity: screenOpacity }]}>
        <View style={styles.ringWrap}>
          <Animated.View style={[styles.outerRing, { transform: [{ scale: outerScale }] }]} />
          <Animated.View style={[styles.innerRing, { transform: [{ scale: innerScale }] }]} />
          <View style={styles.iconCircle}>
            <Ionicons name="heart" size={40} color={colors.rose} />
          </View>
        </View>

        <Animated.Text
          style={[styles.hello, { opacity: helloOpacity, transform: [{ translateY: helloShift }] }]}
        >
          {t('welcome.hello')}
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          {t('welcome.subtitle')}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  ringWrap: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center' },
  outerRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 182, 163, 0.18)',
  },
  innerRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255, 182, 163, 0.35)',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    ...cardShadow,
  },
  hello: { marginTop: 28, fontSize: 52, fontWeight: '700', color: colors.text },
  subtitle: { marginTop: 10, fontSize: 16, textAlign: 'center', color: colors.muted },
});