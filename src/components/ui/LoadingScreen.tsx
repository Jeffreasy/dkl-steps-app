/**
 * LoadingScreen Component
 * Herbruikbare loading state voor hele screens
 * Consistent loading UI door hele app
 */

import { memo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';

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
          <Image
            source={require('../../../assets/dkl-logo.webp')}
            style={styles.logo}
            resizeMode="contain"
          />
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
  logo: {
    width: 200,
    height: 70,
  },
  message: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});