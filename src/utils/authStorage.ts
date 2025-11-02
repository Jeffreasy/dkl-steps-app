/**
 * Auth Storage - RBAC-aware storage voor authentication
 * 
 * Handelt opslag en retrieval van user data, tokens, roles en permissions af.
 * Gebruikt de base storage utility (MMKV of AsyncStorage) onder de hood.
 * 
 * @example
 * ```typescript
 * import { authStorage } from '@/utils/authStorage';
 * 
 * // Save user after login
 * await authStorage.saveUser(user);
 * 
 * // Check permission
 * const canWrite = await authStorage.hasPermission('contact', 'write');
 * ```
 */

import { storage } from './storage';
import { logger } from './logger';
import type { User, Role, Permission } from '../types/api';

const KEYS = {
  TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'userData',
  // Legacy keys (voor backwards compatibility)
  USER_ROLE: 'userRole',
  USER_NAME: 'userName',
  PARTICIPANT_ID: 'participantId',
} as const;

/**
 * Auth Storage - RBAC-aware storage manager
 */
export const authStorage = {
  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  /**
   * Save authentication token
   */
  async saveToken(token: string): Promise<void> {
    await storage.setItem(KEYS.TOKEN, token);
    logger.debug('Auth token saved');
  },

  /**
   * Get authentication token
   */
  async getToken(): Promise<string | null> {
    return await storage.getItem(KEYS.TOKEN);
  },

  /**
   * Save refresh token
   */
  async saveRefreshToken(refreshToken: string): Promise<void> {
    await storage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
    logger.debug('Refresh token saved');
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await storage.getItem(KEYS.REFRESH_TOKEN);
  },

  // ============================================================================
  // USER DATA MANAGEMENT
  // ============================================================================

  /**
   * Save complete user object (includes roles & permissions)
   */
  async saveUser(user: User): Promise<void> {
    await storage.setObject(KEYS.USER, user);
    
    // Also save legacy keys for backwards compatibility
    const primaryRole = user.roles.length > 0 ? user.roles[0].name : 'user';
    await storage.setItem(KEYS.USER_ROLE, primaryRole);
    await storage.setItem(KEYS.USER_NAME, user.naam);
    await storage.setItem(KEYS.PARTICIPANT_ID, user.id);
    
    logger.debug('User data saved', {
      userId: user.id,
      roles: user.roles.length,
      permissions: user.permissions.length,
    });
  },

  /**
   * Get complete user object
   */
  async getUser(): Promise<User | null> {
    return await storage.getObject<User>(KEYS.USER);
  },

  // ============================================================================
  // ROLE & PERMISSION HELPERS
  // ============================================================================

  /**
   * Get all user roles
   */
  async getUserRoles(): Promise<Role[]> {
    const user = await this.getUser();
    return user?.roles ?? [];
  },

  /**
   * Get all user permissions
   */
  async getUserPermissions(): Promise<Permission[]> {
    const user = await this.getUser();
    return user?.permissions ?? [];
  },

  /**
   * Get primary role (first role in array)
   */
  async getPrimaryRole(): Promise<string> {
    const roles = await this.getUserRoles();
    return roles.length > 0 ? roles[0].name : 'user';
  },

  /**
   * Get primary role object
   */
  async getPrimaryRoleObject(): Promise<Role | null> {
    const roles = await this.getUserRoles();
    return roles.length > 0 ? roles[0] : null;
  },

  // ============================================================================
  // PERMISSION CHECKING
  // ============================================================================

  /**
   * Check if user has specific permission
   * @param resource - Resource name (e.g., 'contact', 'admin')
   * @param action - Action name (e.g., 'read', 'write', 'delete', 'access')
   */
  async hasPermission(resource: string, action: string): Promise<boolean> {
    const permissions = await this.getUserPermissions();
    return permissions.some(
      p => p.resource === resource && p.action === action
    );
  },

  /**
   * Check if user has any of the specified permissions
   * @param checks - Array of [resource, action] tuples
   * @returns true if ANY permission matches
   */
  async hasAnyPermission(...checks: Array<[string, string]>): Promise<boolean> {
    const permissions = await this.getUserPermissions();
    return checks.some(([resource, action]) =>
      permissions.some(p => p.resource === resource && p.action === action)
    );
  },

  /**
   * Check if user has all specified permissions
   * @param checks - Array of [resource, action] tuples
   * @returns true only if ALL permissions match
   */
  async hasAllPermissions(...checks: Array<[string, string]>): Promise<boolean> {
    const permissions = await this.getUserPermissions();
    return checks.every(([resource, action]) =>
      permissions.some(p => p.resource === resource && p.action === action)
    );
  },

  /**
   * Check if user has specific role
   * @param roleName - Role name to check (case-insensitive)
   */
  async hasRole(roleName: string): Promise<boolean> {
    const roles = await this.getUserRoles();
    return roles.some(r => r.name.toLowerCase() === roleName.toLowerCase());
  },

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(...roleNames: string[]): Promise<boolean> {
    const roles = await this.getUserRoles();
    const normalizedRoles = roles.map(r => r.name.toLowerCase());
    return roleNames.some(name => normalizedRoles.includes(name.toLowerCase()));
  },

  // ============================================================================
  // QUICK ACCESS CHECKS
  // ============================================================================

  /**
   * Check if user is admin (has admin access permission)
   */
  async isAdmin(): Promise<boolean> {
    return await this.hasPermission('admin', 'access');
  },

  /**
   * Check if user is staff (has staff access permission)
   */
  async isStaff(): Promise<boolean> {
    return await this.hasPermission('staff', 'access');
  },

  /**
   * Check if user is authenticated (has token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  },

  // ============================================================================
  // LEGACY SUPPORT
  // ============================================================================

  /**
   * Get user role (legacy - returns primary role name)
   * @deprecated Use getPrimaryRole() or getUserRoles() instead
   */
  async getUserRole(): Promise<string | null> {
    return await storage.getItem(KEYS.USER_ROLE);
  },

  /**
   * Get user name (legacy)
   * @deprecated Use getUser().naam instead
   */
  async getUserName(): Promise<string | null> {
    return await storage.getItem(KEYS.USER_NAME);
  },

  /**
   * Get participant ID (legacy)
   * @deprecated Use getUser().id instead
   */
  async getParticipantId(): Promise<string | null> {
    return await storage.getItem(KEYS.PARTICIPANT_ID);
  },

  // ============================================================================
  // CLEAR ALL
  // ============================================================================

  /**
   * Clear all auth data (logout)
   */
  async clear(): Promise<void> {
    await storage.multiRemove([
      KEYS.TOKEN,
      KEYS.REFRESH_TOKEN,
      KEYS.USER,
      KEYS.USER_ROLE,
      KEYS.USER_NAME,
      KEYS.PARTICIPANT_ID,
    ]);
    logger.info('Auth storage cleared (logged out)');
  },
};

/**
 * Default export
 */
export default authStorage;