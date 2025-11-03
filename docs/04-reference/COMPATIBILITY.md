# Compatibility Matrix - DKL Steps App

**Version**: 1.0.0
**Date**: 2025-11-03
**Status**: 🔄 Complete Compatibility Reference

Deze matrix toont de compatibiliteit van verschillende versies van de DKL Steps App met platforms, dependencies en externe systemen.

## 📋 Overzicht

### Matrix Types
- **Platform Compatibility**: iOS/Android versies
- **Dependency Matrix**: Package versies per app versie
- **API Compatibility**: Backend API versie vereisten
- **Device Support**: Hardware vereisten
- **Migration Paths**: Upgrade instructies

---

## 📱 Platform Compatibility

### iOS Support Matrix

| App Version | iOS 13.0+ | iOS 14.0+ | iOS 15.0+ | iOS 16.0+ | iOS 17.0+ | iOS 18.0+ |
|-------------|-----------|-----------|-----------|-----------|-----------|-----------|
| v1.0.0-beta.1 | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ⚠️ Untested |
| v1.0.0 | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| v1.1.0 | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |

**Legend:**
- ✅ **Full Support**: Alle features werken
- ⚠️ **Limited**: Sommige features werken niet optimaal
- ❌ **Unsupported**: App werkt niet

### Android Support Matrix

| App Version | Android 6.0 | Android 7.0 | Android 8.0 | Android 9.0 | Android 10+ |
|-------------|-------------|-------------|-------------|-------------|-------------|
| v1.0.0-beta.1 | ❌ Unsupported | ❌ Unsupported | ⚠️ Pedometer limited | ⚠️ Pedometer limited | ⚠️ Pedometer limited |
| v1.0.0 | ❌ Unsupported | ❌ Unsupported | ⚠️ Expo Go limited | ⚠️ Expo Go limited | ⚠️ Expo Go limited |
| v1.1.0 | ❌ Unsupported | ❌ Unsupported | ⚠️ Expo Go limited | ⚠️ Expo Go limited | ⚠️ Expo Go limited |

**Android Notes:**
- **Expo Go Limitation**: Pedometer werkt alleen in standalone builds
- **Standalone APK**: Volledige functionaliteit vanaf Android 6.0
- **Google Play**: APK builds vereist voor volledige compatibiliteit

### Device Hardware Requirements

#### Minimum Hardware
| Component | Requirement | Purpose |
|-----------|-------------|---------|
| **Accelerometer** | Ja | Stappen detectie |
| **Gyroscope** | Aanbevolen | Verbeterde nauwkeurigheid |
| **GPS** | Optioneel | Toekomstige geofencing |
| **Storage** | 50MB+ | App + data opslag |
| **RAM** | 1GB+ | Soepele performance |

#### Recommended Hardware
| Component | Specification | Benefit |
|-----------|---------------|---------|
| **Processor** | A9+ chip (iOS) / Snapdragon 650+ (Android) | Snellere sync |
| **Storage** | 100MB+ | Offline data caching |
| **Battery** | 2000mAh+ | Lange gebruiksduur |

---

## 📦 Dependency Matrix

### Core Dependencies per Version

#### React Native Ecosystem
| Package | v1.0.0-beta.1 | v1.0.0 | v1.1.0 | Notes |
|---------|---------------|--------|--------|-------|
| **React** | 19.1.0 | 19.1.0 | 19.2.0 | Minor patch |
| **React Native** | 0.81.5 | 0.81.5 | 0.81.5 | Stable |
| **Expo** | ~54.0.20 | ~54.0.20 | 54.0.21 | SDK updates |
| **TypeScript** | ~5.9.2 | ~5.9.2 | ~5.9.2 | Stable |

#### State Management
| Package | v1.0.0-beta.1 | v1.0.0 | v1.1.0 | Notes |
|---------|---------------|--------|--------|-------|
| **@tanstack/react-query** | ^5.90.5 | ^5.90.5 | ^5.90.5 | Stable |
| **@react-native-async-storage/async-storage** | 2.2.0 | 2.2.0 | 2.2.0 | Stable |

#### Device Features
| Package | v1.0.0-beta.1 | v1.0.0 | v1.1.0 | Notes |
|---------|---------------|--------|--------|-------|
| **expo-sensors** | ~15.0.7 | ~15.0.7 | ~15.0.7 | Pedometer |
| **@react-native-community/netinfo** | 11.4.1 | 11.4.1 | 11.4.1 | Network status |
| **expo-location** | - | - | ^19.0.7 | Geofencing (v1.1.0) |
| **expo-task-manager** | - | - | ^14.0.8 | Background tasks |

#### UI & Styling
| Package | v1.0.0-beta.1 | v1.0.0 | v1.1.0 | Notes |
|---------|---------------|--------|--------|-------|
| **expo-font** | ~12.0.10 | ~12.0.10 | ~12.0.10 | Font loading |
| **@expo-google-fonts/roboto** | 0.2.3 | 0.2.3 | 0.2.3 | Roboto font |
| **@expo-google-fonts/roboto-slab** | 0.2.3 | 0.2.3 | 0.2.3 | Roboto Slab |

