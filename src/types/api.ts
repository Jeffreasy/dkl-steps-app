/**
 * API Type Definitions
 * Type definitions voor API requests en responses
 */

/**
 * Role - User role met metadata
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  assigned_at?: string;
  is_active?: boolean;
}

/**
 * Permission - Granulaire permission voor resource/action
 */
export interface Permission {
  resource: string;
  action: string;
}

/**
 * User - User object met RBAC support
 */
export interface User {
  id: string;
  naam: string;
  email: string;
  is_actief: boolean;
  roles: Role[];
  permissions: Permission[];
  laatste_login?: string;
  created_at?: string;
}

/**
 * Login Request & Response
 */
export interface LoginRequest {
  email: string;
  wachtwoord: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refresh_token: string;
  user: User;
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  huidig_wachtwoord: string;
  nieuw_wachtwoord: string;
}

/**
 * Dashboard Response
 */
export interface DashboardResponse {
  steps: number;
  route: string;
  allocatedFunds: number;
}

/**
 * Total Steps Response
 */
export interface TotalStepsResponse {
  total_steps: number;
  year: number;
}

/**
 * Funds Distribution Response
 */
export interface FundsDistributionResponse {
  totalX: number;
  routes: Record<string, number>;
}

/**
 * Route Fund Item
 * Used in AdminFundsScreen for CRUD operations
 */
export interface RouteFund {
  id: string;
  route: string;
  amount: number;
}

/**
 * Create Route Fund Request
 */
export interface CreateRouteFundRequest {
  route: string;
  amount: number;
}

/**
 * Update Route Fund Request
 */
export interface UpdateRouteFundRequest {
  amount: number;
}

/**
 * Steps Sync Request
 */
export interface StepsSyncRequest {
  steps: number;
}

/**
 * Generic API Options
 */
export interface APIFetchOptions extends RequestInit {
  retries?: number;
  timeout?: number;
  retryDelay?: number;
}

/**
 * User Roles (voor legacy support en quick checks)
 */
export type UserRole = 'deelnemer' | 'admin' | 'staff' | 'user';

/**
 * Get primary role name from roles array
 */
export function getPrimaryRole(roles: Role[]): string {
  return roles.length > 0 ? roles[0].name : 'user';
}

/**
 * Check if user has specific role
 */
export function hasRole(roles: Role[], roleName: string): boolean {
  return roles.some(r => r.name.toLowerCase() === roleName.toLowerCase());
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  permissions: Permission[],
  resource: string,
  action: string
): boolean {
  return permissions.some(
    p => p.resource === resource && p.action === action
  );
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  permissions: Permission[],
  checks: Array<[string, string]>
): boolean {
  return checks.some(([resource, action]) =>
    hasPermission(permissions, resource, action)
  );
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(
  permissions: Permission[],
  checks: Array<[string, string]>
): boolean {
  return checks.every(([resource, action]) =>
    hasPermission(permissions, resource, action)
  );
}

/**
 * Refresh Token Request & Response
 */
export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  success: boolean;
  token: string;
  refresh_token: string;
}