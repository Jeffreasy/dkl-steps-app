/**
 * Custom Hooks Index
 * 
 * Centrale export voor alle custom hooks in de app.
 * Importeer hooks via: import { useAuth, useNetworkStatus } from '@/hooks';
 */

// Authentication
export { useAuth, type UseAuthReturn } from './useAuth';

// Screen Focus & Refresh
export { useRefreshOnFocus, useRefreshOnFocusManual } from './useRefreshOnFocus';

// Access Control & Authorization
export {
  useAccessControl,
  useRequireRole,
  useRequireSingleRole,
  useRequireAdmin,
} from './useAccessControl';

// Network Status
export {
  useNetworkStatus,
  useIsOnline,
  useNetworkListener,
} from './useNetworkStatus';