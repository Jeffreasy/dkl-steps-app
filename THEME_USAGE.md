# DKL Theme System - Usage Guide

## 📚 Overzicht

Het DKL Steps App theme systeem is volledig geïmplementeerd en klaar voor gebruik. Dit document legt uit hoe je het theme systeem gebruikt in je componenten.

## 🎨 Wat is geïmplementeerd?

### ✅ Complete Theme Structuur
```
src/theme/
├── colors.ts          # DKL brand kleuren (#ff9328 oranje)
├── typography.ts      # Roboto + Roboto Slab fonts
├── spacing.ts         # 4px grid systeem
├── shadows.ts         # Platform-aware shadows
├── components.ts      # Herbruikbare component styles
└── index.ts          # Centrale export
```

### ✅ Gerefactorde Screens
- ✅ **App.tsx** - Font loading met splash screen
- ✅ **LoginScreen** - Volledig gestyled met theme
- ✅ **DashboardScreen** - 464 lijnen → theme-based
- ✅ **GlobalDashboardScreen** - 264 lijnen → theme-based
- ✅ **StepCounter** - Component met theme

### ✅ Font Loading
- Roboto (300, 400, 500, 700)
- Roboto Slab (300, 400, 500, 600, 700)
- Automatisch laden met splash screen

## 📖 Hoe te gebruiken

### 1. Import het Theme

```typescript
import { colors, typography, spacing, shadows, components } from '../theme';
```

### 2. Gebruik Theme in Styles

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default, // Was: '#f5f5f5'
    padding: spacing.lg,                        // Was: padding: 20
  },
  
  title: {
    ...typography.styles.h1,                    // Was: fontSize: 32, fontWeight: 'bold'
    fontFamily: typography.fonts.heading,       // Roboto Slab Bold
    color: colors.text.primary,                 // Was: '#333'
  },
  
  card: {
    ...components.card.elevated,                // Was: backgroundColor, borderRadius, shadow props
    margin: spacing.lg,                         // Was: margin: 15
  },
  
  button: {
    ...components.button.primary.view,          // Complete button styling
  },
  
  buttonText: {
    ...components.button.primary.text,          // Button text styling
    fontFamily: typography.fonts.bodyBold,      // Roboto Bold
  },
});
```

### 3. Color System

```typescript
// Primary (DKL Oranje)
colors.primary           // #ff9328
colors.primaryDark       // #e67f1c
colors.primaryLight      // #ffad5c

// Secondary (Blauw)
colors.secondary         // #2563eb
colors.secondaryDark     // #1d4ed8
colors.secondaryLight    // #3b82f6

// Status Colors
colors.status.success    // #16a34a (groen)
colors.status.warning    // #ca8a04 (geel)
colors.status.error      // #dc2626 (rood)
colors.status.info       // #2563eb (blauw)

// Text Colors
colors.text.primary      // #111827 (donkergrijs)
colors.text.secondary    // #6B7280 (middengrijs)
colors.text.disabled     // #9CA3AF (lichtgrijs)
colors.text.inverse      // #FFFFFF (wit)

// Backgrounds
colors.background.default    // #F9FAFB
colors.background.paper      // #FFFFFF
colors.background.gray50     // #F9FAFB
colors.background.gray100    // #F3F4F6
colors.background.gray200    // #E5E7EB

// Borders
colors.border.default    // #E5E7EB
```

### 4. Typography

```typescript
// Heading Styles (Roboto Slab)
typography.styles.h1     // 32px, bold
typography.styles.h2     // 28px, bold
typography.styles.h3     // 24px, semibold
typography.styles.h4     // 20px, semibold
typography.styles.h5     // 18px, medium
typography.styles.h6     // 16px, medium

// Body Styles (Roboto)
typography.styles.body           // 16px, regular
typography.styles.bodyLarge      // 18px, regular
typography.styles.bodySmall      // 14px, regular

// Special Styles
typography.styles.caption        // 12px, regular
typography.styles.label          // 14px, medium
typography.styles.button         // 16px, semibold

// Font Families
typography.fonts.heading         // RobotoSlab_700Bold
typography.fonts.headingBold     // RobotoSlab_700Bold
typography.fonts.headingMedium   // RobotoSlab_500Medium
typography.fonts.body            // Roboto_400Regular
typography.fonts.bodyBold        // Roboto_700Bold
typography.fonts.bodyMedium      // Roboto_500Medium
```

### 5. Spacing

```typescript
// Named Spacing
spacing.xs      // 4px
spacing.sm      // 8px
spacing.md      // 12px
spacing.lg      // 16px
spacing.xl      // 20px
spacing.xxl     // 24px
spacing.xxxl    // 32px

