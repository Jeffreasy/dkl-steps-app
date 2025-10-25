/**
 * DKL Brand Colors
 * Gebaseerd op de website styling
 */

export const colors = {
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

export type ColorKey = keyof typeof colors;