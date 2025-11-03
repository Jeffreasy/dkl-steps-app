# DKL Steps App - Quick Start Guide

## ⚡ Snel aan de slag

### Stap 1: Dependencies Installeren

```bash
cd dkl-steps-app

# Installeer alle dependencies (Expo + NPM)
npm install
```

**Of handmatig:**

```bash
# Expo dependencies (reeds geïnstalleerd)
expo install @react-navigation/native @react-navigation/native-stack expo-sensors @react-native-async-storage/async-storage expo-constants @react-native-community/netinfo

# NPM dependencies (reeds geïnstalleerd)
npm install @tanstack/react-query jwt-decode
```

### Stap 2: Start de App

```bash
expo start
```

### Stap 3: Open in Expo Go

- Scan de QR code met je telefoon
- Of druk `a` voor Android emulator
- Of druk `i` voor iOS simulator (macOS only)

## 🔐 Test Credentials

Registreer eerst via de DKL website om credentials te krijgen:
- Email: [jouw email]
- Password: [jouw password]

## 📱 Screens Overzicht

1. **Login** → Authenticatie met JWT + RBAC (deelnemer/staff/admin)
2. **Dashboard** → Persoonlijke stappen tracker met real-time sync
3. **Global Dashboard** → Admin/Staff totalen + fondsen distributie (RBAC)
4. **Digital Board** → Live community display (updates elke 10s)
5. **Admin Funds** → Admin CRUD voor route fondsen (RBAC)
6. **Event Management** → Admin event & geofence beheer (RBAC)
7. **Profile** → Gebruikersprofiel & instellingen
8. **Change Password** → Wachtwoord wijzigen

## 🎯 Key Features te Testen

- ✅ **Real-time stappen tracking** (loop rond! - auto-sync elke 50 stappen)
- ✅ **WebSocket live updates** (real-time data van server)
- ✅ **Sync button** (handmatige sync)
- ✅ **Correctie button** (-100 stappen)
- ✅ **Offline mode** (airplane mode test - queue systeem)
- ✅ **Role-based access** (probeer global dashboard als Deelnemer)
- ✅ **Live Digital Board** (updates elke 10s)
- ✅ **Geofencing** (conditional tracking binnen event gebied)
- ✅ **Animations** (smooth UI transitions)
- ✅ **Haptic feedback** (success/error feedback)

## 🚨 Troubleshooting

**TypeScript errors?**
- Normaal tijdens development
- Verdwijnen na dependencies installatie

**Pedometer werkt niet?**
- Test op fysiek device (niet emulator)
- Check permissions in Settings
- Expo Go: beperkt - bouw standalone APK voor volledige functionaliteit

**WebSocket niet werkend?**
- Check `ENABLE_WEBSOCKET=true` in .env.local
- Controleer backend WebSocket endpoint

**Geofencing niet actief?**
- Check `ENABLE_GEOFENCING=true` in .env.local
- Controleer of er een actief event is in Event Management

**API errors?**
- Test backend: `curl https://dklemailservice.onrender.com/api/total-steps?year=2025`
- Voeg `X-Test-Mode: true` header toe in development
- Check .env.local voor BACKEND_URL

## 📚 Meer Info

Zie [`README.md`](README.md) voor volledige documentatie.

---

**Veel succes! 🎉**