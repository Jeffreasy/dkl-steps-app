# Assets Reference - DKL Steps App

**Version**: 1.0.0
**Date**: 2025-11-03
**Status**: 🎨 Complete Asset Documentation

Deze documentatie beschrijft alle assets gebruikt in de DKL Steps App, inclusief logo's, iconen, afbeeldingen en hun gebruiksrichtlijnen.

## 📋 Overzicht

### Asset Types
- **Logo**: DKL merkidentiteit
- **Icons**: App iconen en adaptive icons
- **Splash Screen**: Opstartscherm assets
- **UI Assets**: Component-specifieke afbeeldingen

### Asset Locaties
- **Source**: `assets/` directory
- **Platform-specific**: `android/app/src/main/res/` en `ios/`
- **Documentation**: `docs/04-reference/`

---

## 🏷️ Logo Assets

### DKL Logo (Hoofdlogo)
**Bestand**: `assets/dkl-logo.webp` (origineel) / `assets/dkl-logo.png` (geconverteerd)

**Specificaties**:
- **Formaat**: WebP (origineel), PNG (geconverteerd)
- **Afmetingen**: Variabel (responsive)
- **Gebruik**: Login screen, headers, Digital Board
- **Aspect Ratio**: Behoud originele verhoudingen
- **ResizeMode**: `contain` voor beste kwaliteit

**Download URL**:
```
https://res.cloudinary.com/dgfuv7wif/image/upload/v1748030388/DKLLogoV1_kx60i9.webp
```

**Implementatie**:
```typescript
import { Image } from 'react-native';

// Basis gebruik
<Image
  source={require('../assets/dkl-logo.png')}
  style={{ width: 200, height: 60 }}
  resizeMode="contain"
/>

// In componenten
import DKLLogo from '@/components/ui/DKLLogo';
<DKLLogo size="large" /> // 280x100
<DKLLogo size="medium" /> // 240x75 (default)
<DKLLogo size="small" /> // 120x40
```

---

## 📱 App Icons

### iOS App Icon
**Locatie**: `ios/DKLStepsApp/Images.xcassets/AppIcon.appiconset/`

**Icon Set**:
- `Icon-App-20x20@2x.png` (40x40px) - iPhone Notification
- `Icon-App-20x20@3x.png` (60x60px) - iPhone Notification
- `Icon-App-29x29@2x.png` (58x58px) - iPhone Settings
- `Icon-App-29x29@3x.png` (87x87px) - iPhone Settings
- `Icon-App-40x40@2x.png` (80x80px) - iPhone Spotlight
- `Icon-App-40x40@3x.png` (120x120px) - iPhone Spotlight
- `Icon-App-60x60@2x.png` (120x120px) - iPhone App
- `Icon-App-60x60@3x.png` (180x180px) - iPhone App
- `Icon-App-76x76@2x.png` (152x152px) - iPad App
- `Icon-App-83.5x83.5@2x.png` (167x167px) - iPad Pro

### Android App Icon
**Locatie**: `android/app/src/main/res/`

**Icon Set**:
- `mipmap-mdpi/ic_launcher.png` (48x48px)
- `mipmap-hdpi/ic_launcher.png` (72x72px)
- `mipmap-xhdpi/ic_launcher.png` (96x96px)
- `mipmap-xxhdpi/ic_launcher.png` (144x144px)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192px)

### Android Adaptive Icon
**Locatie**: `android/app/src/main/res/`

**Bestanden**:
- `mipmap-mdpi/ic_launcher_foreground.webp` (108x108px)
- `mipmap-hdpi/ic_launcher_foreground.webp` (162x162px)
- `mipmap-xhdpi/ic_launcher_foreground.webp` (216x216px)
- `mipmap-xxhdpi/ic_launcher_foreground.webp` (324x324px)
- `mipmap-xxxhdpi/ic_launcher_foreground.webp` (432x432px)

**Background**: `mipmap-anydpi-v26/ic_launcher_background.xml`

---

## 🌊 Splash Screen Assets

### iOS Splash Screen
**Locatie**: `ios/DKLStepsApp/Images.xcassets/SplashScreen.imageset/`

**Bestanden**:
- `SplashScreen.png` (1242x2436px) - iPhone X/XS/11 Pro
- `SplashScreen@2x.png` (750x1334px) - iPhone 8/7/6s/6
- `SplashScreen@3x.png` (1242x2208px) - iPhone X/XS/11 Pro

### Android Splash Screen
**Locatie**: `android/app/src/main/res/drawable-*/`

**Bestanden**:
- `splashscreen_logo.png` (hdpi, mdpi, xhdpi, xxhdpi, xxxhdpi)

**Configuratie**: `android/app/src/main/res/values/styles.xml`

---

## 🎨 UI Component Assets

### Empty State Icons
**Gebruik**: Wanneer geen data beschikbaar is

```typescript
// Implementatie in EmptyState component
<EmptyState
  icon="📭"
  title="Geen berichten"
  description="Je hebt nog geen berichten ontvangen"
/>
```

### Loading Skeletons
**Gebruik**: Tijdens data fetching

```typescript
// Implementatie in Skeleton componenten
<CardSkeleton />
<ListItemSkeleton />
<ProgressCardSkeleton />
```

### Badge Icons
**Gebruik**: Status indicators

```typescript
// Implementatie in Badge component
<Badge label="New" variant="primary" />
<Badge label="Active" variant="success" />
```

