/**
 * DKL Spacing System
 * Gebaseerd op 4px grid systeem (zoals Tailwind)
 */

export const spacing = {
  // Base spacing units
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  
  // Named spacing (semantic)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Component spacing
  component: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gapSmall: 8,
    gapMedium: 12,
    gapLarge: 16,
  },
  
  // Section spacing (zoals website)
  section: {
    small: 48,      // py-12
    medium: 64,     // py-16
    large: 80,      // py-20
  },
  
  // Border radius
  radius: {
    none: 0,
    sm: 4,
    default: 8,
    md: 10,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 9999,
  },
} as const;

export type SpacingKey = keyof typeof spacing;