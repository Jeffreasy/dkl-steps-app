/**
 * DKL Shadow System
 * Platform-aware shadows voor iOS en Android
 */

import { Platform, ViewStyle } from 'react-native';

/**
 * Generate platform-specific shadow styles
 */
const createShadow = (
  elevation: number,
  shadowOpacity: number = 0.1,
  shadowRadius: number = 4
): ViewStyle => {
  if (Platform.OS === 'android') {
    return { elevation };
  }
  
  // iOS shadows
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: Math.ceil(elevation / 2),
    },
    shadowOpacity,
    shadowRadius,
  };
};

export const shadows = {
  // No shadow
  none: {
    elevation: 0,
    shadowOpacity: 0,
  },
  
  // Small shadow (zoals website shadow-sm)
  sm: createShadow(2, 0.05, 2),
  
  // Medium shadow (zoals website shadow-md)
  md: createShadow(4, 0.1, 4),
  
  // Large shadow (zoals website shadow-lg)
  lg: createShadow(8, 0.1, 8),
  
  // Extra large shadow (zoals website shadow-xl)
  xl: createShadow(12, 0.15, 12),
  
  // XXL shadow (voor modals)
  xxl: createShadow(20, 0.2, 16),
  
  // Inner shadow (limited support, mainly for borders)
  inner: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  
  // Colored shadows (voor primary/secondary buttons)
  primary: Platform.select({
    ios: {
      shadowColor: '#ff9328',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
  
  secondary: Platform.select({
    ios: {
      shadowColor: '#2563eb',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
} as const;

export type ShadowKey = keyof typeof shadows;