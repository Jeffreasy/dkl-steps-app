/**
 * LazyLoadScreen Component
 * 
 * Suspense fallback component voor lazy-loaded screens.
 * Toont loading state tijdens screen code wordt geladen.
 * 
 * Used by React.lazy() + Suspense voor code splitting.
 */

import { memo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';
import DKLLogo from './DKLLogo';

function LazyLoadScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <DKLLogo size="medium" />
      </View>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
    </View>
  );
}

export default memo(LazyLoadScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.subtle,
    padding: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.xxxl,
  },
  spinner: {
    marginTop: spacing.lg,
  },
});