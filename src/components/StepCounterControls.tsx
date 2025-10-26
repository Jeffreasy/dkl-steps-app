/**
 * StepCounterControls Component
 * 
 * UI component voor sync controls en debug buttons.
 * Extracted van StepCounter voor betere separation of concerns.
 * 
 * Features:
 * - Manual sync button
 * - Correction buttons
 * - Test button (development)
 * - Diagnostics button
 * - Settings button (bij permission denied)
 */

import { memo } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { spacing } from '../theme';

interface StepCounterControlsProps {
  stepsDelta: number;
  isSyncing: boolean;
  hasAuthError: boolean;
  permissionStatus: string;
  onManualSync: () => void;
  onCorrection: (amount: number) => void;
  onTestAdd: () => void;
  onDiagnostics: () => void;
  onOpenSettings: () => void;
}

function StepCounterControls({
  stepsDelta,
  isSyncing,
  hasAuthError,
  permissionStatus,
  onManualSync,
  onCorrection,
  onTestAdd,
  onDiagnostics,
  onOpenSettings,
}: StepCounterControlsProps) {
  
  return (
    <View style={styles.container}>
      {/* Settings button (alleen bij denied permission) */}
      {permissionStatus === 'denied' && (
        <View style={styles.buttonContainer}>
          <Button 
            title="Instellingen Info" 
            onPress={onOpenSettings}
            color="#FF9800"
          />
        </View>
      )}
      
      {/* Manual sync button */}
      <View style={styles.buttonContainer}>
        <Button 
          title={isSyncing ? "Bezig..." : `Sync Nu (${stepsDelta})`} 
          onPress={onManualSync} 
          disabled={stepsDelta === 0 || isSyncing || hasAuthError}
        />
      </View>
      
      {/* Correction & Test buttons row */}
      <View style={styles.buttonRow}>
        <View style={styles.buttonHalf}>
          <Button 
            title="Correctie -100" 
            onPress={() => onCorrection(-100)} 
            color="orange"
            disabled={isSyncing || hasAuthError}
          />
        </View>
        
        <View style={styles.buttonHalf}>
          <Button 
            title="Test +50" 
            onPress={onTestAdd}
            color="#4CAF50"
          />
        </View>
      </View>
      
      {/* Diagnostics button */}
      <View style={styles.buttonContainer}>
        <Button 
          title="🔍 Diagnostics" 
          onPress={onDiagnostics}
          color="#9C27B0"
        />
      </View>
    </View>
  );
}

// Export memoized version
export default memo(StepCounterControls);

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  buttonContainer: {
    marginVertical: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  buttonHalf: {
    flex: 1,
  },
});