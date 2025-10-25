/**
 * ScreenHeader Component
 * Herbruikbare screen header met logo en gradient
 * Elimineert code duplication in 5+ screens
 */

import { memo } from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  gradientColors?: [string, string];
  icon?: string;
  showLogo?: boolean;
}

function ScreenHeader({
  title,
  subtitle,
  gradientColors = [colors.primary, colors.primaryDark],
  icon,
  showLogo = true,
}: ScreenHeaderProps) {
  return (
    <>
      {showLogo && (
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/dkl-logo.webp')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      )}
      
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </LinearGradient>
    </>
  );
}

// Export memoized version
export default memo(ScreenHeader);

const styles = StyleSheet.create({
  logoContainer: {
    backgroundColor: colors.background.paper,
    paddingTop: Platform.OS === 'ios' ? 60 : spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  logo: {
    width: 240,
    height: 75,
  },
  gradient: {
    padding: spacing.xl,
    borderBottomLeftRadius: spacing.radius.xl,
    borderBottomRightRadius: spacing.radius.xl,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.styles.h2,
    fontFamily: typography.fonts.heading,
    color: colors.text.inverse,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});