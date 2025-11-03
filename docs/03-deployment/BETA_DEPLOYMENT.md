# DKL Steps App - Beta Deployment Guide

**Doel:** Een testbare Beta versie uitrollen voor testers en early adopters.

---

## 📋 Deployment Opties

### Optie 1: EAS Build (AANBEVOLEN) 🚀
Standalone APK/IPA builds die werken zonder Expo Go

### Optie 2: Expo Updates (SNELST) ⚡
Over-The-Air updates voor bestaande Expo Go gebruikers

### Optie 3: TestFlight + Play Store Internal Testing (PROFESSIONEEL) 🏢
Via officiële store kanalen

---

## 🎯 Optie 1: EAS Build (Standalone APK/IPA)

### Voordelen:
✅ Werkt zonder Expo Go  
✅ Volledige permissions (ACTIVITY_RECOGNITION op Android!)  
✅ Installeerbaar als normale app  
✅ Professional feel  
✅ Geschikt voor echte testing  

### Stap 1: EAS CLI Installeren

```bash
# Installeer EAS CLI globally
npm install -g eas-cli

# Verifieer installatie
eas --version
```

### Stap 2: Login bij Expo

```bash
# Login met je Expo account
eas login

# Of maak nieuw account
eas register
```

### Stap 3: Project Configureren

```bash
# Initialiseer EAS voor dit project
eas build:configure

# Dit maakt eas.json aan
```

**Bewerk [`eas.json`](eas.json):**
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "android": {
        "gradleCommand": ":app:bundleRelease"
      }
    }
  },
  "submit": {
    "preview": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account-key.json"
      }
    },
    "production": {}
  }
}
```

### Stap 4: Update app.json voor Beta

```bash
# Bewerk app.json
```

**In [`app.json`](app.json):**
```json
{
  "expo": {
    "name": "DKL Steps App (Beta)",
    "slug": "dkl-steps-app",
    "version": "1.1.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "nl.dekoninklijkeloop.stepsapp",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSMotionUsageDescription": "De app heeft toegang nodig tot je bewegingssensoren om je stappen te tellen voor De Koninklijke Loop challenge.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "De app heeft toegang nodig tot je locatie om automatisch stappen te tellen wanneer je binnen het event gebied bent, ook op de achtergrond.",
        "NSLocationWhenInUseUsageDescription": "De app heeft toegang nodig tot je locatie om te controleren of je binnen het event gebied bent.",
        "UIBackgroundModes": [
          "location"
        ]
      }
    },
    "android": {
      "package": "nl.dekoninklijkeloop.stepsapp",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "android.permission.ACTIVITY_RECOGNITION",
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "BACKEND_URL": "https://dklemailservice.onrender.com/api",
      "eas": {
        "projectId": "0f956768-4f43-43bf-8c89-1db197b7bece"
      }
    },
    "runtimeVersion": "1.1.0",
    "updates": {
      "url": "https://u.expo.dev/0f956768-4f43-43bf-8c89-1db197b7bece"
    },
    "plugins": [
      "expo-font",
      "expo-location",
      [
        "expo-task-manager",
        {
          "locationTaskName": "background-location-task"
        }
      ]
    ]
  }
}
```

### Stap 5: Build Beta Versie

#### Voor Android (APK):
```bash
# Build development/preview APK
eas build --platform android --profile preview

# Of voor production-ready build
eas build --platform android --profile production

# Dit duurt 10-20 minuten
# Je krijgt een URL om de APK te downloaden
```

#### Voor iOS (IPA):
```bash
# Requires Apple Developer account ($99/jaar)
eas build --platform ios --profile production

# Voor simulator testing (gratis):
eas build --platform ios --profile preview
```

#### Voor Beide Platforms:
```bash
eas build --platform all --profile preview
```

### Stap 6: Download & Distribueer

**Na succesvolle build:**

1. **Download Link** verschijnt in terminal (Application Archive URL)
2. **Of check in Expo dashboard**: https://expo.dev/accounts/jeffreyed/projects/dkl-steps-app/builds
3. **Monitor actieve builds**: `eas build:list` (toont status: new, in queue, in progress, finished, errored)

**⚠️ Belangrijke Opmerkingen:**
- **Niet meerdere builds tegelijkertijd starten** - dit kan conflicten veroorzaken
- **Check eerst actieve builds** met `eas build:list` voordat je nieuwe start
- **Builds kunnen 10-20 minuten duren** afhankelijk van queue

**Distributie opties:**

#### A. Direct Download Link (SIMPEL)
```bash
# Deel de build URL met testers via:
- Email
- WhatsApp
- Telegram
- SMS

