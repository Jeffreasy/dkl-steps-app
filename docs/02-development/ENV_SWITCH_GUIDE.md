# Environment Switching Guide

**Frontend App:** Switchen tussen Local Docker & Production Render  
**Datum:** 2025-11-03

---

## 🎯 Overzicht

De DKL Steps App kan verbinden met:
- 🐳 **Local Docker Backend** (localhost:8082) - Voor development
- ☁️ **Production Render Backend** (dklemailservice.onrender.com) - Voor testing/productie

---

## ⚡ Quick Switch

### Switch naar Local Docker

**Open:** [`src/config/environment.ts:49`](src/config/environment.ts:49)

```typescript
// CHANGE THIS LINE:
const CURRENT_ENVIRONMENT: Environment = 'local'; // Was: 'production'
```

**Save, herstart app:**
```bash
# Stop app (Ctrl+C)  
npm start
# App verbindt nu met localhost:8082 ✅
```

### Switch naar Production

**Open:** [`src/config/environment.ts:49`](src/config/environment.ts:49)

```typescript
// CHANGE THIS LINE:
const CURRENT_ENVIRONMENT: Environment = 'production'; // Was: 'local'
```

**Save, herstart app:**
```bash
# Stop app (Ctrl+C)
npm start
# App verbindt nu met dklemailservice.onrender.com ✅
```

---

## 🐳 Local Docker Backend Setup

### Stap 1: Start Docker Services

```bash
# Ga naar backend directory (NIET deze frontend directory)
cd ../dklemailservice  # Of waar je backend is

# Start Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Verify services running
docker-compose ps

# Should show:
NAME                IMAGE               STATUS      PORTS
postgres            postgres:15-alpine  Up          0.0.0.0:5433->5432
redis               redis:7-alpine      Up          0.0.0.0:6380->6379  
app                 dklemailservice-app Up          0.0.0.0:8082->8080
```

### Stap 2: Create Local Test Event

```bash
# Run SQL script (in backend directory)
psql -h localhost -p 5433 -U postgres -d dkl_db \
  -f database/migrations/V1_53__add_events_table.sql  # Als nog niet gedaan

psql -h localhost -p 5433 -U postgres -d dkl_db \
  -f database/scripts/setup_local_test_event.sql

# Output should show:
# ✅ Local test event created successfully!
# 📍 Event: De Koninklijke Loop 2025 - LOCAL TEST
# 📍 Location: Utrecht Domplein (52.0907, 5.1214)
```

### Stap 3: Verify Local Backend

```bash
# Test local API endpoint
curl http://localhost:8082/api/events/active

# Expected: 200 OK met event data
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "De Koninklijke Loop 2025 - LOCAL TEST",
  "geofences": [
    {
      "type": "start",
      "lat": 52.0907,
      "long": 5.1214,
      "radius": 500,
      "name": "Start - Utrecht Domplein"
    }
  ],
  "status": "active",
  "is_active": true
}
```

### Stap 4: Update Frontend IP (Eenmalig)

**Find Your Machine IP:**

```bash
# Windows:
ipconfig
# Look for: IPv4 Address (bijv. 192.168.1.252)

# Mac:
ifconfig | grep "inet "
# Look for: 192.168.x.x (niet 127.0.0.1)

# Linux:
ip addr show | grep "inet "
```

**Update [`src/config/environment.ts:24`](src/config/environment.ts:24):**

```typescript
local: {
  ios: 'http://192.168.1.252:8082/api', // ✏️ VERVANG met jouw IP
  android: 'http://10.0.2.2:8082/api',   // ✅ Correct (Android emulator alias)
  default: 'http://192.168.1.252:8082/api', // ✏️ VERVANG met jouw IP
},
```

### Stap 5: Switch App naar Local

**Open:** [`src/config/environment.ts:49`](src/config/environment.ts:49)

```typescript
const CURRENT_ENVIRONMENT: Environment = 'local'; // Changed!
```

**Restart app:**
```bash
cd dkl-steps-app  # Deze directory
npm start
```

**Logs should show:**
```
INFO API Request: GET /events/active
INFO Using backend: http://192.168.1.252:8082/api
INFO Fetched active event: De Koninklijke Loop 2025 - LOCAL TEST
```

---

## ☁️ Production Render Backend Setup

### Stap 1: Verify Production API

```bash
# Test production endpoint
curl https://dklemailservice.onrender.com/api/events/active

# Als 404 → Event moet aangemaakt worden
# Als 200 → Production is ready!
```

