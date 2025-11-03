import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, shadows } from '../../theme';
import { DKLLogo } from '../ui';
import { useCounterAnimation, useFadeAnimation } from '../../hooks/useAnimations';

interface LiveCounterProps {
  total: number;
  year?: number;
}

export function LiveCounter({ total, year = 2025 }: LiveCounterProps) {
  const { scaleAnim, animateChange } = useCounterAnimation(total);
  const { fadeAnim } = useFadeAnimation(1);
  const prevTotal = useRef(total);

  // Animate when counter changes
  useEffect(() => {
    if (prevTotal.current !== total && prevTotal.current !== 0) {
      animateChange(total);
    }
    prevTotal.current = total;
  }, [total, animateChange]);

  return (
    <View style={styles.content}>
      {/* DKL Logo Bovenaan - Op witte achtergrond voor zichtbaarheid */}
      <View style={styles.logoTopContainer}>
        <DKLLogo size="large" />
      </View>
      
      {/* Subtitle with fade */}
      <Animated.Text style={[styles.label, { opacity: fadeAnim }]}>
        Totaal Stappen {year}
      </Animated.Text>
      
      {/* Main Counter met Oranje Glow and Animation */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark, colors.primary]}
          style={styles.totalContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.total}>{total.toLocaleString('nl-NL')}</Text>
        </LinearGradient>
      </Animated.View>
      
      {/* Year Badge */}
      <View style={styles.yearBadge}>
        <Text style={styles.year}>{year}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    width: '100%',
    paddingTop: spacing.xl,
  },
  logoTopContainer: {
    backgroundColor: colors.background.paper,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xl,
    borderRadius: spacing.radius.xl,
    marginBottom: spacing.xxxl,
    ...shadows.xl,
  },
  label: {
    fontSize: 24,
    fontFamily: typography.fonts.headingMedium,
    color: '#888',
    marginBottom: spacing.xl,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  totalContainer: {
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xl,
    borderRadius: spacing.radius.xl,
    marginVertical: spacing.lg,
  },
  total: {
    fontSize: 120,
    fontFamily: typography.fonts.headingBold,
    color: colors.text.inverse,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    letterSpacing: -2,
  },
  yearBadge: {
    backgroundColor: `${colors.primary}30`,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radius.full,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: spacing.md,
  },
  year: {
    fontSize: 28,
    fontFamily: typography.fonts.headingBold,
    color: colors.primary,
    letterSpacing: 6,
    fontWeight: 'bold',
  },
});