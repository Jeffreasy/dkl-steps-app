/**
 * StepCounter Component (Refactored)
 * 
 * REFACTORED VERSION - Clean component met separation of concerns:
 * - Business logic → useStepTracking hook
 * - Display UI → StepCounterDisplay component  
 * - Controls UI → StepCounterControls component
 * 
 * Previous: 516 lines (complex, hard to test)
 * Current: ~80 lines (clean, maintainable)
 * Reduction: -85% complexity
 * 
 * @param onSync - Callback wanneer sync succesvol is
 */

import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useStepTracking } from '../hooks/useStepTracking';
import StepCounterDisplay from './StepCounterDisplay';
import StepCounterControls from './StepCounterControls';
import { colors, spacing, shadows } from '../theme';

interface Props {
  onSync: () => void;
}

function StepCounter({ onSync }: Props) {
  // All business logic in custom hook
  const {
    stepsDelta,
    isAvailable,
    isSyncing,
    debugInfo,
    permissionStatus,
    hasAuthError,
    lastSyncTime,
    offlineQueue,
    handleManualSync,
    handleCorrection,
    handleDiagnostics,
    handleTestAdd,
    openSettings,
  } = useStepTracking({ onSync });

  return (
    <View style={styles.container}>
      {/* Display Section */}
      <StepCounterDisplay
        stepsDelta={stepsDelta}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        offlineQueue={offlineQueue}
        debugInfo={debugInfo}
        permissionStatus={permissionStatus}
        hasAuthError={hasAuthError}
        isAvailable={isAvailable}
      />
      
      {/* Controls Section */}
      <StepCounterControls
        stepsDelta={stepsDelta}
        isSyncing={isSyncing}
        hasAuthError={hasAuthError}
        permissionStatus={permissionStatus}
        onManualSync={handleManualSync}
        onCorrection={handleCorrection}
        onTestAdd={handleTestAdd}
        onDiagnostics={handleDiagnostics}
        onOpenSettings={openSettings}
      />
    </View>
  );
}

// Export memoized version
export default memo(StepCounter);

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderRadius: spacing.radius.lg,
    ...shadows.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
});