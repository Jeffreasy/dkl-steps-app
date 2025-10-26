/**
 * useStepTracking Hook
 * 
 * Extracted business logic van StepCounter component.
 * Handles pedometer tracking, auto-sync logic, and offline queue.
 * 
 * Separation of Concerns:
 * - Hook: Business logic (pedometer, sync, queue)
 * - Component: UI rendering only
 * 
 * @example
 * ```typescript
 * function StepCounter({ onSync }: Props) {
 *   const {
 *     stepsDelta,
 *     isSyncing,
 *     debugInfo,
 *     syncSteps,
 *     handleCorrection,
 *     handleDiagnostics,
 *   } = useStepTracking({ onSync });
 *   
 *   return <StepDisplay stepsDelta={stepsDelta} ... />;
 * }
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { Pedometer } from 'expo-sensors';
import NetInfo from '@react-native-community/netinfo';
import { apiFetch } from '../services/api';
import { storage } from '../utils/storage';
import { isAPIError, getErrorMessage } from '../types';
import { logger } from '../utils/logger';
import { haptics } from '../utils/haptics';

// Auto-sync configuratie
const AUTO_SYNC_THRESHOLD = 50; // Sync elke 50 stappen
const AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // Sync elke 5 minuten

interface UseStepTrackingOptions {
  /**
   * Callback wanneer sync succesvol is
   */
  onSync: () => void;
}

interface UseStepTrackingReturn {
  // State
  stepsDelta: number;
  isAvailable: boolean;
  isSyncing: boolean;
  debugInfo: string;
  permissionStatus: string;
  hasAuthError: boolean;
  lastSyncTime: Date | null;
  offlineQueue: number[];
  
  // Actions
  syncSteps: (delta: number) => Promise<void>;
  handleManualSync: () => void;
  handleCorrection: (amount: number) => void;
  handleDiagnostics: () => void;
  handleTestAdd: () => void;
  openSettings: () => void;
}

