import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@/theme/useAppTheme';

type WelcomeScreenProps = {
  onProceed: () => void;
};

export const WelcomeScreen = ({ onProceed }: WelcomeScreenProps) => {
  const theme = useAppTheme();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, [fadeAnim, floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  const scale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.background, theme.colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.screen}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.heroWrap,
            {
              opacity: fadeAnim,
              transform: [{ translateY }, { scale }],
            },
          ]}
        >
          <View style={[styles.heroOrb, { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.border }]}>
            <Ionicons name="leaf" size={72} color={theme.colors.accent} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>WELCOME</Text>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Build habits with clarity and calm.</Text>
          <Text style={[styles.copy, { color: theme.colors.textSecondary }]}>
            Track progress, notice patterns, and shape routines that feel sustainable.
          </Text>
        </Animated.View>

        <Pressable onPress={onProceed} style={[styles.button, { backgroundColor: theme.colors.accent }]}>
          <Text style={styles.buttonText}>Proceed</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 90,
    paddingBottom: 42,
    justifyContent: 'space-between',
  },
  heroWrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  heroOrb: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
  },
  title: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
    marginBottom: 14,
  },
  copy: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    maxWidth: 320,
  },
  button: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
