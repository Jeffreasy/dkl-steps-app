/**
 * DKL Typography System
 * Gebaseerd op Roboto Slab (headings) en Roboto (body) zoals de website
 */

export const typography = {
  // Font families (Roboto Slab voor headings, Roboto voor body)
  fonts: {
    heading: 'RobotoSlab_700Bold',
    headingLight: 'RobotoSlab_300Light',
    headingRegular: 'RobotoSlab_400Regular',
    headingMedium: 'RobotoSlab_500Medium',
    headingSemiBold: 'RobotoSlab_600SemiBold',
    headingBold: 'RobotoSlab_700Bold',
    body: 'Roboto_400Regular',
    bodyLight: 'Roboto_300Light',
    bodyRegular: 'Roboto_400Regular',
    bodyMedium: 'Roboto_500Medium',
    bodyBold: 'Roboto_700Bold',
    mono: 'Courier',
  },
  
  // Font sizes (gebaseerd op website's Tailwind scale)
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
    '7xl': 64,
    '8xl': 96,
  },
  
  // Font weights
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  
  // Line heights
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Letter spacing
  letterSpacing: {
    tighter: -0.8,
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 1.5,
  },
  
  // Predefined text styles (zoals website)
  styles: {
    // Headings (Roboto Slab)
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
      letterSpacing: -0.5,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '500' as const,
      lineHeight: 26,
    },
    h6: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 24,
    },
    
    // Body text (Roboto)
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 28,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    
    // Caption & labels
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
    
    // Button text
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    
    // Special styles
    overline: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 16,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
  },
} as const;

export type TypographyStyleKey = keyof typeof typography.styles;