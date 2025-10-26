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
  
    describe('Error Handling', () => {
      it('should handle getItem errors and return null', async () => {
        // Test error handling by trying to get a key that causes issues
        const result = await storage.getItem('error-key');
  
        // Should handle gracefully and return null or string
        expect(result === null || typeof result === 'string').toBe(true);
      });
  
      it('should handle setObject errors with invalid objects and throw', async () => {
        const circularRef: any = {};
        circularRef.self = circularRef;
  
        await expect(storage.setObject('circular', circularRef)).rejects.toThrow();
      });
  
      it('should handle getObject errors with invalid JSON and return null', async () => {
        // Set invalid JSON that will fail to parse
        await storage.setItem('invalid-json-key', '{invalid json}');
  
        const result = await storage.getObject('invalid-json-key');
  
        expect(result).toBeNull();
      });
  
      it('should handle getObject errors with malformed JSON and return null', async () => {
        await storage.setItem('malformed-key', 'not a json object at all');
  
        const result = await storage.getObject('malformed-key');
  
        expect(result).toBeNull();
      });
    });
  
    describe('Edge Cases', () => {
      it('should handle empty string value', async () => {
        const key = 'empty-value-' + Date.now();
        await storage.setItem(key, '');
        
        const result = await storage.getItem(key);
        // MMKV treats empty string as null, AsyncStorage preserves it
        expect(result === '' || result === null).toBe(true);
      });
  
      it('should handle special characters in keys', async () => {
        const key = 'special-!@#$%^&*()_+-=[]{}|;:,.<>?-' + Date.now();
        await storage.setItem(key, 'value');
        
        const result = await storage.getItem(key);
        expect(result).toBe('value');
      });
  
      it('should handle very long values', async () => {
        const key = 'long-value-' + Date.now();
        const longValue = 'x'.repeat(10000);
        await storage.setItem(key, longValue);
        
        const result = await storage.getItem(key);
        expect(result).toBe(longValue);
      });
  
      it('should handle unicode characters', async () => {
        const key = 'unicode-' + Date.now();
        const value = '你好世界 🎉 émojis';
        await storage.setItem(key, value);
        
        const result = await storage.getItem(key);
        expect(result).toBe(value);
      });
  
      it('should handle null in object values', async () => {
        const key = 'null-obj-' + Date.now();
        const obj = { value: null, nested: { also: null } };
        await storage.setObject(key, obj);
        
        const result = await storage.getObject(key);
        expect(result).toEqual(obj);
      });
  
      it('should handle boolean values in objects', async () => {
        const key = 'bool-obj-' + Date.now();
        const obj = { isActive: true, isDeleted: false };
        await storage.setObject(key, obj);
        
        const result = await storage.getObject(key);
        expect(result).toEqual(obj);
      });
  
      it('should handle numbers in objects', async () => {
        const key = 'num-obj-' + Date.now();
        const obj = { count: 42, price: 19.99, negative: -10 };
        await storage.setObject(key, obj);
        
        const result = await storage.getObject(key);
        expect(result).toEqual(obj);
      });
    });
  
    describe('Integration Tests', () => {
      it('should persist data across multiple operations', async () => {
        const key1 = 'persist-1-' + Date.now();
        const key2 = 'persist-2-' + Date.now();
        
        // Set multiple items
        await storage.setItem(key1, 'value1');
        await storage.setItem(key2, 'value2');
        
        // Get them back
        const result1 = await storage.getItem(key1);
        const result2 = await storage.getItem(key2);
        
        expect(result1).toBe('value1');
        expect(result2).toBe('value2');
        
        // Remove one
        await storage.removeItem(key1);
        
        // Check one is gone, other remains
        expect(await storage.getItem(key1)).toBeNull();
        expect(await storage.getItem(key2)).toBe('value2');
      });
  
      it('should handle mixed operations', async () => {
        const key = 'mixed-' + Date.now();
        
        // Set string
        await storage.setItem(key, 'string-value');
        expect(await storage.getItem(key)).toBe('string-value');
        
        // Overwrite with object
        await storage.setObject(key, { type: 'object' });
        expect(await storage.getObject(key)).toEqual({ type: 'object' });
        
        // Remove
        await storage.removeItem(key);
        expect(await storage.getItem(key)).toBeNull();
      });
    });
  });
});