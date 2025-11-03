/**
 * useTokenRefresh Hook
 * Automatische token refresh om "Token expired" errors te voorkomen
 * 
 * Features:
 * - Background token refresh elke 15 minuten
 * - Refresh 5 minuten vóór expiry (JWT lifetime = 20 min)
 * - Auto-cleanup bij unmount
 * - Error handling met force logout bij permanent failure
 * 
 * @example
 * ```tsx
 * function App() {
 *   useTokenRefresh(); // Activate in root component
 *   return <YourApp />;
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { storage } from '../utils/storage';
import { apiFetch } from '../services/api';
import { logger } from '../utils/logger';
import type { RefreshResponse } from '../types/api';

// Refresh interval: 15 minuten (voor 20 min token lifetime)
const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

// Max retry attempts before forcing logout
const MAX_RETRY_ATTEMPTS = 3;

/**
 * useTokenRefresh Hook
 * Voegt automatische token refresh toe aan de app
 */
export function useTokenRefresh() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  /**
   * Refresh the authentication token
   */
  const refreshToken = async (): Promise<boolean> => {
    try {
      // Get current tokens
      const currentToken = await storage.getItem('authToken');
      const refreshTokenValue = await storage.getItem('refreshToken');

      if (!currentToken || !refreshTokenValue) {
        logger.warn('No tokens available for refresh');
        return false;
      }

      logger.info('🔄 Refreshing authentication token...');

      // Call refresh endpoint
      const response = await apiFetch<RefreshResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
        retries: 2, // Allow retries for network issues
      });

      if (response.success && response.token && response.refresh_token) {
        // Save new tokens
        await storage.setItem('authToken', response.token);
        await storage.setItem('refreshToken', response.refresh_token);

        // Reset retry counter on success
        retryCountRef.current = 0;

        logger.success('✅ Token refreshed successfully');
        return true;
      } else {
        logger.error('Token refresh failed - invalid response');
        return false;
      }
    } catch (error) {
      logger.error('Token refresh failed:', error);

      // Increment retry counter
      retryCountRef.current++;

      // Force logout after max retries
      if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
        logger.error(`❌ Token refresh failed ${MAX_RETRY_ATTEMPTS} times - forcing logout`);
        await storage.clear(); // This will trigger logout
        retryCountRef.current = 0;
      }

      return false;
    }
  };

  /**
   * Start refresh interval
   */
  const startRefreshInterval = () => {
    stopRefreshInterval();

    intervalRef.current = setInterval(async () => {
      // Only refresh when app is active
      if (appStateRef.current === 'active') {
        await refreshToken();
      } else {
        logger.debug('Skipping token refresh - app not active');
      }
    }, REFRESH_INTERVAL_MS);

    logger.info(`🕐 Token refresh interval started (${REFRESH_INTERVAL_MS / 1000 / 60} minutes)`);
  };

  /**
   * Stop refresh interval
   */
  const stopRefreshInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      logger.debug('Token refresh interval stopped');
    }
  };

  /**
   * Handle app state changes
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (nextAppState === 'active' && previousState.match(/inactive|background/)) {
        // App came to foreground - refresh token immediately
        logger.info('📱 App active - refreshing token');
        refreshToken();
      }
    });

    return () => subscription.remove();
  }, []);

  /**
   * Initialize refresh interval on mount
   */
  useEffect(() => {
    // Check if user is authenticated
    const initializeRefresh = async () => {
      const token = await storage.getItem('authToken');
      if (token) {
        // Refresh immediately on app start
        await refreshToken();
        
        // Then start interval
        startRefreshInterval();
      } else {
        logger.debug('No auth token - skipping refresh interval');
      }
    };

    initializeRefresh();

    return () => {
      stopRefreshInterval();
    };
  }, []);

  // Hook doesn't return anything - it just runs in background
}