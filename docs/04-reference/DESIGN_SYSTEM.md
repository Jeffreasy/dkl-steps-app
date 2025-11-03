# Design System - DKL Steps App

**Version**: 1.0.0
**Date**: 2025-11-03
**Status**: 🎨 Complete Design System Reference

Deze documentatie beschrijft het complete design system van de DKL Steps App, inclusief kleuren, typografie, spacing, componenten en gebruiksrichtlijnen.

## 📋 Overzicht

### Design Principles
- **Consistentie**: Uniform uiterlijk across alle componenten
- **Toegankelijkheid**: WCAG 2.1 AA compliance
- **Responsive**: Optimale weergave op alle schermformaten
- **Brand-aligned**: Gebaseerd op DKL merkidentiteit

### Design Tokens
- **Colors**: Brand kleuren met light/dark mode support
- **Typography**: Roboto Slab (headings) + Roboto (body)
- **Spacing**: 4px grid systeem
- **Components**: Herbruikbare UI componenten

---

## 🎨 Color System

### Primary Colors (Brand)
```typescript
// Primary (Orange)
primary: '#ff9328'        // Main brand color
primaryDark: '#e67f1c'    // Hover states
primaryLight: '#ffad5c'   // Light variants

// Secondary (Blue)
secondary: '#2563eb'      // Secondary actions
secondaryDark: '#1d4ed8'  // Dark variants
secondaryLight: '#3b82f6' // Light variants
```

### Status Colors
```typescript
status: {
  success: '#16a34a',     // Green - positive actions
  warning: '#ca8a04',     // Yellow - warnings
  error: '#dc2626',       // Red - errors/danger
  info: '#2563eb',        // Blue - information
}
```

### Text Colors
```typescript
text: {
  primary: '#111827',     // Main text (dark theme: '#F9FAFB')
  secondary: '#6B7280',   // Secondary text
  disabled: '#9CA3AF',    // Disabled states
  inverse: '#FFFFFF',     // Text on dark backgrounds
  muted: '#6B7280',       // Muted text
}
```

### Background Colors
```typescript
background: {
  default: '#FFF8F0',     // Main background (warm orange tint)
  paper: '#FFFFFF',       // Card/component backgrounds
  dark: '#000000',        // Dark overlays
  subtle: '#FFF4E6',      // Subtle backgrounds
  gray50: '#F9FAFB',      // Light grays
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
}
```

### Border Colors
```typescript
border: {
  default: '#E5E7EB',     // Standard borders
  light: '#F3F4F6',       // Light borders
  dark: '#D1D5DB',        // Dark borders
}
```

### Dark Mode Variants
```typescript
// Dark theme backgrounds
background: {
  default: '#0F172A',     // slate-900
  paper: '#1E293B',       // slate-800
  dark: '#020617',        // slate-950
  subtle: '#334155',      // slate-700
}
```

---

## 📝 Typography System

### Font Families
```typescript
fonts: {
  heading: 'RobotoSlab_700Bold',    // Headings (bold)
  headingLight: 'RobotoSlab_300Light',
  headingRegular: 'RobotoSlab_400Regular',
  headingMedium: 'RobotoSlab_500Medium',
  headingSemiBold: 'RobotoSlab_600SemiBold',
  headingBold: 'RobotoSlab_700Bold',
  body: 'Roboto_400Regular',        // Body text
  bodyLight: 'Roboto_300Light',
  bodyRegular: 'Roboto_400Regular',
  bodyMedium: 'Roboto_500Medium',
  bodyBold: 'Roboto_700Bold',
}
```

### Font Sizes
```typescript
sizes: {
  xs: 12,      // Captions
  sm: 14,      // Small text
  base: 16,    // Body text
  lg: 18,      // Large body
  xl: 20,      // Small headings
  '2xl': 24,   // Headings
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
  '6xl': 48,
  '7xl': 64,
  '8xl': 96,   // Hero text (Digital Board)
}
```

### Predefined Text Styles
```typescript
styles: {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: '700', lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h5: { fontSize: 18, fontWeight: '500', lineHeight: 26 },
  h6: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyLarge: { fontSize: 18, fontWeight: '400', lineHeight: 28 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  label: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  overline: { fontSize: 12, fontWeight: '600', lineHeight: 16, letterSpacing: 1 },
}
```