---

## 🛠️ Asset Management

### Toevoegen van Nieuwe Assets

#### 1. Plaats in assets/ folder
```
assets/
├── new-icon.png
├── background-image.jpg
└── illustration.svg
```

#### 2. Import in componenten
```typescript
// Statische assets
import NewIcon from '../assets/new-icon.png';

// Remote assets (niet aanbevolen voor productie)
<Image source={{ uri: 'https://example.com/image.jpg' }} />
```

#### 3. Expo Asset Optimization
```typescript
// Preload kritieke assets
import { Asset } from 'expo-asset';

Asset.loadAsync([
  require('../assets/dkl-logo.png'),
  require('../assets/icon.png'),
]);
```

### Asset Optimalisatie

#### Compressie
```bash
# Image compressie (gebruik tools als ImageOptim of TinyPNG)
# Target: < 100KB per asset voor mobiele apps

# Voor PNG/WebP conversie
convert input.jpg -quality 80 output.webp
```

#### Format Keuze
- **Icons**: PNG (transparantie support)
- **Foto's**: WebP (betere compressie)
- **Illustraties**: SVG (vector, scalable)

#### Grootte Limits
- **App Icon**: Max 1024x1024px (iOS), 512x512px (Android)
- **Splash Screen**: Device-specifieke resoluties
- **Inline Images**: Max 200KB per asset

---

## 📱 Platform-Specific Requirements

### iOS Asset Requirements
- **Icons**: Alle formaten vereist voor App Store submission
- **Splash Screens**: Storyboard of image assets
- **Naming**: Consistent naming convention
- **Resolution**: @2x/@3x voor retina displays

### Android Asset Requirements
- **Adaptive Icons**: API 26+ (Android 8.0+)
- **Foreground/Background**: Separatie voor adaptive icons
- **Density Buckets**: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi
- **Vector Drawables**: XML-based voor scalable icons

---

## 🔧 Asset Tools & Commands

### Download Logo
```bash
# Via curl
curl -o assets/dkl-logo.webp https://res.cloudinary.com/dgfuv7wif/image/upload/v1748030388/DKLLogoV1_kx60i9.webp

# Via PowerShell (Windows)
Invoke-WebRequest -Uri "https://res.cloudinary.com/dgfuv7wif/image/upload/v1748030388/DKLLogoV1_kx60i9.webp" -OutFile "assets/dkl-logo.webp"
```

### Image Conversion
```bash
# WebP naar PNG
convert assets/dkl-logo.webp assets/dkl-logo.png

# Resize voor verschillende densities
convert assets/icon.png -resize 192x192 assets/icon-xxxhdpi.png
```

### Expo Asset Commands
```bash
# Prebuild assets
npx expo prebuild

# Clear asset cache
npx expo start --clear

# Bundle assets
npx expo export
```

---

## 📊 Asset Inventory

### Huidige Assets

| Asset | Locatie | Grootte | Gebruik |
|-------|---------|---------|---------|
| `dkl-logo.webp` | `assets/` | ~15KB | Logo component |
| `dkl-logo.png` | `assets/` | ~25KB | Fallback logo |
| `icon.png` | `assets/` | ~8KB | App icon base |
| `adaptive-icon.png` | `assets/` | ~12KB | Android adaptive |
| `splash-icon.png` | `assets/` | ~10KB | Splash screen |

### Asset Dependencies

```json
// package.json relevante dependencies
{
  "expo": "~54.0.20",
  "@expo-google-fonts/roboto": "0.2.3",
  "@expo-google-fonts/roboto-slab": "0.2.3"
}
```

---

## 🚨 Troubleshooting

### Common Asset Issues

#### Logo niet zichtbaar
```typescript
// Check import path
import logo from '../assets/dkl-logo.png'; // Correct path?

// Check if file exists
console.log('Logo exists:', !!logo);

// Check styling
<Image source={logo} style={{ width: 200, height: 60 }} />
```

#### Icon niet bijgewerkt
```bash
# Clear Expo cache
expo start --clear

# Rebuild native apps
expo prebuild --clean
```

#### Splash screen problemen
```typescript
// Check app.json splash configuration
{
  "splash": {
    "image": "./assets/splash-icon.png",
    "resizeMode": "contain",
    "backgroundColor": "#ffffff"
  }
}
```

---

## 📚 Related Documentation

- **[LOGO_INSTRUCTIONS.md](LOGO_INSTRUCTIONS.md)**: Gedetailleerde logo instructies
- **[UI_UX_DOCUMENTATION.md](UI_UX_DOCUMENTATION.md)**: UI componenten die assets gebruiken
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)**: Design tokens en kleuren
- **[COMPATIBILITY.md](COMPATIBILITY.md)**: Platform-specifieke asset vereisten
- **[GLOSSARY.md](GLOSSARY.md)**: Asset gerelateerde termen

---

## 🔗 Quick Links

- **Asset Folder**: [`../../assets/`](../../assets/)
- **Android Assets**: [`../../android/app/src/main/res/`](../../android/app/src/main/res/)
- **iOS Assets**: [`../../ios/DKLStepsApp/Images.xcassets/`](../../ios/DKLStepsApp/Images.xcassets/)

---

**Assets Reference Status**: ✅ Complete
**Last Updated**: 2025-11-03
**Version**: 1.0.0

**DKL Steps App Assets** © 2025 DKL Organization. All rights reserved.