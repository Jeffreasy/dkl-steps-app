/**
 * useStepTracking Hook
 *
 * Extracted business logic van StepCounter component.
 * Handles pedometer tracking, auto-sync logic, and offline queue.
 *
 * Features:
 * - Conditional tracking: alleen actief bij in fence + event actief
 * - Auto-sync elke 50 stappen of 5 minuten
 * - Offline queue met automatic retry
 * - Permission handling
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
 *   } = useStepTracking({
 *     onSync,
 *     conditionalTracking: {
 *       enabled: true,
 *       isInsideGeofence: true,
 *       hasActiveEvent: true,
 *     }
 *   });
 *
 *   return <StepDisplay stepsDelta={stepsDelta} ... />;
 * }
 * ```
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Platform, Linking, AppState, AppStateStatus } from 'react-native';
import { Pedometer } from 'expo-sensors';
import NetInfo from '@react-native-community/netinfo';
import { apiFetch } from '../services/api';
import { storage } from '../utils/storage';
import { isAPIError, getErrorMessage } from '../types';
import { logger } from '../utils/logger';
import { haptics } from '../utils/haptics';
import { useEventData } from './useEventData';
import { useGeofencing } from './useGeofencing';
import { getPrimaryGeofence } from '../types/geofencing';
import type { ConditionalTrackingState } from '../types/geofencing';

// Auto-sync configuratie
const AUTO_SYNC_THRESHOLD = 50; // Sync elke 50 stappen
const AUTO_SYNC_INTERVAL = 5 * 60 * 1000; // Sync elke 5 minuten

interface ConditionalTrackingOptions {
  /**
   * Enable conditional tracking (alleen bij in fence + event actief)
   */
  enabled: boolean;
  
  /**
   * Is gebruiker binnen geofence?
   */
  isInsideGeofence: boolean;
  
  /**
   * Is er een actief event?
   */
  hasActiveEvent: boolean;
}

interface UseStepTrackingOptions {
  /**
   * Callback wanneer sync succesvol is
   */
  onSync: () => void;
  
  /**
   * Conditional tracking configuration (optioneel)
   * Indien enabled: pedometer start alleen bij in fence + event actief
   */
  conditionalTracking?: ConditionalTrackingOptions;
}

interface LockedPeriod {
  start: Date;
  end?: Date;
  duration?: number;
  historicalSteps?: number;
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
  conditionalTrackingState: ConditionalTrackingState;
  appState: AppStateStatus;
  lockedPeriods: LockedPeriod[];

  // Actions
  syncSteps: (delta: number) => Promise<void>;
  handleManualSync: () => void;
  handleCorrection: (amount: number) => void;
  handleDiagnostics: () => void;
  handleTestAdd: () => void;
  openSettings: () => void;
}

