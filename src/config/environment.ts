/**
 * Environment Configuration
 * 
 * Switchen tussen local Docker backend en production Render backend.
 * 
 * @example
 * ```typescript
 * import { getBackendURL, isProduction } from './config/environment';
 * 
 * const url = getBackendURL();
 * // Local: http://192.168.1.252:8082/api
 * // Production: https://dklemailservice.onrender.com/api
 * ```
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Environment type
 */
export type Environment = 'local' | 'production';

/**
 * Backend configuration per environment
 */
const BACKEND_URLS = {
  // Local Docker backend (wijzig IP naar jouw machine IP)
  local: {
    // iOS Simulator kan naar localhost via je machine IP
    ios: 'http://192.168.1.252:8082/api', // Vervang met jouw IP
    // Android Emulator heeft speciale localhost alias
    android: 'http://10.0.2.2:8082/api',
    // Physical devices
    default: 'http://192.168.1.252:8082/api', // Vervang met jouw IP
  },
  
  // Production Render backend
  production: {
    ios: 'https://dklemailservice.onrender.com/api',
    android: 'https://dklemailservice.onrender.com/api',
    default: 'https://dklemailservice.onrender.com/api',
  },
};

/**
 * ENVIRONMENT SWITCH
 * 
 * Wijzig deze waarde om te switchen tussen local en production:
 * - 'local' → Docker backend (localhost:8082)
 * - 'production' → Render backend (dklemailservice.onrender.com)
 */
const CURRENT_ENVIRONMENT: Environment = 'production';

/**
 * Get backend URL voor current environment en platform
 */
export function getBackendURL(): string {
  const config = BACKEND_URLS[CURRENT_ENVIRONMENT];
  
  // Platform-specific URL
  if (Platform.OS === 'ios') {
    return config.ios;
  } else if (Platform.OS === 'android') {
    return config.android;
  }
  
  return config.default;
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return CURRENT_ENVIRONMENT === 'production';
}

/**
 * Check if running in local environment
 */
export function isLocal(): boolean {
  return CURRENT_ENVIRONMENT === 'local';
}

/**
 * Get current environment name
 */
export function getCurrentEnvironment(): Environment {
  return CURRENT_ENVIRONMENT;
}

/**
 * Get environment display info (voor debugging)
 */
export function getEnvironmentInfo(): {
  environment: Environment;
  backendURL: string;
  platform: string;
  isProduction: boolean;
} {
  return {
    environment: CURRENT_ENVIRONMENT,
    backendURL: getBackendURL(),
    platform: Platform.OS,
    isProduction: isProduction(),
  };
}