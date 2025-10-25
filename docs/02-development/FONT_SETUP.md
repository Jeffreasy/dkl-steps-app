# Roboto Font Setup voor DKL Steps App

## Overzicht
De app gebruikt dezelfde fonts als de DKL website:
- **Roboto Slab** - Voor headings (koppen)
- **Roboto** - Voor body tekst

## Installatie Stappen

### Stap 1: Installeer Font Packages

```bash
# Installeer Expo Google Fonts packages
npx expo install expo-font @expo-google-fonts/roboto @expo-google-fonts/roboto-slab
```

### Stap 2: Update App.tsx

Voeg font loading toe aan je App.tsx:

```typescript
import { useFonts } from 'expo-font';
import {
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import {
  RobotoSlab_300Light,
  RobotoSlab_400Regular,
  RobotoSlab_500Medium,
  RobotoSlab_600SemiBold,
  RobotoSlab_700Bold,
} from '@expo-google-fonts/roboto-slab';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    RobotoSlab_300Light,
    RobotoSlab_400Regular,
    RobotoSlab_500Medium,
    RobotoSlab_600SemiBold,
    RobotoSlab_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // Show splash screen while loading
  }

  return (
    // ... rest van je app
  );
}
```

### Stap 3: Update Typography Theme

Vervang de font families in `src/theme/typography.ts`:

```typescript
export const typography = {
  fonts: {
    heading: 'RobotoSlab_700Bold',  // Was: 'System'
    body: 'Roboto_400Regular',      // Was: 'System'
    mono: 'Courier',
  },
  // ... rest blijft hetzelfde
}
```

### Stap 4: Gebruik in Components

```typescript
import { Text } from 'react-native';
import { typography } from '../theme';

// Voor headings
<Text style={{ fontFamily: typography.fonts.heading }}>
  Heading Text
</Text>

// Voor body text
<Text style={{ fontFamily: typography.fonts.body }}>
  Body Text
</Text>

// Of gebruik de typography styles:
<Text style={typography.styles.h1}>
  H1 Heading
</Text>
```

## Font Weights Overzicht

### Roboto (Body Text)
- **300** - Light
- **400** - Regular (default)
- **500** - Medium
- **700** - Bold

### Roboto Slab (Headings)
- **300** - Light
- **400** - Regular
- **500** - Medium
- **600** - SemiBold
- **700** - Bold (default voor headings)

## Verificatie

Test of fonts correct laden:

```typescript
import { Text, View } from 'react-native';

export function FontTest() {
  return (
    <View>
      <Text style={{ fontFamily: 'RobotoSlab_700Bold', fontSize: 24 }}>
        Roboto Slab Bold - Heading
      </Text>
      <Text style={{ fontFamily: 'Roboto_400Regular', fontSize: 16 }}>
        Roboto Regular - Body Text
      </Text>
    </View>
  );
}
```

## Troubleshooting

### Fonts laden niet
1. Clear Metro bundler cache:
   ```bash
   expo start --clear
   ```

2. Verwijder node_modules en herinstalleer:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. Check of fonts correct geïmporteerd zijn in App.tsx

### "fontFamily not found" error
- Zorg dat de exacte font naam gebruikt wordt (case-sensitive)
- Check of useFonts() succesvol is (fontsLoaded === true)
- Gebruik de namen precies zoals in de @expo-google-fonts packages

### Fonts zien er vreemd uit
- Check of je de juiste weight gebruikt (bijv. 400 vs 700)
- Verifieer dat fontSize correct is ingesteld
- Test op een physical device (niet alleen simulator)

## Performance Tips

1. **Preload fonts** - Gebruik SplashScreen om fonts te laden voor UI toont
2. **Gebruik system fonts als fallback** tijdens laden
3. **Cache fonts** - Expo doet dit automatisch na eerste download

## Alternatief: Gebruik System Fonts

Als je problemen hebt met font loading, kun je tijdelijk system fonts gebruiken:

```typescript
// iOS
fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'

// Android heeft Roboto built-in
fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System'
```

## Resources

- [Expo Google Fonts](https://github.com/expo/google-fonts)
- [Expo Font Documentation](https://docs.expo.dev/develop/user-interface/fonts/)
- [Google Fonts - Roboto](https://fonts.google.com/specimen/Roboto)
- [Google Fonts - Roboto Slab](https://fonts.google.com/specimen/Roboto+Slab)