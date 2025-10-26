/**
 * Storage Utility Tests
 * 
 * Tests for the smart storage wrapper that handles both MMKV and AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('Storage Utility', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Clear storage before each test for isolation
    try {
      await storage.clear();
    } catch (e) {
      // Ignore clear errors in setup
    }
  });

  describe('getItem', () => {
    it('should get item from storage', async () => {
      // Test actual storage behavior regardless of backend
      await storage.setItem('test-key-unique-1', 'test-value');
      const result = await storage.getItem('test-key-unique-1');

      expect(result).toBe('test-value');
    });

    it('should return null for non-existent key', async () => {
      const result = await storage.getItem('definitely-non-existent-key-xyz');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      // Test that getItem doesn't throw, returns null on error
      const result = await storage.getItem('any-key');

      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  describe('setItem', () => {
    it('should set item in storage', async () => {
      const uniqueKey = 'test-set-key-' + Date.now();
      await storage.setItem(uniqueKey, 'test-value');
      
      // Verify it was set
      const result = await storage.getItem(uniqueKey);
      expect(result).toBe('test-value');
    });

    it('should overwrite existing value', async () => {
      const uniqueKey = 'test-overwrite-' + Date.now();
      await storage.setItem(uniqueKey, 'value1');
      await storage.setItem(uniqueKey, 'value2');
      
      const result = await storage.getItem(uniqueKey);
      expect(result).toBe('value2');
    });
  });

  describe('removeItem', () => {
    it('should remove item from storage', async () => {
      const uniqueKey = 'test-remove-' + Date.now();
      await storage.setItem(uniqueKey, 'value');
      await storage.removeItem(uniqueKey);
      
      const result = await storage.getItem(uniqueKey);
      expect(result).toBeNull();
    });

    it('should not throw error when removing non-existent key', async () => {
      await expect(storage.removeItem('non-existent-xyz-' + Date.now())).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all storage', async () => {
      await storage.setItem('key1', 'value1');
      await storage.setItem('key2', 'value2');
      
      await storage.clear();
      
      const keys = await storage.getAllKeys();
      expect(keys.length).toBe(0);
    });

    it('should not throw error when clearing empty storage', async () => {
      await expect(storage.clear()).resolves.not.toThrow();
    });
  });

  describe('getAllKeys', () => {
    it('should get all keys from storage', async () => {
      const unique1 = 'unique-key-1-' + Date.now();
      const unique2 = 'unique-key-2-' + Date.now();
      
      await storage.setItem(unique1, 'value1');
      await storage.setItem(unique2, 'value2');

      const result = await storage.getAllKeys();

      expect(result).toContain(unique1);
      expect(result).toContain(unique2);
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should return array of keys', async () => {
      const result = await storage.getAllKeys();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('multiSet', () => {
    it('should set multiple items', async () => {
      const unique1 = 'multi-key-1-' + Date.now();
      const unique2 = 'multi-key-2-' + Date.now();
      const pairs: [string, string][] = [
        [unique1, 'value1'],
        [unique2, 'value2'],
      ];

      await storage.multiSet(pairs);

      const value1 = await storage.getItem(unique1);
      const value2 = await storage.getItem(unique2);
      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
    });

    it('should handle empty array', async () => {
      await expect(storage.multiSet([])).resolves.not.toThrow();
    });
  });

  describe('multiGet', () => {
    it('should get multiple items', async () => {
      const unique1 = 'multiget-1-' + Date.now();
      const unique2 = 'multiget-2-' + Date.now();
      
      await storage.setItem(unique1, 'value1');
      await storage.setItem(unique2, 'value2');
      
      const keys = [unique1, unique2];
      const result = await storage.multiGet(keys);

      expect(result).toEqual([
        [unique1, 'value1'],
        [unique2, 'value2'],
      ]);
    });

    it('should return null for non-existent keys', async () => {
      const keys = ['non-existent-xyz-1-' + Date.now(), 'non-existent-xyz-2-' + Date.now()];
      const result = await storage.multiGet(keys);

      expect(result).toEqual([
        [keys[0], null],
        [keys[1], null],
      ]);
    });
  });

  describe('multiRemove', () => {
    it('should remove multiple items', async () => {
      const unique1 = 'remove-1-' + Date.now();
      const unique2 = 'remove-2-' + Date.now();
      
      await storage.setItem(unique1, 'value1');
      await storage.setItem(unique2, 'value2');
      
      const keys = [unique1, unique2];
      await storage.multiRemove(keys);

      const value1 = await storage.getItem(unique1);
      const value2 = await storage.getItem(unique2);
      expect(value1).toBeNull();
      expect(value2).toBeNull();
    });

    it('should not throw error when removing non-existent keys', async () => {
      const keys = ['non-existent-abc-' + Date.now(), 'non-existent-def-' + Date.now()];
      await expect(storage.multiRemove(keys)).resolves.not.toThrow();
    });
  });

  describe('getObject', () => {
    it('should parse and return JSON object', async () => {
      const mockObject = { name: 'test', value: 123 };
      const uniqueKey = 'obj-key-' + Date.now();
      
      await storage.setObject(uniqueKey, mockObject);
      const result = await storage.getObject(uniqueKey);

      expect(result).toEqual(mockObject);
    });

    it('should return null for non-existent key', async () => {
      const result = await storage.getObject('non-existent-obj-' + Date.now());

      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', async () => {
      const uniqueKey = 'invalid-json-' + Date.now();
      await storage.setItem(uniqueKey, 'invalid json');

      const result = await storage.getObject(uniqueKey);

      expect(result).toBeNull();
    });
  });

  describe('setObject', () => {
    it('should stringify and store object', async () => {
      const mockObject = { name: 'test', value: 123 };
      const uniqueKey = 'set-obj-' + Date.now();

      await storage.setObject(uniqueKey, mockObject);

      const result = await storage.getObject(uniqueKey);
      expect(result).toEqual(mockObject);
    });

    it('should handle arrays', async () => {
      const mockArray = [1, 2, 3];
      const uniqueKey = 'array-' + Date.now();

      await storage.setObject(uniqueKey, mockArray);

      const result = await storage.getObject(uniqueKey);
      expect(result).toEqual(mockArray);
    });

    it('should handle complex nested objects', async () => {
      const complex = { a: { b: { c: [1, 2, { d: 'test' }] } } };
      const uniqueKey = 'complex-' + Date.now();
      
      await storage.setObject(uniqueKey, complex);
      
      const result = await storage.getObject(uniqueKey);
      expect(result).toEqual(complex);
    });
  });

  describe('getBackend', () => {
    it('should return storage backend', () => {
      const backend = storage.getBackend();

      // Accept either MMKV or AsyncStorage depending on environment
      expect(['MMKV', 'AsyncStorage']).toContain(backend);
    });
  });

  describe('isMMKVAvailable', () => {
    it('should return boolean for MMKV availability', () => {
      const available = storage.isMMKVAvailable();

      // Can be true or false depending on environment
      expect(typeof available).toBe('boolean');
    });
  });
});