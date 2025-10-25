# Changelog - DKL Steps App

Alle belangrijke wijzigingen in dit project worden gedocumenteerd in dit bestand.

Het format is gebaseerd op [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
en dit project volgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-beta.1] - 2025-10-25

### 🎉 Initial Beta Release

#### ✨ Added

**Core Functionaliteit:**
- 🏃 Real-time stappen tracking via device pedometer (iOS & Android)
- 🔄 Automatische synchronisatie (elke 50 stappen of 5 minuten)
- 📡 Offline support met queue mechanisme
- 🎯 Delta update systeem (positieve en negatieve correcties)
- 📊 Persoonlijk dashboard met voortgang tracking
- 🌍 Globaal dashboard voor Staff en Admins
- 📺 Live digitaal bord (auto-refresh elke 10 seconden)
- ⚙️ Admin CRUD interface voor route fondsen configuratie

**Authenticatie & Security:**
- 🔐 JWT-based authenticatie
- 👥 Role-Based Access Control (Deelnemer, Staff, Admin)
- 🔑 Optionele wachtwoord wijziging
- 🛡️ Secure token storage in AsyncStorage
- 📱 Case-insensitive role checks

**User Experience:**
- 🎨 Moderne UI met card-based design
- 👁️ Wachtwoord show/hide toggle op login
- ⏰ Laatste sync tijd indicator
- 🎯 Visuele mijlpalen (2.5K, 5K, 7.5K, 10K)
- 📊 Dynamische progress bar met kleuren
- 🔍 Diagnostics tool voor debugging
- ↓ Pull-to-refresh op alle dashboards
- ✅ Auto-refresh on screen focus

**Development Features:**
- 🧪 Test button voor stappen simulatie (+50)
- 🔍 Diagnostics button met volledige app state
- 📝 Console logging voor debugging
- 🎯 Quick login buttons in development mode

#### 🔧 Technical

**Dependencies:**
- React 19.1.0
- React Native 0.81.5
- Expo ~54.0.20
- @tanstack/react-query ^5.90.5
- expo-sensors ~15.0.7
- @react-native-async-storage/async-storage 2.2.0
- @react-native-community/netinfo 11.4.1

**Architecture:**
- Component-based architecture
- Service layer voor API calls
- React Query voor server state management
- AsyncStorage voor local persistence
- React Navigation voor routing

**API Integration:**
- JWT-based endpoints (geen ID parameters meer)
- `POST /steps` - Submit stappen (auto user ID van JWT)
- `GET /participant/dashboard` - Dashboard data (auto user ID)
- `GET /total-steps?year=2025` - Globale statistieken
- `GET /funds-distribution` - Fondsen per route
- Admin endpoints: `/steps/admin/route-funds` (CRUD)

#### 🐛 Fixed

**Authentication Issues:**
- Fixed: Verplichte wachtwoord wijziging loop (was niet persistent)
- Fixed: Case-sensitive role checks (Admin vs admin)
- Fixed: 401 errors door correcte JWT endpoints
- Fixed: 403 errors bij stappen posten

**Data Loading:**
- Fixed: Admin/Staff 500 errors op participant dashboard
- Fixed: Oneindige retries voor ongeldige endpoints
- Fixed: Duplicate data fetching

**Sync Issues:**
- Fixed: Offline queue spam bij auth errors
- Fixed: Geen feedback tijdens sync
- Fixed: Missing error handling

**Navigation:**
- Fixed: Admin Funds toegang geblokkeerd
- Fixed: Incorrect route registratie in backend

#### 🚨 Known Issues

**Android Limitations:**
- ⚠️ Pedometer werkt NIET in Expo Go op Android
  - **Workaround:** Gebruik standalone APK build
  - **Workaround:** Of gebruik test button voor simulatie
- ✅ iOS pedometer werkt wel in Expo Go

