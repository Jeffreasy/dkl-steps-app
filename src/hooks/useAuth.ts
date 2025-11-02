/**
 * useAuth Hook - RBAC Edition
 *
 * Centrale authentication logic voor de hele app met RBAC support.
 * Handelt logout, user info ophalen, permission checks en session management af.
 *
 * @example
 * ```typescript
 * function MyScreen() {
 *   const { logout, getUser, hasPermission, isAdmin } = useAuth();
 *
 *   const handleLogout = async () => {
 *     await logout();
 *   };
 *
 *   const canEdit = await hasPermission('contact', 'write');
 *
 *   return <Button onPress={handleLogout} title="Uitloggen" />;
 * }
 * ```
 */

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '../types';
import type { User, Role, Permission } from '../types/api';
import { logger } from '../utils/logger';
import { authStorage } from '../utils/authStorage';

/**
 * Legacy UserInfo interface (voor backwards compatibility)
 */
interface UserInfo {
  role: string;
  name: string;
  isAuthenticated: boolean;
  participantId: string;
}

export function useAuth() {
  const navigation = useNavigation<NavigationProp>();

  /**
   * Logout de gebruiker en navigeer naar login screen
   * Toont een confirmation dialog
   */
  const logout = useCallback(async () => {
    Alert.alert(
      'Uitloggen',
      'Weet je zeker dat je wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Uitloggen',
          style: 'destructive',
          onPress: async () => {
            try {
              logger.info('User logged out');
              await authStorage.clear();
              navigation.replace('Login');
            } catch (error) {
              logger.error('Logout failed:', error);
              Alert.alert('Fout', 'Kon niet uitloggen. Probeer opnieuw.');
            }
          },
        },
      ]
    );
  }, [navigation]);

  /**
   * Logout zonder confirmation dialog
   * Gebruik voor automatische logout (bijv. bij auth errors)
   */
  const forceLogout = useCallback(async () => {
    try {
      logger.warn('Force logout triggered');
      await authStorage.clear();
      navigation.replace('Login');
    } catch (error) {
      logger.error('Force logout failed:', error);
    }
  }, [navigation]);

  /**
   * Get complete user object with roles & permissions
   */
  const getUser = useCallback(async (): Promise<User | null> => {
    try {
      return await authStorage.getUser();
    } catch (error) {
      logger.error('Failed to get user:', error);
      return null;
    }
  }, []);

  /**
   * Haal huidige user informatie op uit storage (legacy format)
   * @deprecated Use getUser() instead for full RBAC support
   */
  const getUserInfo = useCallback(async (): Promise<UserInfo> => {
    try {
      const user = await authStorage.getUser();
      const isAuthenticated = await authStorage.isAuthenticated();

      if (!user) {
        return {
          role: '',
          name: '',
          isAuthenticated: false,
          participantId: '',
        };
      }

      const primaryRole = user.roles.length > 0 ? user.roles[0].name : 'user';

      const userInfo: UserInfo = {
        role: primaryRole,
        name: user.naam,
        isAuthenticated,
        participantId: user.id,
      };

      logger.debug('User info retrieved:', {
        role: userInfo.role,
        isAuthenticated: userInfo.isAuthenticated,
        permissions: user.permissions.length,
      });

      return userInfo;
    } catch (error) {
      logger.error('Failed to get user info:', error);
      return {
        role: '',
        name: '',
        isAuthenticated: false,
        participantId: '',
      };
    }
  }, []);

  /**
   * Check of gebruiker is ingelogd
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    return await authStorage.isAuthenticated();
  }, []);

  // ============================================================================
  // ROLE CHECKING
  // ============================================================================

  /**
   * Get all user roles
   */
  const getUserRoles = useCallback(async (): Promise<Role[]> => {
    return await authStorage.getUserRoles();
  }, []);

  /**
   * Get primary role (first role in array)
   */
  const getPrimaryRole = useCallback(async (): Promise<string> => {
    return await authStorage.getPrimaryRole();
  }, []);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback(async (roleName: string): Promise<boolean> => {
    return await authStorage.hasRole(roleName);
  }, []);

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback(async (...roleNames: string[]): Promise<boolean> => {
    return await authStorage.hasAnyRole(...roleNames);
  }, []);

  // ============================================================================
  // PERMISSION CHECKING
  // ============================================================================

  /**
   * Get all user permissions
   */
  const getUserPermissions = useCallback(async (): Promise<Permission[]> => {
    return await authStorage.getUserPermissions();
  }, []);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback(
    async (resource: string, action: string): Promise<boolean> => {
      return await authStorage.hasPermission(resource, action);
    },
    []
  );

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback(
    async (...checks: Array<[string, string]>): Promise<boolean> => {
      return await authStorage.hasAnyPermission(...checks);
    },
    []
  );

  /**
   * Check if user has all specified permissions
   */
  const hasAllPermissions = useCallback(
    async (...checks: Array<[string, string]>): Promise<boolean> => {
      return await authStorage.hasAllPermissions(...checks);
    },
    []
  );

  // ============================================================================
  // QUICK ACCESS CHECKS
  // ============================================================================

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback(async (): Promise<boolean> => {
    return await authStorage.isAdmin();
  }, []);

  /**
   * Check if user is staff
   */
  const isStaff = useCallback(async (): Promise<boolean> => {
    return await authStorage.isStaff();
  }, []);

  return {
    // Auth management
    logout,
    forceLogout,
    checkAuth,
    
    // User data
    getUser,
    getUserInfo, // Legacy
    
    // Role checking
    getUserRoles,
    getPrimaryRole,
    hasRole,
    hasAnyRole,
    
    // Permission checking
    getUserPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Quick checks
    isAdmin,
    isStaff,
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;