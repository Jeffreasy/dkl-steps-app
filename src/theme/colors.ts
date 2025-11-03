/**
 * DKL Brand Colors
 * Gebaseerd op de website styling met dark mode support
 */

// Light theme colors
export const lightColors = {
  // Primary brand colors (Oranje)
  primary: '#ff9328',
  primaryDark: '#e67f1c',
  primaryLight: '#ffad5c',
  
  // Secondary colors (Blauw)
  secondary: '#2563eb',
  secondaryDark: '#1d4ed8',
  secondaryLight: '#3b82f6',
  
  // Status colors
  status: {
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    info: '#2563eb',
  },
  
  // Text colors
  text: {
    primary: '#111827',      // gray-900
    secondary: '#6B7280',    // gray-600
    disabled: '#9CA3AF',     // gray-400
    inverse: '#FFFFFF',
    muted: '#6B7280',
  },
  
  // Background colors (meer kleur, zoals website)
  background: {
    default: '#FFF8F0',      // Warme oranje tint (zoals website gradient)
    paper: '#FFFFFF',
    dark: '#000000',
    subtle: '#FFF4E6',       // Licht oranje achtergrond
    gradient: {
      start: '#FFF8F0',      // Van licht oranje
      end: '#FFF4E6',        // Naar warmer oranje
    },
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
  },
  
  // Border colors
  border: {
    default: '#E5E7EB',      // gray-200
    light: '#F3F4F6',        // gray-100
    dark: '#D1D5DB',         // gray-300
  },
  
  // Social media colors
  social: {
    facebook: '#1877F2',
    instagram: '#E4405F',
    youtube: '#FF0000',
    linkedin: '#0A66C2',
  },
  
  // Gradients (for special effects)
  gradients: {
    primary: ['#ff9328', '#e67f1c'],
    secondary: ['#3b82f6', '#1d4ed8'],
  },
} as const;

// Dark theme colors
export const darkColors = {
  // Primary brand colors (blijven hetzelfde, maar lichter)
  primary: '#ffad5c',
  primaryDark: '#ff9328',
  primaryLight: '#ffc589',
  
  // Secondary colors
  secondary: '#3b82f6',
  secondaryDark: '#2563eb',
  secondaryLight: '#60a5fa',
  
  // Status colors (iets lichter voor dark mode)
  status: {
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Text colors (inverse)
  text: {
    primary: '#F9FAFB',      // bijna wit
    secondary: '#9CA3AF',    // gray-400
    disabled: '#6B7280',     // gray-600
    inverse: '#111827',      // dark gray
    muted: '#9CA3AF',
  },
  
  // Background colors (dark)
  background: {
    default: '#0F172A',      // slate-900
    paper: '#1E293B',        // slate-800
    dark: '#020617',         // slate-950
    subtle: '#334155',       // slate-700
    gradient: {
      start: '#0F172A',
      end: '#1E293B',
    },
    gray50: '#334155',       // slate-700
    gray100: '#1E293B',      // slate-800
    gray200: '#0F172A',      // slate-900
  },
  
  // Border colors (subtle in dark mode)
  border: {
    default: '#334155',      // slate-700
    light: '#475569',        // slate-600
    dark: '#1E293B',         // slate-800
  },
  
  // Social media colors (same)
  social: {
    facebook: '#1877F2',
    instagram: '#E4405F',
    youtube: '#FF0000',
    linkedin: '#0A66C2',
  },
  
  // Gradients
  gradients: {
    primary: ['#ffad5c', '#ff9328'],
    secondary: ['#60a5fa', '#3b82f6'],
  },
} as const;

// Default export is light theme (for backward compatibility)
export const colors = lightColors;

// Helper function to get colors based on theme
export const getColors = (isDark: boolean) => isDark ? darkColors : lightColors;

export type ColorKey = keyof typeof lightColors;