### Node.js Compatibility

| App Version | Node.js 16 | Node.js 18 | Node.js 20 | Node.js 22 |
|-------------|------------|------------|------------|------------|
| v1.0.0-beta.1 | ⚠️ Limited | ✅ Full | ✅ Full | ⚠️ Untested |
| v1.0.0 | ❌ Unsupported | ✅ Full | ✅ Full | ⚠️ Untested |
| v1.1.0 | ❌ Unsupported | ✅ Full | ✅ Full | ✅ Full |

**Node.js Notes:**
- Minimum Node.js 18.0+ voor development
- EAS Build gebruikt eigen Node.js versie
- npm 8+ aanbevolen

---

## 🌐 API Compatibility

### Backend API Versions

| App Version | Backend API | Required Endpoints | Notes |
|-------------|-------------|-------------------|-------|
| v1.0.0-beta.1 | v1.0.0 | Basic auth + steps | Initial release |
| v1.0.0 | v1.0.0 | All participant endpoints | Stable API |
| v1.1.0 | v1.1.0 | + Geofencing endpoints | Extended API |

### API Endpoint Compatibility

#### Authentication Endpoints
| Endpoint | v1.0.0-beta.1 | v1.0.0 | v1.1.0 |
|----------|---------------|--------|--------|
| `POST /auth/login` | ✅ Required | ✅ Required | ✅ Required |
| `POST /auth/reset-password` | ✅ Required | ✅ Required | ✅ Required |
| `POST /auth/refresh` | ❌ N/A | ⚠️ Optional | ✅ Required |

#### Participant Endpoints
| Endpoint | v1.0.0-beta.1 | v1.0.0 | v1.1.0 |
|----------|---------------|--------|--------|
| `GET /participant/dashboard` | ✅ Required | ✅ Required | ✅ Required |
| `POST /steps` | ✅ Required | ✅ Required | ✅ Required |

#### Global Endpoints
| Endpoint | v1.0.0-beta.1 | v1.0.0 | v1.1.0 |
|----------|---------------|--------|--------|
| `GET /total-steps` | ✅ Required | ✅ Required | ✅ Required |
| `GET /funds-distribution` | ✅ Required | ✅ Required | ✅ Required |

#### Admin Endpoints
| Endpoint | v1.0.0-beta.1 | v1.0.0 | v1.1.0 |
|----------|---------------|--------|--------|
| `GET /steps/admin/route-funds` | ✅ Required | ✅ Required | ✅ Required |
| `POST /steps/admin/route-funds` | ✅ Required | ✅ Required | ✅ Required |
| `PUT /steps/admin/route-funds/:route` | ✅ Required | ✅ Required | ✅ Required |
| `DELETE /steps/admin/route-funds/:route` | ✅ Required | ✅ Required | ✅ Required |

### API Response Format Changes

#### Breaking Changes
- **v1.0.0-beta.1 → v1.0.0**: JWT tokens nu verplicht (geen user ID in URL)
- **v1.0.0 → v1.1.0**: Geofencing data toegevoegd aan responses

#### Backward Compatibility
- Alle endpoints blijven backward compatible
- Nieuwe fields zijn optioneel in responses
- Request formaten ongewijzigd

---

## 🔄 Migration Paths

### App Version Upgrades

#### v1.0.0-beta.1 → v1.0.0
**Required Actions:**
1. ✅ Update app via store/TestFlight
2. ✅ Grant nieuwe permissions indien gevraagd
3. ✅ Test login flow (JWT token changes)
4. ⚠️ Clear app data indien sync problemen

**Breaking Changes:**
- JWT authentication nu verplicht
- Geen user ID parameters meer in URLs

#### v1.0.0 → v1.1.0
**Required Actions:**
1. ✅ Update app via store/TestFlight
2. ✅ Grant location permissions voor geofencing
3. ✅ Test offline sync verbeteringen
4. ⚠️ Background location permission vereist

**New Features:**
- Geofencing capabilities
- Verbeterde offline sync
- Background location tracking

### Development Environment Migration

#### Node.js Upgrade
```bash
# From Node 16 to 18
# 1. Backup project
cp -r dkl-steps-app dkl-steps-app-backup

# 2. Update Node.js via nvm
nvm install 18
nvm use 18

# 3. Clear node_modules
rm -rf node_modules package-lock.json

# 4. Reinstall dependencies
npm install

# 5. Test build
npm run ios # or android
```

#### Expo SDK Migration
```bash
# Update Expo CLI
npm install -g expo-cli@latest

# Update project
expo upgrade

# Test development build
expo start --clear
```

### Backend Compatibility

#### API Version Requirements
| App Version | Minimum Backend | Recommended Backend | Migration Notes |
|-------------|-----------------|-------------------|-----------------|
| v1.0.0-beta.1 | v1.0.0-beta | v1.0.0 | Basic endpoints |
| v1.0.0 | v1.0.0 | v1.0.0 | JWT authentication |
| v1.1.0 | v1.1.0 | v1.1.0 | Geofencing support |

