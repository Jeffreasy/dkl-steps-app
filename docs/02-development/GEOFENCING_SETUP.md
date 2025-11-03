# Geofencing Setup - Complete Guide

**Project:** DKL Steps App (Frontend Only)  
**Backend:** https://dklemailservice.onrender.com  
**Status:** ✅ Frontend Ready - ⏳ Backend Event Vereist

---

## 📋 Project Structuur

Dit is een **frontend-only** React Native/Expo project:
- ✅ Frontend: Deze repository (dkl-steps-app)
- ✅ Backend: Render hosted (dklemailservice.onrender.com)
- ❌ Geen local backend - altijd tegen production

---

## 🎯 Setup Overzicht

### Frontend (DIT PROJECT) - ✅ 100% KLAAR

**Dependencies:**
```bash
✅ expo-location, expo-task-manager - Installed
✅ @turf/turf, @turf/helpers - Installed
```

**Code:**
```bash
✅ Geofencing hooks geïmplementeerd
✅ Event data fetching geïmplementeerd
✅ Conditional tracking geïmplementeerd
✅ UI components klaar
✅ Opt-in feature (geen spam)
✅ Infinite loop fixed
✅ Backend API compatible
```

**Config:**
```bash
✅ app.json - Permissions voor iOS/Android
✅ App.tsx - Background task registered
✅ Types - Match backend 100%
```

### Backend (RENDER PRODUCTION) - ⏳ 1 STAP VEREIST

**Wat al werkt:**
```bash
✅ API endpoints live (/api/events, /api/events/active)
✅ Database schema (V1.53)
✅ RBAC permissions
```

**Wat ontbreekt:**
```bash
⏳ Actief event moet aangemaakt worden
```

---

## 🚀 Quick Start (5 Minuten)

### Stap 1: Frontend Klaar (Already Done)

```bash
# Je bent al in de frontend directory
cd dkl-steps-app

# Dependencies zijn geïnstalleerd
npm install # (Already done)

# Start app
npm start

# ✅ Frontend is klaar!
```

### Stap 2: Backend Event Aanmaken (1x Setup)

**Via cURL (Simpelst):**

```bash
# 1. Login als admin
curl -X POST https://dklemailservice.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dekoninklijkeloop.nl","wachtwoord":"Bootje@12"}'

# Kopieer token uit response

# 2. Maak event aan
curl -X POST https://dklemailservice.onrender.com/api/events \
  -H "Authorization: Bearer PASTE_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "De Koninklijke Loop 2025 - GPS Test",
    "description": "Test event voor geofencing",
    "start_time": "2025-01-01T00:00:00Z",
    "end_time": "2025-12-31T23:59:59Z",
    "status": "active",
    "is_active": true,
    "geofences": [
      {
        "type": "start",
        "lat": 52.5185,
        "long": 5.7220,
        "radius": 500,
        "name": "Dronten Spiegelstraat"
      }
    ]
  }'

# 3. Verify
curl https://dklemailservice.onrender.com/api/events/active
# Should return 200 OK met event data
```

### Stap 3: Test in App

```bash
# 1. App is al running (npm start)
# 2. Login als deelnemer (bijv. diesbosje@hotmail.com)
# 3. Scroll in dashboard
# 4. Tap "📍 Event Locatie Tracking" beta card
# 5. App haalt event op van production backend ✅
# 6. GeofenceManager verschijnt met event info
# 7. Tap "Start Monitoring"
# 8. Grant GPS permission
# 9. Spoof GPS naar 52.5185, 5.7220 (emulator)
# 10. Status: "✓ Binnen Gebied" ✅
```

**Totale tijd:** ~5 minuten

---

## 📱 Frontend Development Setup

### Environment Files

**Geen .env.local nodig!** App gebruikt productie backend via [`app.json`](app.json:42):
```json
"extra": {
  "BACKEND_URL": "https://dklemailservice.onrender.com/api"
}
```

Dit is **altijd production** - geen local backend.

### Testing Against Production

```typescript
// In app code - API calls gaan naar production:
const event = await apiFetch('/events/active');
// → https://dklemailservice.onrender.com/api/events/active

// Dit is OK! Backend is stateless en test-safe.
```

### GPS Testing (Emulator)

**iOS Simulator:**
```bash
# Start app
expo start --ios

# In simulator:
Debug > Simulate Location > Custom Location
Latitude: 52.5185
Longitude: 5.7220

# Status should change to: "✓ Binnen Gebied"
```

**Android Emulator:**
```bash
# Start app
expo start --android

# In emulator:
Extended Controls (⋮) > Location
Latitude: 52.5185
Longitude: 5.7220
Click "Send"

# Status should change to: "✓ Binnen Gebied"
```

---

## 🧪 Complete Testing Checklist

### Pre-Test (Backend Setup)

- [ ] Run cURL login command
- [ ] Run cURL create event command
- [ ] Verify: `curl https://dklemailservice.onrender.com/api/events/active` → 200 OK
- [ ] Response heeft geofences array

### Frontend Testing

- [x] Dependencies installed (`npm install`)
- [x] App starts zonder errors (`npm start`)
- [ ] Login als deelnemer (diesbosje@hotmail.com)
- [ ] Dashboard loads zonder crashes
- [ ] Zie beta card: "📍 Event Locatie Tracking"
- [ ] Tap beta card → GeofenceManager appears
- [ ] Event naam zichtbaar: "GPS Test"
- [ ] Geofences lijst zichtbaar (4 items)
- [ ] Tap "Start Monitoring"
- [ ] Permission dialog appears
- [ ] Grant permission (Always Allow / All the time)
- [ ] Status initialiseert als "⚠ Buiten Gebied" (waarschijnlijk)

### GPS Testing (Emulator)

- [ ] Spoof GPS naar 52.5185, 5.7220
- [ ] Distance updates: groot → klein
- [ ] Bij <500m: Status → "✓ Binnen Gebied"
- [ ] Toast notification: "Je bent binnen het event gebied!"
- [ ] SimpleStepDisplay: "✓ Tracking Actief"
- [ ] Begin lopen in emulator (of tap test button)
- [ ] Steps worden geteld ✅
- [ ] Bij 50 steps: Auto-sync
- [ ] WebSocket update: Real-time

### Background Testing (Physical Device Only)

- [ ] Build standalone app (`eas build`)
- [ ] Install op physical device
- [ ] Enable geofencing + grant permission
- [ ] Minimize app
- [ ] Android: Notification "DKL Steps Tracking" verschijnt
- [ ] iOS: Blue status bar verschijnt
- [ ] Loop in/uit geofence
- [ ] Re-open app
- [ ] Status is updated ✅

---

## 🎯 Quick Reference

### Backend Event Aanmaken (1x Setup)

```bash
# Login + Maak Event (kopieer beide commands)
# 1. Get token
TOKEN=$(curl -s -X POST https://dklemailservice.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dekoninklijkeloop.nl","wachtwoord":"Bootje@12"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Create event
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
```

### Verify Backend Event

```bash
curl https://dklemailservice.onrender.com/api/events/active

# ✅ 200 OK → Event exists, ready to test!
# ❌ 404 → Run create event cURL above
```

### Test in Frontend

```bash
npm start
# Login → Enable geofencing → Test!
```

---

## 🎉 Summary

**Dit project setup:**
- Frontend React Native app (dit repo)
- Backend API op Render (productie only)
- Geen local backend - altijd tegen production testen
- Frontend is 100% klaar
- Backend event moet 1x aangemaakt worden (via cURL)

**Next:** Run de cURL commands boven om backend event aan te maken, dan is alles klaar om te testen! 🚀