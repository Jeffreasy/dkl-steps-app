/**
 * useAuth Hook Tests
 * 
 * Tests for the authentication hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAuth } from '../useAuth';
import { storage } from '../../utils/storage';

// Mock dependencies
jest.mock('../../utils/storage');
jest.mock('react-native/Libraries/Alert/Alert');

// Mock navigation
const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    replace: mockReplace,
  }),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logout', () => {
    it('should show confirmation dialog', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Uitloggen',
        'Weet je zeker dat je wilt uitloggen?',
        expect.any(Array)
      );
    });

    it('should clear storage and navigate on confirmation', async () => {
      (storage.clear as jest.Mock).mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      // Get the alert confirmation callback
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = alertCall[2];
      const confirmButton = buttons.find((b: any) => b.text === 'Uitloggen');

      // Execute the confirmation callback
      await act(async () => {
        await confirmButton.onPress();
      });

      expect(storage.clear).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('Login');
    });

    it('should not logout on cancel', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      // Verify cancel button exists
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = alertCall[2];
      const cancelButton = buttons.find((b: any) => b.text === 'Annuleren');

      expect(cancelButton.style).toBe('cancel');
      expect(storage.clear).not.toHaveBeenCalled();
    });

    it('should handle logout errors', async () => {
      (storage.clear as jest.Mock).mockRejectedValue(new Error('Clear failed'));
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = alertCall[2];
      const confirmButton = buttons.find((b: any) => b.text === 'Uitloggen');

      await act(async () => {
        await confirmButton.onPress();
      });

      // Should show error alert
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Fout',
          'Kon niet uitloggen. Probeer opnieuw.'
        );
      });
    });
  });

  describe('forceLogout', () => {
    it('should logout without confirmation', async () => {
      (storage.clear as jest.Mock).mockResolvedValue(undefined);
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.forceLogout();
      });

      expect(Alert.alert).not.toHaveBeenCalled();
      expect(storage.clear).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('Login');
    });

    it('should handle forceLogout errors gracefully', async () => {
      (storage.clear as jest.Mock).mockRejectedValue(new Error('Clear failed'));
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.forceLogout();
      });

      // Should not throw, just log error
      expect(storage.clear).toHaveBeenCalled();
    });
  });

  describe('getUserInfo', () => {
    it('should return user info from storage', async () => {
      (storage.getItem as jest.Mock).mockImplementation((key: string) => {
        const values: Record<string, string> = {
          userRole: 'admin',
          userName: 'Test User',
          authToken: 'test-token',
          participantId: '123',
        };
        return Promise.resolve(values[key] || null);
      });

      const { result } = renderHook(() => useAuth());

      let userInfo;
      await act(async () => {
        userInfo = await result.current.getUserInfo();
      });

      expect(userInfo).toEqual({
        role: 'admin',
        name: 'Test User',
        isAuthenticated: true,
        participantId: '123',
      });
    });

    it('should return default values when not authenticated', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue(null);
      const { result } = renderHook(() => useAuth());

      let userInfo;
      await act(async () => {
        userInfo = await result.current.getUserInfo();
      });

      expect(userInfo).toEqual({
        role: '',
        name: '',
        isAuthenticated: false,
        participantId: '',
      });
    });

    it('should handle storage errors', async () => {
      (storage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      const { result } = renderHook(() => useAuth());

      let userInfo;
      await act(async () => {
        userInfo = await result.current.getUserInfo();
      });

      expect(userInfo).toEqual({
        role: '',
        name: '',
        isAuthenticated: false,
        participantId: '',
      });
    });
  });

  describe('checkAuth', () => {
    it('should return true when token exists', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('test-token');
      const { result } = renderHook(() => useAuth());

      let isAuthenticated;
      await act(async () => {
        isAuthenticated = await result.current.checkAuth();
      });

      expect(isAuthenticated).toBe(true);
      expect(storage.getItem).toHaveBeenCalledWith('authToken');
    });

    it('should return false when token does not exist', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue(null);
      const { result } = renderHook(() => useAuth());

      let isAuthenticated;
      await act(async () => {
        isAuthenticated = await result.current.checkAuth();
      });

      expect(isAuthenticated).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true for matching role', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('admin');
      const { result } = renderHook(() => useAuth());

      let hasAdminRole;
      await act(async () => {
        hasAdminRole = await result.current.hasRole('admin');
      });

      expect(hasAdminRole).toBe(true);
    });

    it('should return false for non-matching role', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('deelnemer');
      const { result } = renderHook(() => useAuth());

      let hasAdminRole;
      await act(async () => {
        hasAdminRole = await result.current.hasRole('admin');
      });

      expect(hasAdminRole).toBe(false);
    });

    it('should be case-insensitive', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('Admin');
      const { result } = renderHook(() => useAuth());

      let hasAdminRole;
      await act(async () => {
        hasAdminRole = await result.current.hasRole('admin');
      });

      expect(hasAdminRole).toBe(true);
    });

    it('should return false when no role', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue(null);
      const { result } = renderHook(() => useAuth());

      let hasAdminRole;
      await act(async () => {
        hasAdminRole = await result.current.hasRole('admin');
      });

      expect(hasAdminRole).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has one of the roles', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('staff');
      const { result } = renderHook(() => useAuth());

      let hasPermission;
      await act(async () => {
        hasPermission = await result.current.hasAnyRole('admin', 'staff');
      });

      expect(hasPermission).toBe(true);
    });

    it('should return false when user has none of the roles', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('deelnemer');
      const { result } = renderHook(() => useAuth());

      let hasPermission;
      await act(async () => {
        hasPermission = await result.current.hasAnyRole('admin', 'staff');
      });

      expect(hasPermission).toBe(false);
    });

    it('should be case-insensitive', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('Admin');
      const { result } = renderHook(() => useAuth());

      let hasPermission;
      await act(async () => {
        hasPermission = await result.current.hasAnyRole('admin', 'staff');
      });

      expect(hasPermission).toBe(true);
    });

    it('should handle empty roles array', async () => {
      (storage.getItem as jest.Mock).mockResolvedValue('admin');
      const { result } = renderHook(() => useAuth());

      let hasPermission;
      await act(async () => {
        hasPermission = await result.current.hasAnyRole();
      });

      expect(hasPermission).toBe(false);
    });
  });

  describe('hook stability', () => {
    it('should maintain stable function references', () => {
      const { result } = renderHook(() => useAuth());

      const firstLogout = result.current.logout;
      const firstGetUserInfo = result.current.getUserInfo;
      const firstCheckAuth = result.current.checkAuth;

      // Functions should be stable (memoized with useCallback)
      expect(result.current.logout).toBe(firstLogout);
      expect(result.current.getUserInfo).toBe(firstGetUserInfo);
      expect(result.current.checkAuth).toBe(firstCheckAuth);
    });
  });
});