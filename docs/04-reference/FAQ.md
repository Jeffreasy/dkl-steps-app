# FAQ - DKL Steps App

**Version**: 1.0.0
**Date**: 2025-11-03
**Status**: ❓ Complete FAQ Reference

Deze FAQ bevat veelgestelde vragen over de DKL Steps App, georganiseerd per categorie voor snelle navigatie.

## 📋 Overzicht

### Categorieën
- **🔧 Technische Vragen**: Installatie, configuratie, troubleshooting
- **📱 App Gebruik**: Functionaliteit, features, UI/UX
- **👥 Account & Authenticatie**: Login, wachtwoorden, rollen
- **📊 Data & Synchronisatie**: Stappen tracking, offline mode
- **🔒 Beveiliging & Privacy**: Permissions, data opslag
- **🚀 Development**: Voor ontwikkelaars en maintainers

---

## 🔧 Technische Vragen

### Installatie & Setup

**Q: Hoe installeer ik de app op mijn device?**
A: Download de app via de officiële stores:
- **iOS**: App Store zoeken naar "DKL Steps"
- **Android**: Google Play Store zoeken naar "DKL Steps"
- **Development**: Gebruik Expo Go app met QR code van `npm start`

**Q: Waarom werkt de pedometer niet in Expo Go op Android?**
A: Expo Go heeft beperkingen met native device features. Voor volledige functionaliteit:
1. Build een standalone APK via `eas build --platform android`
2. Installeer de APK direct op je device
3. Grant alle vereiste permissions

**Q: Wat zijn de minimum systeemvereisten?**
A:
- **iOS**: 13.0+ (iPhone & iPad)
- **Android**: 6.0+ (API 23+)
- **Device**: Accelerometer/gyroscope voor stappen detectie
- **Netwerk**: HTTPS-ondersteuning vereist

### Configuratie Problemen

**Q: Hoe verander ik de backend URL voor development?**
A: Update `app.json` in de `extra` sectie:
```json
{
  "expo": {
    "extra": {
      "BACKEND_URL": "http://localhost:3000/api"
    }
  }
}
```
Herstart de app volledig na wijziging.

**Q: Waarom krijg ik "Network Error" meldingen?**
A: Mogelijke oorzaken:
1. **Backend offline**: Controleer https://dklemailservice.onrender.com/api/health
2. **Firewall/proxy**: Sommige netwerken blokkeren API calls
3. **VPN**: Schakel VPN uit en probeer opnieuw
4. **Device offline**: Controleer internet verbinding

---

## 📱 App Gebruik

### Basis Functionaliteit