# Bijvoorbeeld:
https://expo.dev/artifacts/eas/abc123.../build-def456.../app-release.apk
```

#### B. Via TestFlight (iOS)
```bash
# Submit naar TestFlight
eas submit --platform ios

# Testers voegen toe via App Store Connect
# Verstuur uitnodigingen
```

#### C. Via Google Play Internal Testing (Android)
```bash
# Submit naar Play Store
eas submit --platform android

# Setup Internal Testing track
# Voeg testers toe via email
```

---

## ⚡ Optie 2: Expo Updates (OTA)

### Voor Bestaande Expo Go Gebruikers

**Voordeel:** Snel, geen nieuwe build nodig  
**Nadeel:** Android pedometer werkt nog steeds niet in Expo Go

```bash
# Publish update
eas update --branch beta --message "Beta release met auto-sync"

# Gebruikers krijgen update bij volgende app launch
```

**Limitatie:** Alleen voor gebruikers die de app al hebben via Expo Go.

---

## 🏢 Optie 3: Store Beta Programs

### iOS TestFlight (Professional)

**Vereisten:**
- Apple Developer Account ($99/jaar)
- App Store Connect toegang

**Steps:**
```bash
# 1. Build production IPA
eas build --platform ios --profile production

# 2. Submit naar TestFlight
eas submit --platform ios

# 3. In App Store Connect:
# - Ga naar TestFlight tab
# - Voeg Internal Testers toe (max 100)
# - Of External Testers (max 10,000, needs review)
# - Deel TestFlight link

# 4. Testers:
# - Installeren TestFlight app
# - Klikken op uitnodigings link
# - Installeren DKL Steps App (Beta)
```

**TestFlight Features:**
- Max 90 dagen per build
- Automatische updates
- Crash reporting
- Feedback collecting

### Android Internal Testing (Professional)

**Vereisten:**
- Google Play Console account ($25 one-time)

**Steps:**
```bash
# 1. Build production APK
eas build --platform android --profile production

# 2. Submit naar Play Store
eas submit --platform android

# 3. In Google Play Console:
# - Ga naar Testing > Internal testing
# - Create new release
# - Upload APK
# - Add testers (via email list)
# - Publish to Internal Testing

# 4. Share testing link met testers
# Link ziet eruit als:
# https://play.google.com/apps/internaltest/...
```

---

## 🎯 Aanbevolen Beta Strategy

### Fase 1: Internal Testing (Week 1-2)
**Doel:** Bug hunting, basic functionaliteit check

```bash
# Build development builds
eas build --platform android --profile development
eas build --platform ios --profile development

# Distributie:
- Direct download links naar 5-10 interne testers
- Focus op core functionaliteit
- Verzamel feedback
```

**Test Groep:**
- DKL team members
- IT/Tech-savvy volunteers
- Mix van iOS en Android gebruikers

### Fase 2: Closed Beta (Week 3-4)
**Doel:** Real-world testing, UX feedback

```bash
# Build preview builds
eas build --platform android --profile preview
eas build --platform ios --profile preview

# Distributie:
- TestFlight (iOS) - 20-30 testers
- Google Play Internal Testing (Android) - 20-30 testers
- Mix van deelnemers en begeleiders
```

**Test Focus:**
- Stappen tracking accuracy
- Battery usage
- Network handling
- Permissions flow
- UI/UX feedback

### Fase 3: Open Beta (Week 5-6)
**Doel:** Scale testing, final validation

```bash
# Build production builds
eas build --platform android --profile production
eas build --platform ios --profile production

# Distributie:
- TestFlight External Testing (iOS) - 100+ testers
- Google Play Open Beta (Android) - 100+ testers
- Public beta announcement
```

**Test Focus:**
- Server load handling
- Edge cases
- Final bugs
- Performance at scale

### Fase 4: Production Release
```bash
# Submit to stores
eas submit --platform all

