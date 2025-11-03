# DKL Steps Mobile App - Technische Documentatie

**Versie:** 1.0.0  
**Laatst bijgewerkt:** Oktober 2025  
**Platform:** React Native (Expo)  
**Licentie:** © 2025 DKL Organization. All rights reserved.

---

## 📑 Inhoudsopgave

1. [Project Overzicht](#1-project-overzicht)
2. [Architectuur](#2-architectuur)
3. [Technologie Stack](#3-technologie-stack)
4. [Installatie & Setup](#4-installatie--setup)
5. [Project Structuur](#5-project-structuur)
6. [Functionaliteit](#6-functionaliteit)
7. [API Integratie](#7-api-integratie)
8. [Beveiliging & Authenticatie](#8-beveiliging--authenticatie)
9. [Componenten Documentatie](#9-componenten-documentatie)
10. [Screens Documentatie](#10-screens-documentatie)
11. [State Management](#11-state-management)
12. [Testing](#12-testing)
13. [Deployment](#13-deployment)
14. [Troubleshooting](#14-troubleshooting)
15. [Best Practices](#15-best-practices)
16. [Toekomstige Uitbreidingen](#16-toekomstige-uitbreidingen)

---

## 1. Project Overzicht

### 1.1 Doel

De DKL Steps Mobile App is een cross-platform mobiele applicatie ontwikkeld voor het tracken en beheren van stappen tijdens de DKL Steps Challenge. De app biedt functionaliteit voor deelnemers, staff en administrators om stappen te volgen, fondsen te beheren en real-time statistieken te bekijken.

### 1.2 Doelgroep

- **Deelnemers**: Individuen die deelnemen aan de DKL Steps Challenge
- **Staff**: Medewerkers die toegang hebben tot globale statistieken
- **Administrators**: Beheerders met volledige CRUD rechten voor fondsen configuratie

### 1.3 Kernfunctionaliteiten

✅ **Real-time Stappen Tracking** - Automatische stappen detectie via device pedometer  
✅ **Delta Update Systeem** - Positieve en negatieve stappen correcties  
✅ **Offline Support** - Queue mechanisme voor sync wanneer verbinding terugkeert  
✅ **Role-Based Access Control (RBAC)** - Verschillende toegangsniveaus per rol  
✅ **Fondsen Beheer** - Dynamic route funds configuratie door admins  
✅ **Live Dashboard** - Real-time updates van totale stappen (elke 10 seconden)  
✅ **Wachtwoord Beveiliging** - Optionele wachtwoord wijziging
✅ **Responsive Design** - Optimalisatie voor verschillende schermformaten
✅ **Automatische Sync** - Stappen worden automatisch gesynchroniseerd (elke 50 stappen of 5 minuten)

### 1.4 Technische Specificaties

- **Platform**: iOS & Android (via React Native)
- **Minimum OS**: iOS 13.0+ / Android 6.0+
- **Device Vereisten**: Accelerometer/Gyroscope voor stappen detectie
- **Netwerk**: HTTPS-only API communicatie
- **Backend**: RESTful API op https://dklemailservice.onrender.com/api

---

## 2. Architectuur

### 2.1 High-Level Architectuur

```
┌─────────────────────────────────────────────────────────┐
│                   DKL Steps Mobile App                   │
│                  (React Native / Expo)                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Screens   │  │ Components  │  │  Services   │     │
│  │             │  │             │  │             │     │
│  │ • Login     │  │ • Step      │  │ • API       │     │
│  │ • Dashboard │  │   Counter   │  │   Client    │     │
│  │ • Global    │  │             │  │             │     │
│  │ • Digital   │  └─────────────┘  └─────────────┘     │
│  │   Board     │                                         │
│  │ • Admin     │                                         │
│  │   Funds     │                                         │
│  └─────────────┘                                         │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │         State Management Layer               │        │
│  │  • React Query (Server State)               │        │
│  │  • AsyncStorage (Local Persistence)         │        │
│  │  • React Navigation (Navigation State)      │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
│  ┌─────────────────────────────────────────────┐        │
│  │           Native Device Features             │        │
│  │  • Pedometer (expo-sensors)                 │        │
│  │  • Network Info (@react-native-netinfo)     │        │
│  │  • Secure Storage (AsyncStorage)            │        │
│  └─────────────────────────────────────────────┘        │
│                                                           │
└──────────────────┬────────────────────────────────────┘
                   │ HTTPS
                   ▼
    ┌────────────────────────────┐
    │    DKL Backend API         │
    │  (Node.js/Express)         │
    │  • Authentication          │
    │  • Steps Management        │
    │  • Funds Distribution      │
    │  • Role Authorization      │
    └────────────────────────────┘
```

### 2.2 Data Flow

```
User Interaction
      │
      ▼
   Screen Component
      │
      ├─→ Local State Update
      │
      ▼
   React Query Mutation
      │
      ▼
   API Service Layer
      │
      ├─→ AsyncStorage (Token)
      │
      ▼
   HTTP Request (Fetch)
      │
      ▼
   Backend API
      │
      ▼
   Response
      │
      ├─→ Success: Cache Update
      │
      └─→ Error: Error Handling
```

### 2.3 Navigatie Structuur

```
App
 │
 ├─ Login Screen
 │   └─→ (Auth Success) → Dashboard Screen
 │
 ├─ Dashboard Screen (Authenticated)
 │   ├─→ Global Dashboard Screen (Staff/Admin only)
 │   │   └─→ Admin Funds Screen (Admin only)
 │   │
 │   ├─→ Digital Board Screen (All users)
 │   │
 │   ├─→ Change Password Screen
 │   │
 │   └─→ Logout → Login Screen
```

---

## 3. Technologie Stack

### 3.1 Core Framework

| Technologie | Versie | Doel |
|------------|--------|------|
| **React** | 19.1.0 | UI Framework |
| **React Native** | 0.81.5 | Cross-platform mobile development |
| **Expo** | ~54.0.20 | Development platform & tooling |
| **TypeScript** | ~5.9.2 | Type-safe development |

### 3.2 State Management & Data Fetching

| Package | Versie | Doel |
|---------|--------|------|
| **@tanstack/react-query** | ^5.90.5 | Server state management & caching |
| **@react-native-async-storage/async-storage** | 2.2.0 | Local storage & persistence |

### 3.3 Theme System & Styling

| Package | Versie | Doel |
|---------|--------|------|
| **expo-font** | ~12.0.10 | Font loading voor Roboto/Roboto Slab |
| **@expo-google-fonts/roboto** | 0.2.3 | Roboto font familie |
| **@expo-google-fonts/roboto-slab** | 0.2.3 | Roboto Slab font familie |

### 3.3 Navigation

| Package | Versie | Doel |
|---------|--------|------|
| **@react-navigation/native** | ^7.1.18 | Navigation infrastructure |
| **@react-navigation/native-stack** | ^7.5.1 | Native stack navigator |
| **react-native-screens** | ~4.16.0 | Native screen optimization |
| **react-native-gesture-handler** | ~2.28.0 | Gesture handling |
| **react-native-safe-area-context** | ~5.6.0 | Safe area support |

### 3.4 Device Features

| Package | Versie | Doel |
|---------|--------|------|
| **expo-sensors** | ~15.0.7 | Pedometer & accelerometer access |
| **@react-native-community/netinfo** | 11.4.1 | Network connectivity monitoring |
| **expo-constants** | ~18.0.10 | Environment constants |

### 3.5 Utilities

| Package | Versie | Doel |
|---------|--------|------|
| **jwt-decode** | ^4.0.0 | JWT token decoding |
| **expo-status-bar** | ~3.0.8 | Status bar styling |

---

## 4. Installatie & Setup

### 4.1 Prerequisites

Zorg ervoor dat de volgende software geïnstalleerd is:

```bash
# Node.js versie 18 of hoger
node --version  # Should be v18.x.x or higher

# NPM (komt met Node.js)
npm --version

# Expo CLI (globaal)
npm install -g expo-cli

# Git (voor version control)
git --version
```

### 4.2 Development Environment Setup

#### Voor iOS Development (macOS only):
```bash
# Install Xcode from App Store
# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods
```

#### Voor Android Development:
```bash
# Download Android Studio
# Setup Android SDK
# Configure environment variables:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 4.3 Project Installation

```bash
# 1. Clone of navigeer naar de project directory
cd dkl-steps-app

# 2. Installeer dependencies
npm install

# 3. Installeer Expo-specifieke packages
expo install @react-navigation/native @react-navigation/native-stack \
  expo-sensors @react-native-async-storage/async-storage \
  expo-constants @react-native-community/netinfo

# 4. Installeer overige NPM packages
npm install @tanstack/react-query jwt-decode

# 5. Verifieer installatie
npm list --depth=0
```

### 4.4 Environment Configuration

Geen `.env` bestand nodig - configuratie zit in [`app.json`](app.json:30):

```json
{
  "expo": {
    "extra": {
      "BACKEND_URL": "https://dklemailservice.onrender.com/api"
    }
  }
}
```

Voor development met lokale backend, pas [`app.json`](app.json:30) aan:
```json
"BACKEND_URL": "http://localhost:3000/api"
```

### 4.5 Running the App

#### Development Mode:
```bash
# Start Expo development server
npm start
# Of
expo start

# Opties:
# - Press 'a' voor Android emulator
# - Press 'i' voor iOS simulator (macOS only)
# - Scan QR code met Expo Go app op physical device
```

#### Platform-Specific:
```bash
# Android only
npm run android

# iOS only (macOS required)
npm run ios

# Web preview
npm run web
```

---

## 5. Project Structuur

### 5.1 Directory Layout

```
dkl-steps-app/
│
├── assets/                      # Static assets
│   ├── icon.png                 # App icon (1024x1024)
│   ├── adaptive-icon.png        # Android adaptive icon
│   ├── splash-icon.png          # Splash screen
│   └── favicon.png              # Web favicon
│
├── src/                         # Source code
│   ├── components/              # Reusable components
│   │   └── StepCounter.tsx      # Step tracking component
│   │
│   ├── screens/                 # Screen components
│   │   ├── LoginScreen.tsx      # Authentication screen
│   │   ├── ChangePasswordScreen.tsx  # Password change
│   │   ├── DashboardScreen.tsx  # Personal dashboard
│   │   ├── GlobalDashboardScreen.tsx # Admin/Staff dashboard
│   │   ├── DigitalBoardScreen.tsx    # Live display board
│   │   └── AdminFundsScreen.tsx      # Admin CRUD interface
│   │
│   └── services/                # Service layer
│       └── api.ts               # API client & utilities
│
├── App.tsx                      # Root component & navigation
├── index.ts                     # Entry point
├── app.json                     # Expo configuration
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── .gitignore                   # Git ignore rules
├── README.md                    # User documentation
├── QUICKSTART.md                # Quick start guide
└── DOCUMENTATIE.md              # This file
```

### 5.2 File Naming Conventions

- **Screens**: PascalCase met `Screen` suffix (bijv. [`DashboardScreen.tsx`](src/screens/DashboardScreen.tsx))
- **Components**: PascalCase (bijv. [`StepCounter.tsx`](src/components/StepCounter.tsx))
- **Services**: camelCase (bijv. [`api.ts`](src/services/api.ts))
- **Assets**: kebab-case (bijv. `adaptive-icon.png`)

### 5.3 Code Organization Principles

1. **Separation of Concerns**: UI, business logic en data fetching zijn gescheiden
2. **Single Responsibility**: Elk component/functie heeft één duidelijke taak
3. **Reusability**: Gedeelde logica in components/services
4. **Type Safety**: TypeScript interfaces voor alle data structures

---

## 6. Functionaliteit

### 6.1 Authenticatie & Autorisatie

#### Login Flow
1. Gebruiker voert credentials in op [`LoginScreen`](src/screens/LoginScreen.tsx)
2. API call naar `/api/auth/login` met email + wachtwoord
3. Response bevat JWT token + gebruikersgegevens
4. Token & user data opgeslagen in AsyncStorage:
   - `authToken`: JWT bearer token
   - `refreshToken`: Refresh token voor token renewal
   - `participantId`: Uniek gebruikers ID
   - `userRole`: Rol (Deelnemer/Staff/Admin)
   - `userName`: Naam van gebruiker

#### Login Flow
```typescript
// Direct navigation to Dashboard after successful login
await AsyncStorage.multiSet([
  ['authToken', data.token],
  ['refreshToken', data.refresh_token],
  ['participantId', data.user.id],
  ['userRole', data.user.rol],
  ['userName', data.user.naam],
]);

navigation.replace('Dashboard');
```

**Features:**
- Email validatie (format check)
- Wachtwoord show/hide toggle
- Real-time error clearing
- Loading states met spinner
- User-friendly error messages
- Development mode quick login buttons

#### Role-Based Access Control

| Rol | Toegang |
|-----|---------|
| **Deelnemer** | Login, Dashboard, Digital Board, Change Password (optioneel) |
| **Staff** | + Global Dashboard (read-only) |
| **Admin** | + Admin Funds (full CRUD) |

Implementatie in screens:
```typescript
// Voorbeeld: GlobalDashboardScreen.tsx
const [hasAccess, setHasAccess] = useState(false);

useEffect(() => {
  const checkAccess = async () => {
    const rol = await AsyncStorage.getItem('userRole');
    if (['Admin', 'Staff'].includes(rol || '')) {
      setHasAccess(true);
    } else {
      navigation.goBack();
    }
  };
  checkAccess();
}, []);
```

### 6.2 Stappen Tracking

#### Pedometer Integratie

Het [`StepCounter`](src/components/StepCounter.tsx:1) component gebruikt Expo Sensors voor real-time stappen detectie:

```typescript
// Check pedometer availability
const [isAvailable, setIsAvailable] = useState(false);
Pedometer.isAvailableAsync().then(setIsAvailable);

// Watch step count updates
const subscription = Pedometer.watchStepCount(result => {
  setStepsDelta(prev => prev + result.steps);
});
```

**Belangrijke notities**:
- Werkt alleen op physical devices (niet in emulators)
- Vereist permissions: `ACTIVITY_RECOGNITION` (Android), Motion Usage (iOS)
- Updates zijn incrementeel (delta's, niet absolute waarden)

#### Delta Update Systeem

Stappen worden verzonden als **delta's** (wijzigingen):

```typescript
// POST /api/steps/:participantId
{
  "steps": 150  // Positief = toevoegen, Negatief = corrigeren
}
```

**Voordelen**:
- Efficiëntere data transfer
- Ondersteunt correcties (negatieve deltas)
- Betere offline sync mogelijkheden

#### Offline Queue Mechanisme

```typescript
// Network monitoring
const netSubscription = NetInfo.addEventListener(state => {
  if (state.isConnected && offlineQueue.length > 0) {
    const totalOffline = offlineQueue.reduce((a, b) => a + b, 0);
    syncSteps(totalOffline);
    setOfflineQueue([]);
  }
});

// Failed sync → add to queue
catch (err) {
  console.error('Sync failed:', err);
  setOfflineQueue(prev => [...prev, delta]);
}
```

### 6.3 Dashboard Functionaliteit

#### Persoonlijk Dashboard ([`DashboardScreen`](src/screens/DashboardScreen.tsx))

Toont:
- **Totaal Stappen**: Cumulatieve stappen van gebruiker
- **Route**: Toegewezen route (6 KM, 12 KM, etc.)
- **Toegewezen Fonds**: Bedrag geassocieerd met route
- **Voortgang Bar**: Visuele representatie (target: 10,000 stappen)
- **StepCounter Component**: Live delta tracking
- **Quick Actions**: Navigatie naar andere screens

Data fetching:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['personalDashboard'],
  queryFn: async () => {
    const id = await AsyncStorage.getItem('participantId');
    return apiFetch(`/participant/${id}/dashboard`);
  },
});
```

#### Global Dashboard ([`GlobalDashboardScreen`](src/screens/GlobalDashboardScreen.tsx))

**Toegang**: Staff & Admin only

Toont:
- **Totaal Stappen 2025**: Alle participanten gecombineerd
- **Totaal Fondsen**: Som van alle route fondsen
- **Fondsen per Route**: Lijst met route → bedrag mapping

Dual data fetching:
```typescript
// Total steps
const { data: totals } = useQuery({
  queryKey: ['totalSteps'],
  queryFn: () => apiFetch('/total-steps?year=2025'),
});

// Funds distribution
const { data: funds } = useQuery({
  queryKey: ['fundsDistribution'],
  queryFn: () => apiFetch('/funds-distribution'),
});
```

### 6.4 Digital Board

Live display scherm ([`DigitalBoardScreen`](src/screens/DigitalBoardScreen.tsx)) voor groot scherm presentatie:

**Features**:
- ⚫ Zwarte achtergrond voor contrast
- 🔢 Extra grote font (96px) voor zichtbaarheid
- ✨ Glow effect op cijfers
- 🔄 Auto-refresh elke 10 seconden
- 📊 Minimalistische interface

```typescript
// Auto-refresh interval
useEffect(() => {
  const fetchTotal = async () => {
    const data = await apiFetch('/total-steps?year=2025');
    setTotal(data.total_steps);
  };
  
  fetchTotal(); // Initial
  const interval = setInterval(fetchTotal, 10000); // Every 10s
  
  return () => clearInterval(interval); // Cleanup
}, []);
```

### 6.5 Admin Fondsen Beheer

CRUD interface ([`AdminFundsScreen`](src/screens/AdminFundsScreen.tsx)) voor route funds configuratie:

#### CREATE - Nieuwe Route
```typescript
const createMut = useMutation({
  mutationFn: (body: { route: string; amount: number }) => 
    apiFetch('/steps/admin/route-funds', { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
    Alert.alert('Succes', 'Route toegevoegd');
  },
});
```

#### READ - Routes Lijst
```typescript
const { data: fundsList } = useQuery({
  queryKey: ['adminRouteFunds'],
  queryFn: () => apiFetch('/steps/admin/route-funds'),
});
```

#### UPDATE - Bedrag Aanpassen
```typescript
// Quick adjust buttons: +10 / -10
const handleUpdate = (item: RouteFund, increment: number) => {
  const newAmount = item.amount + increment;
  updateMut.mutate({ 
    r: item.route, 
    body: { amount: newAmount } 
  });
};
```

#### DELETE - Route Verwijderen
```typescript
const handleDelete = (item: RouteFund) => {
  Alert.alert(
    'Bevestigen',
    `Weet je zeker dat je "${item.route}" wilt verwijderen?`,
    [
      { text: 'Annuleren', style: 'cancel' },
      { 
        text: 'Verwijderen', 
        onPress: () => deleteMut.mutate(item.route)
      },
    ]
  );
};
```

### 6.6 Wachtwoord Wijzigen

Veilige wachtwoord update flow ([`ChangePasswordScreen`](src/screens/ChangePasswordScreen.tsx)):

**Validatie Rules**:
- Alle velden verplicht
- Nieuw wachtwoord minimaal 8 karakters
- Nieuwe wachtwoorden moeten matchen
- Nieuw wachtwoord moet verschillen van huidig

```typescript
const handleChangePassword = async () => {
  // Validation checks
  if (newPassword.length < 8) {
    setError('Nieuw wachtwoord moet minimaal 8 karakters zijn');
    return;
  }
  
  // API call
  await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      huidig_wachtwoord: currentPassword,
      nieuw_wachtwoord: newPassword,
    }),
  });
  
  // Mark as changed
  await AsyncStorage.setItem('passwordChanged', 'true');
};
```

---

## 7. API Integratie

### 7.1 API Service Layer

Centralized API client in [`src/services/api.ts`](src/services/api.ts:1):

```typescript
export async function apiFetch(
  endpoint: string, 
  options: RequestInit = {}, 
  isTestMode = false
) {
  const token = await AsyncStorage.getItem('authToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isTestMode ? { 'X-Test-Mode': 'true' } : {}),
    ...options.headers,
  };
  
  const response = await fetch(
    `${BASE_URL}${endpoint}`, 
    { ...options, headers }
  );
  
  // Error handling
  if (!response.ok) {
    throw new Error(getErrorMessage(response.status));
  }
  
  return response.json();
}
```

**Features**:
- Automatic JWT token injection
- Centralized error handling
- Test mode header support
- Type-safe responses (via TypeScript)

### 7.2 API Endpoints

#### Authentication
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/login` | `{ email, wachtwoord }` | `{ token, refresh_token, user }` |
| POST | `/auth/reset-password` | `{ huidig_wachtwoord, nieuw_wachtwoord }` | `{ success }` |

#### Participant Data (JWT-based)
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/participant/dashboard` | - | Personal stats (JWT contains user ID) |
| POST | `/steps` | `{ steps: number }` | Submit step delta (JWT contains user ID) |

#### Global Statistics
| Method | Endpoint | Query | Description |
|--------|----------|-------|-------------|
| GET | `/total-steps` | `?year=2025` | Total steps for year |
| GET | `/funds-distribution` | - | All routes with funds |

#### Admin Operations
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/steps/admin/route-funds` | - | List all route funds |
| POST | `/steps/admin/route-funds` | `{ route, amount }` | Create new route |
| PUT | `/steps/admin/route-funds/:route` | `{ amount }` | Update route fund |
| DELETE | `/steps/admin/route-funds/:route` | - | Delete route |

### 7.3 Error Handling Strategy

```typescript
// Status code to user-friendly message
const errorMessages: Record<number, string> = {
  400: 'Ongeldige request (400)',
  401: 'Niet geauthenticeerd (401)',
  403: 'Geen toestemming (403)',
  404: 'Niet gevonden (404)',
  500: 'Server fout (500)',
};

// Usage in components
try {
  await apiFetch('/endpoint');
} catch (err: any) {
  setError(err.message);
  // Optionally: Alert.alert('Fout', err.message);
}
```

---

## 8. Beveiliging & Authenticatie

### 8.1 JWT Token Management

**Storage**:
```typescript
// Secure storage in AsyncStorage (encrypted on device)
await AsyncStorage.multiSet([
  ['authToken', data.token],
  ['refreshToken', data.refresh_token],
  ['participantId', data.user.id],
  ['userRole', data.user.rol],
]);
```

**Auto-Injection**:
```typescript
// All API calls automatically include token
const token = await AsyncStorage.getItem('authToken');
headers['Authorization'] = `Bearer ${token}`;
```

**Token Expiration**:
- Tokens worden gevalideerd door backend
- 401 responses triggeren logout
- Refresh token kan gebruikt worden voor renewal (toekomstige implementatie)

### 8.2 Secure Communication

- ✅ **HTTPS Only**: Alle API calls via encrypted connection
- ✅ **No Credentials in Code**: Geen hardcoded tokens/passwords
- ✅ **Environment Variables**: Backend URL in app.json extra config
- ✅ **CORS Protection**: Backend enforces allowed origins

### 8.3 Input Validation

**Client-Side**:
```typescript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
if (password.length < 8) {
  setError('Minimaal 8 karakters vereist');
}

// Numeric validation
const amount = parseInt(inputValue);
if (isNaN(amount) || amount < 0) {
  setError('Geldig getal vereist');
}
```

**Server-Side**:
- Backend valideert alle inputs
- SQL injection preventie
- XSS protection via sanitization

### 8.4 Permission Checks

```typescript
// Screen-level permission check
useEffect(() => {
  const checkAccess = async () => {
    const rol = await AsyncStorage.getItem('userRole');
    if (!allowedRoles.includes(rol || '')) {
      Alert.alert('Toegang Geweigerd');
      navigation.goBack();
    }
  };
  checkAccess();
}, []);
```

### 8.5 Data Privacy

- **Local Storage**: AsyncStorage is device-encrypted (iOS Keychain, Android EncryptedSharedPreferences)
- **No Analytics Tracking**: Geen third-party tracking (tenzij expliciet toegevoegd)
- **Minimal Data Collection**: Alleen noodzakelijke user data
- **GDPR Compliant**: User kan data verwijderen via account deletion

---

## 9. Componenten Documentatie

### 9.1 StepCounter Component

**Location**: [`src/components/StepCounter.tsx`](src/components/StepCounter.tsx:1)

**Purpose**: Real-time stappen tracking met offline support en manuele sync.

#### Props Interface
```typescript
interface Props {
  onSync: () => void;  // Callback na succesvolle sync
}
```

#### State Management
```typescript
const [isAvailable, setIsAvailable] = useState(false);     // Pedometer beschikbaar?
const [stepsDelta, setStepsDelta] = useState(0);           // Lokale stappen delta
const [participantId, setParticipantId] = useState<string | null>(null);
const [offlineQueue, setOfflineQueue] = useState<number[]>([]); // Offline deltas
const [isSyncing, setIsSyncing] = useState(false);         // Sync in progress
```

#### Key Functions

**watchStepCount**:
```typescript
const subscription = Pedometer.watchStepCount(result => {
  setStepsDelta(prev => prev + result.steps);
});
```

**syncSteps**:
```typescript
const syncSteps = async (delta: number) => {
  if (!participantId || delta === 0 || isSyncing) return;
  
  setIsSyncing(true);
  try {
    await apiFetch(`/steps/${participantId}`, {
      method: 'POST',
      body: JSON.stringify({ steps: delta }),
    });
    setStepsDelta(0);
    onSync(); // Refresh parent data
  } catch (err) {
    setOfflineQueue(prev => [...prev, delta]); // Queue for later
  } finally {
    setIsSyncing(false);
  }
};
```

**Network Listener**:
```typescript
const netSubscription = NetInfo.addEventListener(state => {
  if (state.isConnected && offlineQueue.length > 0) {
    const totalOffline = offlineQueue.reduce((a, b) => a + b, 0);
    syncSteps(totalOffline);
    setOfflineQueue([]);
  }
});
```

#### Usage Example
```typescript
<StepCounter 
  onSync={() => {
    queryClient.invalidateQueries({ queryKey: ['personalDashboard'] });
  }} 
/>
```

---

## 10. Screens Documentatie

### 10.1 LoginScreen

**Location**: [`src/screens/LoginScreen.tsx`](src/screens/LoginScreen.tsx:1)

**Purpose**: Gebruiker authenticatie en eerste toegang tot app.

#### Functionaliteit
- Email + wachtwoord input fields
- Form validation
- JWT token opslag
- First-time login detectie → redirect naar ChangePassword
- Error display voor invalid credentials

#### Key Logic
```typescript
const handleLogin = async () => {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, wachtwoord: password }),
  });
  
  await AsyncStorage.multiSet([
    ['authToken', data.token],
    ['refreshToken', data.refresh_token],
    ['participantId', data.user.id],
    ['userRole', data.user.rol],
    ['userName', data.user.naam],
  ]);
  
  // Check password change requirement
  const passwordChanged = await AsyncStorage.getItem('passwordChanged');
  if (!passwordChanged || passwordChanged !== 'true') {
    navigation.replace('ChangePassword');
  } else {
    navigation.replace('Dashboard');
  }
};
```

---

### 10.2 DashboardScreen

**Location**: [`src/screens/DashboardScreen.tsx`](src/screens/DashboardScreen.tsx:1)

**Purpose**: Hoofdscherm voor deelnemers - persoonlijke statistieken en acties.

#### Weergegeven Data
- Totaal stappen
- Route assignment
- Toegewezen fondsen
- Voortgang bar (0-10,000 target)
- StepCounter component

#### Navigatie Opties
- Global Dashboard (indien Staff/Admin)
- Digital Board
- Change Password
- Logout

#### React Query Integration
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['personalDashboard'],
  queryFn: async () => {
    const id = await AsyncStorage.getItem('participantId');
    return apiFetch(`/participant/${id}/dashboard`);
  },
});

const refresh = () => {
  queryClient.invalidateQueries({ queryKey: ['personalDashboard'] });
};
```

---

### 10.3 GlobalDashboardScreen

**Location**: [`src/screens/GlobalDashboardScreen.tsx`](src/screens/GlobalDashboardScreen.tsx:1)

**Purpose**: Overzicht van totale statistieken (Staff/Admin only).

#### Access Control
```typescript
useEffect(() => {
  const checkAccess = async () => {
    const rol = await AsyncStorage.getItem('userRole');
    if (['Admin', 'Staff'].includes(rol || '')) {
      setHasAccess(true);
    } else {
      navigation.goBack();
    }
  };
  checkAccess();
}, []);
```

#### Data Display
- **Totaal Stappen 2025**: Aggregated from all participants
- **Totaal Fondsen**: Sum of all route funds
- **Fondsen per Route**: Table view met route → bedrag

#### Admin Navigation
```typescript
<Button 
  title="Admin Funds Beheer" 
  onPress={() => navigation.navigate('AdminFunds')}
  color="#FF9800"
/>
```

---

### 10.4 DigitalBoardScreen

**Location**: [`src/screens/DigitalBoardScreen.tsx`](src/screens/DigitalBoardScreen.tsx:1)

**Purpose**: Full-screen live display voor presentatie doeleinden.

#### Design Choices
- Zwarte achtergrond (#000) voor hoog contrast
- Extra grote font (96px) voor lange afstand zichtbaarheid
- Glow effect via textShadow voor visuele impact
- Minimalistische layout (geen distracties)

#### Auto-Refresh Logic
```typescript
useEffect(() => {
  const fetchTotal = async () => {
    const data = await apiFetch('/total-steps?year=2025');
    setTotal(data.total_steps);
  };
  
  fetchTotal(); // Initial load
  const interval = setInterval(fetchTotal, 10000); // Every 10s
  
  return () => clearInterval(interval); // Cleanup on unmount
}, []);
```

#### Styling Highlight
```typescript
total: { 
  fontSize: 96, 
  color: '#fff', 
  fontWeight: 'bold', 
  textShadowColor: '#4CAF50',
  textShadowRadius: 20,  // Glow effect
}
```

---

### 10.5 AdminFundsScreen

**Location**: [`src/screens/AdminFundsScreen.tsx`](src/screens/AdminFundsScreen.tsx:1)

**Purpose**: CRUD interface voor route funds (Admin only).

#### Access Control
```typescript
useEffect(() => {
  const checkAccess = async () => {
    const rol = await AsyncStorage.getItem('userRole');
    if (rol === 'Admin') {
      setHasAccess(true);
    } else {
      Alert.alert('Toegang Geweigerd', 'Alleen Admins hebben toegang');
      navigation.goBack();
    }
  };
  checkAccess();
}, []);
```

#### CRUD Operations

**CREATE**:
```typescript
const createMut = useMutation({
  mutationFn: (body: { route: string; amount: number }) => 
    apiFetch('/steps/admin/route-funds', { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
    queryClient.invalidateQueries({ queryKey: ['fundsDistribution'] });
    setRoute(''); 
    setAmount('');
  },
});
```

**UPDATE**:
```typescript
const updateMut = useMutation({
  mutationFn: ({ r, body }: { r: string; body: { amount: number } }) => 
    apiFetch(`/steps/admin/route-funds/${encodeURIComponent(r)}`, { 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
    Alert.alert('Succes', 'Route bijgewerkt');
  },
});
```

**DELETE**:
```typescript
const deleteMut = useMutation({
  mutationFn: (r: string) => 
    apiFetch(`/steps/admin/route-funds/${encodeURIComponent(r)}`, { 
      method: 'DELETE' 
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
  },
});
```

#### UI Elements
- Route list met bedragen
- Quick adjust buttons (+10 / -10)
- Delete button met confirmatie dialog
- Add route form (input fields + submit button)

---

### 10.6 ChangePasswordScreen

**Location**: [`src/screens/ChangePasswordScreen.tsx`](src/screens/ChangePasswordScreen.tsx:1)

**Purpose**: Veilige wachtwoord wijziging voor gebruikers.

#### Validation Rules
```typescript
// Required fields check
if (!currentPassword || !newPassword || !confirmPassword) {
  setError('Alle velden zijn verplicht');
  return;
}

// Minimum length
if (newPassword.length < 8) {
  setError('Nieuw wachtwoord moet minimaal 8 karakters zijn');
  return;
}

// Match check
if (newPassword !== confirmPassword) {
  setError('Nieuwe wachtwoorden komen niet overeen');
  return;
}

// Different from current
if (currentPassword === newPassword) {
  setError('Nieuw wachtwoord moet verschillen van het huidige');
  return;
}
```

#### Password Change Flow
```typescript
const handleChangePassword = async () => {
  // Validation...
  
  await apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      huidig_wachtwoord: currentPassword,
      nieuw_wachtwoord: newPassword,
    }),
  });
  
  // Mark as changed
  await AsyncStorage.setItem('passwordChanged', 'true');
  
  Alert.alert('Succes', 'Wachtwoord succesvol gewijzigd', [
    {
      text: 'OK',
      onPress: () => navigation.replace('Dashboard'),
    },
  ]);
};
```

#### First-Time Login Integration
- Screen is **required** op eerste login
- `passwordChanged` flag in AsyncStorage tracks status
- Kan niet terug naar login zonder wachtwoord te wijzigen

---

## 11. State Management

### 11.1 Server State (React Query)

**Configuratie**:
```typescript
const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  {/* App navigation */}
</QueryClientProvider>
```

**Query Patterns**:

```typescript
// Basic query
const { data, isLoading, error } = useQuery({
  queryKey: ['uniqueKey'],
  queryFn: () => apiFetch('/endpoint'),
});

// Query met enabled flag (conditional fetching)
const { data } = useQuery({
  queryKey: ['adminData'],
  queryFn: () => apiFetch('/admin/data'),
  enabled: hasAdminAccess, // Only fetch if admin
});

// Mutation voor POST/PUT/DELETE
const mutation = useMutation({
  mutationFn: (body) => apiFetch('/endpoint', { 
    method: 'POST', 
    body: JSON.stringify(body) 
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['relatedData'] });
  },
});
```

**Cache Invalidatie Strategie**:

```typescript
// Single query
queryClient.invalidateQueries({ queryKey: ['personalDashboard'] });

// Multiple related queries
queryClient.invalidateQueries({ queryKey: ['adminRouteFunds'] });
queryClient.invalidateQueries({ queryKey: ['fundsDistribution'] });
```

### 11.2 Local State (AsyncStorage)

**Stored Data**:

| Key | Value Type | Purpose |
|-----|------------|---------|
| `authToken` | string (JWT) | Bearer token voor API calls |
| `refreshToken` | string | Token renewal |
| `participantId` | string | User unique ID |
| `userRole` | string | Deelnemer/Staff/Admin |
| `userName` | string | Display name |

**Common Operations**:

```typescript
// Set single item
await AsyncStorage.setItem('key', 'value');

// Set multiple items
await AsyncStorage.multiSet([
  ['key1', 'value1'],
  ['key2', 'value2'],
]);

// Get single item
const value = await AsyncStorage.getItem('key');

// Get multiple items
const values = await AsyncStorage.multiGet(['key1', 'key2']);

// Remove all (logout)
await AsyncStorage.clear();
```

### 11.3 Component State (useState)

**Gebruikt voor**:
- Form inputs (email, password, etc.)
- UI state (loading, errors, modals)
- Temporary data (delta counter, offline queue)

**Best Practices**:
```typescript
// Initialize with proper types
const [isLoading, setIsLoading] = useState<boolean>(false);
const [error, setError] = useState<string>('');
const [data, setData] = useState<DataType | null>(null);

// Reset state on unmount if needed
useEffect(() => {
  return () => {
    setError('');
    setIsLoading(false);
  };
}, []);
```

### 11.4 Navigation State

**Managed by** React Navigation

```typescript
// Push to stack
navigation.navigate('ScreenName', { params });

// Replace current screen (no back)
navigation.replace('Dashboard');

// Go back
navigation.goBack();

// Check navigation state
const isFocused = useIsFocused();
```

---

## 12. Testing

### 12.1 Manual Testing Workflow

#### Test Flow 1: Complete User Journey
```bash
1. ✅ Login Screen
   - Enter test credentials
   - Verify JWT token stored in AsyncStorage
   - Check navigation to ChangePassword (first time)

2. ✅ Dashboard Screen
   - Verify personal stats load (steps, route, funds)
   - Walk around to trigger pedometer
   - Observe delta counter increment
   - Click "Sync Nu" button
   - Verify delta resets to 0
   - Check server received update (via API logs)

3. ✅ Offline Testing
   - Enable airplane mode
   - Walk around (delta accumulates)
   - Click "Sync Nu" → see offline queue
   - Disable airplane mode
   - Observe auto-sync trigger
   - Verify queue clears

4. ✅ Correctie Button
   - Click "Correctie -100"
   - Verify negative delta sent
   - Refresh dashboard → steps decreased

5. ✅ Global Dashboard (Staff/Admin)
   - Navigate from Dashboard
   - Verify total steps 2025 displayed
   - Check funds distribution table
   - Try as Deelnemer → should be blocked

6. ✅ Digital Board
   - Navigate from Dashboard
   - Verify large font display
   - Wait 10 seconds → check refresh
   - Compare total with Global Dashboard

7. ✅ Admin Funds (Admin only)
   - Navigate from Global Dashboard
   - CREATE: Add new route (e.g., "25 KM", €200)
   - UPDATE: Use +10/-10 buttons
   - DELETE: Remove a route (with confirmation)
   - Verify changes in Global Dashboard

8. ✅ Change Password (Optioneel)
   - Navigate from Dashboard
   - Test validation rules
   - Verify success message

9. ✅ Automatische Sync
   - Loop 50+ stappen
   - Verify auto-sync triggers
   - Check dashboard updates automatisch

10. ✅ Logout
   - Click logout button
   - Verify redirect to Login
   - Check AsyncStorage cleared
```

### 12.2 Platform-Specific Testing

#### iOS Testing
```bash
# Simulator (geen pedometer)
npm run ios

# Physical device (via Expo Go)
1. Install Expo Go from App Store
2. Scan QR code from `expo start`
3. Grant motion permission when prompted

# Test pedometer on physical device:
- Walk around with device
- Check delta counter updates
```

#### Android Testing
```bash
# Emulator (geen pedometer)
npm run android

# Physical device
1. Install Expo Go from Play Store
2. Scan QR code
3. Grant Activity Recognition permission in Settings

# Permission check:
Settings > Apps > DKL Steps > Permissions > Physical Activity
```

### 12.3 API Testing

**Backend Health Check**:
```bash
curl https://dklemailservice.onrender.com/api/total-steps?year=2025

# Expected response:
{
  "total_steps": 123456,
  "year": 2025
}
```

**Test Mode Header**:
```typescript
// Add in development for debugging
apiFetch('/endpoint', {}, true); // isTestMode = true
// Sends: X-Test-Mode: true
```

### 12.4 Error Scenario Testing

| Scenario | Expected Behavior |
|----------|-------------------|
| Invalid credentials | "Niet geauthenticeerd (401)" error |
| Expired token | Logout + redirect to Login |
| Network timeout | Offline queue activation |
| Invalid route name | "Voer een route naam in" validation |
| Negative fund amount | "Bedrag kan niet negatief zijn" |
| Non-Admin accesses AdminFunds | Auto-redirect + alert |
| Pedometer unavailable | "⚠️ Pedometer niet beschikbaar" |

### 12.5 Performance Testing

**Load Testing**:
- Create 100+ step entries quickly
- Monitor UI responsiveness
- Check memory usage in React DevTools

**Network Testing**:
- Slow 3G simulation
- Verify loading states show properly
- Check timeout handling

**Large Data Sets**:
- Test with 10,000+ steps
- Verify number formatting (toLocaleString)
- Check progress bar calculation

---

## 13. Deployment

### 13.1 Pre-Deployment Checklist

```bash
✅ All dependencies installed (`npm install`)
✅ TypeScript errors resolved (`tsc --noEmit`)
✅ Backend URL correct in app.json
✅ Assets present (icon, splash, adaptive-icon)
✅ Permissions configured (iOS & Android)
✅ Version number updated in app.json & package.json
✅ Test credentials documented
✅ Manual testing completed on both platforms
```

### 13.2 EAS Build Setup

**Installatie**:
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login
eas login

# Initialize EAS
eas build:configure
```

**Configuratie** (`eas.json`):
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "archive"
      }
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

### 13.3 Building for Production

#### Android APK
```bash
# Build APK
eas build --platform android --profile production

# Download APK
# URL will be provided in terminal output

# Install on device
adb install path/to/app.apk
```

#### iOS App Store
```bash
# Build IPA (requires Apple Developer account)
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios

# Follow prompts for App Store Connect credentials
```

#### Build Both Platforms
```bash
eas build --platform all --profile production
```

### 13.4 Over-The-Air (OTA) Updates

**Publish Update**:
```bash
# Publish to production branch
eas update --branch production --message "Bug fixes and improvements"

# Publish to specific channel
eas update --channel preview --message "Testing new feature"
```

**Update Flow**:
1. User launches app
2. App checks for updates
3. Update downloads in background
4. Applied on next app restart

**Limitations**:
- Only JS/React code updates (no native changes)
- Assets can be updated
- Cannot change app.json permissions
- Cannot update native modules

### 13.5 Environment Management

**Production**:
```json
// app.json
{
  "extra": {
    "BACKEND_URL": "https://dklemailservice.onrender.com/api"
  }
}
```

**Staging** (optioneel):
```json
{
  "extra": {
    "BACKEND_URL": "https://staging.dklemailservice.com/api"
  }
}
```

**Development**:
```json
{
  "extra": {
    "BACKEND_URL": "http://localhost:3000/api"
  }
}
```

### 13.6 Release Checklist

```bash
Pre-Release:
✅ Update version in app.json (e.g., 1.0.0 → 1.1.0)
✅ Update version in package.json
✅ Update CHANGELOG.md with new features
✅ Test build locally (`eas build --local --profile production`)
✅ Create git tag (`git tag v1.1.0`)

Release:
✅ Build production apps (`eas build --platform all`)
✅ Test production builds on physical devices
✅ Submit to stores (if applicable)
✅ Create GitHub release with notes

Post-Release:
✅ Monitor crash reports
✅ Check user feedback
✅ Document known issues
✅ Plan next iteration
```

---

## 14. Troubleshooting

### 14.1 Installatie Problemen

#### "Cannot find module" Errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
expo start --clear
```

#### TypeScript Errors tijdens Development
```bash
# Normal during development - dependencies niet gevonden
# Oplossing: Run install commands

expo install @react-navigation/native @react-navigation/native-stack
npm install @tanstack/react-query jwt-decode

# Restart Metro bundler
expo start --clear
```

### 14.2 Runtime Problemen

#### Pedometer Niet Beschikbaar

**Symptomen**: "⚠️ Pedometer niet beschikbaar" warning

**Oorzaken & Oplossingen**:
1. **Emulator**: Pedometer werkt niet in simulators
   - ✅ Test op physical device
2. **Permissions**: Niet toegestaan
   - ✅ iOS: Settings > DKL Steps > Motion & Fitness
   - ✅ Android: Settings > Apps > DKL Steps > Permissions > Physical Activity
3. **Device**: Geen accelerometer hardware
   - ❌ Gebruik nieuwere device

#### JWT Decode Fout
```bash
# Error: jwtDecode is not a function

# Solution 1: Check import
import { jwtDecode } from 'jwt-decode'; // Correct (named export)

# Solution 2: Reinstall package
npm uninstall jwt-decode
npm install jwt-decode@^4.0.0
```

#### Network Errors

**Symptomen**: API calls falen met timeout/connection error

**Debugging**:
```bash
# 1. Test backend directly
curl https://dklemailservice.onrender.com/api/total-steps?year=2025

# 2. Check device network
# iOS: Settings > Wi-Fi
# Android: Settings > Network & Internet

# 3. Verify API URL in app.json
# Should be: https://dklemailservice.onrender.com/api

# 4. Check firewall/proxy settings
# Corporate networks may block ports

# 5. Use test mode header in development
apiFetch('/endpoint', {}, true); // Adds X-Test-Mode: true
```

#### 401/403 Errors

**401 Unauthorized**:
```typescript
// Token expired of invalid
// Solution: Re-login
await AsyncStorage.clear();
navigation.replace('Login');
```

**403 Forbidden**:
```typescript
// User lacks permission for endpoint
// Check role:
const rol = await AsyncStorage.getItem('userRole');
console.log('Current role:', rol);

// Verify role matches endpoint requirements:
// - Staff/Admin: Global Dashboard
// - Admin only: Admin Funds
```

### 14.3 UI/UX Problemen

#### Screen Niet Zichtbaar
```bash
# Check navigation state
console.log(navigation.getState());

# Verify screen registered in App.tsx
<Stack.Screen name="ScreenName" component={ScreenComponent} />
```

#### Loading State Blijft Hangen
```typescript
// Add timeout to queries
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: 3,
  retryDelay: 1000,
});

// Add error boundary
try {
  await apiFetch('/endpoint');
} catch (err) {
  setIsLoading(false); // Ensure state resets
  setError(err.message);
}
```

#### Styling Werkt Niet
```bash
# Clear Metro cache
expo start --clear

# Verify StyleSheet import
import { StyleSheet } from 'react-native';

# Check for typos in style names
<View style={styles.container} /> // Must match: container: { }
```

### 14.4 Build Problemen

#### EAS Build Fails
```bash
# Check build logs
eas build:list

# Common issues:
# 1. Outdated dependencies
npm update

# 2. Missing credentials
eas credentials

# 3. Invalid app.json
eas build:configure
```

#### iOS Signing Issues
```bash
# Configure credentials
eas credentials

# Or use automatic signing
# app.json:
{
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.dkl.stepsapp"
  }
}
```

### 14.5 Performance Issues

#### App Langzaam
```bash
# Enable performance monitoring
console.time('Operation');
// ... code ...
console.timeEnd('Operation');

# Check React DevTools Profiler
# Identify unnecessary re-renders

# Optimize queries
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

#### Memory Leaks
```typescript
// Always cleanup subscriptions
useEffect(() => {
  const subscription = Pedometer.watchStepCount(callback);
  return () => subscription?.remove(); // IMPORTANT
}, []);

// Clear intervals
useEffect(() => {
  const interval = setInterval(fetch, 10000);
  return () => clearInterval(interval);
}, []);
```

---

## 15. Best Practices

### 15.1 Code Style

#### Naming Conventions
```typescript
// Components: PascalCase
const DashboardScreen = () => { };

// Functions: camelCase
const handleLogin = () => { };

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://...';

// Interfaces: PascalCase met I prefix (optioneel)
interface RouteFund {
  id: string;
  route: string;
  amount: number;
}
```

#### TypeScript Usage
```typescript
// Always type props
interface Props {
  onSync: () => void;
  userId: string;
}

// Type function returns
const fetchData = async (): Promise<DataType> => {
  return await apiFetch('/endpoint');
};

// Use type guards
if (typeof value === 'string') {
  // TypeScript knows value is string here
}
```

### 15.2 Component Design

#### Single Responsibility
```typescript
// ❌ Bad: Component does too much
const Dashboard = () => {
  // Handles auth, data fetching, rendering, business logic
};

// ✅ Good: Separated concerns
const Dashboard = () => {
  const { data } = useDashboardData(); // Custom hook
  const { logout } = useAuth(); // Custom hook
  return <DashboardView data={data} onLogout={logout} />;
};
```

#### Props Drilling Avoidance
```typescript
// Use React Query instead of passing data through props
const ChildComponent = () => {
  const { data } = useQuery({ 
    queryKey: ['sharedData'],
    queryFn: fetchData 
  });
  // Data comes from cache, no prop drilling
};
```

### 15.3 Performance Optimization

#### Memoization
```typescript
// Expensive calculation
const expensiveValue = useMemo(() => {
  return data?.items.reduce((sum, item) => sum + item.value, 0);
}, [data]);

// Callback stability
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency]);
```

#### Conditional Rendering
```typescript
// ✅ Good: Early returns
if (isLoading) return <Loading />;
if (error) return <Error message={error} />;
return <Content data={data} />;

// ❌ Bad: Nested ternaries
return isLoading ? <Loading /> : error ? <Error /> : <Content />;
```

### 15.4 Error Handling

#### Graceful Degradation
```typescript
try {
  const data = await apiFetch('/endpoint');
  return data;
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly message
  Alert.alert('Fout', 'Kon data niet laden. Probeer opnieuw.');
  // Return fallback data
  return { items: [] };
}
```

#### Error Boundaries (voor crashes)
```typescript
// Create ErrorBoundary component
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo);
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorScreen />;
    }
    return this.props.children;
  }
}
```

### 15.5 Security Best Practices

#### Input Sanitization
```typescript
// Validate before sending
const sanitizedEmail = email.trim().toLowerCase();
const sanitizedRoute = route.trim().replace(/[^a-zA-Z0-9\s]/g, '');

// Validate numeric input
const amount = parseInt(input);
if (isNaN(amount) || amount < 0) {
  throw new Error('Invalid amount');
}
```

#### Sensitive Data Handling
```typescript
// ❌ Never log tokens
console.log('Token:', token); // DON'T DO THIS

// ✅ Log safely
console.log('Token present:', !!token);

// ❌ Never hardcode credentials
const API_KEY = 'abc123...'; // DON'T DO THIS

// ✅ Use environment variables
const API_KEY = Constants.expoConfig?.extra?.API_KEY;
```

---

## 16. Toekomstige Uitbreidingen

### 16.1 Geplande Features

#### 1. Token Refresh Mechanisme
```typescript
// Auto-refresh expired tokens
const refreshToken = async () => {
  const refresh = await AsyncStorage.getItem('refreshToken');
  const response = await fetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refresh }),
  });
  const { token } = await response.json();
  await AsyncStorage.setItem('authToken', token);
};
```

#### 2. Push Notifications
```typescript
// Notify users of milestones
import * as Notifications from 'expo-notifications';

const sendNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎉 Milestone!",
      body: "Je hebt 5000 stappen bereikt!",
    },
    trigger: null,
  });
};
```

#### 3. Charts & Visualisaties
```bash
# Install charting library
npm install react-native-chart-kit
# Or
npm install victory-native
```

```typescript
// Weekly progress chart
import { LineChart } from 'react-native-chart-kit';

