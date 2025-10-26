/**
 * useAuth Hook
 * 
 * Centrale authentication logic voor de hele app.
 * Handelt logout, user info ophalen, en session management af.
 * 
 * @example
 * ```typescript
 * function MyScreen() {
 *   const { logout, getUserInfo, isAuthenticated } = useAuth();
 *   
 *   const handleLogout = async () => {
 *     await logout();
 *   };
 *   
 *   return <Button onPress={handleLogout} title="Uitloggen" />;
 * }
 * ```
 */

import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '../types';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';

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
              await storage.clear();
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
      await storage.clear();
      navigation.replace('Login');
    } catch (error) {
      logger.error('Force logout failed:', error);
    }
  }, [navigation]);

  /**
   * Haal huidige user informatie op uit storage
   * Returns user details of default values bij niet ingelogd
   */
  const getUserInfo = useCallback(async (): Promise<UserInfo> => {
    try {
      const [role, name, token, participantId] = await Promise.all([
        storage.getItem('userRole'),
        storage.getItem('userName'),
        storage.getItem('authToken'),
        storage.getItem('participantId'),
      ]);

      const userInfo: UserInfo = {
        role: role || '',
        name: name || '',
        isAuthenticated: !!token,
        participantId: participantId || '',
      };

      logger.debug('User info retrieved:', { 
        role: userInfo.role, 
        isAuthenticated: userInfo.isAuthenticated 
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
    const token = await storage.getItem('authToken');
    return !!token;
  }, []);

  /**
   * Check of gebruiker een specifieke role heeft
   */
  const hasRole = useCallback(async (requiredRole: string): Promise<boolean> => {
    const role = await storage.getItem('userRole');
    const normalizedRole = (role || '').toLowerCase();
    return normalizedRole === requiredRole.toLowerCase();
  }, []);

  /**
   * Check of gebruiker één van de opgegeven roles heeft
   */
  const hasAnyRole = useCallback(async (requiredRoles: string[]): Promise<boolean> => {
    const role = await storage.getItem('userRole');
    const normalizedRole = (role || '').toLowerCase();
    return requiredRoles.some(r => r.toLowerCase() === normalizedRole);
  }, []);

  return {
    logout,
    forceLogout,
    getUserInfo,
    checkAuth,
    hasRole,
    hasAnyRole,
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;