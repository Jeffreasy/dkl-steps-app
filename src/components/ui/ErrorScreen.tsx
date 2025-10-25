/**
 * ErrorScreen Component
 * Herbruikbare error state voor hele screens
 * Consistent error UI door hele app
 */

import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  emoji?: string;
  onRetry?: () => void;
  retryText?: string;
  showLogo?: boolean;
}

function ErrorScreen({
  title = 'Er ging iets mis',
  message,
  emoji = '😕',
  onRetry,
  retryText = 'Opnieuw Proberen',
  showLogo = false,
}: ErrorScreenProps) {
  return (
    <View style={styles.container}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/dkl-logo.webp')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      )}
      
      <Text style={styles.emoji}>{emoji}</Text>
      
      <Text style={styles.title}>{title}</Text>
      
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
      
      {onRetry && (
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Export memoized version
export default memo(ErrorScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.subtle,
  },
  logoContainer: {
    backgroundColor: colors.background.paper,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: spacing.radius.lg,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  logo: {
    width: 200,
    height: 70,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.styles.h2,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md + 2,
    borderRadius: spacing.radius.lg,
    ...shadows.md,
  },
  buttonText: {
    ...typography.styles.button,
    fontFamily: typography.fonts.bodyBold,
    color: colors.text.inverse,
  },
});