**Q: Hoe werkt stappen tracking?**
A: De app gebruikt je device's pedometer sensor om stappen te detecteren:
- Start automatisch bij app lancering
- Tracks incrementeel (delta's) voor nauwkeurigheid
- Synchroniseert elke 50 stappen of 5 minuten
- Werkt alleen op physical devices (niet emulators)

**Q: Wat betekenen de verschillende dashboards?**
A:
- **Personal Dashboard**: Jouw persoonlijke stappen en voortgang
- **Global Dashboard**: Totale statistieken (alleen Staff/Admin)
- **Digital Board**: Full-screen display voor presentaties
- **Admin Funds**: Route fondsen beheer (alleen Admin)

**Q: Hoe gebruik ik de correctie functie?**
A: Voor het corrigeren van verkeerd getelde stappen:
1. Ga naar Personal Dashboard
2. Klik "Correctie -100" voor 100 stappen aftrek
3. Of gebruik "Sync Nu" voor handmatige synchronisatie
4. Negatieve deltas worden verzonden naar server

### UI/UX Vragen

**Q: Waarom zie ik geen stappen updates?**
A: Controleer:
1. **Permissions**: Zorg dat "Motion & Fitness" permissions zijn verleend
2. **Physical device**: Pedometer werkt niet in simulators
3. **App actief**: Houd app open of in background voor tracking
4. **iOS vs Android**: iOS werkt beter in Expo Go, Android vereist standalone build

**Q: Hoe schakel ik tussen light en dark mode?**
A: De app volgt automatisch je systeem voorkeur:
- **iOS**: Settings > Display & Brightness > Light/Dark
- **Android**: Settings > Display > Theme > Light/Dark
- Geen handmatige toggle beschikbaar (nog)

**Q: Wat zijn de milestone markers (2.5K, 5K, etc.)?**
A: Visuele voortgangsindicatoren voor je stappen doel:
- 2.5K stappen: Eerste milestone
- 5K stappen: Halverwege
- 7.5K stappen: Bijna daar
- 10K stappen: Voltooid doel
Deze verschijnen als badges op je progress bar.

---

## 👥 Account & Authenticatie

### Login Problemen

**Q: Ik ben mijn wachtwoord vergeten, wat nu?**
A: Contacteer de DKL organisatie voor wachtwoord reset. De app heeft geen self-service wachtwoord reset functie.

**Q: Waarom word ik gevraagd mijn wachtwoord te veranderen bij eerste login?**
A: Voor beveiliging moet elk nieuw account het wachtwoord veranderen bij eerste gebruik. Dit is een eenmalige actie.

**Q: Wat zijn de verschillende user rollen?**
A:
- **Deelnemer**: Basis toegang - persoonlijke dashboard en digital board
- **Staff**: Uitgebreide toegang - globale statistieken bekijken
- **Admin**: Volledige toegang - route fondsen beheren

### Account Beheer

**Q: Kan ik mijn account gegevens veranderen?**
A: Nee, account gegevens (naam, email, rol) worden beheerd door DKL organisatie. Neem contact op voor wijzigingen.

**Q: Hoe log ik uit?**
A: Gebruik de "Logout" button in het Personal Dashboard menu. Dit wist alle lokale data en keert terug naar login scherm.

---

## 📊 Data & Synchronisatie

### Offline Functionaliteit

**Q: Wat gebeurt er als ik geen internet heb?**
A: De app gebruikt een offline queue systeem:
- Stappen blijven lokaal opgeslagen
- Zodra verbinding terugkomt, synchroniseert automatisch
- Offline indicator toont aantal wachtende acties
- Geen data verlies bij verbindingsproblemen

**Q: Hoe weet ik of mijn data gesynchroniseerd is?**
A: Controleer de "Laatste sync" timestamp op je dashboard. Groen = recent gesynchroniseerd, rood = sync fout.

### Data Accuracy

**Q: Waarom komen mijn stappen niet overeen met andere apps?**
A: Verschillende apps gebruiken verschillende algoritmes:
- DKL app gebruikt device pedometer voor nauwkeurigheid
- Andere apps kunnen GPS of andere sensors gebruiken
- Focus op consistente tracking binnen dezelfde app

**Q: Kan ik stappen van andere apparaten combineren?**
A: Nee, elke installatie tracks onafhankelijk. Gebruik altijd dezelfde device voor consistente resultaten.

### Data Export

**Q: Kan ik mijn stappen data exporteren?**
A: Momenteel niet beschikbaar. Data wordt centraal opgeslagen door DKL organisatie voor rapportage doeleinden.

---

## 🔒 Beveiliging & Privacy

### Permissions

**Q: Welke permissions heeft de app nodig?**
A:
- **Motion & Fitness** (iOS): Voor pedometer toegang
- **Physical Activity** (Android): Voor bewegingstracking
- **Internet**: Voor data synchronisatie
- **Storage**: Voor offline data persistence

**Q: Is mijn data veilig?**
A: Ja, beveiligingsmaatregelen:
- JWT tokens voor authenticatie
- HTTPS-only communicatie
- Device-encrypted lokale opslag (AsyncStorage)
- Geen data sharing met derde partijen

### Data Opslag

**Q: Waar wordt mijn data opgeslagen?**
A:
- **Lokale data**: Device-encrypted opslag voor offline toegang
- **Server data**: PostgreSQL database bij DKL backend
- **Backup**: Regelmatige backups volgens DKL beleid
- **Retention**: Data bewaard zolang account actief is

**Q: Kan ik mijn data verwijderen?**
A: Neem contact op met DKL organisatie voor account deletion. Alle persoonlijke data wordt permanent verwijderd.

---

## 🚀 Development Vragen

### Voor Ontwikkelaars

**Q: Hoe draai ik de app in development mode?**
A:
```bash
# Install dependencies
npm install

# Start development server
npm start

# Of platform-specifiek
npm run ios    # iOS simulator
npm run android # Android emulator
```

**Q: Hoe voeg ik een nieuwe component toe?**
A: Volg de bestaande structuur:
1. Maak component in `src/components/` of `src/components/ui/`
2. Export in `index.ts`
3. TypeScript interfaces voor props
4. Unit tests in `__tests__/` folder
5. Update documentatie

**Q: Wat is het verschil tussen useQuery en useMutation?**
A:
- **useQuery**: Voor data ophalen (GET requests)
- **useMutation**: Voor data modificatie (POST/PUT/DELETE)
- Queries zijn automatisch cached, mutations trigger invalidation

### Testing

**Q: Hoe schrijf ik tests voor nieuwe features?**
A: Gebruik Jest + React Native Testing Library:
```typescript
// Component test voorbeeld
import { render, fireEvent } from '@testing-library/react-native';

test('button press triggers action', () => {
  const mockFn = jest.fn();
  const { getByText } = render(<MyButton onPress={mockFn} />);
  fireEvent.press(getByText('Press me'));
  expect(mockFn).toHaveBeenCalled();
});
```

**Q: Wat is de test coverage doelstelling?**
A: Minimum 80% voor unit tests, focus op:
- Component rendering
- User interactions
- Error states
- Edge cases

### Deployment

**Q: Hoe bouw ik een productie versie?**
A: Gebruik EAS Build:
```bash
# Install EAS CLI
npm install -g eas-cli

# Configureer project
eas build:configure

# Build voor beide platforms
eas build --platform all --profile production
```

**Q: Hoe publiceer ik updates zonder app store?**
A: Gebruik Expo OTA updates:
```bash
# Publish update naar channel
eas update --channel production --message "Bug fixes"
```

---

## 🔍 Troubleshooting

### Veelvoorkomende Problemen

**Q: App crasht bij opstarten**
A: Probeer:
1. Clear app cache/data in device settings
2. Herinstalleer app
3. Controleer device storage ruimte
4. Update naar laatste OS versie

**Q: Stappen teller werkt niet**
A: Checklist:
1. ✅ Physical device (geen emulator)
2. ✅ Permissions verleend in device settings
3. ✅ App actief op voorgrond
4. ✅ iOS: Settings > Privacy > Motion & Fitness
5. ✅ Android: Settings > Apps > DKL Steps > Permissions

**Q: Login blijft falen**
A: Controleer:
1. Correcte email/wachtwoord combinatie
2. Internet verbinding actief
3. Backend server online (zie status endpoint)
4. Geen speciale karakters in wachtwoord

**Q: Data wordt niet gesynchroniseerd**
A: Troubleshooting:
1. Check "Laatste sync" tijdstip
2. Controleer netwerk verbinding
3. Probeer handmatig sync met "Sync Nu"
4. Check offline queue indicator
5. Herstart app volledig

### Debug Informatie

**Q: Hoe krijg ik debug informatie?**
A: Gebruik de ingebouwde diagnostics:
1. Ga naar Dashboard
2. Klik diagnostics button (indien beschikbaar in dev mode)
3. Check console logs in development
4. Noteer error messages voor support

---

## 📞 Contact & Support

### Waar vind ik hulp?

**Voor gebruikers:**
- Check deze FAQ eerst
- Contact DKL organisatie voor account problemen
- App store reviews voor technische issues

**Voor ontwikkelaars:**
- [DOCUMENTATIE.md](../02-development/DOCUMENTATIE.md) - Technische documentatie
- [API_REFERENCE.md](API_REFERENCE.md) - API details
- GitHub Issues voor bugs/features

**Voor urgente problemen:**
- Development team contact
- Backend status: https://dklemailservice.onrender.com/api/health

### Feature Requests

**Q: Hoe stel ik nieuwe features voor?**
A: Gebruik GitHub Issues met "enhancement" label:
1. Duidelijke titel en beschrijving
2. Use case en voordelen
3. Mockups indien UI gerelateerd
4. Impact assessment

---

## 📚 Related Documentation

- **[DOCUMENTATIE.md](../02-development/DOCUMENTATIE.md)**: Technische handleiding
- **[API_REFERENCE.md](API_REFERENCE.md)**: API documentatie
- **[GLOSSARY.md](GLOSSARY.md)**: Termen en definities
- **[TROUBLESHOOTING.md](../02-development/TROUBLESHOOTING.md)**: Gedetailleerde probleemoplossing
- **[COMPATIBILITY.md](COMPATIBILITY.md)**: Platform-specifieke vragen
- **[CHANGELOG.md](CHANGELOG.md)**: Recente changes

---

**FAQ Status**: ✅ Complete
**Last Updated**: 2025-11-03
**Version**: 1.0.0

**DKL Steps App FAQ** © 2025 DKL Organization. All rights reserved.