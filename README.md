# 🏃 DKL Steps Mobile App

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0--beta.1-blue)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react)
![Expo](https://img.shields.io/badge/Expo-54.0.20-000020?logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript)
![License](https://img.shields.io/badge/license-Proprietary-red)

**Een professionele mobiele app voor het tracken van stappen tijdens De Koninklijke Loop challenge**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentatie](#-documentatie) • [Tech Stack](#-tech-stack) • [Screenshots](#-screenshots)

</div>

---

## 🎯 Features

- 🏃 **Real-time Stappen Tracking** - Automatische pedometer detectie
- 🔄 **Auto-Sync** - Elke 50 stappen of 5 minuten automatisch
- 📡 **Offline Support** - Queue mechanisme met auto-recovery
- 👥 **Role-Based Access** - Deelnemer, Staff, Admin rollen
- 📊 **Live Dashboard** - Real-time updates (10 seconden)
- 🎨 **Professional Design** - DKL brand identity met oranje gradients
- ⚙️ **Admin Beheer** - CRUD interface voor route fondsen
- 🔐 **JWT Security** - Veilige authenticatie
- 📱 **Cross-Platform** - iOS & Android support

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone https://github.com/YOUR_ORG/dkl-steps-app.git
cd dkl-steps-app

# 2. Installeer dependencies
npm install

# 3. Start development server
npm start

# 4. Scan QR code met Expo Go app
```

**Zie [docs/01-getting-started/QUICKSTART.md](docs/01-getting-started/QUICKSTART.md) voor volledige installatie instructies.**

## 📚 Documentatie

Alle documentatie is professioneel georganiseerd in de [`docs/`](docs/) folder:

### 🎯 Start Hier
- 📖 **[docs/COMPLETE_DOCUMENTATIE.md](docs/COMPLETE_DOCUMENTATIE.md)** - Complete geconsolideerde gids (1,499 lijnen)
- 📚 **[docs/README.md](docs/README.md)** - Documentatie index & navigatie

### 📁 Categorieën
- **[01-getting-started/](docs/01-getting-started/)** - Voor nieuwe gebruikers
  - [README.md](docs/01-getting-started/README.md) - Gebruikershandleiding
  - [QUICKSTART.md](docs/01-getting-started/QUICKSTART.md) - 5-minuten setup
  
- **[02-development/](docs/02-development/)** - Voor developers
  - [DOCUMENTATIE.md](docs/02-development/DOCUMENTATIE.md) - Technische details (2,294 lijnen)
  - [THEME_USAGE.md](docs/02-development/THEME_USAGE.md) - Theme system gids
  - [FONT_SETUP.md](docs/02-development/FONT_SETUP.md) - Font installatie
  
- **[03-deployment/](docs/03-deployment/)** - Voor releases
  - [BETA_DEPLOYMENT.md](docs/03-deployment/BETA_DEPLOYMENT.md) - Deployment strategie
  
- **[04-reference/](docs/04-reference/)** - Referentie materiaal
  - [CHANGELOG.md](docs/04-reference/CHANGELOG.md) - Versie historie
  - [LOGO_INSTRUCTIONS.md](docs/04-reference/LOGO_INSTRUCTIONS.md) - Logo setup
  
- **[05-reports/](docs/05-reports/)** - Project rapporten
  - [PROFESSIONAL_UPGRADE_SUMMARY.md](docs/05-reports/PROFESSIONAL_UPGRADE_SUMMARY.md) - Upgrade rapport
  - [FINAL_IMPLEMENTATION_REPORT.md](docs/05-reports/FINAL_IMPLEMENTATION_REPORT.md) - Implementatie details

## 🏗️ Tech Stack

### Core
- **React Native** 0.81.5 - Cross-platform framework
- **Expo** 54.0.20 - Development platform
- **TypeScript** 5.9.2 - Type safety
- **React** 19.1.0 - UI library

### State & Data
- **React Query** 5.90.5 - Server state management
- **AsyncStorage** 2.2.0 - Local persistence
- **NetInfo** 11.4.1 - Network monitoring

### Navigation & UI
- **React Navigation** 7.1.18 - Navigation
- **Expo Sensors** 15.0.7 - Pedometer
- **Linear Gradient** 15.0.7 - Gradient effects
- **Google Fonts (Roboto)** 0.4.x - Typography

### Design System
- ✅ Centralized theme system (5 modules)
- ✅ -67% code reductie (800 lijnen bespaard)
- ✅ DKL brand identity (#ff9328 oranje)
- ✅ Professional UI components

## 📁 Project Structuur

```
dkl-steps-app/
├── src/
│   ├── components/          # Herbruikbare componenten
│   │   ├── StepCounter.tsx  # Pedometer + auto-sync
│   │   └── ui/             # UI component library
│   ├── screens/            # Screen componenten (7 screens)
│   ├── services/           # API client + helpers
│   └── theme/              # Design system (5 modules)
│
├── assets/                 # Logo's & iconen
├── docs/                   # Documentatie (6,651 lijnen)
├── App.tsx                 # Root component
├── app.json               # Expo configuratie
└── package.json           # Dependencies
```

## 🎨 Screenshots

<div align="center">

| Login | Dashboard | Digital Board |
|-------|-----------|---------------|
| *Gradient login screen met DKL branding* | *Personal stats met live tracking* | *Live display met 120px cijfers* |

</div>

> **Note:** Screenshots volgen binnenkort

## 🚀 Deployment

### Development
```bash
npm start          # Start Expo development server
npm run android    # Open Android emulator
npm run ios        # Open iOS simulator (macOS)
```

### Production Build
```bash
# EAS Build
npm install -g eas-cli
eas login
eas build --platform android --profile production
eas build --platform ios --profile production
```

**Zie [docs/03-deployment/BETA_DEPLOYMENT.md](docs/03-deployment/BETA_DEPLOYMENT.md) voor volledige deployment gids.**

## 🧪 Testing

```bash
# Run the app
npm start

# Test flow:
# 1. Login met credentials
# 2. Walk rond → delta counter increments
# 3. Auto-sync bij 50 stappen
# 4. Check dashboard updates
```

**Zie [docs/COMPLETE_DOCUMENTATIE.md#10-testing](docs/COMPLETE_DOCUMENTATIE.md#10-testing) voor complete test flows.**

## 🐛 Troubleshooting

### Pedometer werkt niet?
- ✅ Test op **physical device** (niet emulator)
- ✅ Android: Bouw **standalone APK** (Expo Go ondersteunt geen pedometer)
- ✅ iOS: Werkt in Expo Go
- ✅ Check permissions in device settings

### Dependencies errors?
```bash
rm -rf node_modules package-lock.json
npm install
expo start --clear
```

**Zie [docs/COMPLETE_DOCUMENTATIE.md#12-troubleshooting](docs/COMPLETE_DOCUMENTATIE.md#12-troubleshooting) voor meer oplossingen.**

## 📊 Project Metrics

| Metric | Waarde |
|--------|--------|
| **Code Lijnen** | ~3,500 |
| **Documentatie** | 6,651 lijnen |
| **Screens** | 7 |
| **Components** | 10+ |
| **Type Coverage** | 100% TypeScript |
| **Code Reductie** | -67% (theme system) |

## 🔐 Security

- ✅ JWT-based authentication
- ✅ Role-Based Access Control (RBAC)
- ✅ HTTPS-only API communication
- ✅ Encrypted local storage (AsyncStorage)
- ✅ Input validation (client + server)

## 📝 Changelog

### Version 1.0.0-beta.1 (25 Oktober 2025)

**Added:**
- ✨ Real-time pedometer tracking
- ✨ Auto-sync (50 stappen / 5 minuten)
- ✨ Professional theme system
- ✨ DKL brand identity
- ✨ 7 volledig themed screens
- ✨ Admin CRUD interface
- ✨ Offline queue mechanisme

**Fixed:**
- 🐛 JWT endpoint auth errors
- 🐛 Case-sensitive role checks
- 🐛 Offline sync spam

**See [docs/04-reference/CHANGELOG.md](docs/04-reference/CHANGELOG.md) for complete history.**

## 🤝 Contributing

Dit is een privaat project voor DKL Organization. Voor interne contributors:

1. Branch maken: `git checkout -b feature/your-feature`
2. Changes maken en testen
3. Commit: `git commit -m "feat: your feature"`
4. Push: `git push origin feature/your-feature`
5. Open Pull Request

## 📞 Support

- 📖 **Documentatie:** [docs/](docs/)
- 🌐 **Website:** https://www.dekoninklijkeloop.nl
- 📝 **API Reference:** [docs/COMPLETE_DOCUMENTATIE.md#8-api-documentatie](docs/COMPLETE_DOCUMENTATIE.md#8-api-documentatie)

## 📄 License

© 2025 DKL Organization. All rights reserved.

Deze software is eigendom van DKL Organization en mag niet worden gekopieerd, gedistribueerd of gemodificeerd zonder expliciete toestemming.

---

<div align="center">

**Made with ❤️ for De Koninklijke Loop**

[Website](https://www.dekoninklijkeloop.nl) • [Documentatie](docs/) • [Changelog](docs/04-reference/CHANGELOG.md)

</div>