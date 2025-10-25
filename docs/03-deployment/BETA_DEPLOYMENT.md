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
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "archive"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      },
      "distribution": "internal"
    },
    "development": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "simulator": true
      },
      "distribution": "internal",
      "developmentClient": true
    }
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
    "version": "1.0.0-beta.1",
    "android": {
      "package": "nl.dekoninklijkeloop.stepsapp",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "android.permission.ACTIVITY_RECOGNITION",
        "android.permission.INTERNET"
      ]
    },
    "ios": {
      "bundleIdentifier": "nl.dekoninklijkeloop.stepsapp",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSMotionUsageDescription": "Voor stappen tellen."
      }
    }
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

1. **Download Link** verschijnt in terminal
2. **Of check in Expo dashboard**: https://expo.dev/accounts/[username]/projects/dkl-steps-app/builds

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

---

## 📝 Pre-Build Checklist

```bash
# 1. Update versie nummers
✅ app.json: "version": "1.0.0-beta.1"
✅ package.json: "version": "1.0.0-beta.1"

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

# 2. Update versie
# Bewerk app.json: "version": "1.0.0-beta.1"

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

# Check logs als build faalt
eas build:logs [BUILD_ID]
```

**Expo Dashboard:**
https://expo.dev/accounts/[username]/projects/dkl-steps-app/builds

---

## 🐛 Common Build Issues

### 1. Build Fails - Missing Credentials
```bash
# Setup credentials
eas credentials

# Select platform and follow prompts
```

### 2. "Invalid Bundle Identifier"
```bash
# Use reverse domain notation
# app.json:
"bundleIdentifier": "nl.dekoninklijkeloop.stepsapp"
```

### 3. "Gradle Build Failed" (Android)
```bash
# Check app.json android config
# Ensure all required fields present
# Verify permissions array is valid
```

### 4. Build Takes Too Long
```bash
# Check queue status
eas build:list

# Priority builds (paid plan)
eas build --platform android --non-interactive
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
│   Versie: 1.0.0-beta.1      │
└─────────────────────────────┘
```

---

## 🔄 Update Workflow

### Voor Bug Fixes tijdens Beta:

```bash
# 1. Fix de bug in code
# 2. Test lokaal
npm start

# 3. Update versie
# app.json: "1.0.0-beta.1" → "1.0.0-beta.2"

# 4. Rebuild
eas build --platform android --profile preview

# 5. Notify testers
# Stuur nieuwe download link
```

### Voor OTA Updates (JS changes only):

```bash
# Publish update zonder rebuild
eas update --branch beta --message "Fix sync issue"

# Testers krijgen update automatisch bij volgende launch
```

**Limitatie OTA:**
- Alleen JS/React changes
- Geen native code changes
- Geen app.json permission changes

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
- App Versie: 1.0.0-beta.1

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

**Via Analytics (optioneel te implementeren):**
```typescript
// Install: npm install @react-native-firebase/analytics
// Of: expo install expo-firebase-analytics

// Track events:
- Login attempts (success/fail)
- Steps synced (count, frequency)
- Screen views
- Errors encountered
- Time spent in app
```

**Manual Tracking:**
- Aantal downloads
- Aantal actieve gebruikers
- Bug reports count
- Feature requests
- Net Promoter Score (NPS)

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
- FAQ document met common issues

**Voor developers:**
- EAS Dashboard voor build logs
- Expo Forums: https://forums.expo.dev
- React Native Docs: https://reactnative.dev

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