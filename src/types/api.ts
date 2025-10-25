/**
 * API Type Definitions
 * Type definitions voor API requests en responses
 */

/**
 * Login Request & Response
 */
export interface LoginRequest {
  email: string;
  wachtwoord: string;
}

export interface LoginResponse {
  token: string;
  refresh_token?: string;
  user: {
    id: string;
    naam: string;
    email: string;
    rol: 'deelnemer' | 'admin' | 'staff' | 'Admin' | 'Staff';
  };
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
 * User Roles (normalized)
 */
export type UserRole = 'deelnemer' | 'admin' | 'staff';

/**
 * Normalize user role to lowercase
 */
export function normalizeUserRole(role: string): UserRole {
  const normalized = role.toLowerCase();
  if (normalized === 'admin' || normalized === 'staff' || normalized === 'deelnemer') {
    return normalized as UserRole;
  }
  return 'deelnemer'; // default fallback
}