### Stap 2: Create Production Event (Als Nodig)

```bash
# Login als admin
TOKEN=$(curl -s -X POST https://dklemailservice.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dekoninklijkeloop.nl","wachtwoord":"Bootje@12"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Create event
curl -X POST https://dklemailservice.onrender.com/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "De Koninklijke Loop 2025 - GPS Test",
    "start_time": "2025-01-01T00:00:00Z",
    "end_time": "2025-12-31T23:59:59Z",
    "status": "active",
    "is_active": true,
    "geofences": [
      {"type":"start","lat":52.5185,"long":5.7220,"radius":500,"name":"Dronten Spiegelstraat"}
    ]
  }'

# Verify
curl https://dklemailservice.onrender.com/api/events/active
# Should return 200 OK
```

### Stap 3: Switch App naar Production

**Open:** [`src/config/environment.ts:49`](src/config/environment.ts:49)

```typescript
const CURRENT_ENVIRONMENT: Environment = 'production'; // Changed!
```

**Restart app:**
```bash
npm start
```

**Logs should show:**
```
INFO Using backend: https://dklemailservice.onrender.com/api
INFO Fetched active event: De Koninklijke Loop 2025 - GPS Test
```

---

## 🔄 Environment Comparison

| Feature | Local Docker | Production Render |
|---------|-------------|-------------------|
| **Backend URL** | http://localhost:8082/api | https://dklemailservice.onrender.com/api |
| **iOS Simulator** | http://192.168.1.252:8082/api | https://... |
| **Android Emulator** | http://10.0.2.2:8082/api | https://... |
| **Database** | Docker PostgreSQL (port 5433) | Render PostgreSQL |
| **Test Event** | Utrecht (52.0907, 5.1214) | Dronten (52.5185, 5.7220) |  
| **GPS Testing** | Emulator spoof naar Utrecht | Emulator/Device naar Dronten |
| **Use Case** | Development & debugging | Testing & productie |

---

## 🧪 Testing Different Environments

### Test Local Backend

```bash
# 1. Switch to local (environment.ts)
const CURRENT_ENVIRONMENT = 'local';

# 2. Start Docker backend
cd ../backend && docker-compose up -d

# 3. Restart frontend app
cd ../dkl-steps-app && npm start

# 4. In app:
# - Login
# - Enable geofencing
# - Should see: "Local TEST" event
# - Spoof GPS: 52.0907, 5.1214 (Utrecht)
# - Status: "✓ Binnen Gebied" ✅
```

### Test Production Backend

```bash
# 1. Switch to production (environment.ts)
const CURRENT_ENVIRONMENT = 'production';

# 2. Restart frontend app
npm start

# 3. In app:
# - Login
# - Enable geofencing
# - Should see: "GPS Test" event
# - Spoof GPS: 52.5185, 5.7220 (Dronten)
# - Status: "✓ Binnen Gebied" ✅
```

---

## 🐛 Troubleshooting

### "Network request failed" in Local Mode

**Probleem:** App kan localhost niet bereiken

**Check:**
```bash
# 1. Is Docker backend running?
docker-compose ps
# Should show: app (Up)

# 2. Is port 8082 open?
curl http://localhost:8082/api/health
# Should return: {"status":"ok"}

# 3. Is IP address correct?
# Open environment.ts en check IP match jouw machine
ipconfig  # Windows
ifconfig  # Mac/Linux
# Update environment.ts met correct IP
```

**iOS Simulator:** Moet jouw machine IP gebruiken (niet localhost)  
**Android Emulator:** Kan 10.0.2.2 gebruiken (alias voor host)

### "404 Not Found" voor Events

**Check welke backend actief is:**

```typescript
// Add to App.tsx tijdelijk:
import { getEnvironmentInfo } from './src/config/environment';
console.log('Environment:', getEnvironmentInfo());

// Output:
// {
//   environment: 'local',
//   backendURL: 'http://192.168.1.252:8082/api',
//   platform: 'ios',
//   isProduction: false
// }
```

**Dan test correct backend:**
```bash
# Local:
curl http://localhost:8082/api/events/active

# Production:
curl https://dklemailservice.onrender.com/api/events/active
```

### Constantly Switching Back

**Probleem:** Na restart app gebruikt verkeerde backend

**Cause:** Metro bundler cache

**Fix:**
```bash
# Clear cache en restart
npm start -- --clear

# OF
expo start -c
```

---

## 💡 Pro Tips

### 1. Check Current Environment in App

Add debug info in app (dev mode only):