export function useStepTracking({
  onSync,
  conditionalTracking,
}: UseStepTrackingOptions): UseStepTrackingReturn {
  // Integrate event data and geofencing for automatic conditional tracking
  const { activeEvent, isLoading: eventsLoading } = useEventData();

  // Convert backend geofence to frontend format
  const primaryGeofence = activeEvent ? getPrimaryGeofence(activeEvent) : null;

  const { status: geofenceStatus, startMonitoring: startGeofencing } = useGeofencing({
    geofence: primaryGeofence,
    onEnter: () => logger.info('📍 Entered event geofence'),
    onExit: () => logger.info('📍 Left event geofence'),
  });

  const [isAvailable, setIsAvailable] = useState(false);
  const [stepsDelta, setStepsDelta] = useState(0);
  const [offlineQueue, setOfflineQueue] = useState<number[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<string>('checking');
  const [hasAuthError, setHasAuthError] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [conditionalTrackingState, setConditionalTrackingState] = useState<ConditionalTrackingState>({
    isTrackingEnabled: true, // Default: altijd actief (backward compatible)
    lastUpdate: null,
  });
  const [appState, setAppState] = useState<AppStateStatus>('active');
  const [lockedPeriods, setLockedPeriods] = useState<LockedPeriod[]>([]);
  const autoSyncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastForegroundStepsRef = useRef<number>(0);

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

    // Check if user is authenticated first
    const isAuthenticated = await storage.getItem('token') !== null;
    if (!isAuthenticated) {
      logger.debug('No auth token available - queuing steps');
      setDebugInfo('⏳ Wachten op login...');
      setIsSyncing(false);
      // Queue the steps for later sync when user logs in
      setOfflineQueue(prev => [...prev, delta]);
      return;
    }

    // Check token
    const token = await storage.getItem('token');
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
   * Query historical steps for a locked period
   */
  const queryHistoricalSteps = useCallback(async (startDate: Date, endDate: Date): Promise<number> => {
    try {
      if (!isAvailable) {
        logger.debug('Pedometer not available - skipping historical query');
        return 0;
      }

      const result = await Pedometer.getStepCountAsync(startDate, endDate);
      const historicalSteps = result.steps;

      if (historicalSteps > 0) {
        logger.info(`📊 Historical steps found: ${historicalSteps} (${startDate.toISOString()} - ${endDate.toISOString()})`);
        return historicalSteps;
      }

      return 0;
    } catch (error) {
      logger.error('Failed to query historical steps:', error);
      return 0;
    }
  }, [isAvailable]);

  /**
   * Handle app state changes (lock/unlock detection)
   */
  useEffect(() => {
    let subscription: any = null;

    // Only add listener if AppState is available (not in test environment)
    if (AppState && typeof AppState.addEventListener === 'function') {
      const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        const previousState = appState;
        setAppState(nextAppState);

        logger.debug(`App state changed: ${previousState} → ${nextAppState}`);

        if (nextAppState === 'background' || nextAppState === 'inactive') {
          // Phone locked - start tracking locked period
          setLockedPeriods(prev => [...prev, { start: new Date() }]);
          lastForegroundStepsRef.current = stepsDelta;
          logger.info('📱 Phone locked - tracking locked period');
        } else if (nextAppState === 'active' && previousState.match(/inactive|background/)) {
          // Phone unlocked - query historical steps
          const lastLocked = lockedPeriods[lockedPeriods.length - 1];
          if (lastLocked && !lastLocked.end) {
            const unlockTime = new Date();
            const duration = unlockTime.getTime() - lastLocked.start.getTime();

            logger.info(`📱 Phone unlocked - querying historical steps for ${Math.round(duration / 1000)}s locked period`);

            // Query historical steps for the locked period
            const historicalSteps = await queryHistoricalSteps(lastLocked.start, unlockTime);

            if (historicalSteps > 0) {
              // Add historical steps (avoid double counting foreground steps)
              const foregroundStepsDuringLock = stepsDelta - lastForegroundStepsRef.current;
              const netHistoricalSteps = Math.max(0, historicalSteps - foregroundStepsDuringLock);

              if (netHistoricalSteps > 0) {
                setStepsDelta(prev => prev + netHistoricalSteps);
                setDebugInfo(`📊 +${netHistoricalSteps} historische stappen toegevoegd`);
                logger.success(`Added ${netHistoricalSteps} historical steps from locked period`);
              }
            }

            // Mark locked period as complete
            setLockedPeriods(prev => prev.map(period =>
              period === lastLocked
                ? { ...period, end: unlockTime, duration, historicalSteps }
                : period
            ));
          }
        }
      };

      subscription = AppState.addEventListener('change', handleAppStateChange);
    } else {
      // Mock implementation for testing
      logger.debug('AppState not available - skipping app state listener');
    }

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, [appState, lockedPeriods, stepsDelta, queryHistoricalSteps]);

  /**
    * Update conditional tracking state - automatisch via useEventData en useGeofencing
    */
   useEffect(() => {
     // Check if conditional tracking is enabled (backward compatibility)
     const enabled = conditionalTracking?.enabled ?? true; // Default true for automatic integration

     if (!enabled) {
       // Conditional tracking disabled - altijd actief (legacy behavior)
       setConditionalTrackingState(prev => {
         if (prev.isTrackingEnabled) return prev;
         return {
           isTrackingEnabled: true,
           lastUpdate: new Date(),
         };
       });
       setDebugInfo('✓ Tracking actief: Altijd actief (conditional tracking uitgeschakeld)');
       return;
     }

     // Automatic conditional tracking via integrated hooks
     const hasActiveEvent = !!activeEvent && !eventsLoading;
     const isInsideGeofence = geofenceStatus === 'inside';

     // Tracking enabled alleen als BEIDE conditions true zijn
     const shouldTrack = hasActiveEvent && isInsideGeofence;

     // Determine disabled reason voor debugging
     let disabledReason: ConditionalTrackingState['disabledReason'];
     if (eventsLoading) {
       disabledReason = 'event_not_active'; // Loading state
     } else if (!hasActiveEvent) {
       disabledReason = 'no_event';
     } else if (!isInsideGeofence) {
       disabledReason = 'outside_fence';
     }

     setConditionalTrackingState(prev => {
       // Only update if changed
       if (prev.isTrackingEnabled === shouldTrack && prev.disabledReason === disabledReason) {
         return prev;
       }

       return {
         isTrackingEnabled: shouldTrack,
         disabledReason: shouldTrack ? undefined : disabledReason,
         lastUpdate: new Date(),
       };
     });

     // Update debug info based on state
     if (eventsLoading) {
       setDebugInfo('⏳ Tracking: Events laden...');
     } else if (!shouldTrack) {
       const reason = disabledReason === 'no_event'
         ? 'Geen actief event'
         : disabledReason === 'outside_fence'
         ? 'Buiten event gebied'
         : 'Event niet actief';
       setDebugInfo(`⏸️ Tracking gepauzeerd: ${reason}`);
     } else {
       setDebugInfo('✓ Tracking actief: Binnen event gebied');
     }

     // Only log when state actually changes to avoid spam
     const prevState = conditionalTrackingState;
     const stateChanged = prevState.isTrackingEnabled !== shouldTrack ||
                         prevState.disabledReason !== disabledReason;

     if (stateChanged) {
       logger.info('Conditional tracking state updated:', {
         shouldTrack,
         hasActiveEvent,
         isInsideGeofence,
         geofenceStatus,
         eventsLoading,
         disabledReason,
         activeEventName: activeEvent?.name ?? 'none',
       });
     }
   }, [
     conditionalTracking?.enabled,
     activeEvent,
     geofenceStatus,
     eventsLoading,
   ]);

  /**
    * Initialize pedometer en start tracking
    * Alleen actief als conditional tracking dit toestaat
    */
   useEffect(() => {
     // Start geofencing monitoring when we have an active event
     if (activeEvent && !eventsLoading) {
       startGeofencing();
     }

     // Check conditional tracking
     if (!conditionalTrackingState.isTrackingEnabled) {
       // Only log once when state changes to avoid spam
       const shouldLog = !debugInfo.includes('gepauzeerd') || debugInfo !== (
         eventsLoading ? '⏳ Tracking: Events laden...' :
         conditionalTrackingState.disabledReason === 'no_event' ? '⏸️ Tracking gepauzeerd: Geen actief event' :
         '⏸️ Tracking gepauzeerd: Buiten event gebied'
       );

       if (shouldLog) {
         logger.info('Pedometer paused: conditional tracking requirements not met');
       }
       return;
     }
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

    if (permissionStatus === 'granted' && conditionalTrackingState.isTrackingEnabled) {
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
        // Check if user is now authenticated before syncing queued steps
        const checkAndSyncQueued = async () => {
          const token = await storage.getItem('token');
          if (token) {
            const totalOffline = offlineQueue.reduce((a, b) => a + b, 0);
            logger.info(`📶 Network restored - syncing ${totalOffline} queued steps`);
            syncSteps(totalOffline);
          }
        };
        checkAndSyncQueued();
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
  }, [permissionStatus, hasAuthError, syncSteps, conditionalTrackingState.isTrackingEnabled, appState, activeEvent, eventsLoading, startGeofencing]);

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
    const token = await storage.getItem('token');
    const role = await storage.getItem('userRole');
    const name = await storage.getItem('userName');
    const participantId = await storage.getItem('participantId');

    const timeSinceSync = lastSyncTime
      ? `${Math.round((Date.now() - lastSyncTime.getTime()) / 1000)}s geleden`
      : 'Nog niet gesynchroniseerd';

    const trackingStatus = conditionalTrackingState.isTrackingEnabled
      ? 'Actief'
      : `Gepauzeerd (${conditionalTrackingState.disabledReason || 'unknown'})`;

    const lockedPeriodsInfo = lockedPeriods.length > 0
      ? lockedPeriods.map((period, index) =>
          `Period ${index + 1}: ${period.start.toLocaleTimeString()} - ${period.end?.toLocaleTimeString() || 'ongoing'} (${period.historicalSteps || 0} steps)`
        ).join('\n')
      : 'Geen locked periods';

    Alert.alert(
      'Diagnostics',
      `Token: ${token ? 'Aanwezig (' + token.substring(0, 20) + '...)' : 'GEEN TOKEN!'}\n\n` +
      `Rol: ${role || 'Onbekend'}\n` +
      `Naam: ${name || 'Onbekend'}\n` +
      `ID: ${participantId?.substring(0, 8) || 'Onbekend'}...\n\n` +
      `Pedometer: ${isAvailable ? 'Beschikbaar' : 'Niet beschikbaar'}\n` +
      `Permission: ${permissionStatus}\n` +
      `Platform: ${Platform.OS}\n` +
      `App State: ${appState}\n` +
      `Auth Error: ${hasAuthError ? 'Ja' : 'Nee'}\n\n` +
      `Conditional Tracking: ${conditionalTracking?.enabled ? 'Enabled' : 'Disabled'}\n` +
      `Tracking Status: ${trackingStatus}\n\n` +
      `Laatste Sync: ${timeSinceSync}\n` +
      `Offline Queue: ${offlineQueue.length} items\n\n` +
      `Locked Periods:\n${lockedPeriodsInfo}`,
      [{ text: 'OK' }]
    );
  }, [isAvailable, permissionStatus, hasAuthError, lastSyncTime, offlineQueue.length, conditionalTrackingState, conditionalTracking, appState, lockedPeriods]);

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
    conditionalTrackingState,
    appState,
    lockedPeriods,

    // Actions
    syncSteps,
    handleManualSync,
    handleCorrection,
    handleDiagnostics,
    handleTestAdd,
    openSettings,
  };
}