# Monitor:
- Crash reports
- User reviews
- Support tickets
```

**Voor Production (1.0.0):**
- Complete beta testing cycle (zie [`PRODUCTION_TRANSITION.md`](PRODUCTION_TRANSITION.md))
- Fix all critical bugs
- Performance optimization (zie [`../07-optimization/README.md`](../07-optimization/README.md))
- Store submission (Google Play + App Store)
- Public launch announcement

---

## 📝 Pre-Build Checklist

```bash
# 1. Update versie nummers
✅ app.json: "version": "1.1.0"
✅ package.json: "version": "1.1.0"

# 2. Verifieer backend URL
✅ app.json extra.BACKEND_URL correct?

# 3. Test lokaal
✅ npm start → werkt zonder errors?
✅ Alle screens accessible?
✅ Login/logout flow werkt?

# 4. Update assets (optioneel)
✅ Beta badge op icon?
✅ Splash screen updated?

# 5. Documentatie
✅ README.md updated?
✅ CHANGELOG.md toegevoegd?
✅ Test credentials gedocumenteerd?
```

---

## 🔨 Snelste Weg naar Beta (Nu!)

### Quick Start (Android APK in 15 minuten):

```bash
# 1. Setup (eenmalig)
npm install -g eas-cli
eas login
eas build:configure

# 2. Update versie (indien nodig)
# Bewerk app.json: "version": "1.1.1" (voor volgende builds)

# 3. Build
eas build --platform android --profile preview

# 4. Wacht 10-15 minuten
# EAS bouwt de APK in de cloud

# 5. Download link verschijnt
# Bijvoorbeeld: https://expo.dev/artifacts/eas/...

# 6. Deel link met testers
# Ze downloaden en installeren de APK direct
```

**Install instructies voor testers:**
```
1. Open de download link op je Android device
2. Download het .apk bestand
3. Open het bestand
4. Klik "Installeren" (mogelijk "Unknown sources" toestaan)
5. Open DKL Steps App
6. Login met je credentials
7. Geef toestemming voor stappen tracking
8. Begin met lopen!
```

---

## 📱 Beta Testing Script voor Testers

```markdown
# DKL Steps App Beta Test Instructies

Bedankt voor het testen! 🙏

## Installatie

**Android:**
1. Download de APK via: [LINK]
2. Installeer (mogelijk "Unknown sources" toestaan)
3. Open de app

**iOS:**
1. Installeer TestFlight app
2. Klik op uitnodigingslink
3. Installeer DKL Steps App (Beta)

## Test Scenario's

### ✅ Basis Functionaliteit
- [ ] Login werkt met je email/wachtwoord
- [ ] Dashboard laadt je statistieken
- [ ] Route en fonds zijn zichtbaar
- [ ] Logout werkt

### ✅ Stappen Tracking
- [ ] Geef toestemming voor stappen tracking
- [ ] Loop 50+ stappen rond
- [ ] Zie delta counter omhoog gaan
- [ ] Auto-sync triggert bij 50 stappen
- [ ] Dashboard "Totaal Stappen" update

### ✅ Offline Modus
- [ ] Schakel airplane mode in
- [ ] Loop rond (delta groeit)
- [ ] Schakel airplane mode uit
- [ ] Offline stappen syncen automatisch

### ✅ Navigatie
- [ ] Globaal Dashboard werkt
- [ ] Digital Board toont live totaal
- [ ] Terug navigeren werkt soepel

### ✅ UX
- [ ] App voelt snel en responsive
- [ ] Geen crashes
- [ ] Duidelijke feedback bij acties
- [ ] Battery usage acceptabel

## Feedback Delen

Rapporteer bugs of suggesties via:
- Email: [EMAIL]
- WhatsApp groep: [LINK]
- Google Form: [LINK]

**Wat te rapporteren:**
- Screenshots van errors
- Stappen om bug te reproduceren
- Device info (iPhone 14, Android 12, etc.)
- UX verbeterpunten

Bedankt! 🎉
```

---

## 📊 Build Status Monitoring

**Check build status:**
```bash
# List alle builds
eas build:list

# Detailed view van specifieke build
eas build:view [BUILD_ID]

# ⚠️ Let op: eas build:logs commando bestaat niet in huidige EAS CLI versie
# Gebruik in plaats daarvan de Logs URL uit build:view output
```

**Expo Dashboard:**
https://expo.dev/accounts/jeffreyed/projects/dkl-steps-app/builds

**Voorbeeld van werkende build URLs:**
- Succesvolle APK: https://expo.dev/artifacts/eas/dZdv8Ny2DxFmG4J987gFmj.apk
- Build Details: https://expo.dev/accounts/jeffreyed/projects/dkl-steps-app/builds/692ac37d-c74c-4520-beb1-307229f2892e

---

## 🛡️ Compliance en Security Checks

### Pre-Beta Launch Review

```bash
✅ **App Store Guidelines**
- [ ] Privacy Policy aanwezig en compliant
- [ ] Location permissions duidelijk uitgelegd
- [ ] Motion & Fitness permissions gerechtvaardigd
- [ ] Age rating correct (4+)
- [ ] Content guidelines nageleefd

