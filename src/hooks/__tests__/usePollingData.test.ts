/**
 * Tests for usePollingData hook
 * Tests WebSocket fallback, exponential backoff, retry logic, and network awareness
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePollingData } from '../usePollingData';
import * as useNetworkStatusModule from '../useNetworkStatus';

// Mock dependencies
jest.mock('../useNetworkStatus');
jest.mock('../../utils/logger');

// Mock AppState specifically to avoid undefined errors
jest.mock('react-native/Libraries/AppState/AppState', () => ({
  currentState: 'active',
  addEventListener: jest.fn((event: string, listener: (state: string) => void) => ({
    remove: jest.fn(),
  })),
}));

describe('usePollingData', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  describe('Basic Polling', () => {
    it('should fetch data initially', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ data: 'test' });
      (useNetworkStatusModule.useNetworkStatus as jest.Mock).mockReturnValue({
        isOnline: true,
      });

      const { result } = renderHook(() =>
        usePollingData({
          fetchFn: mockFetch,
          interval: 5000,
        })
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.data).toEqual({ data: 'test' });
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should poll at specified interval', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ data: 'test' });
      (useNetworkStatusModule.useNetworkStatus as jest.Mock).mockReturnValue({
        isOnline: true,
      });

      renderHook(() =>
        usePollingData({
          fetchFn: mockFetch,
          interval: 5000,
        })
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Advance time by interval
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should stop polling when disabled', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ data: 'test' });
      (useNetworkStatusModule.useNetworkStatus as jest.Mock).mockReturnValue({
        isOnline: true,
      });

      const { rerender } = renderHook(
        (props: { enabled: boolean }) =>
          usePollingData({
            fetchFn: mockFetch,
            interval: 5000,
            enabled: props.enabled,
          }),
        { initialProps: { enabled: true } }
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Disable polling
      rerender({ enabled: false });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Should not call again
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Network Awareness', () => {
    it('should pause polling when offline', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ data: 'test' });
      let onOfflineCallback: (() => void) | undefined;

      (useNetworkStatusModule.useNetworkStatus as jest.Mock).mockImplementation(
        ({ onOffline }) => {
          onOfflineCallback = onOffline;
          return { isOnline: true };
        }
      );

      renderHook(() =>
        usePollingData({
          fetchFn: mockFetch,
          interval: 5000,
          networkAware: true,
        })
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      // Simulate going offline
      act(() => {
        (useNetworkStatusModule.useNetworkStatus as jest.Mock).mockReturnValue({
          isOnline: false,
        });
        onOfflineCallback?.();
      });

      // Advance time - should not poll
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should resume polling when coming back online', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ data: 'test' });
      let onOnlineCallback: (() => void) | undefined;

      (useNetworkStatusModule.useNetworkStatus as jest.Mock).mockImplementation(
        ({ onOnline }) => {
          onOnlineCallback = onOnline;
          return { isOnline: false };
        }
      );

      renderHook(() =>
        usePollingData({
          fetchFn: mockFetch,
          interval: 5000,
          networkAware: true,
        })
      );

      // Should not fetch initially (offline)
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(mockFetch).not.toHaveBeenCalled();

      // Simulate coming online
      act(() => {
        (useNetworkStatusModule.useNetworkStatus as jest.Mock).mockReturnValue({
          isOnline: true,
        });
        onOnlineCallback?.();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Exponential Backoff & Retry Logic', () => {
    it('should retry with exponential backoff on failure', async () => {
      const mockFetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({ data: 'success' });

      (useNetworkStatusModule.useNetworkStatus as jest.Mock).mockReturnValue({
        isOnline: true,
      });

      const { result } = renderHook(() =>
        usePollingData({
          fetchFn: mockFetch,
          interval: 10000,
          retryDelay: 1000,
          maxRetries: 3,
        })
      );

      // Initial fetch fails
      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
      expect(result.current.retryCount).toBe(1);

      // First retry after 1000ms (2^0 * 1000)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
      expect(result.current.retryCount).toBe(2);

      // Second retry after 2000ms (2^1 * 1000)
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3);
        expect(result.current.data).toEqual({ data: 'success' });
      });
      expect(result.current.retryCount).toBe(0);
    });

    it('should call onMaxRetriesReached when max retries exceeded', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Persistent error'));
      const onMaxRetriesReached = jest.fn();

      (useNetworkStatusModule.useNetworkStatus as jest.Mock).mockReturnValue({
        isOnline: true,
      });

      renderHook(() =>
        usePollingData({
          fetchFn: mockFetch,
          interval: 10000,
          retryDelay: 100,
          maxRetries: 3,
          onMaxRetriesReached,
        })
      );

      // Wait for all retries
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Advance through all retries
      for (let i = 0; i < 3; i++) {
        act(() => {
          jest.advanceTimersByTime(100 * Math.pow(2, i));
        });
        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledTimes(i + 2);
        });
      }

      await waitFor(() => {
        expect(onMaxRetriesReached).toHaveBeenCalledWith(expect.any(Error));
      });
    });
  });

  describe('WebSocket Fallback', () => {
    it('should use WebSocket when connected', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ data: 'polling' });
      const mockConnect = jest.fn();
      const mockDisconnect = jest.fn();

      (useNetworkStatusModule.useNetworkStatus as jest.Mock).mockReturnValue({
        isOnline: true,
      });

      const { result } = renderHook(() =>
        usePollingData({
          fetchFn: mockFetch,
          interval: 5000,
          webSocketFallback: {
            connect: mockConnect,
            disconnect: mockDisconnect,
            isConnected: true,
            data: { data: 'websocket' },
          },
        })
      );

      await waitFor(() => {
        expect(result.current.data).toEqual({ data: 'websocket' });
      });

      expect(result.current.isUsingWebSocket).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fall back to polling when WebSocket disconnects', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ data: 'polling' });
      const mockConnect = jest.fn();
      const mockDisconnect = jest.fn();

      (useNetworkStatusModule.useNetworkStatus as jest.Mock).mockReturnValue({
        isOnline: true,
      });

      const { result, rerender } = renderHook(
        (props: { wsConnected: boolean }) =>
          usePollingData<{ data: string }>({
            fetchFn: mockFetch,
            interval: 5000,
            webSocketFallback: {
              connect: mockConnect,
              disconnect: mockDisconnect,
              isConnected: props.wsConnected,
              data: props.wsConnected ? { data: 'websocket' } : null,
            },
          }),
        { initialProps: { wsConnected: true } }
      );

      await waitFor(() => {
        expect(result.current.data).toEqual({ data: 'websocket' });
      });

      // Disconnect WebSocket
      rerender({ wsConnected: false });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        expect(result.current.data).toEqual({ data: 'polling' });
      });

      expect(result.current.isUsingWebSocket).toBe(false);
    });
  });

  describe('Force Refetch', () => {
    it('should force refetch and reset retry count', async () => {
      const mockFetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValue({ data: 'success' });

      (useNetworkStatusModule.useNetworkStatus as jest.Mock).mockReturnValue({
        isOnline: true,
      });

      const { result } = renderHook(() =>
        usePollingData({
          fetchFn: mockFetch,
          interval: 10000,
          maxRetries: 5,
        })
      );

      await waitFor(() => {
        expect(result.current.error).toBe('Error');
        expect(result.current.retryCount).toBe(1);
      });

      // Force refetch
      await act(async () => {
        await result.current.forceRefetch();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({ data: 'success' });
        expect(result.current.retryCount).toBe(0);
      });
    });
  });
});