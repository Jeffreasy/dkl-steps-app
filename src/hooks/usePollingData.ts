import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { logger } from '../utils/logger';
import { useNetworkStatus } from './useNetworkStatus';

interface UsePollingDataOptions<T> {
  fetchFn: () => Promise<T>;
  interval?: number;
  enabled?: boolean;
  /**
   * WebSocket fallback function (optional)
   * If provided, will use WebSocket when available and fall back to polling
   */
  webSocketFallback?: {
    connect: () => void;
    disconnect: () => void;
    isConnected: boolean;
    data: T | null;
  };
  /**
   * Max retry attempts for failed requests
   * @default 5
   */
  maxRetries?: number;
  /**
   * Initial retry delay in ms (will use exponential backoff)
   * @default 1000
   */
  retryDelay?: number;
  /**
   * Enable network awareness (pause polling when offline)
   * @default true
   */
  networkAware?: boolean;
  /**
   * Callback when polling fails after max retries
   */
  onMaxRetriesReached?: (error: Error) => void;
}

interface UsePollingDataResult<T> {
  data: T | null;
  error: string;
  isLoading: boolean;
  retryCount: number;
  isUsingWebSocket: boolean;
  isOnline: boolean;
  forceRefetch: () => Promise<void>;
}

export function usePollingData<T>({
  fetchFn,
  interval = 10000,
  enabled = true,
  webSocketFallback,
  maxRetries = 5,
  retryDelay = 1000,
  networkAware = true,
  onMaxRetriesReached,
}: UsePollingDataOptions<T>): UsePollingDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isUsingWebSocket, setIsUsingWebSocket] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const consecutiveFailures = useRef(0);
  const currentRetryDelay = useRef(retryDelay);
  const fetchFnRef = useRef(fetchFn);
  
  // Keep fetchFn ref up to date
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);
  
  // Network status monitoring
  const { isOnline } = useNetworkStatus({
    silent: true,
    onOnline: () => {
      if (networkAware && enabled) {
        logger.info('Polling: Network restored - resuming');
        consecutiveFailures.current = 0;
        currentRetryDelay.current = retryDelay;
        startPolling();
      }
    },
    onOffline: () => {
      if (networkAware) {
        logger.info('Polling: Network lost - pausing');
        stopPolling();
      }
    },
  });

  /**
   * Calculate exponential backoff delay
   */
  const calculateBackoff = useCallback((attempt: number): number => {
    const delay = retryDelay * Math.pow(2, attempt);
    const maxDelay = 60000; // Cap at 60 seconds
    return Math.min(delay, maxDelay);
  }, [retryDelay]);

  /**
   * Fetch data with retry logic
   */
  const fetchData = useCallback(async (isRetry = false): Promise<void> => {
    // Check if WebSocket is available and connected
    if (webSocketFallback?.isConnected && webSocketFallback.data) {
      setIsUsingWebSocket(true);
      setData(webSocketFallback.data);
      setError('');
      setIsLoading(false);
      consecutiveFailures.current = 0;
      currentRetryDelay.current = retryDelay;
      return;
    }

    // Use polling
    setIsUsingWebSocket(false);

    try {
      logger.debug('Polling: Fetching data');
      const result = await fetchFnRef.current();
      setData(result);
      setError('');
      setIsLoading(false);
      setRetryCount(0);
      consecutiveFailures.current = 0;
      currentRetryDelay.current = retryDelay;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      consecutiveFailures.current++;
      
      logger.error(`Polling fetch failed (attempt ${consecutiveFailures.current}/${maxRetries}):`, err);

      // Check if max retries reached
      if (consecutiveFailures.current >= maxRetries) {
        setError(`Max retries reached: ${message}`);
        setIsLoading(false);
        logger.error('Polling: Max retries reached');
        
        if (onMaxRetriesReached && err instanceof Error) {
          onMaxRetriesReached(err);
        }
        
        // Reset after a longer delay
        retryTimeoutRef.current = setTimeout(() => {
          consecutiveFailures.current = 0;
          currentRetryDelay.current = retryDelay;
          fetchData();
        }, 120000); // Wait 2 minutes before trying again
        
        return;
      }

      // Calculate backoff delay
      const backoffDelay = calculateBackoff(consecutiveFailures.current - 1);
      currentRetryDelay.current = backoffDelay;
      setRetryCount(consecutiveFailures.current);
      setError(message);
      setIsLoading(false);

      // Retry with exponential backoff
      logger.info(`Polling: Retrying in ${backoffDelay}ms (attempt ${consecutiveFailures.current}/${maxRetries})`);
      retryTimeoutRef.current = setTimeout(() => {
        fetchData(true);
      }, backoffDelay);
    }
  }, [webSocketFallback, maxRetries, retryDelay, calculateBackoff, onMaxRetriesReached]);

  /**
   * Force refetch (bypass cache)
   */
  const forceRefetch = useCallback(async (): Promise<void> => {
    consecutiveFailures.current = 0;
    currentRetryDelay.current = retryDelay;
    setRetryCount(0);
    await fetchData();
  }, [fetchData, retryDelay]);

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    // Don't start if network aware and offline
    if (networkAware && !isOnline) {
      logger.info('Polling: Skipping start (offline)');
      return;
    }

    // If WebSocket is connected, use that instead
    if (webSocketFallback?.isConnected) {
      logger.info('Polling: Using WebSocket instead of polling');
      webSocketFallback.connect();
      return;
    }

    logger.info(`Polling: Starting polling (${interval}ms interval)`);
    fetchData(); // Initial fetch
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Clear any pending retries
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    // Set up interval
    intervalRef.current = setInterval(() => fetchData(), interval);
  }, [fetchData, interval, isOnline, networkAware]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    logger.info('Polling: Stopping polling');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Disconnect WebSocket if using it
    if (webSocketFallback?.isConnected) {
      webSocketFallback.disconnect();
    }
  }, []);

  /**
   * WebSocket data updates
   */
  useEffect(() => {
    if (webSocketFallback?.isConnected && webSocketFallback.data) {
      setData(webSocketFallback.data);
      setIsUsingWebSocket(true);
    }
  }, [webSocketFallback?.data, webSocketFallback?.isConnected]);

  /**
   * App state management
   */
  useEffect(() => {
    if (!enabled) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // App came to foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        logger.info('Polling: App became active - resuming');
        startPolling();
      }
      // App went to background
      else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        logger.info('Polling: App backgrounded - stopping');
        stopPolling();
      }
      
      appState.current = nextAppState;
    };

    // Start polling on mount
    startPolling();

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup
    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [enabled, startPolling, stopPolling]);

  return {
    data,
    error,
    isLoading,
    retryCount,
    isUsingWebSocket,
    isOnline,
    forceRefetch,
  };
}