✅ **GDPR Compliance**
- [ ] Data collection transparant
- [ ] User consent voor tracking
- [ ] Data retention beleid
- [ ] Right to erasure geïmplementeerd
- [ ] Data processing agreement met backend

✅ **Security Audit**
- [ ] HTTPS only voor alle API calls
- [ ] JWT tokens secure
- [ ] Sensitive data encrypted
- [ ] Certificate pinning (optioneel)
- [ ] Security headers op backend
```

### Beta-Specific Compliance

**Voor TestFlight (iOS):**
- Max 100 internal testers
- Max 10,000 external testers
- Builds verlopen na 90 dagen
- Apple Developer Program lidmaatschap vereist

**Voor Google Play Beta:**
- Unlimited internal testers
- Max 2,000 external testers
- Closed testing track
- Google Play Developer account vereist

### Data Safety Form (Google Play)

```json
{
  "dataCollection": {
    "healthInfo": {
      "collected": true,
      "purpose": "App functionality - step counting",
      "sharing": false
    },
    "location": {
      "collected": true,
      "purpose": "Geofencing during events",
      "sharing": false
    }
  }
}
```

---

##  Common Build Issues

### 1. Build Fails - Missing Credentials
```bash
# Setup credentials
eas credentials

# Select platform and follow prompts
# Voor iOS: Apple Developer account nodig
# Voor Android: Google Service Account key
```

### 2. "Invalid Bundle Identifier"
```bash
# Use reverse domain notation
# app.json:
"bundleIdentifier": "nl.dekoninklijkeloop.stepsapp"
# Zorg voor unieke identifier
```

### 3. "Gradle Build Failed" (Android)
```bash
# Check app.json android config
# Ensure all required fields present
# Verify permissions array is valid
# Check target SDK version (34 recommended)
```

### 4. Build Takes Too Long
```bash
# Check queue status
eas build:list

# Priority builds (paid plan) - voorkomt queue wachttijd
eas build --platform android --non-interactive

# Of annuleer oude builds eerst
# eas build:cancel [BUILD_ID]
```

### 5. Build Fails - Concurrent Builds
```bash
# Check voor actieve builds voordat je nieuwe start
eas build:list

# Wacht tot andere builds klaar zijn voordat je nieuwe start
# Meerdere gelijktijdige builds kunnen conflicten veroorzaken
```

### 6. OTA Update Not Working
```bash
# Check runtime version match
eas update --branch beta --message "Test update"

# Verify branch configuration in eas.json
# Check Expo dashboard voor update status
```

### 7. Permissions Not Working
```bash
# iOS: Check Info.plist in app.json
# Android: Check android.permissions array
# Rebuild required voor permission changes (geen OTA)
```

---

## 📦 Distribution Methods

### Method 1: Direct Download (SIMPLEST)

**Voor Android:**
```bash
# After build succeeds:
1. Copy the artifact URL (ends in .apk)
2. Shorten with bit.ly or tinyurl
3. Share via email/WhatsApp
4. Testers download and install

# Install via ADB (voor developers):
adb install path/to/app-release.apk
```

**Voor iOS:**
```bash
# Requires TestFlight or Ad-Hoc provisioning
# Cannot install .ipa directly without signing
```

### Method 2: Internal Testing Links

**Google Play Console:**
```
Internal Testing Link:
https://play.google.com/apps/internaltest/4701663136797704441

Testers need:
1. Gmail account
2. Be added to testers list
3. Accept invitation
4. Install from Play Store
```

**TestFlight:**
```
TestFlight Link:
https://testflight.apple.com/join/ABC123XYZ

Testers need:
1. Apple ID
2. TestFlight app installed
3. Click invitation link
4. Install app
```

### Method 3: QR Code

```bash
# Create QR code for download link
# Use: https://www.qr-code-generator.com/