// Border Radius
spacing.radius.sm        // 4px
spacing.radius.default   // 8px
spacing.radius.md        // 10px
spacing.radius.lg        // 12px
spacing.radius.xl        // 16px
spacing.radius.full      // 9999px (circle)
```

### 6. Shadows

```typescript
// Basic Shadows (platform-aware)
shadows.sm      // Small shadow
shadows.md      // Medium shadow
shadows.lg      // Large shadow
shadows.xl      // Extra large shadow

// Colored Shadows
shadows.primary     // Primary color shadow
shadows.secondary   // Secondary color shadow

// Usage
const styles = StyleSheet.create({
  card: {
    ...shadows.md,  // Automatisch iOS/Android compatible
  },
});
```

### 7. Component Styles

```typescript
// Buttons
components.button.primary      // Oranje button
components.button.secondary    // Blauw button
components.button.outline      // Outline button
components.button.ghost        // Transparant button
components.button.danger       // Rood button
components.button.disabled     // Disabled state

// Cards
components.card.base           // Basic card
components.card.elevated       // Card met shadow
components.card.bordered       // Card met border
components.card.interactive    // Touchable card

// Inputs
components.input.base          // Basic input
components.input.focused       // Focused state
components.input.error         // Error state
components.input.disabled      // Disabled state

// Progress Bars
components.progress.container  // Progress container
components.progress.bar        // Progress bar
components.progress.barSuccess // Success variant
components.progress.barWarning // Warning variant

// Badges
components.badge.base          // Basic badge
components.badge.primary       // Primary badge
components.badge.success       // Success badge
components.badge.warning       // Warning badge

// Dividers
components.divider.horizontal  // Horizontal line
components.divider.vertical    // Vertical line
```

## 🔧 Best Practices

### 1. Altijd Theme Gebruiken
```typescript
// ❌ NIET DOEN
backgroundColor: '#4CAF50'
fontSize: 16
padding: 20

// ✅ WEL DOEN
backgroundColor: colors.primary
...typography.styles.body
padding: spacing.lg
```

### 2. Font Families Toepassen
```typescript
// ❌ NIET DOEN
<Text style={{ fontSize: 24, fontWeight: 'bold' }}>
  Title
</Text>

// ✅ WEL DOEN
<Text style={[
  typography.styles.h3,
  { fontFamily: typography.fonts.heading }
]}>
  Title
</Text>
```

### 3. Component Styles Hergebruiken
```typescript
// ❌ NIET DOEN - Duplicatie
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff9328',
    padding: 12,
    borderRadius: 8,
    // ... etc
  },
});

// ✅ WEL DOEN - Hergebruik
const styles = StyleSheet.create({
  button: {
    ...components.button.primary.view,
  },
  buttonText: {
    ...components.button.primary.text,
    fontFamily: typography.fonts.bodyBold,
  },
});
```

### 4. Platform-Aware Styling
```typescript
// ❌ NIET DOEN - Manual platform check
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
elevation: Platform.OS === 'android' ? 3 : 0,

// ✅ WEL DOEN - Theme handelt het af
...shadows.md
```

## 📊 Vergelijking: Voor vs Na

### Voor Theme System
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    margin: 15,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

### Na Theme System
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    padding: spacing.lg,
  },
  title: {
    ...typography.styles.h1,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  card: {
    ...components.card.elevated,
    margin: spacing.lg,
  },
  button: {
    ...components.button.primary.view,
  },
  buttonText: {
    ...components.button.primary.text,
    fontFamily: typography.fonts.bodyBold,
  },
});
```

**Resultaat:**
- ✅ **-60% minder code**
- ✅ **Consistent design**
- ✅ **Makkelijk te onderhouden**
- ✅ **Type-safe met TypeScript**

## 🎯 Nog Te Doen

1. **Logo Toevoegen** - Volg `assets/LOGO_INSTRUCTIONS.md`
2. **Andere Screens** - AdminFundsScreen, ChangePasswordScreen, DigitalBoardScreen
3. **Testen** - Test de app op device/emulator

## 💡 Tips

1. **Code Reuse** - Gebruik `components.ts` voor herhalende patterns
2. **Consistency** - Gebruik altijd theme variabelen, nooit hardcoded values
3. **Performance** - Theme imports worden geoptimaliseerd door bundler
4. **Type Safety** - TypeScript helpt met autocomplete en type checking

## 📞 Hulp Nodig?

- Check `FONT_SETUP.md` voor font problemen
- Check `assets/LOGO_INSTRUCTIONS.md` voor logo setup
- Check de gerefactorde screens als voorbeeld

## 🚀 Next Steps

1. Download logo (zie `assets/LOGO_INSTRUCTIONS.md`)
2. Test de app: `npm start`
3. Refactor remaining screens indien nodig
4. Geniet van je professional styled app! 🎉