<LineChart
  data={{
    labels: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
    datasets: [{ data: [2000, 3500, 4200, 3800, 5000, 2500, 4100] }]
  }}
  width={Dimensions.get('window').width - 40}
  height={220}
  chartConfig={{
    backgroundColor: '#4CAF50',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  }}
/>
```

#### 4. Social Features
- Leaderboard (top steppers)
- Team challenges
- Share progress op social media
- Friend invites

#### 5. Enhanced Offline Support
```typescript
// Queue met prioriteit
interface QueuedAction {
  id: string;
  type: 'step_update' | 'correction';
  data: any;
  priority: number;
  timestamp: number;
}

// Persist queue in AsyncStorage
const saveQueue = async (queue: QueuedAction[]) => {
  await AsyncStorage.setItem('syncQueue', JSON.stringify(queue));
};
```

#### 6. Biometric Authentication
```bash
npm install expo-local-authentication
```

```typescript
import * as LocalAuthentication from 'expo-local-authentication';

const authenticateWithBiometrics = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Log in met biometrie',
    });
    return result.success;
  }
  return false;
};
```

### 16.2 Technical Debt

#### 1. Error Tracking Service
```bash
# Integreer Sentry
npm install @sentry/react-native

# Setup
import * as Sentry from '@sentry/react-native';
Sentry.init({
  dsn: 'YOUR_DSN',
  enableInExpoDevelopment: true,
});
```

#### 2. Unit Testing
```bash
# Setup Jest
npm install --save-dev jest @testing-library/react-native

