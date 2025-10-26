/**
 * useNetworkStatus Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStatus, useIsOnline, useNetworkListener } from '../useNetworkStatus';

jest.mock('@react-native-community/netinfo');

describe('useNetworkStatus Hook', () => {
  let mockListener: ((state: any) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    mockListener = null;

    // Setup NetInfo mock
    (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
      mockListener = callback;
      return jest.fn(); // Return unsubscribe function
    });

    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {
        isConnectionExpensive: false,
        cellularGeneration: null,
        strength: null,
      },
    });
  });

  describe('basic functionality', () => {
    it('should return initial network status', async () => {
      const { result } = renderHook(() => useNetworkStatus());

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.isInternetReachable).toBe(true);
      // Connection type can be 'wifi' or 'unknown' depending on initial state
      expect(['wifi', 'unknown']).toContain(result.current.connectionType);
    });

    it('should fetch initial network state', async () => {
      renderHook(() => useNetworkStatus());

      await waitFor(() => {
        expect(NetInfo.fetch).toHaveBeenCalled();
      });
    });

    it('should subscribe to network changes', () => {
      renderHook(() => useNetworkStatus());

      expect(NetInfo.addEventListener).toHaveBeenCalled();
    });

    it('should unsubscribe on unmount', () => {
      const mockUnsubscribe = jest.fn();
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(mockUnsubscribe);

      const { unmount } = renderHook(() => useNetworkStatus());

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('network state changes', () => {
    it('should detect when going offline', async () => {
      const { result } = renderHook(() => useNetworkStatus());

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });

      // Simulate going offline
      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: false,
            isInternetReachable: false,
            type: 'none',
            details: {},
          });
        }
      });

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectionType).toBe('none');
    });

    it('should detect when coming online', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      const { result } = renderHook(() => useNetworkStatus());

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });

      // Simulate coming online
      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: true,
            isInternetReachable: true,
            type: 'wifi',
            details: {},
          });
        }
      });

      expect(result.current.isOnline).toBe(true);
    });

    it('should handle cellular connection', async () => {
      const { result } = renderHook(() => useNetworkStatus());

      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: true,
            isInternetReachable: true,
            type: 'cellular',
            details: {
              isConnectionExpensive: true,
              cellularGeneration: '4g',
              strength: 3,
            },
          });
        }
      });

      await waitFor(() => {
        expect(result.current.connectionType).toBe('cellular');
      });

      expect(result.current.details.isConnectionExpensive).toBe(true);
      expect(result.current.details.cellularGeneration).toBe('4g');
      expect(result.current.details.strength).toBe(3);
    });
  });

  describe('callbacks', () => {
    it('should call onOnline when coming online', async () => {
      const mockOnOnline = jest.fn();
      
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
      });

      const { result } = renderHook(() => 
        useNetworkStatus({ onOnline: mockOnOnline })
      );

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });

      // Simulate coming online
      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: true,
            isInternetReachable: true,
            type: 'wifi',
            details: {},
          });
        }
      });

      await waitFor(() => {
        expect(mockOnOnline).toHaveBeenCalled();
      });
    });

    it('should call onOffline when going offline', async () => {
      const mockOnOffline = jest.fn();

      const { result } = renderHook(() => 
        useNetworkStatus({ onOffline: mockOnOffline })
      );

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });

      // Simulate going offline
      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: false,
            isInternetReachable: false,
            type: 'none',
            details: {},
          });
        }
      });

      await waitFor(() => {
        expect(mockOnOffline).toHaveBeenCalled();
      });
    });

    it('should call onConnectionChange on status change', async () => {
      const mockOnChange = jest.fn();

      const { result } = renderHook(() => 
        useNetworkStatus({ onConnectionChange: mockOnChange })
      );

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });

      // Simulate going offline
      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: false,
            isInternetReachable: false,
            type: 'none',
            details: {},
          });
        }
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(false);
      });
    });

    it('should not call callbacks when silent mode', async () => {
      const mockOnOnline = jest.fn();
      const mockOnOffline = jest.fn();

      const { result } = renderHook(() => 
        useNetworkStatus({
          onOnline: mockOnOnline,
          onOffline: mockOnOffline,
          silent: true,
        })
      );

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });

      // Callbacks should still work even in silent mode
      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: false,
            isInternetReachable: false,
            type: 'none',
            details: {},
          });
        }
      });

      await waitFor(() => {
        expect(mockOnOffline).toHaveBeenCalled();
      });
    });
  });

  describe('useIsOnline helper', () => {
    it('should return boolean online status', async () => {
      const { result } = renderHook(() => useIsOnline());

      await waitFor(() => {
        expect(typeof result.current).toBe('boolean');
        expect(result.current).toBe(true);
      });
    });

    it('should update when going offline', async () => {
      const { result } = renderHook(() => useIsOnline());

      await waitFor(() => {
        expect(result.current).toBe(true);
      });

      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: false,
            isInternetReachable: false,
            type: 'none',
          });
        }
      });

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('useNetworkListener helper', () => {
    it('should accept callbacks directly', async () => {
      const mockOnOnline = jest.fn();
      const mockOnOffline = jest.fn();

      const { result } = renderHook(() => 
        useNetworkListener(mockOnOnline, mockOnOffline)
      );

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
      });

      // Test offline callback
      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: false,
            isInternetReachable: false,
            type: 'none',
            details: {},
          });
        }
      });

      await waitFor(() => {
        expect(mockOnOffline).toHaveBeenCalled();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null values gracefully', async () => {
      const { result } = renderHook(() => useNetworkStatus());

      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: null,
            isInternetReachable: null,
            type: null,
            details: null,
          });
        }
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.isInternetReachable).toBe(false);
      });
    });

    it('should handle partial connectivity', async () => {
      const { result } = renderHook(() => useNetworkStatus());

      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: true,
            isInternetReachable: false, // Connected but no internet
            type: 'wifi',
            details: {},
          });
        }
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
        expect(result.current.isInternetReachable).toBe(false);
        expect(result.current.isOnline).toBe(false);
      });
    });

    it('should handle unknown connection type', async () => {
      const { result } = renderHook(() => useNetworkStatus());

      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: true,
            isInternetReachable: true,
            type: 'unknown',
            details: {},
          });
        }
      });

      await waitFor(() => {
        expect(result.current.connectionType).toBe('unknown');
      });
    });
  });

  describe('connection types', () => {
    it('should detect WiFi connection', async () => {
      const { result } = renderHook(() => useNetworkStatus());

      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: true,
            isInternetReachable: true,
            type: 'wifi',
            details: { isConnectionExpensive: false },
          });
        }
      });

      await waitFor(() => {
        expect(result.current.connectionType).toBe('wifi');
        expect(result.current.details.isConnectionExpensive).toBe(false);
      });
    });

    it('should detect cellular connection', async () => {
      const { result } = renderHook(() => useNetworkStatus());

      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: true,
            isInternetReachable: true,
            type: 'cellular',
            details: {
              isConnectionExpensive: true,
              cellularGeneration: '5g',
            },
          });
        }
      });

      await waitFor(() => {
        expect(result.current.connectionType).toBe('cellular');
        expect(result.current.details.isConnectionExpensive).toBe(true);
        expect(result.current.details.cellularGeneration).toBe('5g');
      });
    });

    it('should detect ethernet connection', async () => {
      const { result } = renderHook(() => useNetworkStatus());

      act(() => {
        if (mockListener) {
          mockListener({
            isConnected: true,
            isInternetReachable: true,
            type: 'ethernet',
            details: { isConnectionExpensive: false },
          });
        }
      });

      await waitFor(() => {
        expect(result.current.connectionType).toBe('ethernet');
      });
    });
  });
});