# DKL Steps Mobile App - Getting Started

Een mobiele applicatie voor het tracken van stappen voor de DKL Steps challenge. Deze app integreert met de DKL backend API en biedt functionaliteit voor deelnemers, staff en admins.

## 📚 Documentation Navigation

- **[DKL Steps App Overview](DKL_STEPS_APP_OVERVIEW.md)** - Comprehensive project overview, architecture, and implementation details
- **[Quick Start Guide](QUICKSTART.md)** - 5-minute quickstart for immediate testing
- **[Development Guide](../02-development/DOCUMENTATIE.md)** - Technical details for developers
- **[Deployment Guide](../03-deployment/BETA_DEPLOYMENT.md)** - Build and release instructions
- **[Theme Usage](../02-development/THEME_USAGE.md)** - UI theming and customization
- **[Font Setup](../02-development/FONT_SETUP.md)** - Font installation and troubleshooting
- **[Testing Guide](../08-testing/COMPLETE_TESTING_GUIDE.md)** - Complete testing strategies
- **[Optimization Reports](../07-optimization/)** - Performance analysis and improvements

### Gerelateerde Documentatie Folders

- **[02-development](../02-development/)** - Voor ontwikkelaars: technische details, theming, fonts
- **[03-deployment](../03-deployment/)** - Voor deployment: build strategieën en releases
- **[04-reference](../04-reference/)** - Referentie materialen: changelog, logo instructies
- **[05-reports](../05-reports/)** - Project rapporten: implementatie samenvattingen
- **[07-optimization](../07-optimization/)** - Optimalisatie: code reviews en performance analyses
- **[08-testing](../08-testing/)** - Testing: complete test gidsen en strategieën

## 🎯 Features

- **Stappen Tracking**: Real-time stappen tellen met pedometer
- **Delta Updates**: Positieve en negatieve stappen correcties
- **Persoonlijk Dashboard**: Bekijk je voortgang, route en toegewezen fondsen
- **Globaal Dashboard**: Voor Admin/Staff - totaal stappen en fondsen distributie
- **Digitaal Bord**: Live display van totaal stappen (updates elke 10 seconden)
- **Admin Beheer**: CRUD operaties voor route fondsen configuratie
- **Event Management**: Admin interface voor event & geofence beheer
- **Offline Support**: Queue systeem voor offline stappen sync
- **RBAC**: Role-based access control (Deelnemer, Staff, Admin)

## 📋 Prerequisites

- **Node.js** 18+ geïnstalleerd
- **Expo CLI** geïnstalleerd globaal: `npm install -g expo-cli`
- **Expo Go** app op je telefoon (voor development)
- **Android Studio** of **Xcode** (voor emulators, optioneel)
- **Backend API**: Toegang tot https://dklemailservice.onrender.com/api
- **Test Account**: Registreer via de DKL website voor credentials

## 🚀 Installation

### 1. Clone/Navigate to Project

```bash
cd dkl-steps-app
```

### 2. Install Dependencies

**Alle dependencies installeren:**

```bash
npm install
```

**Of handmatig met specifieke versies:**

**Expo Dependencies:**
```bash
expo install @react-navigation/native@^6.1.9 @react-navigation/native-stack@^6.9.17 expo-sensors@^13.0.0 @react-native-async-storage/async-storage@^1.21.0 expo-constants@^16.0.2 @react-native-community/netinfo@^11.3.1
```

**NPM Dependencies:**
```bash
npm install @tanstack/react-query@^5.17.15 jwt-decode@^4.0.0
```

### 3. Environment Setup

**Stap-voor-stap .env.local aanmaken:**

1. Kopieer `.env.example` naar `.env.local` (als deze bestaat):
   ```bash
   cp .env.example .env.local
   ```

2. Of maak handmatig `.env.local` aan met de volgende inhoud:

   ```env
   # Local Development Environment
   BACKEND_URL=https://dklemailservice.onrender.com/api

   # Feature Flags (verplicht)
   ENABLE_GEOFENCING=true
   ENABLE_WEBSOCKET=true
   ENABLE_LOGGING=true

   # Development Settings (optioneel)
   LOG_LEVEL=debug
   ```

