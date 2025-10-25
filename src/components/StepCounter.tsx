import { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform, Linking } from 'react-native';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../services/api';
import NetInfo from '@react-native-community/netinfo';
import { colors, typography, spacing, shadows } from '../theme';

interface Props {
  onSync: () => void;
}

// Auto-sync configuratie
const AUTO_SYNC_THRESHOLD = 50; // Auto-sync elke 50 stappen
const AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // Auto-sync elke 5 minuten

export default function StepCounter({ onSync }: Props) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [stepsDelta, setStepsDelta] = useState(0);
  const [offlineQueue, setOfflineQueue] = useState<number[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<string>('checking');
  const [hasAuthError, setHasAuthError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const autoSyncTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initPedometer = async () => {
      try {
        // Check if pedometer hardware is available
        const available = await Pedometer.isAvailableAsync();
        setIsAvailable(available);
        
        if (!available) {
          setDebugInfo('⚠️ Pedometer niet beschikbaar op dit device');
          setPermissionStatus('unavailable');
          return;
        }
        
        // Request permissions (works for both Android and iOS)
        const { status } = await Pedometer.requestPermissionsAsync();
        console.log('Pedometer permission status:', status);
        
        if (status !== 'granted') {
          setDebugInfo('❌ Toestemming geweigerd - ga naar instellingen');
          setPermissionStatus('denied');
          
          Alert.alert(
            'Toestemming Vereist',
            Platform.OS === 'android' 
              ? 'De app heeft toestemming nodig om je stappen te tellen. NOTA: In Expo Go werkt dit niet - bouw een standalone APK voor volledige functionaliteit.'
              : 'De app heeft toestemming nodig om je stappen te tellen.',
            [
              { text: 'Annuleren', style: 'cancel' },
              { text: 'Open Instellingen', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
        
        setPermissionStatus('granted');
        setDebugInfo('✓ Pedometer actief - auto-sync elke 50 stappen');
        
      } catch (error) {
        console.error('Pedometer init error:', error);
        setDebugInfo('⚠️ Fout bij initialiseren pedometer');
        setPermissionStatus('error');
      }
    };
    
    initPedometer();

    let subscription: any = null;

    // Only start watching if we have permission
    if (permissionStatus === 'granted') {
      subscription = Pedometer.watchStepCount(result => {
        console.log('Pedometer update:', result.steps);
        setStepsDelta(prev => {
          const newDelta = prev + result.steps;
          setDebugInfo(`✓ ${result.steps} stappen gedetecteerd`);
          return newDelta;
        });
      });
    }

    const netSubscription = NetInfo.addEventListener(state => {
      // Don't try to sync if we have auth errors
      if (state.isConnected && offlineQueue.length > 0 && !hasAuthError) {
        const totalOffline = offlineQueue.reduce((a, b) => a + b, 0);
        syncSteps(totalOffline);
      }
    });

    return () => {
      if (subscription) {
        subscription.remove();
      }
      netSubscription();
      if (autoSyncTimerRef.current) {
        clearInterval(autoSyncTimerRef.current);
      }
    };
  }, [offlineQueue, permissionStatus, hasAuthError]);

  // Auto-sync based on step threshold
  useEffect(() => {
    if (stepsDelta >= AUTO_SYNC_THRESHOLD && !hasAuthError && !isSyncing) {
      console.log(`Auto-sync triggered: ${stepsDelta} stappen (threshold: ${AUTO_SYNC_THRESHOLD})`);
      setDebugInfo(`🔄 Auto-sync: ${stepsDelta} stappen...`);
      syncSteps(stepsDelta);
    }
  }, [stepsDelta, hasAuthError, isSyncing]);

  // Auto-sync based on time interval
  useEffect(() => {
    if (autoSyncTimerRef.current) {
      clearInterval(autoSyncTimerRef.current);
    }

    autoSyncTimerRef.current = setInterval(() => {
      if (stepsDelta > 0 && !hasAuthError && !isSyncing) {
        console.log(`Auto-sync timer triggered: ${stepsDelta} stappen`);
        setDebugInfo(`⏰ Automatische sync: ${stepsDelta} stappen...`);
        syncSteps(stepsDelta);
      }
    }, AUTO_SYNC_INTERVAL);

    return () => {
      if (autoSyncTimerRef.current) {
        clearInterval(autoSyncTimerRef.current);
      }
    };
  }, [stepsDelta, hasAuthError, isSyncing]);

  const syncSteps = async (delta: number) => {
    if (delta === 0) {
      setDebugInfo('⚠️ Geen stappen om te syncen');
      return;
    }
    
    if (isSyncing) {
      return;
    }
    
    // Don't sync if we already know there's an auth error
    if (hasAuthError) {
      setDebugInfo('❌ Log opnieuw in om te syncen');
      return;
    }
    
    setIsSyncing(true);
    
    // Check if we have a token BEFORE trying to sync
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      setDebugInfo(`❌ Geen login token - log opnieuw in`);
      setIsSyncing(false);
      setHasAuthError(true);
      Alert.alert(
        'Niet Ingelogd',
        'Je moet inloggen om stappen te kunnen synchroniseren.',
        [{ text: 'OK' }]
      );
      setStepsDelta(0);
      setOfflineQueue([]); // Clear queue
      return;
    }
    
    setDebugInfo(`⏳ Syncing ${delta} stappen...`);
    
    try {
      console.log('Syncing steps:', { delta, tokenPresent: !!token });
      await apiFetch(`/steps`, {
        method: 'POST',
        body: JSON.stringify({ steps: delta }),
      });
      setStepsDelta(0);
      setLastSyncTime(new Date());
      setDebugInfo(`✅ ${delta} stappen gesynchroniseerd!`);
      setHasAuthError(false); // Reset auth error flag on success
      onSync();
    } catch (err: any) {
      console.error('Sync failed:', err);
      
      // Check if it's an authentication error (401)
      if (err.message && err.message.includes('401')) {
        setDebugInfo(`❌ Login opnieuw - sessie verlopen`);
        setHasAuthError(true); // Set flag to prevent retry spam
        Alert.alert(
          'Sessie Verlopen',
          'Je moet opnieuw inloggen om stappen te kunnen synchroniseren.',
          [{ text: 'OK' }]
        );
        setStepsDelta(0); // Reset to prevent spam
        setOfflineQueue([]); // Clear offline queue
      } else if (err.message && err.message.includes('403')) {
        setDebugInfo(`❌ Geen toestemming - contacteer DKL`);
        setHasAuthError(true);
        Alert.alert(
          'Geen Toestemming',
          'Je account heeft geen toestemming om stappen te posten. Neem contact op met DKL support.',
          [{ text: 'OK' }]
        );
        setStepsDelta(0);
        setOfflineQueue([]);
      } else {
        // Network error or temporary issue - add to offline queue
        setDebugInfo(`❌ Sync mislukt: ${err.message}`);
        if (!hasAuthError) { // Only queue if not auth error
          setOfflineQueue(prev => [...prev, delta]);
        }
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = () => {
    console.log('Manual sync requested');
    syncSteps(stepsDelta);
  };

  const handleCorrection = (amount: number) => {
    syncSteps(amount);
  };

  const handleDiagnostics = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const role = await AsyncStorage.getItem('userRole');
    const name = await AsyncStorage.getItem('userName');
    const participantId = await AsyncStorage.getItem('participantId');
    
    const timeSinceSync = lastSyncTime 
      ? `${Math.round((Date.now() - lastSyncTime.getTime()) / 1000)}s geleden`
      : 'Nog niet gesynchroniseerd';
    
    Alert.alert(
      'Diagnostics',
      `Token: ${token ? 'Aanwezig (' + token.substring(0, 20) + '...)' : 'GEEN TOKEN!'}\n\n` +
      `Rol: ${role || 'Onbekend'}\n` +
      `Naam: ${name || 'Onbekend'}\n` +
      `ID: ${participantId?.substring(0, 8) || 'Onbekend'}...\n\n` +
      `Pedometer: ${isAvailable ? 'Beschikbaar' : 'Niet beschikbaar'}\n` +
      `Permission: ${permissionStatus}\n` +
      `Platform: ${Platform.OS}\n` +
      `Auth Error: ${hasAuthError ? 'Ja' : 'Nee'}\n\n` +
      `Laatste Sync: ${timeSinceSync}\n` +
      `Offline Queue: ${offlineQueue.length} items`,
      [{ text: 'OK' }]
    );
  };

  const openSettings = () => {
    Alert.alert(
      'Toestemming Vereist',
      Platform.OS === 'android'
        ? 'NOTA: Expo Go ondersteunt geen stappen tracking op Android. Bouw een standalone APK voor volledige functionaliteit.\n\nVoor standalone apps: Instellingen > Apps > DKL Steps App > Machtigingen.'
        : 'Ga naar Instellingen > Privacy > Motion & Fitness en schakel DKL Steps App in.',
      [
        { text: 'OK' }
      ]
    );
  };

  const formatTimeSinceSync = () => {
    if (!lastSyncTime) return '';
    const seconds = Math.round((Date.now() - lastSyncTime.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s geleden`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m geleden`;
    const hours = Math.floor(minutes / 60);
    return `${hours}u geleden`;
  };

  const offlineTotal = offlineQueue.reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Delta Stappen</Text>
        <Text style={styles.value}>{stepsDelta}</Text>
        
        {/* Auto-sync indicator */}
        <View style={styles.autoSyncInfo}>
          <View style={[styles.syncDot, isSyncing && styles.syncDotActive]} />
          <Text style={styles.autoSyncText}>
            {isSyncing 
              ? '🔄 Bezig met synchroniseren...'
              : `✓ Auto-sync: elke ${AUTO_SYNC_THRESHOLD} stappen of 5 min`
            }
          </Text>
        </View>
        
        {lastSyncTime && !isSyncing && (
          <Text style={styles.lastSync}>
            Laatste sync: {formatTimeSinceSync()}
          </Text>
        )}
        
        {offlineTotal !== 0 && (
          <Text style={styles.offline}>Offline wachtrij: {offlineTotal}</Text>
        )}
        {debugInfo && (
          <Text style={styles.debug}>{debugInfo}</Text>
        )}
        {Platform.OS === 'android' && (
          <Text style={styles.platformInfo}>📱 Android (Expo Go: gebruik test button)</Text>
        )}
      </View>
      
      {!isAvailable && (
        <Text style={styles.warning}>⚠️ Pedometer niet beschikbaar - gebruik physical device</Text>
      )}
      
      {permissionStatus === 'denied' && (
        <View style={styles.permissionWarning}>
          <Text style={styles.warningText}>❌ Toestemming voor stappen tracking is geweigerd</Text>
          <View style={styles.buttonContainer}>
            <Button 
              title="Info" 
              onPress={openSettings}
              color="#FF9800"
            />
          </View>
        </View>
      )}
      
      {hasAuthError && (
        <View style={styles.authErrorWarning}>
          <Text style={styles.warningText}>🔐 Authenticatie probleem - log opnieuw in</Text>
        </View>
      )}
      
      {permissionStatus === 'checking' && (
        <Text style={styles.debug}>⏳ Toestemming controleren...</Text>
      )}
      
      <View style={styles.buttonContainer}>
        <Button 
          title={isSyncing ? "Bezig..." : `Sync Nu (${stepsDelta})`} 
          onPress={handleManualSync} 
          disabled={stepsDelta === 0 || isSyncing || hasAuthError}
        />
      </View>
      
      <View style={styles.buttonRow}>
        <View style={styles.buttonHalf}>
          <Button 
            title="Correctie -100" 
            onPress={() => handleCorrection(-100)} 
            color="orange"
            disabled={isSyncing || hasAuthError}
          />
        </View>
        
        <View style={styles.buttonHalf}>
          <Button 
            title="Test +50" 
            onPress={() => {
              setStepsDelta(prev => prev + 50);
              setDebugInfo('✓ Test: 50 stappen toegevoegd');
            }}
            color="#4CAF50"
          />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="🔍 Diagnostics" 
          onPress={handleDiagnostics}
          color="#9C27B0"
        />
      </View>
    </View>
  );
}

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
    backgroundColor: `${colors.primary}15`, // 8% opacity voor subtiele achtergrond
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}40`, // 25% opacity border
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