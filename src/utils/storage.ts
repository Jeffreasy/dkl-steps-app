/**
 * Storage Utility - Smart Storage met MMKV + AsyncStorage Fallback
 * 
 * Probeert MMKV te gebruiken (50x sneller) in standalone builds,
 * maar valt terug naar AsyncStorage in Expo Go.
 * 
 * BELANGRIJK: 
 * - In Expo Go: gebruikt AsyncStorage (werkt altijd)
 * - In EAS Build: gebruikt MMKV (50x sneller!)
 * 
 * @example
 * ```typescript
 * import { storage } from '@/utils/storage';
 * 
 * // Set value
 * await storage.setItem('authToken', token);
 * 
 * // Get value  
 * const token = await storage.getItem('authToken');
 * ```
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

// Try to import MMKV, but fallback gracefully if not available
let MMKV: any = null;
let mmkvInstance: any = null;
let useMMKV = false;

try {
  // Dynamic import - only works in standalone builds
  MMKV = require('react-native-mmkv').MMKV;
  mmkvInstance = new MMKV();
  useMMKV = true;
  logger.success('🚀 MMKV storage initialized - 50x faster!');
} catch (error) {
  logger.info('ℹ️  MMKV not available - using AsyncStorage (Expo Go mode)');
  useMMKV = false;
}

/**
 * Storage wrapper - Automatisch MMKV of AsyncStorage
 */
export const storage = {
  /**
   * Get item from storage
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (useMMKV && mmkvInstance) {
        return mmkvInstance.getString(key) ?? null;
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      logger.error(`Storage getItem error for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Set item in storage
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (useMMKV && mmkvInstance) {
        mmkvInstance.set(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      logger.error(`Storage setItem error for key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Remove item from storage
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      if (useMMKV && mmkvInstance) {
        mmkvInstance.delete(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      logger.error(`Storage removeItem error for key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Clear all storage
   */
  clear: async (): Promise<void> => {
    try {
      if (useMMKV && mmkvInstance) {
        mmkvInstance.clearAll();
      } else {
        await AsyncStorage.clear();
      }
      logger.info('Storage cleared');
    } catch (error) {
      logger.error('Storage clear error:', error);
      throw error;
    }
  },

  /**
   * Get all keys
   */
  getAllKeys: async (): Promise<readonly string[]> => {
    try {
      if (useMMKV && mmkvInstance) {
        return mmkvInstance.getAllKeys();
      } else {
        return await AsyncStorage.getAllKeys();
      }
    } catch (error) {
      logger.error('Storage getAllKeys error:', error);
      return [];
    }
  },

  /**
   * Multi set - set multiple key-value pairs
   */
  multiSet: async (keyValuePairs: [string, string][]): Promise<void> => {
    try {
      if (useMMKV && mmkvInstance) {
        // MMKV - set each individually (still faster than AsyncStorage!)
        keyValuePairs.forEach(([key, value]) => {
          mmkvInstance.set(key, value);
        });
      } else {
        await AsyncStorage.multiSet(keyValuePairs);
      }
    } catch (error) {
      logger.error('Storage multiSet error:', error);
      throw error;
    }
  },

  /**
   * Multi get - get multiple values
   */
  multiGet: async (keys: readonly string[]): Promise<readonly [string, string | null][]> => {
    try {
      if (useMMKV && mmkvInstance) {
        // MMKV - get each individually
        return keys.map(key => [key, mmkvInstance.getString(key) ?? null] as [string, string | null]);
      } else {
        return await AsyncStorage.multiGet(keys);
      }
    } catch (error) {
      logger.error('Storage multiGet error:', error);
      return keys.map(key => [key, null] as [string, string | null]);
    }
  },

  /**
   * Multi remove - remove multiple keys
   */
  multiRemove: async (keys: string[]): Promise<void> => {
    try {
      if (useMMKV && mmkvInstance) {
        keys.forEach(key => mmkvInstance.delete(key));
      } else {
        await AsyncStorage.multiRemove(keys);
      }
    } catch (error) {
      logger.error('Storage multiRemove error:', error);
      throw error;
    }
  },

  /**
   * Get JSON object
   */
  getObject: async <T = any>(key: string): Promise<T | null> => {
    try {
      const value = await storage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Storage getObject error for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Set JSON object
   */
  setObject: async (key: string, value: any): Promise<void> => {
    try {
      const jsonString = JSON.stringify(value);
      await storage.setItem(key, jsonString);
    } catch (error) {
      logger.error(`Storage setObject error for key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Check welke storage backend actief is
   */
  getBackend: (): 'MMKV' | 'AsyncStorage' => {
    return useMMKV ? 'MMKV' : 'AsyncStorage';
  },

  /**
   * Check of MMKV beschikbaar is
   */
  isMMKVAvailable: (): boolean => {
    return useMMKV;
  },
};

/**
 * Default export
 */
export default storage;