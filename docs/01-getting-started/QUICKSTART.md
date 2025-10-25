# DKL Steps App - Quick Start Guide

## ⚡ Snel aan de slag

### Stap 1: Dependencies Installeren

```bash
cd dkl-steps-app

# Installeer Expo dependencies
expo install @react-navigation/native @react-navigation/native-stack expo-sensors @react-native-async-storage/async-storage expo-constants @react-native-community/netinfo

# Installeer NPM dependencies
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

1. **Login** → Authenticatie met JWT
2. **Dashboard** → Persoonlijke stappen tracker
3. **Global Dashboard** → Admin/Staff totalen (RBAC)
4. **Digital Board** → Live community display
5. **Admin Funds** → Admin CRUD voor routes (RBAC)

## 🎯 Key Features te Testen

- ✅ Real-time stappen tracking (loop rond!)
- ✅ Sync button (handmatige sync)
- ✅ Correctie button (-100 stappen)
- ✅ Offline mode (airplane mode test)
- ✅ Role-based access (probeer global dashboard als Deelnemer)
- ✅ Live updates (Digital Board refresh elke 10s)

## 🚨 Troubleshooting

**TypeScript errors?**
- Normaal tijdens development
- Verdwijnen na dependencies installatie

**Pedometer werkt niet?**
- Test op fysiek device (niet emulator)
- Check permissions in Settings

**API errors?**
- Test backend: `curl https://dklemailservice.onrender.com/api/total-steps?year=2025`
- Voeg `X-Test-Mode: true` header toe in development

## 📚 Meer Info

Zie [`README.md`](README.md) voor volledige documentatie.

---

**Veel succes! 🎉**