/**
 * DKL Theme System
 * Centralized theming voor de hele app
 * Gebaseerd op de DKL website design
 */

export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { shadows } from './shadows';
export { components } from './components';

// Re-export types
export type { ColorKey } from './colors';
export type { TypographyStyleKey } from './typography';
export type { SpacingKey } from './spacing';
export type { ShadowKey } from './shadows';
export type { ComponentKey } from './components';

/**
 * Complete theme object voor makkelijke import
 */
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { components } from './components';

export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  components,
} as const;

export default theme;