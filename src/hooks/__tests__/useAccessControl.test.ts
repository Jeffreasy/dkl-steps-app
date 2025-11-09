/**
 * useAccessControl Hook Tests
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAccessControl, useRequireRole, useRequireSingleRole, useRequireAdmin } from '../useAccessControl';
import { authStorage } from '../../utils/authStorage';

jest.mock('../../utils/authStorage');

const mockGoBack = jest.fn();
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn(() => true);

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
    replace: mockReplace,
    canGoBack: mockCanGoBack,
  }),
}));

describe('useAccessControl Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should grant access when user has allowed role', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'admin' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('admin');

      const { result } = renderHook(() =>
        useAccessControl(['admin', 'staff'])
      );

      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
      });

      expect(result.current.hasAccess).toBe(true);
      expect(result.current.userRole).toBe('admin');
    });

    it('should deny access when user role not in allowed list', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'deelnemer' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('deelnemer');

      const { result } = renderHook(() =>
        useAccessControl(['admin', 'staff'])
      );

      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
      });

      expect(result.current.hasAccess).toBe(false);
      expect(result.current.userRole).toBe('deelnemer');
    });

    it('should be case-insensitive', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'Admin' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('Admin');

      const { result } = renderHook(() =>
        useAccessControl(['admin'])
      );

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(true);
      });
    });

    it('should deny access when no role found', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('user');

      const { result } = renderHook(() =>
        useAccessControl(['admin'])
      );

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });
    });
  });

  describe('access control behavior', () => {
    it('should deny access with default options', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'deelnemer' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('deelnemer');

      const { result } = renderHook(() => useAccessControl(['admin']));

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });
    });

    it('should support custom options', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'deelnemer' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('deelnemer');

      const { result } = renderHook(() =>
        useAccessControl({
          allowedRoles: ['admin'],
          alertTitle: 'Custom Title',
          alertMessage: 'Custom message here',
        })
      );

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });
    });

    it('should check multiple allowed roles', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'deelnemer' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('deelnemer');

      const { result } = renderHook(() =>
        useAccessControl(['admin', 'staff', 'moderator'])
      );

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });
    });
  });

  describe('navigation behavior', () => {
    it('should deny access and trigger alert', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'deelnemer' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('deelnemer');

      const { result } = renderHook(() => useAccessControl(['admin']));

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });
    });

    it('should respect navigateBackOnDeny option', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'deelnemer' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('deelnemer');

      const { result } = renderHook(() =>
        useAccessControl({
          allowedRoles: ['admin'],
          navigateBackOnDeny: false,
        })
      );

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });
    });

    it('should handle navigation when cannot go back', async () => {
      mockCanGoBack.mockReturnValue(false);
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'deelnemer' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('deelnemer');

      const { result } = renderHook(() => useAccessControl(['admin']));

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });
    });
  });

  describe('callbacks', () => {
    it('should accept onAccessDenied callback', async () => {
      const mockOnDenied = jest.fn();
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'deelnemer' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('deelnemer');

      const { result } = renderHook(() =>
        useAccessControl({
          allowedRoles: ['admin'],
          onAccessDenied: mockOnDenied,
        })
      );

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });
    });

    it('should not trigger callback when access is granted', async () => {
      const mockOnDenied = jest.fn();
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'admin' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('admin');

      const { result } = renderHook(() =>
        useAccessControl({
          allowedRoles: ['admin'],
          onAccessDenied: mockOnDenied,
        })
      );

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(true);
      });

      expect(mockOnDenied).not.toHaveBeenCalled();
    });
  });

  describe('helper hooks', () => {
    it('useRequireRole should work with role array', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'staff' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('staff');

      const { result } = renderHook(() =>
        useRequireRole(['admin', 'staff'])
      );

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(true);
      });
    });

    it('useRequireSingleRole should work with single role', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'admin' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('admin');

      const { result } = renderHook(() =>
        useRequireSingleRole('admin')
      );

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(true);
      });
    });

    it('useRequireAdmin should check for admin role', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'admin' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([{ resource: 'admin', action: 'access' }]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('admin');

      const { result } = renderHook(() => useRequireAdmin());

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(true);
      });
    });

    it('useRequireAdmin should deny non-admin users', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'deelnemer' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('deelnemer');

      const { result } = renderHook(() => useRequireAdmin());

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('should deny access when authStorage fails', async () => {
      (authStorage.getUserRoles as jest.Mock).mockRejectedValue(new Error('Storage error'));
      (authStorage.getUserPermissions as jest.Mock).mockRejectedValue(new Error('Storage error'));
      (authStorage.getPrimaryRole as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useAccessControl(['admin']));

      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
      });

      expect(result.current.hasAccess).toBe(false);
    });

    it('should handle empty allowed roles array', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'admin' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('admin');

      const { result } = renderHook(() => useAccessControl([]));

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });
    });
  });

  describe('state management', () => {
    it('should start with isChecking true', () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'admin' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('admin');

      const { result } = renderHook(() => useAccessControl(['admin']));

      expect(result.current.isChecking).toBe(true);
    });

    it('should set isChecking to false after check', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'admin' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('admin');

      const { result } = renderHook(() => useAccessControl(['admin']));

      await waitFor(() => {
        expect(result.current.isChecking).toBe(false);
      });
    });

    it('should update userRole state', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'staff' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('staff');

      const { result } = renderHook(() => useAccessControl(['staff']));

      await waitFor(() => {
        expect(result.current.userRole).toBe('staff');
      });
    });
  });

  describe('multiple roles', () => {
    it('should grant access for first matching role', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'staff' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('staff');

      const { result } = renderHook(() =>
        useAccessControl(['admin', 'staff', 'moderator'])
      );

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(true);
      });
    });

    it('should grant access for last matching role', async () => {
      (authStorage.getUserRoles as jest.Mock).mockResolvedValue([{ name: 'moderator' }]);
      (authStorage.getUserPermissions as jest.Mock).mockResolvedValue([]);
      (authStorage.getPrimaryRole as jest.Mock).mockResolvedValue('moderator');

      const { result } = renderHook(() =>
        useAccessControl(['admin', 'staff', 'moderator'])
      );

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(true);
      });
    });
  });
});