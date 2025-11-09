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
    * Refresh the authentication token with improved error handling
    */
   const refreshTokenFn = async (): Promise<boolean> => {
     try {
       // Get current tokens
       const currentToken = await storage.getItem('token');
       const refreshTokenValue = await storage.getItem('refresh_token');

       if (!currentToken || !refreshTokenValue) {
         logger.warn('No tokens available for refresh');
         return false;
       }

       logger.info('🔄 Refreshing authentication token...');

       // Call refresh endpoint with retry logic
       const response = await apiFetch<RefreshResponse>('/auth/refresh', {
         method: 'POST',
         body: JSON.stringify({ refresh_token: refreshTokenValue }),
         retries: 3, // Allow more retries for network issues
         timeout: 15000, // Longer timeout for refresh
       });

       if (response.success && response.token && response.refresh_token) {
         // Save new tokens
         await storage.setItem('token', response.token);
         await storage.setItem('refresh_token', response.refresh_token);

         // Reset retry counter on success
         retryCountRef.current = 0;

         logger.success('✅ Token refreshed successfully');
         return true;
       } else {
         logger.error('Token refresh failed - invalid response format');
         return false;
       }
     } catch (error: any) {
       logger.error('Token refresh failed:', error);

       // Handle different error types
       if (error.statusCode === 401) {
         // Invalid refresh token - don't retry, force logout immediately
         logger.error('❌ Invalid refresh token (401) - forcing immediate logout');
         await storage.clear();
         retryCountRef.current = 0;
         return false;
       }

       // For network errors or other issues, increment retry counter
       retryCountRef.current++;

       // Force logout after max retries (only for non-401 errors)
       if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
         logger.error(`❌ Token refresh failed ${MAX_RETRY_ATTEMPTS} times - forcing logout`);
         await storage.clear();
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
        await refreshTokenFn();
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
        refreshTokenFn();
      }
    });

    return () => subscription.remove();
  }, []);

  /**
    * Initialize refresh interval on mount
    */
   useEffect(() => {
     // Check if user is authenticated and has valid tokens
     const initializeRefresh = async () => {
       const token = await storage.getItem('token');
       const refreshToken = await storage.getItem('refresh_token');

       if (token && refreshToken) {
         logger.info('🔄 Initializing token refresh on app start...');

         // Refresh immediately on app start
         const success = await refreshTokenFn();

         // Only start interval if initial refresh was successful
         if (success) {
           startRefreshInterval();
           logger.info('✅ Token refresh initialized successfully');
         } else {
           logger.warn('⚠️ Initial token refresh failed - not starting interval');
           // Don't start interval if refresh fails immediately
         }
       } else {
         logger.debug('No valid tokens available - skipping refresh initialization');
       }
     };

     initializeRefresh();

     return () => {
       stopRefreshInterval();
     };
   }, []);

  // Hook doesn't return anything - it just runs in background
}