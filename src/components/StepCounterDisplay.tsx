/**
 * StepCounterDisplay Component
 * 
 * UI component voor het weergeven van stappen delta en sync status.
 * Extracted van StepCounter voor betere separation of concerns.
 * 
 * Features:
 * - Step delta display
 * - Auto-sync indicator
 * - Last sync timestamp
 * - Offline queue indicator
 * - Debug info display
 */

import { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface StepCounterDisplayProps {
  stepsDelta: number;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  offlineQueue: number[];
  debugInfo: string;
  permissionStatus: string;
  hasAuthError: boolean;
  isAvailable: boolean;
}

function StepCounterDisplay({
  stepsDelta,
  isSyncing,
  lastSyncTime,
  offlineQueue,
  debugInfo,
  permissionStatus,
  hasAuthError,
  isAvailable,
}: StepCounterDisplayProps) {
  
  const formatTimeSinceSync = useCallback(() => {
    if (!lastSyncTime) return '';
    const seconds = Math.round((Date.now() - lastSyncTime.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s geleden`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m geleden`;
    const hours = Math.floor(minutes / 60);
    return `${hours}u geleden`;
  }, [lastSyncTime]);

  const offlineTotal = offlineQueue.reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      {/* Main Counter */}
      <View style={styles.card}>
        <Text style={styles.label}>Delta Stappen</Text>
        <Text style={styles.value}>{stepsDelta}</Text>
        
        {/* Auto-sync indicator */}
        <View style={styles.autoSyncInfo}>
          <View style={[styles.syncDot, isSyncing && styles.syncDotActive]} />
          <Text style={styles.autoSyncText}>
            {isSyncing 
              ? '🔄 Bezig met synchroniseren...'
              : `✓ Auto-sync: elke 50 stappen of 5 min`
            }
          </Text>
        </View>
        
        {/* Last sync time */}
        {lastSyncTime && !isSyncing && (
          <Text style={styles.lastSync}>
            Laatste sync: {formatTimeSinceSync()}
          </Text>
        )}
        
        {/* Offline queue indicator */}
        {offlineTotal !== 0 && (
          <Text style={styles.offline}>Offline wachtrij: {offlineTotal}</Text>
        )}
        
        {/* Debug info */}
        {debugInfo && (
          <Text style={styles.debug}>{debugInfo}</Text>
        )}
        
        {/* Platform info */}
        {Platform.OS === 'android' && (
          <Text style={styles.platformInfo}>
            📱 Android (Expo Go: gebruik test button)
          </Text>
        )}
      </View>
      
      {/* Warnings */}
      {!isAvailable && (
        <Text style={styles.warning}>
          ⚠️ Pedometer niet beschikbaar - gebruik physical device
        </Text>
      )}
      
      {permissionStatus === 'denied' && (
        <View style={styles.permissionWarning}>
          <Text style={styles.warningText}>
            ❌ Toestemming voor stappen tracking is geweigerd
          </Text>
        </View>
      )}
      
      {hasAuthError && (
        <View style={styles.authErrorWarning}>
          <Text style={styles.warningText}>
            🔐 Authenticatie probleem - log opnieuw in
          </Text>
        </View>
      )}
      
      {permissionStatus === 'checking' && (
        <Text style={styles.debug}>⏳ Toestemming controleren...</Text>
      )}
    </View>
  );
}

// Export memoized version
export default memo(StepCounterDisplay);

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  card: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 48,
    fontFamily: typography.fonts.headingBold,
    fontWeight: '700',
    color: colors.primary,
  },
  autoSyncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: `${colors.primary}15`,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  syncDotActive: {
    backgroundColor: colors.status.warning,
  },
  autoSyncText: {
    fontSize: 11,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.primaryDark,
    fontWeight: '500',
  },
  lastSync: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    marginTop: spacing.xs + 2,
  },
  offline: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.status.warning,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  debug: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  platformInfo: {
    fontSize: 10,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    marginTop: spacing.xs,
  },
  warning: {
    color: colors.status.error,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontSize: 14,
  },
  permissionWarning: {
    backgroundColor: `${colors.status.warning}1A`,
    padding: spacing.lg,
    borderRadius: spacing.radius.default,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.warning,
  },
  authErrorWarning: {
    backgroundColor: `${colors.status.error}1A`,
    padding: spacing.lg,
    borderRadius: spacing.radius.default,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  warningText: {
    color: colors.primaryDark,
    fontFamily: typography.fonts.bodyMedium,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
});