---

## 📏 Spacing System

### Base Spacing Units (4px grid)
```typescript
spacing: {
  0: 0,     // No spacing
  1: 4,     // xs
  2: 8,     // sm
  3: 12,    // md
  4: 16,    // lg
  5: 20,    // xl
  6: 24,    // 2xl
  7: 28,
  8: 32,    // 3xl
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
}
```

### Semantic Spacing
```typescript
// Named spacing
xs: 4,      // Extra small
sm: 8,      // Small
md: 12,     // Medium (default)
lg: 16,     // Large
xl: 20,     // Extra large
xxl: 24,    // 2X large
xxxl: 32,   // 3X large

// Component spacing
component: {
  paddingHorizontal: 16,
  paddingVertical: 12,
  gapSmall: 8,
  gapMedium: 12,
  gapLarge: 16,
}

// Section spacing
section: {
  small: 48,    // py-12
  medium: 64,   // py-16
  large: 80,    // py-20
}
```

### Border Radius
```typescript
radius: {
  none: 0,
  sm: 4,        // Small elements
  default: 8,   // Standard radius
  md: 10,
  lg: 12,       // Cards
  xl: 16,
  xxl: 20,
  full: 9999,   // Circular elements
}
```

---

## 🧩 Component Variants

### Button Variants
```typescript
button: {
  primary: {
    backgroundColor: '#ff9328',
    textColor: '#FFFFFF',
    pressed: '#e67f1c'
  },
  secondary: {
    backgroundColor: '#2563eb',
    textColor: '#FFFFFF',
    pressed: '#1d4ed8'
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#ff9328',
    textColor: '#ff9328',
    pressed: { backgroundColor: '#ff9328', textColor: '#FFFFFF' }
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: '#ff9328',
    pressed: '#ff93281A' // 10% opacity
  },
  danger: {
    backgroundColor: '#dc2626',
    textColor: '#FFFFFF'
  }
}
```

### Card Variants
```typescript
card: {
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadow: 'medium'
  },
  elevated: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadow: 'large'
  },
  bordered: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  }
}
```

### Badge Variants
```typescript
badge: {
  primary: { backgroundColor: '#ff93281A', textColor: '#ff9328' },
  success: { backgroundColor: '#16a34a1A', textColor: '#16a34a' },
  warning: { backgroundColor: '#ca8a041A', textColor: '#ca8a04' },
  danger: { backgroundColor: '#dc26261A', textColor: '#dc2626' },
  info: { backgroundColor: '#2563eb1A', textColor: '#2563eb' },
  neutral: { backgroundColor: '#6B72801A', textColor: '#6B7280' }
}
```

### Progress Bar Variants
```typescript
progress: {
  primary: { backgroundColor: '#ff9328' },
  success: { backgroundColor: '#16a34a' },
  warning: { backgroundColor: '#ca8a04' },
  danger: { backgroundColor: '#dc2626' }
}
```

---

## 🎯 Usage Guidelines

### Color Usage
- **Primary**: Main actions, CTAs, brand elements
- **Secondary**: Secondary actions, links
- **Success**: Positive feedback, completed states
- **Warning**: Caution states, pending actions
- **Error**: Error states, destructive actions
- **Info**: Neutral information, help text

### Typography Hierarchy
1. **H1**: Page titles, hero sections
2. **H2**: Section headers
3. **H3**: Subsection headers
4. **H4**: Component titles
5. **Body**: Main content
6. **Caption**: Metadata, labels

### Spacing Scale
- **xs (4px)**: Tight spacing, icon padding
- **sm (8px)**: Component internal spacing
- **md (12px)**: Default component padding
- **lg (16px)**: Container padding
- **xl (20px)**: Section spacing
- **xxl (24px)**: Large gaps

### Component Guidelines
- **Buttons**: Use primary for main actions, secondary for alternatives
- **Cards**: Use elevated for important content, base for standard content
- **Badges**: Use semantic colors (success, warning, error)
- **Progress Bars**: Use primary for general progress, semantic colors for status

---

## 🌙 Dark Mode Implementation