# Print QR code poster:
┌─────────────────────────────┐
│   DKL Steps App (Beta)      │
│                             │
│   [QR CODE HERE]            │
│                             │
│   Scan om te installeren    │
│   Versie: 1.1.0      │
└─────────────────────────────┘
```

---

## 🌿 Branching Strategy voor OTA Updates

### Branch Structuur voor Beta

```
main (production)
├── beta (beta releases)
├── develop (development)
│   ├── feature/geofencing
│   ├── hotfix/sync-bug
```

### OTA Branch Mapping

**Voor beta channel:**
```bash
# Update beta branch voor testers
eas update --branch beta --message "Beta update: geofencing improvements"

# Gebruikers met beta builds krijgen update automatisch
```

**Runtime Version Matching:**
```json
// eas.json
{
  "runtimeVersion": "1.1.0",
  "branches": {
    "beta": {
      "channel": "beta"
    }
  }
}
```

**Limitatie OTA:**
- Alleen JS/React changes
- Geen native code changes (nieuwe permissions, etc.)
- Geen app.json changes die native rebuild vereisen

---

## 🔄 Update Workflow

### Voor Bug Fixes tijdens Beta:

```bash
# 1. Fix de bug in code
# 2. Test lokaal
npm start

# 3. Update versie (indien nodig)
# app.json: "1.1.0" → "1.1.1"

# 4. Kies update methode:
# - Voor JS-only changes: OTA update
# - Voor native changes: Rebuild

# OTA voor JS changes:
eas update --branch beta --message "Fix sync issue"

# Of rebuild voor native changes:
eas build --platform android --profile preview

# 5. Notify testers
# Stuur nieuwe download link of OTA notificatie
```

### Voor Feature Updates:

```bash
# Accumuleer features in develop branch
# Test grondig
# Merge naar beta branch
# Release als OTA of rebuild afhankelijk van changes
```

---

## 🚨 Rollback Procedures

### OTA Rollback

**Voor beta channel:**
```bash
# Publish rollback naar vorige stabiele versie
eas update --branch beta --message "Rollback naar v1.0.0" --runtime-version 1.0.0

# Testers krijgen rollback bij volgende app restart
```

### Build Rollback

**Voor critical issues:**
```bash
# 1. Identificeer laatste stabiele build
eas build:list

# 2. Submit vorige build naar stores indien nodig
eas submit --platform ios --url "https://expo.dev/artifacts/eas/previous-build-url"

# 3. Notify testers van nieuwe download link
```

### Emergency Procedures

```bash
# Bij critical security issue:
# 1. Stop alle beta distributions
# 2. Reset beta branch naar main
# 3. Publish emergency update
# 4. Communicate met testers
```

---

## 📧 Beta Tester Communication

### Initial Invitation Email:

```
Onderwerp: 🎉 Uitnodiging: DKL Steps App Beta Testing

Beste [Naam],

Je bent uitgenodigd om de DKL Steps App Beta te testen!

📱 Installatie:
Android: [DOWNLOAD LINK]
iOS: [TESTFLIGHT LINK]

🔐 Test Credentials:
Email: [email]
Wachtwoord: DKL2025!

⚠️ Belangrijk:
- Dit is een BETA versie
- Bugs kunnen voorkomen
- Feedback is zeer welkom!

📝 Feedback:
Rapporteer via: [FEEDBACK FORM LINK]

🗓️ Beta Periode:
Van: [START DATE]
Tot: [END DATE]

Bedankt voor je hulp! 🙏

Team DKL
```

### Bug Report Template:

```markdown
## Bug Report

**Wat ging er mis?**
[Beschrijving]

**Hoe te reproduceren?**
1. Stap 1
2. Stap 2
3. Stap 3

**Verwachte gedrag:**
[Wat had moeten gebeuren]

**Screenshots:**
[Voeg toe indien mogelijk]

**Device Info:**
- Platform: iOS / Android
- Device: iPhone 14 / Samsung Galaxy S21
- OS Versie: iOS 17.1 / Android 13
- App Versie: 1.1.0

