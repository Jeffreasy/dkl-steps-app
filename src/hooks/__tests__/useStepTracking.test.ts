import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { Pedometer } from 'expo-sensors';
import NetInfo from '@react-native-community/netinfo';
import { useStepTracking } from '../useStepTracking';
import { apiFetch } from '../../services/api';
import { storage } from '../../utils/storage';
import { haptics } from '../../utils/haptics';

jest.mock('expo-sensors');
jest.mock('@react-native-community/netinfo');
jest.mock('../../services/api');
jest.mock('../../utils/storage');
jest.mock('../../utils/haptics');

describe('useStepTracking', () => {
  const mockOnSync = jest.fn();
  let mockPedometerSubscription: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPedometerSubscription = { remove: jest.fn() };
    (Pedometer.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Pedometer.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Pedometer.watchStepCount as jest.Mock).mockReturnValue(mockPedometerSubscription);
    (storage.getItem as jest.Mock).mockResolvedValue('fake-token');
    (apiFetch as jest.Mock).mockResolvedValue({});
    (haptics.success as jest.Mock).mockResolvedValue(undefined);
    (haptics.error as jest.Mock).mockResolvedValue(undefined);
    (haptics.warning as jest.Mock).mockResolvedValue(undefined);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  describe('Initialization', () => {
    it('initializes with pedometer available and permissions granted', async () => {
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      await waitFor(() => expect(result.current.isAvailable).toBe(true));
      expect(result.current.permissionStatus).toBe('granted');
      expect(result.current.stepsDelta).toBe(0);
    });

    it('handles pedometer not available', async () => {
      (Pedometer.isAvailableAsync as jest.Mock).mockResolvedValue(false);
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      await waitFor(() => expect(result.current.permissionStatus).toBe('unavailable'));
      expect(result.current.isAvailable).toBe(false);
    });

    it('handles permission denied', async () => {
      (Pedometer.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      await waitFor(() => expect(result.current.permissionStatus).toBe('denied'));
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('handles initialization error', async () => {
      (Pedometer.isAvailableAsync as jest.Mock).mockRejectedValue(new Error('Init failed'));
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      await waitFor(() => expect(result.current.permissionStatus).toBe('error'));
    });
  });

  describe('Step Syncing', () => {
    it('syncs steps successfully', async () => {
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      await act(async () => {
        await result.current.syncSteps(100);
      });

      expect(apiFetch).toHaveBeenCalledWith('/steps', {
        method: 'POST',
        body: JSON.stringify({ steps: 100 }),
      });
      expect(result.current.stepsDelta).toBe(0);
      expect(mockOnSync).toHaveBeenCalled();
      expect(haptics.success).toHaveBeenCalled();
    });

    it('updates lastSyncTime after successful sync', async () => {
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      expect(result.current.lastSyncTime).toBeNull();
      
      await act(async () => {
        await result.current.syncSteps(100);
      });

      expect(result.current.lastSyncTime).toBeInstanceOf(Date);
    });

    it('sets isSyncing flag during sync', async () => {
      (apiFetch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      act(() => {
        result.current.syncSteps(100);
      });

      // Should be syncing immediately
      expect(result.current.isSyncing).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles missing auth token', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue(null);
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      await act(async () => {
        await result.current.syncSteps(100);
      });

      expect(result.current.hasAuthError).toBe(true);
      expect(result.current.stepsDelta).toBe(0);
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('queues steps on network error', async () => {
      (apiFetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      await act(async () => {
        await result.current.syncSteps(100);
      });

      expect(result.current.offlineQueue).toContain(100);
      expect(haptics.error).toHaveBeenCalled();
    });

    it('does not sync when auth error is set', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue(null);
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      await act(async () => {
        await result.current.syncSteps(50);
      });

      expect(result.current.hasAuthError).toBe(true);
      (apiFetch as jest.Mock).mockClear();

      await act(async () => {
        await result.current.syncSteps(50);
      });

      expect(apiFetch).not.toHaveBeenCalled();
    });
  });

  describe('Manual Actions', () => {
    it('handles test add (50 steps)', () => {
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      act(() => {
        result.current.handleTestAdd();
      });

      expect(result.current.stepsDelta).toBe(50);
    });

    it('handles manual sync', async () => {
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      act(() => {
        result.current.handleTestAdd();
      });

      expect(result.current.stepsDelta).toBe(50);

      await act(async () => {
        result.current.handleManualSync();
      });

      expect(apiFetch).toHaveBeenCalled();
    });

    it('handles correction with negative amount', async () => {
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      await act(async () => {
        await result.current.handleCorrection(-100);
      });

      expect(apiFetch).toHaveBeenCalledWith('/steps', {
        method: 'POST',
        body: JSON.stringify({ steps: -100 }),
      });
    });

    it('shows diagnostics information', async () => {
      (storage.getItem as jest.Mock)
        .mockResolvedValueOnce('fake-token')
        .mockResolvedValueOnce('admin')
        .mockResolvedValueOnce('Test User')
        .mockResolvedValueOnce('participant-id');

      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      await act(async () => {
        result.current.handleDiagnostics();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Diagnostics',
        expect.any(String),
        expect.any(Array)
      );
    });

    it('shows settings alert', () => {
      const { result } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      act(() => {
        result.current.openSettings();
      });

      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('removes pedometer subscription on unmount', async () => {
      const { unmount } = renderHook(() => useStepTracking({ onSync: mockOnSync }));
      
      await waitFor(() => {
        expect(Pedometer.watchStepCount).toHaveBeenCalled();
      });

      unmount();

      expect(mockPedometerSubscription.remove).toHaveBeenCalled();
    });
  });
});