export function useStepTracking({ onSync }: UseStepTrackingOptions): UseStepTrackingReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [stepsDelta, setStepsDelta] = useState(0);
  const [offlineQueue, setOfflineQueue] = useState<number[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<string>('checking');
  const [hasAuthError, setHasAuthError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const autoSyncTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Sync stappen naar backend
   */
  const syncSteps = useCallback(async (delta: number) => {
    if (delta === 0) {
      setDebugInfo('⚠️ Geen stappen om te syncen');
      return;
    }
    
    if (isSyncing) {
      return;
    }
    
    // Don't sync if auth error
    if (hasAuthError) {
      setDebugInfo('❌ Log opnieuw in om te syncen');
      return;
    }
    
    setIsSyncing(true);
    
    // Check token
    const token = await storage.getItem('authToken');
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
      setOfflineQueue([]);
      return;
    }
    
    setDebugInfo(`⏳ Syncing ${delta} stappen...`);
    
    try {
      logger.info('Syncing steps:', { delta, tokenPresent: !!token });
      await apiFetch(`/steps`, {
        method: 'POST',
        body: JSON.stringify({ steps: delta }),
      });
      setStepsDelta(0);
      setLastSyncTime(new Date());
      setDebugInfo(`✅ ${delta} stappen gesynchroniseerd!`);
      setHasAuthError(false);
      
      await haptics.success();
      onSync();
    } catch (error: unknown) {
      logger.error('Sync failed:', error);
      
      if (isAPIError(error)) {
        if (error.isAuthError()) {
          setDebugInfo(`❌ Login opnieuw - sessie verlopen`);
          setHasAuthError(true);
          Alert.alert(
            'Sessie Verlopen',
            'Je moet opnieuw inloggen om stappen te kunnen synchroniseren.',
            [{ text: 'OK' }]
          );
          setStepsDelta(0);
          setOfflineQueue([]);
          await haptics.warning();
        } else {
          const message = getErrorMessage(error);
          setDebugInfo(`❌ Sync mislukt: ${message}`);
          if (!hasAuthError) {
            setOfflineQueue(prev => [...prev, delta]);
            await haptics.error();
          }
        }
      } else {
        const message = getErrorMessage(error);
        setDebugInfo(`❌ Sync mislukt: ${message}`);
        if (!hasAuthError) {
          setOfflineQueue(prev => [...prev, delta]);
          await haptics.error();
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }, [hasAuthError, isSyncing, onSync]);

  /**
   * Initialize pedometer en start tracking
   */
  useEffect(() => {
    const initPedometer = async () => {
      try {
        const available = await Pedometer.isAvailableAsync();
        setIsAvailable(available);
        
        if (!available) {
          setDebugInfo('⚠️ Pedometer niet beschikbaar op dit device');
          setPermissionStatus('unavailable');
          return;
        }
        
        const { status } = await Pedometer.requestPermissionsAsync();
        logger.info('Pedometer permission status:', status);
        
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
        logger.error('Pedometer init error:', error);
        setDebugInfo('⚠️ Fout bij initialiseren pedometer');
        setPermissionStatus('error');
      }
    };
    
    initPedometer();

    let subscription: any = null;

    if (permissionStatus === 'granted') {
      subscription = Pedometer.watchStepCount(result => {
        logger.debug('Pedometer update:', result.steps);
        setStepsDelta(prev => {
          const newDelta = prev + result.steps;
          setDebugInfo(`✓ ${result.steps} stappen gedetecteerd`);
          return newDelta;
        });
      });
    }

    const netSubscription = NetInfo.addEventListener(state => {
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
  }, [offlineQueue, permissionStatus, hasAuthError, syncSteps]);

  /**
   * Combined auto-sync: threshold-based OR time-based
   */
  useEffect(() => {
    // Check threshold first
    if (stepsDelta >= AUTO_SYNC_THRESHOLD && !hasAuthError && !isSyncing) {
      logger.info(`Auto-sync triggered: ${stepsDelta} stappen (threshold: ${AUTO_SYNC_THRESHOLD})`);
      setDebugInfo(`🔄 Auto-sync: ${stepsDelta} stappen...`);
      syncSteps(stepsDelta);
      return;
    }

    // Clear existing interval
    if (autoSyncTimerRef.current) {
      clearInterval(autoSyncTimerRef.current);
      autoSyncTimerRef.current = null;
    }

    // Set up time-based sync
    if (stepsDelta > 0 && !hasAuthError && !isSyncing) {
      autoSyncTimerRef.current = setInterval(() => {
        logger.info(`Auto-sync timer triggered: ${stepsDelta} stappen`);
        setDebugInfo(`⏰ Automatische sync: ${stepsDelta} stappen...`);
        syncSteps(stepsDelta);
      }, AUTO_SYNC_INTERVAL);
    }

    return () => {
      if (autoSyncTimerRef.current) {
        clearInterval(autoSyncTimerRef.current);
        autoSyncTimerRef.current = null;
      }
    };
  }, [stepsDelta, hasAuthError, isSyncing, syncSteps]);

  /**
   * Manual sync handler
   */
  const handleManualSync = useCallback(() => {
    logger.info('Manual sync requested');
    syncSteps(stepsDelta);
  }, [syncSteps, stepsDelta]);

  /**
   * Correction handler (bijv. -100 voor foute stappen)
   */
  const handleCorrection = useCallback((amount: number) => {
    syncSteps(amount);
  }, [syncSteps]);

  /**
   * Diagnostics handler - toont debug info
   */
  const handleDiagnostics = useCallback(async () => {
    const token = await storage.getItem('authToken');
    const role = await storage.getItem('userRole');
    const name = await storage.getItem('userName');
    const participantId = await storage.getItem('participantId');
    
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
  }, [isAvailable, permissionStatus, hasAuthError, lastSyncTime, offlineQueue.length]);

  /**
   * Test add handler - voeg 50 stappen toe voor testing
   */
  const handleTestAdd = useCallback(() => {
    setStepsDelta(prev => prev + 50);
    setDebugInfo('✓ Test: 50 stappen toegevoegd');
  }, []);

  /**
   * Open settings handler
   */
  const openSettings = useCallback(() => {
    Alert.alert(
      'Toestemming Vereist',
      Platform.OS === 'android'
        ? 'NOTA: Expo Go ondersteunt geen stappen tracking op Android. Bouw een standalone APK voor volledige functionaliteit.\n\nVoor standalone apps: Instellingen > Apps > DKL Steps App > Machtigingen.'
        : 'Ga naar Instellingen > Privacy > Motion & Fitness en schakel DKL Steps App in.',
      [{ text: 'OK' }]
    );
  }, []);

  return {
    // State
    stepsDelta,
    isAvailable,
    isSyncing,
    debugInfo,
    permissionStatus,
    hasAuthError,
    lastSyncTime,
    offlineQueue,
    
    // Actions
    syncSteps,
    handleManualSync,
    handleCorrection,
    handleDiagnostics,
    handleTestAdd,
    openSettings,
  };
}