**Extra Context:**
[Overige relevante info]
```

---

## 🎯 Beta Success Criteria

**Voordat Production Release:**

✅ **Functionaliteit**
- [ ] Login werkt 100% success rate
- [ ] Stappen syncen betrouwbaar
- [ ] Offline mode werkt correct
- [ ] Alle RBAC permissions correct
- [ ] Admin CRUD functionaliteit stabiel

✅ **Performance**
- [ ] App start < 3 seconden
- [ ] Sync requests < 2 seconden
- [ ] Geen memory leaks
- [ ] Battery drain acceptabel (< 5%/uur)

✅ **Stability**
- [ ] Crash rate < 1%
- [ ] Geen data loss incidents
- [ ] Error handling comprehensive

✅ **UX**
- [ ] Positieve feedback van 80%+ testers
- [ ] Geen major usability issues
- [ ] Accessibility ok

---

## 📊 Beta Metrics to Track

**Via Analytics (zie [`MONITORING.md`](MONITORING.md) voor implementatie):**
```typescript
// Firebase Analytics integration
// Track events:
- Login attempts (success/fail)
- Steps synced (count, frequency)
- Screen views
- Errors encountered
- Time spent in app
- Geofence events
- Beta feedback submissions
```

**Manual Tracking:**
- Aantal downloads per distributie methode
- Aantal actieve gebruikers per dag
- Bug reports count en severity
- Feature requests prioriteit
- Net Promoter Score (NPS) van testers
- Device/platform breakdown
- Session duration gemiddelden

**Success Metrics:**
- Crash-free users: > 95%
- App startup time: < 3 seconden
- Step sync success rate: > 98%
- User retention (beta periode): > 70%

---

## 🚀 Quick Commands Samenvatting

```bash
# Setup (eenmalig)
npm install -g eas-cli
eas login
eas build:configure

# Build Android Beta
eas build -p android --profile preview

# Build iOS Beta (with Apple Dev account)
eas build -p ios --profile production
eas submit -p ios

# Build Both
eas build --platform all --profile preview

# Update bestaande builds (OTA)
eas update --branch beta --message "Update description"

# Check build status
eas build:list
eas build:view [BUILD_ID]

# Download build
# URL wordt gegeven na build succeeds
```

---

## 💡 Pro Tips

1. **Start met Android Preview Build** - Sneller en simpeler
2. **Test eerst intern** - Vang major bugs vroeg
3. **Versie nummering** - Gebruik semantic versioning (1.0.0-beta.1, beta.2, etc.)
4. **Changelog bijhouden** - Documenteer wat er in elke build zit
5. **Feedback form** - Maak een Google Form voor structured feedback
6. **WhatsApp groep** - Snelle communicatie met testers
7. **Weekly updates** - Houd testers engaged
8. **Reward testers** - Kleine incentive voor actieve feedback

---

## 📞 Support tijdens Beta

**Voor testers:**
- Beta testing WhatsApp groep
- Email support: beta@dekoninklijkeloop.nl
- FAQ document met common issues (zie hieronder)
- In-app feedback form

**Voor developers:**
- EAS Dashboard voor build logs: https://expo.dev/accounts/jeffreyed/projects/dkl-steps-app/builds
- Expo Forums: https://forums.expo.dev
- React Native Docs: https://reactnative.dev
- DKL Development Team Slack

---

## ❓ Beta FAQ - Common Issues & Solutions

### 🔧 Build & Installation Issues

**Q: APK installatie faalt met "Unknown sources"**
```
A: Android security vereist toestemming voor sideloaded apps.
   Ga naar Settings > Security > Unknown Sources > Toestaan
   Of: Settings > Apps > Special access > Install unknown apps
```

**Q: iOS build werkt niet zonder Apple Developer account**
```
A: TestFlight vereist beta subscription ($99/jaar).
   Workaround: Gebruik Expo Go voor development testing.
   Of: Vraag Apple Developer toegang aan bij DKL IT.
```

**Q: Build queue te lang (>30 min wachten)**
```
A: EAS heeft beperkte free tier capacity.
   Solution: Upgrade naar priority builds ($0.05/build)
   Of: bouw alleen tijdens daluren (nacht/ochtend)
```

### 📱 App Functionality Issues

**Q: Pedometer werkt niet op Android**
```
A: Bekend issue - pedometer werkt alleen in standalone builds.
   Solution: Download APK build, niet Expo Go.
   Test button simuleert stappen voor development.
```

**Q: Stappen syncen niet automatisch**
```
A: Sync triggert bij 50+ stappen of 5 minuten inactiviteit.
   Check: Internet verbinding, login status, backend health.
   Manual sync: Pull-to-refresh op dashboard.
```

**Q: Locatie permissions werken niet**
```
A: iOS: Check Settings > Privacy > Location > App toestemming
   Android: Check app permissions in settings
   Rebuild vereist bij permission changes (geen OTA fix)
