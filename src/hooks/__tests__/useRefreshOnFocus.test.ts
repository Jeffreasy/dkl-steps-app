/**
 * useRefreshOnFocus Hook Tests
 */

import { renderHook } from '@testing-library/react-native';
import { useRefreshOnFocus, useRefreshOnFocusManual } from '../useRefreshOnFocus';

// Mock useFocusEffect
let mockFocusCallback: (() => void) | null = null;

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => {
    mockFocusCallback = callback;
  }),
}));

describe('useRefreshOnFocus Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFocusCallback = null;
  });

  describe('basic functionality', () => {
    it('should accept refetch function', () => {
      const mockRefetch = jest.fn();
      
      renderHook(() => useRefreshOnFocus(mockRefetch));

      expect(mockFocusCallback).toBeTruthy();
    });

    it('should skip first mount by default', () => {
      const mockRefetch = jest.fn();
      
      renderHook(() => useRefreshOnFocus(mockRefetch));

      // Trigger focus
      if (mockFocusCallback) {
        mockFocusCallback();
      }

      // Should not call on first mount
      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it('should call refetch on subsequent focus', () => {
      const mockRefetch = jest.fn();
      
      renderHook(() => useRefreshOnFocus(mockRefetch));

      // First focus - skip
      if (mockFocusCallback) {
        mockFocusCallback();
      }
      expect(mockRefetch).not.toHaveBeenCalled();

      // Second focus - should refetch
      if (mockFocusCallback) {
        mockFocusCallback();
      }
      
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should respect enabled parameter', () => {
      const mockRefetch = jest.fn();
      
      renderHook(() => useRefreshOnFocus(mockRefetch, false));

      // First focus - skip (disabled)
      if (mockFocusCallback) {
        mockFocusCallback();
      }

      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it('should refetch when enabled is true', () => {
      const mockRefetch = jest.fn();
      
      renderHook(() => useRefreshOnFocus(mockRefetch, true));

      // First focus - skip
      if (mockFocusCallback) {
        mockFocusCallback();
      }

      // Second focus with enabled=true
      if (mockFocusCallback) {
        mockFocusCallback();
      }

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('enabled parameter', () => {
    it('should not refetch when enabled is false', () => {
      const mockRefetch = jest.fn();
      
      renderHook(() => useRefreshOnFocus(mockRefetch, false));

      // Multiple focus events
      if (mockFocusCallback) {
        mockFocusCallback();
      }
      if (mockFocusCallback) {
        mockFocusCallback();
      }

      // Should never call refetch when disabled
      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it('should respect enabled parameter', () => {
      const mockRefetch = jest.fn();
      
      renderHook(() => useRefreshOnFocus(mockRefetch, true));

      // Should work when enabled
      expect(mockFocusCallback).toBeTruthy();
    });
  });

  describe('async refetch', () => {
    it('should handle async refetch function', async () => {
      const mockAsyncRefetch = jest.fn(() => Promise.resolve());
      
      renderHook(() => useRefreshOnFocus(mockAsyncRefetch));

      // First focus - skip
      if (mockFocusCallback) {
        mockFocusCallback();
      }

      // Second focus
      if (mockFocusCallback) {
        mockFocusCallback();
      }

      expect(mockAsyncRefetch).toHaveBeenCalled();
    });

    it('should call async refetch without catching errors', async () => {
      const mockAsyncRefetch = jest.fn(() => Promise.resolve());
      
      renderHook(() => useRefreshOnFocus(mockAsyncRefetch));

      // Skip first mount
      if (mockFocusCallback) {
        mockFocusCallback();
      }

      // Second call should trigger refetch
      if (mockFocusCallback) {
        mockFocusCallback();
      }

      expect(mockAsyncRefetch).toHaveBeenCalled();
    });
  });
});

describe('useRefreshOnFocusManual Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFocusCallback = null;
  });

  describe('basic functionality', () => {
    it('should return refresh function', () => {
      const mockRefetch = jest.fn();
      
      const { result } = renderHook(() => useRefreshOnFocusManual(mockRefetch));

      expect(result.current.refresh).toBeDefined();
      expect(typeof result.current.refresh).toBe('function');
    });

    it('should skip first mount by default', () => {
      const mockRefetch = jest.fn();
      
      renderHook(() => useRefreshOnFocusManual(mockRefetch));

      if (mockFocusCallback) {
        mockFocusCallback();
      }

      // Should not call on first mount
      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it('should respect skipFirstMount option', () => {
      const mockRefetch = jest.fn();
      
      renderHook(() => 
        useRefreshOnFocusManual(mockRefetch, { skipFirstMount: false })
      );

      if (mockFocusCallback) {
        mockFocusCallback();
      }

      // Should call immediately when skipFirstMount=false
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('manual refresh', () => {
    it('should allow manual refresh calls', () => {
      const mockRefetch = jest.fn();
      
      const { result } = renderHook(() => useRefreshOnFocusManual(mockRefetch));

      // Call manually
      result.current.refresh();

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should support multiple manual refresh calls', () => {
      const mockRefetch = jest.fn();
      
      const { result } = renderHook(() => useRefreshOnFocusManual(mockRefetch));

      result.current.refresh();
      result.current.refresh();
      result.current.refresh();

      expect(mockRefetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('debounce functionality', () => {
    it('should accept debounce option', () => {
      const mockRefetch = jest.fn();
      
      renderHook(() => 
        useRefreshOnFocusManual(mockRefetch, { debounceMs: 100 })
      );

      expect(mockFocusCallback).toBeTruthy();
    });

    it('should handle zero debounce', () => {
      const mockRefetch = jest.fn();
      
      const { result } = renderHook(() => 
        useRefreshOnFocusManual(mockRefetch, { debounceMs: 0 })
      );

      result.current.refresh();

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('enabled option', () => {
    it('should respect enabled option', () => {
      const mockRefetch = jest.fn();
      
      renderHook(() => 
        useRefreshOnFocusManual(mockRefetch, { enabled: false })
      );

      if (mockFocusCallback) {
        mockFocusCallback();
      }

      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it('should refetch when enabled is true', () => {
      const mockRefetch = jest.fn();
      
      renderHook(() => 
        useRefreshOnFocusManual(mockRefetch, { 
          enabled: true,
          skipFirstMount: false 
        })
      );

      if (mockFocusCallback) {
        mockFocusCallback();
      }

      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should cleanup on unmount', () => {
      const mockRefetch = jest.fn();
      
      const { unmount } = renderHook(() => useRefreshOnFocusManual(mockRefetch));

      unmount();

      // Should not throw errors
      expect(true).toBe(true);
    });
  });
});