#### Database Migration
- **v1.0.0**: Basis user en steps tabellen
- **v1.1.0**: Geofencing events tabel toegevoegd
- Automatische migration scripts beschikbaar

---

## ⚠️ Known Compatibility Issues

### Platform-Specific Issues

#### iOS Issues
- **iOS 13.0-13.3**: Pedometer minder nauwkeurig
  - **Workaround**: Update naar iOS 13.4+
  - **Impact**: Leichte afwijking in stapentelling

- **iPad Compatibility**: Volledig ondersteund maar niet geoptimaliseerd
  - **Workaround**: Gebruik iPhone voor beste ervaring
  - **Future**: iPad-specifieke UI planned

#### Android Issues
- **Expo Go Limitation**: Pedometer niet beschikbaar
  - **Workaround**: Gebruik standalone APK build
  - **Impact**: Development only issue

- **Android 6.0-7.0**: Beperkte background processing
  - **Workaround**: Houd app actief op voorgrond
  - **Impact**: Offline sync werkt alleen met actieve app

### Dependency Conflicts

#### React Query Version Conflicts
```json
// Correct configuration
{
  "@tanstack/react-query": "^5.90.5",
  "react": "19.1.0",
  "react-native": "0.81.5"
}
```
**Issue**: Oudere React Query versies werken niet met React 19
**Solution**: Altijd nieuwste compatible versie gebruiken

#### Font Loading Issues
**Symptom**: Roboto fonts laden niet
**Cause**: Network connectivity of CDN issues
**Solution**: Fallback fonts in app.json
```json
{
  "fonts": {
    "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf")
  }
}
```

---

## 🧪 Testing Compatibility

### Test Matrix Template

#### Platform Testing
```markdown
| Test Case | iOS 13+ | iOS 14+ | iOS 15+ | Android 8+ | Android 9+ | Android 10+ |
|-----------|---------|---------|---------|------------|------------|-------------|
| Login Flow | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Step Tracking | ✅ | ✅ | ✅ | ⚠️ APK only | ⚠️ APK only | ⚠️ APK only |
| Offline Sync | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin Functions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
```

#### Device Testing
- **iPhone SE (2016+)**: Minimum iOS 13
- **iPhone 12+**: Modern iOS features
- **Samsung Galaxy S8+**: Android 8.0 baseline
- **Google Pixel 4+**: Android 10+ features

### Automated Testing Compatibility

#### Jest Configuration
```json
// jest.config.js
{
  "preset": "jest-expo",
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
  "moduleFileExtensions": ["ts", "tsx", "js", "jsx"],
  "testMatch": ["**/__tests__/**/*.test.(ts|tsx|js)"]
}
```

#### Test Coverage Goals
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical user flows
- **Platform Tests**: iOS + Android specific features

---

## 📈 Performance Benchmarks

### App Size Compatibility

| Build Type | iOS Size | Android Size | Download Size |
|------------|----------|--------------|---------------|
| Development | ~50MB | ~45MB | N/A |
| Production | ~25MB | ~20MB | ~15MB |

### Startup Time Benchmarks

| Device | Cold Start | Warm Start | Notes |
|--------|------------|------------|-------|
| iPhone 12 | <2s | <1s | Optimal |
| iPhone SE | <3s | <1.5s | Acceptable |
| Pixel 4 | <3s | <1.5s | Acceptable |
| Galaxy S8 | <4s | <2s | Slower hardware |

### Memory Usage

| Feature | Memory Impact | Battery Impact |
|---------|----------------|----------------|
| Basic UI | ~50MB | Low |
| Step Tracking | +10MB | Medium |
| Background Location | +15MB | High |
| Offline Queue | +5MB | Low |

---

## 🔗 Related Documentation

- **[CHANGELOG.md](CHANGELOG.md)**: Version history en changes
- **[API_REFERENCE.md](API_REFERENCE.md)**: API endpoint details
- **[RELEASE_NOTES.md](RELEASE_NOTES.md)**: Migration guides
- **[FAQ.md](FAQ.md)**: Compatibility vragen
- **[GLOSSARY.md](GLOSSARY.md)**: Platform-specifieke termen
- **[FAQ.md](FAQ.md)**: Common compatibility questions

---

## 📞 Support Contacts

**For compatibility issues:**
- Development Team: [development@dkl.nl](mailto:development@dkl.nl)
- Platform-specific issues: Check respective store support

**For migration assistance:**
- Technical Documentation: [DOCUMENTATIE.md](../02-development/DOCUMENTATIE.md)
- Release Notes: [RELEASE_NOTES.md](RELEASE_NOTES.md)

---

**Compatibility Matrix Status**: ✅ Complete
**Last Updated**: 2025-11-03
**Version**: 1.0.0

**DKL Steps App Compatibility** © 2025 DKL Organization. All rights reserved.