**Belangrijke variabelen uitleg:**
- `BACKEND_URL`: Verplicht - URL naar DKL backend API
- `ENABLE_GEOFENCING`: Verplicht - Activeert GPS-gebaseerde tracking binnen events
- `ENABLE_WEBSOCKET`: Verplicht - Live updates van server
- `ENABLE_LOGGING`: Optioneel - Gedetailleerde logging voor debugging
- `LOG_LEVEL`: Optioneel - `debug`, `info`, `warn`, `error`

### 4. Platform-Specific Setup

#### iOS Setup (macOS only)
1. **Xcode Installatie**: Zorg dat Xcode 15+ geïnstalleerd is
2. **Command Line Tools**: `xcode-select --install`
3. **iOS Simulator**: Via Xcode > Preferences > Components
4. **Permissions in Info.plist**: Voeg toe aan `ios/dkl-steps-app/Info.plist`:
   ```xml
   <key>NSMotionUsageDescription</key>
   <string>Deze app gebruikt bewegingssensoren om stappen te tellen tijdens DKL events.</string>
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>Locatie toegang nodig voor geofencing tijdens events.</string>
   <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
   <string>Achtergrond locatie toegang voor continue geofence monitoring.</string>
   ```

#### Android Setup
1. **Android Studio**: Installeer Android Studio met SDK 34+
2. **Environment Variables**: Voeg toe aan `~/.bashrc` of `~/.zshrc`:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
3. **Android Emulator**: Maak AVD aan via Android Studio
4. **Permissions in AndroidManifest.xml**: Controleer `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
   ```

### 5. Package.json Snippet voor Reproduceerbaarheid

Voor volledige reproduceerbaarheid, zorg dat je `package.json` deze dependencies bevat:

```json
{
  "dependencies": {
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@react-native-community/netinfo": "^11.3.1",
    "@tanstack/react-query": "^5.17.15",
    "expo": "~51.0.0",
    "expo-constants": "~16.0.2",
    "expo-sensors": "~13.0.0",
    "jwt-decode": "^4.0.0",
    "react": "18.2.0",
    "react-native": "0.74.0"
  }
}
```
### 4. Run the App

**Start Development Server:**
```bash
expo start
```

**Opties:**
- Press `a` - Open in Android emulator
- Press `i` - Open in iOS simulator (macOS only)
- Scan QR code met **Expo Go** app op je telefoon

## 📱 Testing & Example Usage

### Demo Screenshots

