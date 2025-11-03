// Authentication & Access Control
export { useAuth } from './useAuth';
export { useTokenRefresh } from './useTokenRefresh';
export { useLogin } from './useLogin';
export { useChangePassword } from './useChangePassword';
export {
  useAccessControl,
  useRequirePermission,
  useRequireAnyPermission,
  useRequireAdmin,
  useRequireStaff,
  useRequireRole,
  useRequireSingleRole,
} from './useAccessControl';

// Data Management
export { useStepTracking } from './useStepTracking';
export { useRefreshOnFocus } from './useRefreshOnFocus';
export { useNetworkStatus } from './useNetworkStatus';
export { usePollingData } from './usePollingData';
export { useStepsWebSocket } from './useStepsWebSocket';

// Geofencing & Events
export { useGeofencing, defineBackgroundLocationTask } from './useGeofencing';
export { useEventData, useEvent, useHasActiveEvent } from './useEventData';
export { useEventMutations } from './useEventMutations';

// UI/UX
export { useToast } from './useToast';

// Animations
export {
  useFadeAnimation,
  useScaleAnimation,
  usePulseAnimation,
  useSlideAnimation,
  useShakeAnimation,
  useCounterAnimation,
  useSpringAnimation,
  useRotationAnimation,
  useEntryAnimation,
  useProgressAnimation,
  useStaggerAnimation,
} from './useAnimations';

// Admin Features
export { useOptimisticMutations } from './useOptimisticMutations';
export { useUndoRedo } from './useUndoRedo';
export { useAuditLog } from './useAuditLog';