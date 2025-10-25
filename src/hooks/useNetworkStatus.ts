/**
 * useNetworkStatus Hook
 * 
 * Monitor de netwerk status (online/offline) realtime.
 * Geeft informatie over connectiviteit en internet bereikbaarheid.
 * 
 * @example
 * ```typescript
 * function MyScreen() {
 *   const { isConnected, isOnline, connectionType } = useNetworkStatus();
 *   
 *   if (!isOnline) {
 *     return <Text>Geen internetverbinding</Text>;
 *   }
 *   
 *   return <View>Content</View>;
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { logger } from '../utils/logger';

interface NetworkStatus {
  /**
   * Of er een netwerk connectie is (WiFi, Cellular, etc.)
   */
  isConnected: boolean;
  
  /**
   * Of internet daadwerkelijk bereikbaar is
   */
  isInternetReachable: boolean;
  
  /**
   * Combined: isConnected && isInternetReachable
   */
  isOnline: boolean;
  
  /**
   * Type connectie (wifi, cellular, ethernet, none, unknown)
   */
  connectionType: string;
  
  /**
   * Extra details over de connectie
   */
  details: {
    isConnectionExpensive: boolean;
    cellularGeneration: string | null;
    strength: number | null;
  };
}

/**
 * Hook om network status te monitoren
 * 
 * @param options - Configuratie opties
 */
export function useNetworkStatus(options?: {
  /**
   * Callback wanneer connectie verandert
   */
  onConnectionChange?: (isOnline: boolean) => void;
  
  /**
   * Callback wanneer offline gaat
   */
  onOffline?: () => void;
  
  /**
   * Callback wanneer online komt
   */
  onOnline?: () => void;
  
  /**
   * Logging uitschakelen
   */
  silent?: boolean;
}): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    isOnline: true,
    connectionType: 'unknown',
    details: {
      isConnectionExpensive: false,
      cellularGeneration: null,
      strength: null,
    },
  });

  const {
    onConnectionChange,
    onOffline,
    onOnline,
    silent = false,
  } = options || {};

  const handleStateChange = useCallback((state: NetInfoState) => {
    const isConnected = state.isConnected ?? false;
    const isInternetReachable = state.isInternetReachable ?? false;
    const isOnline = isConnected && isInternetReachable;
    
    const newStatus: NetworkStatus = {
      isConnected,
      isInternetReachable,
      isOnline,
      connectionType: state.type || 'unknown',
      details: {
        isConnectionExpensive: state.details?.isConnectionExpensive ?? false,
        cellularGeneration: (state.details as any)?.cellularGeneration ?? null,
        strength: (state.details as any)?.strength ?? null,
      },
    };

    // Log status change (tenzij silent mode)
    if (!silent) {
      logger.debug('Network status changed:', {
        isOnline: newStatus.isOnline,
        type: newStatus.connectionType,
        reachable: newStatus.isInternetReachable,
      });
    }

    // Check of er een wijziging is in online status
    const wasOnline = networkStatus.isOnline;
    if (wasOnline !== isOnline) {
      if (!silent) {
        logger.info(isOnline ? 'Device came online' : 'Device went offline');
      }
      
      // Trigger callbacks
      if (isOnline && onOnline) {
        onOnline();
      } else if (!isOnline && onOffline) {
        onOffline();
      }
      
      if (onConnectionChange) {
        onConnectionChange(isOnline);
      }
    }

    setNetworkStatus(newStatus);
  }, [networkStatus.isOnline, onConnectionChange, onOffline, onOnline, silent]);

  useEffect(() => {
    // Subscribe to network status updates
    const unsubscribe = NetInfo.addEventListener(handleStateChange);

    // Get initial state
    NetInfo.fetch().then(state => {
      handleStateChange(state);
    });

    return () => {
      unsubscribe();
    };
  }, [handleStateChange]);

  return networkStatus;
}

/**
 * Simplified hook - alleen online/offline status
 */
export function useIsOnline(): boolean {
  const { isOnline } = useNetworkStatus({ silent: true });
  return isOnline;
}

/**
 * Hook met callbacks voor online/offline events
 */
export function useNetworkListener(
  onOnline: () => void,
  onOffline: () => void
): NetworkStatus {
  return useNetworkStatus({
    onOnline,
    onOffline,
  });
}