/**
 * DKLLogo Component
 * 
 * Cached DKL logo component voor consistent gebruik door hele app.
 * Voorkomt meerdere imports en optimaleert memory usage.
 * 
 * Features:
 * - Drie sizes: small, medium, large
 * - Cached image source (single import)
 * - Memoized voor performance
 * - Consistent styling
 * 
 * Usage:
 * <DKLLogo size="medium" />
 * <DKLLogo size="small" style={{ marginTop: 20 }} />
 */

import { memo } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

// Cache logo source (single import for entire app)
const logoSource = require('../../../assets/dkl-logo.webp');

interface DKLLogoProps {
  /**
   * Logo size preset
   * - small: 120x40 (for small headers, badges)
   * - medium: 240x75 (default, most screens)
   * - large: 280x100 (login screen, splash)
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Custom style overrides
   */
  style?: StyleProp<ImageStyle>;
}

/**
 * Predefined sizes voor consistency
 */
const SIZES = {
  small: { width: 120, height: 40 },
  medium: { width: 240, height: 75 },
  large: { width: 280, height: 100 },
} as const;

function DKLLogo({ size = 'medium', style }: DKLLogoProps) {
  return (
    <Image
      source={logoSource}
      style={[SIZES[size], style]}
      resizeMode="contain"
    />
  );
}

// Export memoized version voor performance
export default memo(DKLLogo);