import { memo, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiFetch } from '../services/api';
import { colors, typography, spacing } from '../theme';
import type { TotalStepsResponse } from '../types';
import { LiveCounter, LiveIndicator, BoardBranding } from '../components/digitalboard';
import { usePollingData } from '../hooks/usePollingData';

function DigitalBoardScreen() {
  const fetchTotal = useCallback(async () => {
    const data = await apiFetch<TotalStepsResponse>('/total-steps?year=2025');
    return data.total_steps;
  }, []);

  const { data: total, error, isLoading } = usePollingData<number>({
    fetchFn: fetchTotal,
    interval: 10000,
  });

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.container}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Laden...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a', '#000000']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <LiveCounter total={total || 0} year={2025} />
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>⚠️ {error}</Text>
        </View>
      )}
      
      <LiveIndicator interval={10} />
      
      <BoardBranding />
    </LinearGradient>
  );
}

// Export memoized version
export default memo(DigitalBoardScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    color: colors.text.inverse,
    fontFamily: typography.fonts.body,
    fontSize: 18,
    marginTop: spacing.lg,
  },
  errorContainer: {
    backgroundColor: `${colors.status.error}20`,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: spacing.radius.lg,
    borderWidth: 2,
    borderColor: colors.status.error,
    marginTop: spacing.xxxl,
  },
  error: {
    color: colors.status.error,
    fontFamily: typography.fonts.bodyMedium,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});