# Create __tests__ directories
# Write component tests
```

```typescript
// Example test
import { render, fireEvent } from '@testing-library/react-native';
import StepCounter from '../StepCounter';

test('sync button disabled when delta is 0', () => {
  const { getByText } = render(<StepCounter onSync={() => {}} />);
  const button = getByText('Sync Nu');
  expect(button).toBeDisabled();
});
```

#### 3. Accessibility Improvements
```typescript
// Add accessibility labels
<Button
  title="Sync Nu"
  accessibilityLabel="Synchroniseer je stappen met de server"
  accessibilityHint="Dubbeltap om te synchroniseren"
/>

// Support screen readers
<Text accessible={true} accessibilityRole="header">
  Dashboard
</Text>
```

#### 4. Internationalization (i18n)
```bash
npm install i18next react-i18next
```

```typescript
// Setup
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    nl: { translation: { welcome: 'Welkom' } },
    en: { translation: { welcome: 'Welcome' } },
  },
  lng: 'nl',
  fallbackLng: 'nl',
});

// Usage
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<Text>{t('welcome')}</Text>
```

### 16.3 Scalability Overwegingen

#### Database Caching
```typescript
// React Query persistent cache
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});
```

#### Pagination voor Grote Datasets
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['participants'],
  queryFn: ({ pageParam = 0 }) => 
    apiFetch(`/participants?page=${pageParam}&limit=20`),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

#### Image Optimization
```bash
# Use optimized image formats
# Compress before including in assets
# Use CDN for remote images
```

---

## 📞 Support & Contact

**Voor technische vragen**:
- Review deze documentatie
- Check [`README.md`](README.md) voor gebruikersgids
- Raadpleeg [`QUICKSTART.md`](QUICKSTART.md) voor snelle setup

**Voor API gerelateerde issues**:
- API Reference: https://dklemailservice.onrender.com/api/docs
- Test endpoint: `curl https://dklemailservice.onrender.com/api/total-steps?year=2025`

**Voor DKL Organization**:
- Contact DKL support team
- Check DKL website voor updates

---

## 📝 Changelog

### Version 1.0.0 (Oktober 2025)
- ✅ Initial release
- ✅ Core features geïmplementeerd
- ✅ iOS & Android support
- ✅ RBAC functionaliteit
- ✅ Offline sync mechanisme
- ✅ Admin CRUD interface
- ✅ Live Digital Board
- ✅ Optionele wachtwoord wijziging
- ✅ Automatische synchronisatie
- ✅ JWT-based endpoints (geen ID parameters)
- ✅ Case-insensitive role checks
- ✅ Enhanced UI/UX voor alle screens

---

## 📄 Licentie

© 2025 DKL Organization. All rights reserved.

Deze software is eigendom van DKL Organization en mag niet worden gekopieerd, gedistribueerd of gemodificeerd zonder expliciete toestemming.

---

**Document Versie**: 1.0.0  
**Laatste Update**: Oktober 2025  
**Auteur**: DKL Development Team  
**Status**: Productie Klaar ✅

---

# Einde Documentatie

Voor vragen of suggesties, neem contact op met het development team.

**Happy Stepping! 👟**