```typescript
// In any component (bijv. LoginScreen)
import { getEnvironmentInfo } from '../config/environment';

if (__DEV__) {
  const env = getEnvironmentInfo();
  console.log('🔧 Backend:', env.backendURL);
}
```

### 2. Different GPS Coordinates Per Environment

```typescript
// Local = Utrecht coordinates
// Production = Dronten coordinates

// Spoof accordingly:
const TEST_COORDS = {
  local: { lat: 52.0907, long: 5.1214 }, // Utrecht
  production: { lat: 52.5185, long: 5.7220 }, // Dronten
};
```

### 3. Quick Environment Check

```bash
# Check welke backend wordt gebruikt
grep "CURRENT_ENVIRONMENT" src/config/environment.ts

# Output:
# const CURRENT_ENVIRONMENT: Environment = 'production';
# → App gebruikt production

# OF:
# const CURRENT_ENVIRONMENT: Environment = 'local';  
# → App gebruikt local Docker
```

---

## 📊 Recommended Workflow

### Development Workflow:

```bash
# 1. Start local Docker backend
cd backend && docker-compose up -d

# 2. Switch frontend to local
# Edit environment.ts → CURRENT_ENVIRONMENT = 'local'

# 3. Create local test event
psql -h localhost -p 5433 ... -f setup_local_test_event.sql

# 4. Start frontend
cd dkl-steps-app && npm start

# 5. Test met Utrecht coordinates (52.0907, 5.1214)
```

### Pre-Production Testing:

```bash
# 1. Switch frontend to production
# Edit environment.ts → CURRENT_ENVIRONMENT = 'production'

# 2. Restart app
npm start

# 3. Test tegen echte production backend
# 4. Test met Dronten coordinates (52.5185, 5.7220)
```

### Production Deploy:

```bash
# environment.ts MOET op 'production' staan!
grep "CURRENT_ENVIRONMENT" src/config/environment.ts
# Should show: 'production'

# Build
eas build --profile production --platform all
```

---

## ✅ Setup Checklist

### Één Keer Setup (Local Docker):

- [ ] Clone backend repo (als je die hebt)
- [ ] `docker-compose up` in backend directory
- [ ] Run migration V1.53
- [ ] Run setup_local_test_event.sql
- [ ] Verify: `curl http://localhost:8082/api/events/active` → 200 OK
- [ ] Update IP in environment.ts (windows: ipconfig, mac: ifconfig)

### Één Keer Setup (Production):

- [ ] Verify: `curl https://dklemailservice.onrender.com/api/events/active`
- [ ] Als 404: Run cURL event create command
- [ ] Verify: 200 OK met event data

### Daily Development:

- [ ] Start Docker: `cd backend && docker-compose up -d`
- [ ] Switch environment.ts: `CURRENT_ENVIRONMENT = 'local'`
- [ ] Start app: `npm start`
- [ ] Test in emulator met Utrecht GPS

### Before Deploy:

- [ ] Switch environment.ts: `CURRENT_ENVIRONMENT = 'production'`  
- [ ] Test app tegen production
- [ ] Verify alles werkt
- [ ] Build: `eas build`

---

## 🎯 Current Status

**Check welke environment actief is:**

```bash
cat src/config/environment.ts | grep "CURRENT_ENVIRONMENT"

# Output:
const CURRENT_ENVIRONMENT: Environment = 'production';
# → Currently pointing to PRODUCTION ✅
```

**Change to local:**
```typescript
// In src/config/environment.ts line 49:
const CURRENT_ENVIRONMENT: Environment = 'local';
```

**App wijst nu naar:** `http://192.168.1.252:8082/api` (pas IP aan naar jouw machine)

---

## 📝 Quick Reference

| Actie | Command/File |
|-------|--------------|
| Switch to Local | Edit `environment.ts:49` → `'local'` |
| Switch to Production | Edit `environment.ts:49` → `'production'` |
| Check Current | `grep CURRENT_ENVIRONMENT src/config/environment.ts` |
| Update Local IP | Edit `environment.ts:24` met jouw machine IP |
| Start Docker | `cd backend && docker-compose up -d` |
| Stop Docker | `cd backend && docker-compose down` |
| Test Local API | `curl http://localhost:8082/api/events/active` |
| Test Prod API | `curl https://dklemailservice.onrender.com/api/events/active` |

---

**Default:** Production (veilig voor deployment)  
**Switch:** Edit 1 lijn in environment.ts  
**Restart:** App pakt nieuwe config op  
**Ready:** ✅ Kan nu switchen tussen local & production!