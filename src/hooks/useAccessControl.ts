/**
 * useAccessControl Hook
 * 
 * Controleert of een gebruiker toegang heeft tot een screen op basis van hun role.
 * Toont automatisch een alert en navigeert terug bij geen toegang.
 * 
 * @example
 * ```typescript
 * function AdminScreen() {
 *   const { hasAccess, isChecking } = useAccessControl(['admin']);
 *   
 *   if (isChecking) return <LoadingScreen />;
 *   if (!hasAccess) return <ErrorScreen />;
 *   
 *   return <View>Admin Content</View>;
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationProp } from '../types';
import { logger } from '../utils/logger';

interface UseAccessControlOptions {
  /**
   * Toegestane roles (lowercase)
   */
  allowedRoles: string[];
  
  /**
   * Custom alert title
   */
  alertTitle?: string;
  
  /**
   * Custom alert message
   */
  alertMessage?: string;
  
  /**
   * Navigeer terug bij geen toegang (default: true)
   */
  navigateBackOnDeny?: boolean;
  
  /**
   * Callback bij toegang geweigerd
   */
  onAccessDenied?: () => void;
}

interface UseAccessControlReturn {
  /**
   * Of gebruiker toegang heeft
   */
  hasAccess: boolean;
  
  /**
   * Of de check nog bezig is
   */
  isChecking: boolean;
  
  /**
   * De role van de gebruiker
   */
  userRole: string | null;
}

/**
 * Hook om toegang te controleren op basis van user role
 */
export function useAccessControl(
  options: UseAccessControlOptions | string[]
): UseAccessControlReturn {
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  // Normalize options
  const {
    allowedRoles,
    alertTitle = 'Geen Toegang',
    alertMessage,
    navigateBackOnDeny = true,
    onAccessDenied,
  } = Array.isArray(options)
    ? { allowedRoles: options }
    : options;

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        const normalizedRole = (role || '').toLowerCase();
        
        setUserRole(normalizedRole);

        // Check of role in toegestane lijst staat
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
        const access = normalizedAllowedRoles.includes(normalizedRole);
        
        setHasAccess(access);

        if (!access) {
          logger.warn('Access denied:', {
            userRole: normalizedRole,
            allowedRoles: normalizedAllowedRoles,
          });

          // Genereer alert message
          const message = alertMessage || 
            `Alleen ${allowedRoles.join(', ')} hebben toegang tot deze functie.`;

          // Toon alert
          Alert.alert(
            alertTitle,
            message,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Custom callback
                  if (onAccessDenied) {
                    onAccessDenied();
                  }
                  
                  // Navigeer terug of naar Dashboard
                  if (navigateBackOnDeny) {
                    // Check if we can go back, otherwise navigate to Dashboard
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      // Fallback: navigate to Dashboard
                      (navigation as any).replace('Dashboard');
                    }
                  }
                },
              },
            ]
          );
        } else {
          logger.debug('Access granted:', {
            userRole: normalizedRole,
            allowedRoles: normalizedAllowedRoles,
          });
        }
      } catch (error) {
        logger.error('Access control check failed:', error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [allowedRoles, alertTitle, alertMessage, navigateBackOnDeny, onAccessDenied, navigation]);

  return {
    hasAccess,
    isChecking,
    userRole,
  };
}

/**
 * Simplified version - alleen array van roles accepteren
 */
export function useRequireRole(allowedRoles: string[]): UseAccessControlReturn {
  return useAccessControl(allowedRoles);
}

/**
 * Check voor single role
 */
export function useRequireSingleRole(role: string): UseAccessControlReturn {
  return useAccessControl([role]);
}

/**
 * Check voor admin access
 */
export function useRequireAdmin(): UseAccessControlReturn {
  return useAccessControl(['admin']);
}