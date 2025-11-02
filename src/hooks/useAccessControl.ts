/**
 * useAccessControl Hook - RBAC Edition
 *
 * Controleert of een gebruiker toegang heeft tot een screen op basis van:
 * - Roles (backwards compatible)
 * - Permissions (nieuwe RBAC manier - PREFERRED)
 *
 * @example
 * ```typescript
 * // Permission-based (PREFERRED - nieuwe RBAC manier)
 * function AdminScreen() {
 *   const { hasAccess, isChecking } = useAccessControl({
 *     requiredPermissions: [['admin', 'access']]
 *   });
 *
 *   if (isChecking) return <LoadingScreen />;
 *   if (!hasAccess) return <ErrorScreen />;
 *
 *   return <View>Admin Content</View>;
 * }
 *
 * // Role-based (backwards compatible)
 * function StaffScreen() {
 *   const { hasAccess, isChecking } = useAccessControl({
 *     allowedRoles: ['admin', 'staff']
 *   });
 *
 *   return hasAccess ? <View>Content</View> : null;
 * }
 *
 * // Simple role array (legacy shorthand)
 * function OldWay() {
 *   const { hasAccess } = useAccessControl(['admin']);
 *   return hasAccess ? <View>Content</View> : null;
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '../types';
import { logger } from '../utils/logger';
import { authStorage } from '../utils/authStorage';

interface UseAccessControlOptions {
  /**
   * Toegestane roles (voor backwards compatibility)
   * @deprecated Use requiredPermissions instead for better RBAC
   */
  allowedRoles?: string[];
  
  /**
   * Required permissions - user moet ALLE hebben (AND)
   * Format: [resource, action]
   * Example: [['admin', 'access'], ['contact', 'write']]
   */
  requiredPermissions?: Array<[string, string]>;
  
  /**
   * Required permissions - user moet minimaal ÉÉN hebben (OR)
   * Format: [resource, action]
   * Example: [['admin', 'access'], ['staff', 'access']]
   */
  requiredAnyPermission?: Array<[string, string]>;
  
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
   * De primary role van de gebruiker (legacy)
   */
  userRole: string | null;
  
  /**
   * Alle roles van de gebruiker
   */
  userRoles: string[];
  
  /**
   * Aantal permissions dat de gebruiker heeft
   */
  permissionCount: number;
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

  // Normalize options - support legacy array format
  const normalizedOptions: UseAccessControlOptions = Array.isArray(options)
    ? { allowedRoles: options }
    : options;

  const {
    allowedRoles,
    requiredPermissions,
    requiredAnyPermission,
    alertTitle = 'Geen Toegang',
    alertMessage,
    navigateBackOnDeny = true,
    onAccessDenied,
  } = normalizedOptions;

  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [permissionCount, setPermissionCount] = useState(0);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Haal user data op
        const [roles, permissions, primaryRole] = await Promise.all([
          authStorage.getUserRoles(),
          authStorage.getUserPermissions(),
          authStorage.getPrimaryRole(),
        ]);

        const roleNames = roles.map(r => r.name);
        setUserRole(primaryRole);
        setUserRoles(roleNames);
        setPermissionCount(permissions.length);

        let access = false;
        let accessMethod = '';

        // PRIORITY 1: Check required permissions (ALL - AND logic)
        if (requiredPermissions && requiredPermissions.length > 0) {
          access = await authStorage.hasAllPermissions(...requiredPermissions);
          accessMethod = 'requiredPermissions (ALL)';
          
          if (!access) {
            logger.warn('Access denied - missing required permissions:', {
              required: requiredPermissions,
              userPermissions: permissions.length,
            });
          }
        }
        // PRIORITY 2: Check required any permission (ANY - OR logic)
        else if (requiredAnyPermission && requiredAnyPermission.length > 0) {
          access = await authStorage.hasAnyPermission(...requiredAnyPermission);
          accessMethod = 'requiredAnyPermission (ANY)';
          
          if (!access) {
            logger.warn('Access denied - no matching permission:', {
              required: requiredAnyPermission,
              userPermissions: permissions.length,
            });
          }
        }
        // PRIORITY 3: Check allowed roles (backwards compatibility)
        else if (allowedRoles && allowedRoles.length > 0) {
          const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
          access = roleNames.some(role =>
            normalizedAllowedRoles.includes(role.toLowerCase())
          );
          accessMethod = 'allowedRoles (legacy)';
          
          if (!access) {
            logger.warn('Access denied - role not in allowed list:', {
              userRoles: roleNames,
              allowedRoles,
            });
          }
        }
        // No access control specified - DENY by default
        else {
          access = false;
          accessMethod = 'none specified - deny by default';
          logger.warn('Access denied - no access control rules specified');
        }

        setHasAccess(access);

        if (!access) {
          // Genereer alert message
          let message = alertMessage;
          if (!message) {
            if (requiredPermissions || requiredAnyPermission) {
              message = 'Je hebt niet de vereiste rechten voor deze functie.';
            } else if (allowedRoles) {
              message = `Alleen ${allowedRoles.join(', ')} hebben toegang tot deze functie.`;
            } else {
              message = 'Je hebt geen toegang tot deze functie.';
            }
          }

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
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      (navigation as any).replace('Dashboard');
                    }
                  }
                },
              },
            ]
          );
        } else {
          logger.debug('Access granted via:', {
            method: accessMethod,
            userRoles: roleNames,
            permissionCount: permissions.length,
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
  }, [
    allowedRoles,
    requiredPermissions,
    requiredAnyPermission,
    alertTitle,
    alertMessage,
    navigateBackOnDeny,
    onAccessDenied,
    navigation,
  ]);

  return {
    hasAccess,
    isChecking,
    userRole,
    userRoles,
    permissionCount,
  };
}

/**
 * Require specific permission (NEW - PREFERRED)
 * @example useRequirePermission('admin', 'access')
 */
export function useRequirePermission(
  resource: string,
  action: string
): UseAccessControlReturn {
  return useAccessControl({
    requiredPermissions: [[resource, action]],
  });
}

/**
 * Require any of the specified permissions (NEW - PREFERRED)
 * @example useRequireAnyPermission([['admin', 'access'], ['staff', 'access']])
 */
export function useRequireAnyPermission(
  ...permissions: Array<[string, string]>
): UseAccessControlReturn {
  return useAccessControl({
    requiredAnyPermission: permissions,
  });
}

/**
 * Check voor admin access (NEW - permission-based)
 */
export function useRequireAdmin(): UseAccessControlReturn {
  return useAccessControl({
    requiredPermissions: [['admin', 'access']],
  });
}

/**
 * Check voor staff access (NEW - permission-based)
 */
export function useRequireStaff(): UseAccessControlReturn {
  return useAccessControl({
    requiredAnyPermission: [
      ['admin', 'access'],
      ['staff', 'access'],
    ],
  });
}

/**
 * Simplified version - alleen array van roles accepteren (LEGACY)
 * @deprecated Use useRequirePermission or useRequireAnyPermission instead
 */
export function useRequireRole(allowedRoles: string[]): UseAccessControlReturn {
  return useAccessControl({ allowedRoles });
}

/**
 * Check voor single role (LEGACY)
 * @deprecated Use useRequirePermission instead
 */
export function useRequireSingleRole(role: string): UseAccessControlReturn {
  return useAccessControl({ allowedRoles: [role] });
}