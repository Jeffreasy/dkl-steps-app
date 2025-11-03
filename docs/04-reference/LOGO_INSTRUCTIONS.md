# DKL Logo Instructies

## Logo URL
https://res.cloudinary.com/dgfuv7wif/image/upload/v1748030388/DKLLogoV1_kx60i9.webp

## Benodigde Acties

### 1. Download het logo
Download het DKL logo van bovenstaande URL en sla het op als:
```
assets/dkl-logo.webp
```

### 2. Optioneel: Converteer naar PNG
Voor betere compatibiliteit met React Native, converteer het logo ook naar PNG:
```
assets/dkl-logo.png
```

### 3. Gebruik in de app

```typescript
import { Image } from 'react-native';

// In je component:
<Image
  source={require('../assets/dkl-logo.png')}
  style={{ width: 200, height: 60 }}
  resizeMode="contain"
/>
```

## Logo Specificaties

- **Formaat**: WebP (origineel) / PNG (geconverteerd)
- **Gebruik**: Login screen, splash screen, headers
- **Aspect ratio**: Behoud altijd de originele verhoudingen
- **ResizeMode**: Gebruik "contain" voor beste resultaat

## Locaties waar logo gebruikt wordt

1. **LoginScreen** - Hoofd logo boven het formulier
2. **SplashScreen** - Optioneel tijdens app laden
3. **Dashboard Header** - Klein logo in navigation bar (optioneel)
4. **Digital Board** - Groot logo voor presentaties

## Verwante Documentatie

- **[ASSETS.md](ASSETS.md)**: Uitgebreide asset instructies
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)**: Logo gebruik in design system
- **[UI_UX_DOCUMENTATION.md](UI_UX_DOCUMENTATION.md)**: DKLLogo component details

## Download & Conversie Opties

### Optie 1: Handmatig
1. Open de URL in browser
2. Rechtermuisklik → "Opslaan als..."
3. Sla op in assets/ folder

### Optie 2: Via command line (macOS/Linux)
```bash
curl -o assets/dkl-logo.webp https://res.cloudinary.com/dgfuv7wif/image/upload/v1748030388/DKLLogoV1_kx60i9.webp
```

### Optie 3: PowerShell (Windows)
```powershell
Invoke-WebRequest -Uri "https://res.cloudinary.com/dgfuv7wif/image/upload/v1748030388/DKLLogoV1_kx60i9.webp" -OutFile "assets/dkl-logo.webp"
```

## Conversie naar PNG (indien nodig)

Gebruik een online tool of ImageMagick:
```bash
convert assets/dkl-logo.webp assets/dkl-logo.png
```

Of gebruik: https://convertio.co/webp-png/