# DKL Steps Mobile App

Een mobiele applicatie voor het tracken van stappen voor de DKL Steps challenge. Deze app integreert met de DKL backend API en biedt functionaliteit voor deelnemers, staff en admins.

## 🎯 Features

- **Stappen Tracking**: Real-time stappen tellen met pedometer
- **Delta Updates**: Positieve en negatieve stappen correcties
- **Persoonlijk Dashboard**: Bekijk je voortgang, route en toegewezen fondsen
- **Globaal Dashboard**: Voor Admin/Staff - totaal stappen en fondsen distributie
- **Digitaal Bord**: Live display van totaal stappen (updates elke 10 seconden)
- **Admin Beheer**: CRUD operaties voor route fondsen configuratie
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

**Expo Dependencies:**
```bash
expo install @react-navigation/native @react-navigation/native-stack expo-sensors @react-native-async-storage/async-storage expo-constants @react-native-community/netinfo
```

**NPM Dependencies:**
```bash
npm install @tanstack/react-query jwt-decode
```

### 3. Verify Environment

Check dat `.env` bestaat met:
```
BACKEND_URL=https://dklemailservice.onrender.com/api
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

## 📱 Testing

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

- Controleer backend URL in `.env`
- Test API met Postman: `GET https://dklemailservice.onrender.com/api/total-steps?year=2025`
- Voeg `X-Test-Mode: true` header toe voor development

### Login 401/403 Errors

- Gebruik geldige credentials van DKL website
- Check JWT expiration (implement refresh token indien nodig)
- Verify user role voor restricted endpoints

## 📁 Project Structure

```
dkl-steps-app/
├── App.tsx                          # Main navigation setup
├── app.json                         # Expo configuration
├── .env                             # Environment variables
├── src/
│   ├── services/
│   │   └── api.ts                   # API helper with error handling
│   ├── components/
│   │   └── StepCounter.tsx          # Steps tracking component
│   └── screens/
│       ├── LoginScreen.tsx          # Authentication
│       ├── DashboardScreen.tsx      # Personal dashboard
│       ├── GlobalDashboardScreen.tsx # Admin/Staff dashboard
│       ├── DigitalBoardScreen.tsx   # Live total display
│       └── AdminFundsScreen.tsx     # Admin CRUD for funds
└── assets/                          # App icons and splash
```

## 🎨 Features Breakdown

### Role-Based Access

- **Deelnemer**: Login, Dashboard, Digital Board
- **Staff**: + Global Dashboard (view totals/funds)
- **Admin**: + Admin Funds (CRUD operations)

### Steps Delta System

- Positive deltas: Add steps (+N)
- Negative deltas: Corrections (-N, min 0)
- Real-time pedometer tracking
- Manual sync button
- Offline queue with auto-sync

### Funds Configuration

- Dynamic route funds via backend
- Admin can CRUD routes and amounts
- Default routes: 6 KM (€50), 12 KM (€100), etc.
- Shown on participant dashboard

## 🚢 Deployment

### Build for Production

```bash
# Setup EAS Build
npm install -g eas-cli
eas login
eas build:configure

# Build Android APK
eas build --platform android

# Build iOS IPA (macOS required)
eas build --platform ios

# Build both
eas build --platform all
```

### Over-The-Air Updates

```bash
# Publish update
eas update --branch production

# Users receive update on next app launch
```

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

1. **Recharts on React Native**: May need to switch to `react-native-chart-kit` or `victory-native` if rendering issues occur
2. **Pedometer Background**: Not supported in Expo Go, needs custom development build
3. **Large Step Counts**: Test performance with 10k+ steps

## 📞 Support

Voor vragen of issues:
- Check DKL website documentatie
- Contact DKL support team
- Review API Reference: https://dklemailservice.onrender.com/api/docs

## 📝 License

© 2025 DKL Organization. All rights reserved.

---

**Happy Stepping! 👟**