/**
 * LoadingScreen Component
 * Herbruikbare loading state voor hele screens
 * Consistent loading UI door hele app
 */

import { memo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';
import DKLLogo from './DKLLogo';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
  color?: string;
}

function LoadingScreen({ 
  message = 'Laden...', 
  showLogo = true,
  color = colors.primary,
}: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      {showLogo && (
        <View style={styles.logoContainer}>
          <DKLLogo size="medium" />
        </View>
      )}
      
      <ActivityIndicator size="large" color={color} />
      
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

// Export memoized version
export default memo(LoadingScreen);

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
    marginBottom: spacing.xxxl,
    ...shadows.lg,
  },
  message: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});