#### Login Screen
![Login Screen](https://via.placeholder.com/300x600/FF6B35/FFFFFF?text=Login+Screen)
*Gebruikers authenticatie met JWT tokens*

#### Personal Dashboard
![Personal Dashboard](https://via.placeholder.com/300x600/FF8F65/FFFFFF?text=Personal+Dashboard)
*Persoonlijke voortgang met real-time stappen tracking*

#### Global Dashboard (Admin/Staff)
![Global Dashboard](https://via.placeholder.com/300x600/FFA07A/FFFFFF?text=Global+Dashboard)
*Community totaal en fondsen distributie*

#### Digital Board
![Digital Board](https://via.placeholder.com/600x400/FFB088/FFFFFF?text=Digital+Board)
*Live display voor events (updates elke 10 seconden)*

### Registratie Instructies

**Stap 1: Registreer via DKL Website**
- Ga naar: https://www.dekoninklijkeloop.nl/aanmelden
- Vul het registratieformulier in
- Kies je rol: Deelnemer, Staff, of Admin
- Ontvang bevestigingsemail met credentials

**Stap 2: Eerste Login in App**
- Open DKL Steps App
- Gebruik email en wachtwoord van registratie
- App slaat JWT token veilig op voor toekomstige sessies

### Minimale Test Flow

1. **Login Screen**
    - Login met test credentials
    - Controleer JWT token opslag in AsyncStorage

2. **Dashboard Screen**
    - Bekijk persoonlijke stats (stappen, route, fondsen)
    - Test StepCounter component (loop rond)
    - Test "Sync Nu" button
    - Test "Correctie -100" button

3. **Global Dashboard** (Staff/Admin only)
    - Navigeer via Dashboard
    - Controleer totaal stappen 2025
    - Bekijk fondsen distributie per route

4. **Digital Board**
    - Navigeer via Dashboard
    - Bekijk live totaal (update elke 10 sec)
    - Geschikt voor groot scherm display

5. **Admin Funds** (Admin only)
    - Navigeer via Global Dashboard
    - CRUD operaties testen:
      - Create: Nieuwe route toevoegen
      - Read: Lijst bekijken
      - Update: +10/-10 buttons
      - Delete: Route verwijderen

### Permissions Testing

**Android:**
```bash
# Request activity recognition permission on first use
# Settings > Apps > DKL Steps > Permissions
```

**iOS:**
```bash
# Motion usage permission dialog appears automatically
```

### Offline Testing

1. Enable airplane mode
2. Loop en verzamel stappen
3. Click "Sync Nu" - stappen worden gequeued
4. Disable airplane mode
5. Stappen synced automatisch

## 🔑 API Endpoints Used

```
POST   /api/login                           # Authentication
GET    /api/participant/:id/dashboard       # Personal stats
POST   /api/steps/:id                       # Delta update
GET    /api/total-steps?year=2025          # Global total
GET    /api/funds-distribution              # Funds per route
GET    /api/steps/admin/route-funds        # Admin: List routes
POST   /api/steps/admin/route-funds        # Admin: Create route
PUT    /api/steps/admin/route-funds/:route # Admin: Update route
DELETE /api/steps/admin/route-funds/:route # Admin: Delete route
GET    /api/events                         # List all events
GET    /api/events/active                  # Get active event
POST   /api/events                         # Create event
PUT    /api/events/:id                     # Update event
DELETE /api/events/:id                     # Delete event
```

## 🛠️ Troubleshooting

### TypeScript Errors (Dependencies not found)

De TypeScript errors voor missing modules zijn normaal voor development. Run de install commands hierboven.

### Pedometer Not Available

- Test op **fysiek device** (niet emulator)
- Controleer permissions in device settings
- iOS: Check `Info.plist` voor `NSMotionUsageDescription`
- Android: Check `AndroidManifest.xml` voor `ACTIVITY_RECOGNITION`

### JWT Decode Error

```bash
npm install jwt-decode
# Of gebruik legacy import:
# import jwtDecode from 'jwt-decode'
```

### Network Errors

- Controleer backend URL in `.env.local`
- Test API met Postman: `GET https://dklemailservice.onrender.com/api/total-steps?year=2025`
- Voeg `X-Test-Mode: true` header toe voor development
- Check feature flags: `ENABLE_WEBSOCKET=true`, `ENABLE_GEOFENCING=true`

### Login 401/403 Errors

- Gebruik geldige credentials van DKL website
- Check JWT expiration (implement refresh token indien nodig)
- Verify user role voor restricted endpoints

### Edge Cases & Feature Flags

**Wat als permissions geweigerd worden?**
- Android: Ga naar Settings > Apps > DKL Steps > Permissions > Enable "Physical activity"
- iOS: Ga naar Settings > Privacy & Security > Motion & Fitness > Enable voor DKL Steps
- Herstart app na permission wijziging

**Hoe reset je AsyncStorage voor JWT issues?**
```bash
# In development console (druk 'd' in terminal):
AsyncStorage.clear()
# Of herinstalleer app volledig
```

**Feature Flags Uitleg:**
- `ENABLE_GEOFENCING=false`: Valt terug op always-on tracking (batterij intensiever)
- `ENABLE_WEBSOCKET=false`: Gebruikt alleen polling (hogere latency)
- `ENABLE_LOGGING=false`: Minimal logging (minder debug info)

**Queue Stats Controleren:**
```javascript
// In development console:
import { getQueueStats } from './src/services/stepQueue';
getQueueStats().then(stats => console.log(stats));
```

**Geofence Debugging:**
- Controleer of er een actief event is in Event Management
- Test GPS nauwkeurigheid in buitenomgeving
- Check `ENABLE_GEOFENCING=true` in .env.local

## 📁 Project Structure

```
dkl-steps-app/
├── App.tsx                          # Main navigation setup
├── app.json                         # Expo configuration
├── .env.local                       # Environment variables (local)
├── src/
│   ├── services/
│   │   └── api.ts                   # API helper with error handling
│   ├── components/
│   │   ├── StepCounter.tsx          # Steps tracking component
│   │   ├── ui/                      # Reusable UI components
│   │   ├── dashboard/               # Dashboard-specific components
│   │   ├── globaldashboard/         # Global dashboard components
│   │   ├── digitalboard/            # Digital board components
│   │   ├── admin/                   # Admin components
│   │   └── geofencing/              # Geofencing components
│   ├── hooks/
│   │   ├── useAuth.ts               # Authentication hook
│   │   ├── useStepTracking.ts       # Pedometer & sync logic
│   │   ├── usePollingData.ts        # WebSocket fallback polling
│   │   ├── useStepsWebSocket.ts     # Real-time WebSocket updates
│   │   ├── useEventData.ts          # Event data fetching
│   │   ├── useEventMutations.ts     # Event CRUD operations
│   │   ├── useAnimations.ts         # Animation utilities
│   │   └── useGeofencing.ts         # Geofencing logic
│   ├── screens/
│   │   ├── LoginScreen.tsx          # Authentication
│   │   ├── DashboardScreen.tsx      # Personal dashboard
│   │   ├── GlobalDashboardScreen.tsx # Admin/Staff dashboard
│   │   ├── DigitalBoardScreen.tsx   # Live total display
│   │   ├── AdminFundsScreen.tsx     # Admin CRUD for funds
│   │   ├── EventManagementScreen.tsx # Admin event management
│   │   ├── ProfileScreen.tsx        # User profile
│   │   └── ChangePasswordScreen.tsx # Password change
│   ├── theme/                       # Centralized theming
│   ├── types/                       # TypeScript definitions
│   ├── utils/                       # Utility functions
│   └── config/                      # Configuration files
├── docs/                            # Documentation
├── assets/                          # App icons and splash
├── android/                         # Android build files
├── ios/                             # iOS build files (macOS)
└── __tests__/                       # Test files
```

## 🎨 Features Breakdown

### Role-Based Access (RBAC)

- **Deelnemer**: Login, Dashboard, Digital Board, Profile, Change Password
- **Staff**: + Global Dashboard (view totals/funds)
- **Admin**: + Admin Funds (CRUD operations), + Event Management (event & geofence management)

### Advanced Step Tracking

- **Real-time pedometer**: Auto-sync elke 50 stappen of 5 minuten
- **Delta updates**: Positieve/negatieve correcties (-100 stappen)
- **Offline queue**: Automatische sync bij terug online
- **Conditional tracking**: Alleen actief binnen geofence + actief event
- **WebSocket live updates**: Real-time data van server

### Geofencing System

- **Event-based activation**: Tracking alleen tijdens events
- **Geofence monitoring**: GPS-based gebiedscontrole
- **Admin management**: Event & geofence configuratie
- **Background location**: Continue monitoring (met permissies)

### Real-time Features

- **WebSocket connection**: Live updates van server
- **Polling fallback**: Automatische fallback bij WS disconnect
- **Digital Board**: Live totaal display (10s updates)
- **Push notifications**: Event updates & achievements

### Animation System

- **60fps animations**: Native driver optimalisatie
- **Smooth transitions**: UI feedback & micro-interactions
- **Loading states**: Skeleton screens & progress indicators
- **Haptic feedback**: Success/error bevestigingen

### Funds Configuration

- Dynamic route funds via backend
- Admin can CRUD routes and amounts
- Default routes: 6 KM (€50), 12 KM (€100), etc.
- Shown on participant dashboard

## 🚢 Deployment & Updates

### Build for Production

```bash
# Setup EAS Build (eenmalig)
npm install -g eas-cli
eas login
eas build:configure

# Preview builds (development)
eas build --profile preview --platform android
eas build --profile preview --platform ios

# Production builds
eas build --profile production --platform android
eas build --profile production --platform ios

# Build both platforms
eas build --profile production --platform all
```

### Over-The-Air Updates

```bash
# Development updates
eas update --branch development

# Production updates
eas update --branch production

# Users receive update on next app launch (no app store approval needed)
```

### Update Instructies na Git Pull

Na het pullen van nieuwe code uit de repository:

```bash
# Dependencies bijwerken
npm install

# Cache legen voor Expo issues
expo start --reset-cache

# Of met EAS voor productie builds
eas build --profile preview --platform android --clear-cache
```

### Version Compatibility

**Minimale OS Versies:**
- **Android**: API level 24 (Android 7.0) - voor ACTIVITY_RECOGNITION permission
- **iOS**: 14.0+ - voor Core Motion pedometer API

**Bekende Incompatibiliteiten:**
- Expo Go: Beperkte pedometer & background location functionaliteit
- Oudere Android versies (<7.0): Geen activity recognition
- iOS <14: Beperkte pedometer nauwkeurigheid

## 🔒 Security Notes

- JWT tokens stored in AsyncStorage (encrypted on device)
- Backend validates all requests
- RBAC enforced on server and client
- HTTPS only for API calls
- Test mode header for development only

## 📊 Performance

- React Query for efficient caching
- Optimistic updates for better UX
- Lazy loading for screens
- Minimal re-renders with proper memoization

## 🐛 Known Issues

1. **Expo Go Limitations**: Pedometer & background location werken niet volledig - bouw standalone APK voor productie
2. **Victory Native Charts**: Gebruikt voor grafieken - test performance met grote datasets
3. **Large Step Counts**: Performance testen met 10k+ stappen
4. **WebSocket Fallback**: Polling actief bij WS disconnect - normaal gedrag
5. **Geofencing Accuracy**: GPS afhankelijk - test in real-world condities

## 🤝 Contributing Basics

### Hoe fork je en run je lokaal?

1. **Fork de repository** op GitHub
2. **Clone je fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/dkl-steps-app.git
   cd dkl-steps-app
   ```
3. **Setup development environment** (zie Installation sectie hierboven)
4. **Maak een feature branch**:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```
5. **Commit je changes**:
   ```bash
   git add .
   git commit -m "Add awesome feature"
   ```
6. **Push en maak Pull Request**:
   ```bash
   git push origin feature/my-awesome-feature
   ```

Voor gedetailleerde contributing guidelines, zie [`CONTRIBUTING.md`](../CONTRIBUTING.md) (indien beschikbaar).

## ❓ FAQ

### Waarom syncen stappen niet?
**Check internet connectie en queue stats:**
```javascript
// In development console:
import { getQueueStats } from './src/services/stepQueue';
getQueueStats().then(stats => console.log('Queued steps:', stats.totalQueued));
```
- Als queue > 0: Wacht op internet en probeer "Sync Nu"
- Als queue = 0: Controleer backend URL in .env.local

### Wat gebeurt er bij geofencing?
- **ENABLE_GEOFENCING=true**: Tracking alleen binnen event gebied (batterij vriendelijk)
- **ENABLE_GEOFENCING=false**: Always-on tracking (hogere batterij verbruik)
- Controleer actief event in Admin > Event Management

### Hoe reset ik app data?
```bash
# Complete reset (development only):
AsyncStorage.clear()
# Herstart app daarna
```

### Waarom werkt pedometer niet op emulator?
- Pedometer werkt alleen op fysieke devices
- iOS Simulator: Geen hardware sensoren
- Android Emulator: Beperkte sensor support
- **Oplossing**: Test op echt device of bouw standalone APK

### Wat zijn de verschillen tussen rollen?
- **Deelnemer**: Persoonlijk dashboard, digital board, profile
- **Staff**: + Global dashboard (view totals/funds)
- **Admin**: + Admin funds CRUD, + Event management

## 📞 Support

Voor vragen of issues:
- Check DKL website documentatie
- Contact DKL support team
- Review API Reference: https://dklemailservice.onrender.com/api/docs

## 📝 License

© 2025 DKL Organization. All rights reserved.

---

**Happy Stepping! 👟**