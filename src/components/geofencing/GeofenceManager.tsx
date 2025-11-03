/**
 * GeofenceManager Component
 * 
 * UI controls voor geofencing management.
 * Toont status, distance, event info en biedt start/stop controls.
 * 
 * Features:
 * - Event display met geofence info
 * - Status indicator (inside/outside/unknown)
 * - Distance display met color coding
 * - Start/Stop monitoring buttons
 * - Permission handling UI
 * - Loading states
 * 
 * @example
 * ```tsx
 * <GeofenceManager
 *   onStatusChange={(status) => console.log('Status:', status)}
 * />
 * ```
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useEventData } from '../../hooks/useEventData';
import { useGeofencing } from '../../hooks/useGeofencing';
import CustomButton from '../ui/CustomButton';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import LoadingScreen from '../ui/LoadingScreen';
import EmptyState from '../ui/EmptyState';
import { theme } from '../../theme';
import type { GeofenceStatus } from '../../types/geofencing';
import { getPrimaryGeofence, isEventCurrentlyActive } from '../../types/geofencing';

interface GeofenceManagerProps {
  /**
   * Callback when geofence status changes
   */
  onStatusChange?: (status: GeofenceStatus, isInsideGeofence: boolean) => void;
  
  /**
   * Show detailed debug info
   */
  showDebugInfo?: boolean;
}