```

### 🔐 Authentication Issues

**Q: Login faalt met "Invalid credentials"**
```
A: Check: Email format, wachtwoord case-sensitive.
   Beta credentials: Email + "DKL2025!" (voor test accounts)
   Contact admin voor account setup indien nodig.
```

**Q: "403 Forbidden" bij stappen sync**
```
A: RBAC permissions issue - gebruiker heeft geen steps:write.
   Contact admin voor role assignment.
   Check user role in profile screen.
```

### 🌐 Network & Backend Issues

**Q: "Network error" bij sync pogingen**
```
A: Check internet verbinding, firewall/proxy settings.
   Backend URL: https://dklemailservice.onrender.com/api
   Mogelijk backend downtime - check status page.
```

**Q: Offline queue sync niet werken**
```
A: Offline stappen worden lokaal opgeslagen.
   Sync triggert automatisch bij internet terugkeer.
   Manual trigger: Reopen app of pull-to-refresh.
```

### 🎯 Testing & Feedback Issues

**Q: Hoe rapporteer ik bugs?**
```
A: Gebruik in-app feedback form (indien beschikbaar)
   Of: Email naar beta@dekoninklijkeloop.nl
   Include: Screenshots, device info, stappen om te reproduceren
```

**Q: App crasht bij specifieke actie**
```
A: Noteer exacte stappen voor reproduce.
   Check device logs via Android Studio/Xcode.
   Include crash logs in bug report.
```

**Q: Features werken anders dan verwacht**
```
A: Check deze documentatie voor expected behavior.
   Beta versie - sommige features nog in development.
   Feedback welkom voor UX improvements.
```

### ⚡ Performance Issues

**Q: App langzaam of bevriest**
```
A: Check device specs (min Android 6.0, iOS 13.0)
   Close andere apps, restart device.
   Clear app cache via device settings.
```

**Q: Battery drain te hoog**
```
A: Background location tracking actief tijdens events.
   Check: Geofence status, location permissions.
   Battery optimalisatie: Sluit app wanneer niet in gebruik.
```

### 🔄 Update Issues

**Q: OTA update niet zichtbaar**
```
A: Force restart app volledig (niet background).
   Check: Runtime version match tussen build en update.
   Manual: Re-download nieuwste APK.
```

**Q: Na update werkt oude functionaliteit niet**
```
A: Clear app data/cache via device settings.
   Re-login indien nodig.
   Contact support bij persistente issues.
```

### 🛠️ Development-Specific Issues

**Q: Test button werkt niet**
```
A: Alleen beschikbaar in development mode.
   Check: npm start output voor "development" mode.
   Of: Build development profile voor test features.
```

**Q: Expo Go vs Standalone verschil**
```
A: Expo Go: Snelle testing, beperkte native features
   Standalone: Volledige app, alle permissions werken
   Use Expo Go voor UI testing, standalone voor full validation.
```

---

## 📚 Troubleshooting Resources

- **[`CI_CD.md`](CI_CD.md)** - Voor build pipeline issues
- **[`MONITORING.md`](MONITORING.md)** - Voor analytics setup
- **[`PRODUCTION_TRANSITION.md`](PRODUCTION_TRANSITION.md)** - Voor production migration
- **[`CHANGELOG.md`](../04-reference/CHANGELOG.md)** - Voor version changes
- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev/docs

---

## ✅ Checklist voor Beta Launch

```bash
Pre-Launch:
✅ Code is getest en stable
✅ Backend is production-ready
✅ Test accounts zijn aangemaakt
✅ Versie nummer is bijgewerkt
✅ Assets zijn finalized
✅ Permissions zijn geconfigureerd

Launch:
✅ EAS builds succesvol
✅ Download links getest
✅ Tester uitnodigingen verstuurd
✅ Feedback mechanisme actief
✅ Support kanalen open

Post-Launch:
✅ Monitor build analytics
✅ Respond op feedback (24u)
✅ Track critical bugs
✅ Plan next iteration
```

---

## 🎊 Ready to Launch!

**Kies je strategie en start:**

```bash
# QUICK START (Android APK):
eas build --platform android --profile preview

# Wacht 15 minuten
# Download link verschijnt
# Deel met testers
# Begin beta testing! 🚀
```

**Good luck met de Beta release!** 🎉