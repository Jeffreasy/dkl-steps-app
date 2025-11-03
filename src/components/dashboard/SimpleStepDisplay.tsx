import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../theme';
import { useStepTracking } from '../../hooks/useStepTracking';
import { memo } from 'react';
import type { ConditionalTrackingState, GeofenceStatus } from '../../types/geofencing';

interface SimpleStepDisplayProps {
  onSync: () => void;
  geofenceStatus?: GeofenceStatus;
  hasActiveEvent?: boolean;
  enableConditionalTracking?: boolean;
}

/**
 * Simpele, gebruikersvriendelijke stappen display
 * Geen developer tools - alleen essentiële functionaliteit
 */
function SimpleStepDisplay({
  onSync,
  geofenceStatus,
  hasActiveEvent,
  enableConditionalTracking = false,
}: SimpleStepDisplayProps) {
  const {
    stepsDelta,
    isSyncing,
    lastSyncTime,
    handleManualSync,
    conditionalTrackingState,
  } = useStepTracking({
    onSync,
    conditionalTracking: enableConditionalTracking ? {
      enabled: true,
      isInsideGeofence: geofenceStatus === 'inside',
      hasActiveEvent: hasActiveEvent ?? false,
    } : undefined,
  });

  const handleSync = async () => {
    await handleManualSync();
  };

  // Format last sync time
  const getLastSyncText = () => {
    if (!lastSyncTime) return 'Nog niet gesynchroniseerd';
    
    const now = Date.now();
    const diff = now - Number(lastSyncTime);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Zojuist gesynchroniseerd';
    if (minutes === 1) return '1 minuut geleden';
    if (minutes < 60) return `${minutes} minuten geleden`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 uur geleden';
    return `${hours} uur geleden`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[`${colors.primary}0D`, `${colors.primary}05`]}
        style={styles.gradient}
      >
        {/* Steps Display */}
        <View style={styles.stepsSection}>
          <Text style={styles.label}>Vandaag Gelopen</Text>
          <Text style={styles.stepsValue}>
            {stepsDelta.toLocaleString('nl-NL')}
          </Text>
          <Text style={styles.stepsUnit}>stappen</Text>
          
          {/* Conditional Tracking Status */}
          {enableConditionalTracking && !conditionalTrackingState.isTrackingEnabled && (
            <View style={styles.pausedBanner}>
              <Text style={styles.pausedIcon}>⏸️</Text>
              <Text style={styles.pausedText}>
                {conditionalTrackingState.disabledReason === 'no_event'
                  ? 'Geen actief event'
                  : conditionalTrackingState.disabledReason === 'outside_fence'
                  ? 'Buiten event gebied'
                  : 'Tracking gepauzeerd'}
              </Text>
            </View>
          )}
          
          {/* Tracking Active Indicator */}
          {enableConditionalTracking && conditionalTrackingState.isTrackingEnabled && (
            <View style={styles.activeBanner}>
              <Text style={styles.activeIcon}>✓</Text>
              <Text style={styles.activeText}>Tracking Actief</Text>
            </View>
          )}
        </View>

        {/* Sync Status */}
        <View style={styles.syncSection}>
          {isSyncing ? (
            <View style={styles.syncingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.syncingText}>Synchroniseren...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.lastSyncText}>{getLastSyncText()}</Text>
              <TouchableOpacity
                style={styles.syncButton}
                onPress={handleSync}
                activeOpacity={0.7}
                disabled={isSyncing}
              >
                <Text style={styles.syncButtonText}>🔄 Synchroniseer</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

export default memo(SimpleStepDisplay);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: spacing.radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradient: {
    padding: spacing.xl,
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  stepsSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepsValue: {
    ...typography.styles.h1,
    fontFamily: typography.fonts.headingBold,
    color: colors.primary,
    fontSize: 48,
    lineHeight: 56,
  },
  stepsUnit: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    marginTop: spacing.xs,
  },
  syncSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  syncingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  syncingText: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
  lastSyncText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    marginBottom: spacing.sm,
  },
  syncButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radius.full,
  },
  syncButtonText: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  pausedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fef3c7',
    borderRadius: spacing.radius.md,
    gap: spacing.xs,
  },
  pausedIcon: {
    fontSize: 16,
  },
  pausedText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.bodyMedium,
    color: '#d97706',
    fontWeight: '600',
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#d1fae5',
    borderRadius: spacing.radius.md,
    gap: spacing.xs,
  },
  activeIcon: {
    fontSize: 16,
    color: '#10b981',
  },
  activeText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.bodyMedium,
    color: '#059669',
    fontWeight: '600',
  },
});