export function GeofenceManager({
  onStatusChange,
  showDebugInfo = false,
}: GeofenceManagerProps) {
  // Fetch active event
  const { activeEvent, isLoading: isLoadingEvent } = useEventData();
  
  // Get primary geofence (start, checkpoint, of finish)
  const primaryGeofence = activeEvent ? getPrimaryGeofence(activeEvent) : null;

  // Geofencing hook
  const {
    status,
    distance,
    isMonitoring,
    hasPermission,
    lastChecked,
    startMonitoring,
    stopMonitoring,
    requestPermission,
  } = useGeofencing({
    geofence: primaryGeofence,
    onEnter: (location) => {
      Alert.alert(
        'Binnen Event Gebied! 🎉',
        'Je bent binnen het event gebied. Stappen tracking is nu actief!',
        [{ text: 'OK' }]
      );
    },
    onExit: (location) => {
      Alert.alert(
        'Event Gebied Verlaten',
        'Je bent buiten het event gebied. Stappen tracking is gepauzeerd.',
        [{ text: 'OK' }]
      );
    },
  });

  // Notify parent of status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status, status === 'inside');
    }
  }, [status, onStatusChange]);

  // Handle start monitoring
  const handleStartMonitoring = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Permission Vereist',
          'Locatie toegang is nodig voor automatische stappen tracking binnen het event gebied.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const success = await startMonitoring();
    if (!success) {
      Alert.alert(
        'Fout',
        'Kon geofence monitoring niet starten. Controleer je instellingen.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle stop monitoring
  const handleStopMonitoring = async () => {
    Alert.alert(
      'Monitoring Stoppen?',
      'Automatische stappen tracking binnen event gebieden wordt gestopt.',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Stop', 
          style: 'destructive',
          onPress: stopMonitoring,
        },
      ]
    );
  };

  // Loading state
  if (isLoadingEvent) {
    return <LoadingScreen message="Event data laden..." />;
  }

  // No active event
  if (!activeEvent) {
    return (
      <Card style={styles.card}>
        <EmptyState
          icon="📅"
          title="Geen Actief Event"
          description="Er is momenteel geen actief event. Geofencing is alleen beschikbaar tijdens events."
        />
      </Card>
    );
  }

  // No geofence configured
  if (!activeEvent.geofences || activeEvent.geofences.length === 0) {
    return (
      <Card style={styles.card}>
        <EmptyState
          icon="📍"
          title="Geen Geofences"
          description={`Event "${activeEvent.name}" heeft geen geofences geconfigureerd.`}
        />
      </Card>
    );
  }

  const isInside = status === 'inside';

  return (
    <Card style={styles.card}>
      {/* Event Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actief Event</Text>
        <View style={styles.eventInfo}>
          <Text style={styles.eventName}>{activeEvent.name}</Text>
          <Badge label="Actief" variant="success" size="small" />
        </View>
        {activeEvent.description && (
          <Text style={styles.eventDescription}>{activeEvent.description}</Text>
        )}
      </View>

      {/* Geofence Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Geofences</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Aantal:</Text>
          <Text style={styles.value}>{activeEvent.geofences.length}</Text>
        </View>
        {activeEvent.geofences.map((fence, index) => (
          <View key={index} style={styles.geofenceItem}>
            <Badge
              label={fence.type.toUpperCase()}
              variant={fence.type === 'start' ? 'success' : fence.type === 'finish' ? 'info' : 'neutral'}
              size="small"
            />
            <Text style={styles.geofenceName}>{fence.name || `${fence.type} geofence`}</Text>
            <Text style={styles.geofenceRadius}>{fence.radius}m</Text>
          </View>
        ))}
        {primaryGeofence && (
          <Text style={styles.primaryNote}>
            ℹ️ Tracking gebruikt "{activeEvent.geofences[0].type}" geofence
          </Text>
        )}
      </View>

      {/* Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusContainer}>
          <Badge
            label={
              status === 'inside' ? '✓ Binnen Gebied' :
              status === 'outside' ? '⚠ Buiten Gebied' :
              '? Onbekend'
            }
            variant={
              status === 'inside' ? 'success' :
              status === 'outside' ? 'warning' :
              'neutral'
            }
            size="medium"
          />
          
          {distance !== undefined && (
            <Text style={[
              styles.distance,
              isInside ? styles.distanceInside : styles.distanceOutside
            ]}>
              {distance < 1000 
                ? `${Math.round(distance)}m`
                : `${(distance / 1000).toFixed(1)}km`
              }
            </Text>
          )}
        </View>

        {lastChecked && (
          <Text style={styles.lastChecked}>
            Laatst gecontroleerd: {lastChecked.toLocaleTimeString('nl-NL')}
          </Text>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!isMonitoring ? (
          <CustomButton
            title={hasPermission ? 'Start Monitoring' : 'Geef Toestemming & Start'}
            onPress={handleStartMonitoring}
            variant="primary"
            fullWidth
          />
        ) : (
          <CustomButton
            title="Stop Monitoring"
            onPress={handleStopMonitoring}
            variant="secondary"
            fullWidth
          />
        )}
      </View>

      {/* Permission Warning */}
      {!hasPermission && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ Locatie toestemming is vereist voor geofencing
          </Text>
        </View>
      )}

      {/* Debug Info */}
      {showDebugInfo && primaryGeofence && (
        <View style={styles.debug}>
          <Text style={styles.debugTitle}>Debug Info</Text>
          <Text style={styles.debugText}>Status: {status}</Text>
          <Text style={styles.debugText}>Monitoring: {isMonitoring ? 'Ja' : 'Nee'}</Text>
          <Text style={styles.debugText}>Permission: {hasPermission ? 'Granted' : 'Denied'}</Text>
          <Text style={styles.debugText}>Distance: {distance?.toFixed(2) ?? 'N/A'}m</Text>
          <Text style={styles.debugText}>Geofence ID: {primaryGeofence.identifier}</Text>
          <Text style={styles.debugText}>Event ID: {activeEvent.id}</Text>
          <Text style={styles.debugText}>Total Geofences: {activeEvent.geofences.length}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  label: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distance: {
    fontSize: 18,
    fontWeight: '700',
  },
  distanceInside: {
    color: '#10b981', // success green
  },
  distanceOutside: {
    color: '#f59e0b', // warning orange
  },
  lastChecked: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    opacity: 0.7,
  },
  controls: {
    marginTop: theme.spacing.md,
  },
  warning: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: '#fef3c7', // warning light
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#f59e0b', // warning
  },
  warningText: {
    fontSize: 14,
    color: '#d97706', // warning dark
    textAlign: 'center',
  },
  debug: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.gray100,
    borderRadius: theme.spacing.sm,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
  },
  debugText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontFamily: 'monospace',
    marginBottom: 2,
    opacity: 0.8,
  },
  geofenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.gray200,
  },
  geofenceName: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  geofenceRadius: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  primaryNote: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
});