### Color Mapping
```typescript
// Light → Dark transformations
text.primary: '#111827' → '#F9FAFB'
background.default: '#FFF8F0' → '#0F172A'
background.paper: '#FFFFFF' → '#1E293B'
border.default: '#E5E7EB' → '#334155'
```

### Theme Detection
```typescript
import { useColorScheme } from 'react-native';

// Auto-detect system preference
const colorScheme = useColorScheme(); // 'light' | 'dark' | null

// Manual theme switching
const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
```

### Theme Provider
```typescript
// App.tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

<ThemeProvider>
  <App />
</ThemeProvider>

// Component usage
import { useTheme } from '@/contexts/ThemeContext';

const { theme, isDark } = useTheme();
const colors = isDark ? darkColors : lightColors;
```

---

## 📱 Responsive Design

### Breakpoints (Conceptual)
```typescript
// Mobile-first approach
mobile: { maxWidth: 640px }    // Small phones
tablet: { minWidth: 641px }   // Large phones/tablets
desktop: { minWidth: 1024px } // Desktop (future web version)
```

### Component Scaling
```typescript
// Font sizes scale with screen size
const scale = Dimensions.get('window').width / 375; // Base iPhone width
const responsiveFontSize = baseFontSize * scale;

// Spacing scales proportionally
const responsiveSpacing = baseSpacing * scale;
```

### Touch Targets
- **Minimum**: 44x44px (Apple HIG)
- **Recommended**: 48x48px for better accessibility
- **Large buttons**: 56x56px for primary actions

---

## ♿ Accessibility

### Color Contrast
- **Text on background**: Minimum 4.5:1 ratio (WCAG AA)
- **Large text**: 3:1 ratio for 18pt+ text
- **Interactive elements**: 3:1 ratio minimum

### Touch Accessibility
- **Target size**: Minimum 44x44px
- **Spacing**: 8px minimum between touch targets
- **Feedback**: Haptic feedback for actions

### Screen Reader Support
```typescript
// Accessibility props
<View accessible={true} accessibilityRole="button">
  <Text accessibilityLabel="Login button">Login</Text>
</View>

// Screen reader hints
<Button
  accessibilityHint="Logs you into your account"
  accessibilityRole="button"
/>
```

---

## 🔧 Implementation

### Theme Integration
```typescript
// src/theme/index.ts
export { colors, getColors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { components } from './components';
export { shadows } from './shadows';

// Usage in components
import { colors, spacing, typography } from '@/theme';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
  },
  title: {
    ...typography.styles.h1,
    color: colors.text.primary,
  },
});
```

### Component Theming
```typescript
// CustomButton.tsx
import { useTheme } from '@/contexts/ThemeContext';
import { components } from '@/theme';

const CustomButton = ({ variant = 'primary', children }) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const buttonStyle = [
    components.button[variant].view,
    { backgroundColor: colors.primary } // Theme-aware
  ];
  
  return (
    <TouchableOpacity style={buttonStyle}>
      <Text style={components.button[variant].text}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};
```

---

## 📚 Related Documentation

- **[UI_UX_DOCUMENTATION.md](UI_UX_DOCUMENTATION.md)**: Component implementations
- **[ASSETS.md](ASSETS.md)**: Visual assets and branding
- **[THEME_USAGE.md](../02-development/THEME_USAGE.md)**: Theme implementation guide
- **[GLOSSARY.md](GLOSSARY.md)**: Design system termen
- **[COMPATIBILITY.md](COMPATIBILITY.md)**: Theme compatibiliteit

---

## 🎨 Design Resources

### Figma Libraries (Future)
- Component library met alle variants
- Color palette swatches
- Typography scale
- Spacing grid overlay

### Design Tokens Export
```json
// design-tokens.json
{
  "colors": {
    "primary": { "value": "#ff9328", "type": "color" },
    "spacing": { "sm": { "value": "8px", "type": "spacing" } }
  },
  "typography": {
    "body": {
      "fontFamily": { "value": "Roboto" },
      "fontSize": { "value": "16px" }
    }
  }
}
```

---

**Design System Status**: ✅ Complete
**Last Updated**: 2025-11-03
**Version**: 1.0.0

**DKL Steps App Design System** © 2025 DKL Organization. All rights reserved.