/**
 * useRefreshOnFocus Hook
 * 
 * Automatisch data refetchen wanneer het screen in focus komt.
 * Ideaal voor React Query queries die up-to-date moeten blijven.
 * 
 * @example
 * ```typescript
 * function MyScreen() {
 *   const { data, refetch } = useQuery(['myData'], fetchMyData);
 *   
 *   // Auto-refetch wanneer screen in focus komt
 *   useRefreshOnFocus(refetch);
 *   
 *   return <Text>Content</Text>;
 * }
 * ```
 */

import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { logger } from '../utils/logger';

/**
 * Hook om data te refetchen wanneer screen focus krijgt
 * 
 * @param refetch - Functie om data opnieuw op te halen (bijv. van React Query)
 * @param enabled - Of de auto-refresh actief moet zijn (default: true)
 */
export function useRefreshOnFocus(
  refetch: () => void | Promise<void>,
  enabled: boolean = true
) {
  const isFirstMount = useRef(true);

  useFocusEffect(
    useCallback(() => {
      // Skip eerste mount om dubbele fetches te voorkomen
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }

      if (enabled) {
        logger.debug('Screen focused - triggering refetch');
        refetch();
      }
    }, [refetch, enabled])
  );
}

/**
 * Alternatieve versie met meer controle
 * Returns een functie om handmatig te refreshen
 */
export function useRefreshOnFocusManual(
  refetch: () => void | Promise<void>,
  options?: {
    enabled?: boolean;
    skipFirstMount?: boolean;
    debounceMs?: number;
  }
) {
  const isFirstMount = useRef(true);
  const lastRefreshTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const {
    enabled = true,
    skipFirstMount = true,
    debounceMs = 0,
  } = options || {};

  const refresh = useCallback(() => {
    // Debounce check
    if (debounceMs > 0) {
      const now = Date.now();
      if (now - lastRefreshTime.current < debounceMs) {
        logger.debug('Refresh debounced');
        return;
      }
      lastRefreshTime.current = now;
    }

    logger.debug('Manual refresh triggered');
    refetch();
  }, [refetch, debounceMs]);

  useFocusEffect(
    useCallback(() => {
      // Skip eerste mount indien gewenst
      if (skipFirstMount && isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }

      if (enabled) {
        // Clear eventuele bestaande timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Optioneel: vertraag refresh met debounce
        if (debounceMs > 0) {
          timeoutRef.current = setTimeout(() => {
            refresh();
          }, debounceMs);
        } else {
          refresh();
        }
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [refresh, enabled, skipFirstMount, debounceMs])
  );

  return { refresh };
}