**Backend Dependencies:**
- ⚠️ Vereist gebruikersaccounts voor deelnemers
  - SQL script moet uitgevoerd zijn
  - Aanmeldingen moeten gelinkt zijn via gebruiker_id
- ⚠️ Vereist RBAC permissions voor steps:write
  - Deelnemers moeten write permission hebben

#### 📱 Platform Support

**iOS:**
- ✅ iOS 13.0+
- ✅ iPhone & iPad
- ✅ Pedometer werkt in development (Expo Go)
- ✅ Volledige functionaliteit

**Android:**
- ✅ Android 6.0+ (API 23+)
- ⚠️ Pedometer vereist standalone build
- ✅ Alle andere features werken in Expo Go

#### 🎯 Beta Testing Focus

**Prioriteit 1 (Critical):**
- [ ] Login flow voor alle rollen
- [ ] Stappen tracking accuracy (iPhone)
- [ ] Sync betrouwbaarheid
- [ ] RBAC permissions correct
- [ ] Crash-free operation

**Prioriteit 2 (Important):**
- [ ] Battery usage acceptable
- [ ] Network error handling
- [ ] Offline sync recovery
- [ ] UI/UX feedback
- [ ] Performance benchmarks

**Prioriteit 3 (Nice to Have):**
- [ ] Minor UI tweaks
- [ ] Feature requests
- [ ] Optimization opportunities

#### 📝 Migration Notes

**Van Expo Go naar Standalone:**
- Testers moeten APK/IPA installeren
- Permissions worden opnieuw gevraagd
- AsyncStorage data blijft behouden (zelfde package ID)

**Backend Updates Required:**
- ✅ JWT endpoints implemented
- ✅ RBAC permissions configured
- ✅ Route funds endpoints fixed
- ⏳ Deelnemer accounts aangemaakt (via SQL script)

#### 🚀 Next Steps

**Voor Beta Launch:**
1. Run EAS build: `eas build -p android --profile preview`
2. Test APK op physical Android device
3. Verify pedometer permissions werken
4. Distribute to internal testers (5-10 people)
5. Collect feedback
6. Fix critical bugs
7. Iterate to beta.2, beta.3, etc.

**Voor Production (1.0.0):**
- Complete beta testing cycle
- Fix all critical bugs
- Performance optimization
- Store submission (Google Play + App Store)
- Public launch announcement

---

## [Unreleased]

### Planned Features
- Push notifications voor mijlpalen
- Weekly/monthly statistics charts
- Social sharing functionality
- Leaderboard (top steppers)
- Team challenges
- Profile customization
- Export data functionaliteit
- Biometric authentication (Face ID / Fingerprint)

### Potential Improvements
- Persistent offline queue in AsyncStorage
- Background step counting (requires native module)
- Widget support (iOS 14+, Android 12+)
- Dark mode support
- Internationalization (EN/NL language toggle)
- Accessibility improvements (VoiceOver/TalkBack)

---

## Version Naming Convention

- **Major (1.0.0)**: Breaking changes, major features
- **Minor (1.1.0)**: New features, backwards compatible
- **Patch (1.0.1)**: Bug fixes, no new features
- **Beta (1.0.0-beta.1)**: Pre-release testing versions
- **Alpha (1.0.0-alpha.1)**: Internal development builds

---

## Release Process

1. **Development** → Feature branches
2. **Testing** → Merge to `develop` branch
3. **Beta** → Tag with `beta.X` → EAS preview build
4. **Production** → Merge to `main` → Tag with `vX.Y.Z` → EAS production build
5. **Deployment** → Submit to stores or distribute APK/IPA

---

## Support

Voor vragen over deze release:
- Check [`BETA_DEPLOYMENT.md`](BETA_DEPLOYMENT.md) voor deployment instructies
- Check [`DOCUMENTATIE.md`](DOCUMENTATIE.md) voor technische details
- Check [`README.md`](README.md) voor gebruikersinstructies

---

**Maintained by:** DKL Development Team  
**License:** © 2025 DKL Organization. All rights reserved.