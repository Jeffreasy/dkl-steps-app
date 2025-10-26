import { useState, useEffect, memo, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiFetch } from '../services/api';
import { colors, typography, spacing, shadows } from '../theme';
import type { TotalStepsResponse } from '../types';
import { getErrorMessage } from '../types';
import { DKLLogo } from '../components/ui';
import { logger } from '../utils/logger';

function DigitalBoardScreen() {
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        logger.debug('DigitalBoard: Fetching total steps');
        const data = await apiFetch<TotalStepsResponse>('/total-steps?year=2025');
        setTotal(data.total_steps);
        setError('');
        setIsLoading(false);
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        setError(message);
        setIsLoading(false);
        logger.error('DigitalBoard fetch failed:', error);
      }
    };

    // Start polling functie
    const startPolling = () => {
      logger.info('DigitalBoard: Starting polling (10s interval)');
      fetchTotal(); // Initial fetch
      
      // Clear existing interval als die er is
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Set up interval to fetch every 10 seconds
      intervalRef.current = setInterval(fetchTotal, 10000);
    };

    // Stop polling functie
    const stopPolling = () => {
      logger.info('DigitalBoard: Stopping polling (app backgrounded)');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // AppState change handler
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Als app naar foreground gaat
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        logger.info('DigitalBoard: App became active - resuming polling');
        startPolling();
      }
      // Als app naar background gaat
      else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        logger.info('DigitalBoard: App backgrounded - stopping polling');
        stopPolling();
      }
      
      appState.current = nextAppState;
    };

    // Start polling bij mount
    startPolling();

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup
    return () => {
      stopPolling();
      subscription.remove();
    };
  }, []);

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
      <View style={styles.content}>
        {/* DKL Logo Bovenaan - Op witte achtergrond voor zichtbaarheid */}
        <View style={styles.logoTopContainer}>
          <DKLLogo size="large" />
        </View>
        
        {/* Subtitle */}
        <Text style={styles.label}>Totaal Stappen 2025</Text>
        
        {/* Main Counter met Oranje Glow */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark, colors.primary]}
          style={styles.totalContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.total}>{total.toLocaleString('nl-NL')}</Text>
        </LinearGradient>
        
        {/* Year Badge */}
        <View style={styles.yearBadge}>
          <Text style={styles.year}>2025</Text>
        </View>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>⚠️ {error}</Text>
          </View>
        )}
        
        {/* Live Indicator */}
        <View style={styles.updateIndicator}>
          <View style={styles.pulse} />
          <Text style={styles.updateText}>🔴 LIVE • Updates elke 10 sec</Text>
        </View>
        
        {/* DKL Logo + Branding Onderaan - Op witte achtergrond */}
        <View style={styles.branding}>
          <View style={styles.logoBottomContainer}>
            <DKLLogo size="medium" style={styles.logoBottom} />
          </View>
          <Text style={styles.brandTagline}>Samen in beweging voor een goed doel</Text>
        </View>
      </View>
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
  updateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxxl + spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.radius.full,
  },
  pulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.status.error,
    marginRight: spacing.md,
  },
  updateText: {
    color: '#999',
    fontFamily: typography.fonts.bodyMedium,
    fontSize: 13,
    letterSpacing: 1,
    fontWeight: '500',
  },
  branding: {
    position: 'absolute',
    bottom: spacing.xxxl + spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  logoBottomContainer: {
    backgroundColor: colors.background.paper,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.radius.lg,
    marginBottom: spacing.md,
  },
  logoBottom: {
    width: 220,
    height: 70,
  },
  brandTagline: {
    fontSize: 14,
    fontFamily: typography.fonts.body,
    color: '#999',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});