# Glossary - DKL Steps App

**Version**: 1.0.0
**Date**: 2025-11-03
**Status**: 📚 Complete Terminology Reference

Deze woordenlijst bevat alle belangrijke termen, concepten en afkortingen gebruikt in de DKL Steps App documentatie en codebase.

## 📋 Overzicht

### Categorieën
- **Technische Termen**: Development en architectuur
- **Business Concepten**: DKL-specifieke termen
- **UI/UX Termen**: Design en gebruikerservaring
- **API Termen**: Backend communicatie
- **DevOps Termen**: Deployment en onderhoud

---

## 🔧 Technische Termen

### A
**API (Application Programming Interface)**: Interface voor communicatie tussen applicaties. In deze app: RESTful API op https://dklemailservice.onrender.com/api

**AsyncStorage**: React Native's lokale opslag systeem voor persistente data opslag op device.

### C
**Component**: Herbruikbare UI bouwsteen. Voorbeeld: `StepCounter`, `CustomButton`.

**Context**: React feature voor state sharing tussen componenten zonder prop drilling.

### D
**Delta Update**: Verschil-gebaseerde data verzending. Stappen worden als +150 of -100 verzonden in plaats van absolute waarden.

### E
**Expo**: Platform voor React Native development met tools voor building en deployment.

**Expo Application Services (EAS)**: Cloud service voor building, submitting en updating Expo apps.

### F
**Fetch**: JavaScript API voor HTTP requests naar de backend.

### H
**Hook**: React functie voor state en lifecycle management. Voorbeeld: `useQuery`, `useMutation`.

### J
**JWT (JSON Web Token)**: Token format voor veilige authenticatie. Bevat user info en verloopt na tijd.

**Jest**: JavaScript testing framework gebruikt voor unit en integration tests.

### M
**Mutation**: TanStack Query term voor data modificatie operations (POST, PUT, DELETE).

### P
**Pedometer**: Device sensor voor stappen detectie via accelerometer/gyroscope.

**Permissions**: Toestemmingen vereist voor device features zoals locatie en motion sensors.

### Q
**Query**: TanStack Query term voor data fetching operations (GET requests).

### R
**React Native**: Framework voor cross-platform mobile apps met native performance.

**React Query (TanStack Query)**: Data fetching en caching library voor server state management.

### S
**Screen**: Top-level component representeert een volledige pagina/view in de app.

**Service Layer**: Abstractie laag tussen UI en API calls. Voorbeeld: `api.ts`.

### T
**TypeScript**: Typed superset van JavaScript voor betere developer experience en error prevention.

### U
**useEffect**: React Hook voor side effects zoals data fetching en subscriptions.

**useState**: React Hook voor lokale component state management.

---

## 🏢 Business Concepten

### A
**Admin**: Gebruiker rol met volledige CRUD rechten voor route funds configuratie.

### D
**Deelnemer**: Eindgebruiker die deelneemt aan DKL Steps Challenge, kan alleen persoonlijke data bekijken.

### F
**Fonds**: Geld bedrag gekoppeld aan een route. Voorbeeld: "6 KM" → €150.

### G
**Global Dashboard**: Overzicht scherm voor Staff/Admin met totale statistieken.

### P
**Participant**: Zie "Deelnemer".

**Personal Dashboard**: Individueel overzicht scherm met persoonlijke stappen en voortgang.

### R
**RBAC (Role-Based Access Control)**: Permissie systeem gebaseerd op user rollen (Deelnemer/Staff/Admin).

**Route**: Afstand categorie voor deelnemers. Voorbeeld: 6 KM, 12 KM, 25 KM.

### S
**Staff**: Gebruiker rol met toegang tot globale statistieken maar geen admin rechten.

**Steps Challenge**: DKL Steps initiatief voor stappen tracking en fondsen werving.

### T
**Totaal Stappen**: Cumulatieve stappen van alle deelnemers in een jaar.

---

## 🎨 UI/UX Termen

### A
**Avatar**: Circulaire user representatie, vaak met initialen of foto.

### B
**Badge**: Kleine indicator voor status of categorie. Voorbeeld: "New", "Active".

**Button Variants**: Verschillende button stijlen - primary, secondary, outline, ghost, danger.

### C
**Card**: Container component met schaduw en padding voor content grouping.

**Component Library**: Collectie herbruikbare UI componenten.

### D
**Dark Mode**: Donker kleurenschema voor betere zichtbaarheid in lage licht condities.

**Design System**: Complete set van design regels, componenten en tokens.

**Design Tokens**: Herbruikbare design waarden zoals kleuren, spacing, typography.

### E
**Empty State**: UI voor wanneer geen data beschikbaar is, vaak met illustratie en actie button.

### F
**Figma**: Design tool gebruikt voor UI prototyping en component libraries.

### G
**Glow Effect**: TextShadow voor visuele impact, gebruikt in Digital Board.

### H
**Haptic Feedback**: Trilling feedback bij user interactions voor betere UX.

### I
**Icon**: Kleine grafische representatie van concepten of acties.

### L
**Lazy Loading**: Componenten laden alleen wanneer nodig voor betere performance.

### M
**Material Design**: Design systeem van Google, invloed op sommige componenten.

### P
**Progress Bar**: Visuele indicator van voortgang, vaak gebruikt voor stappen targets.

**Pull-to-Refresh**: Swipe down gesture om data te verversen.

### S
**Skeleton**: Placeholder UI tijdens data loading met shimmer animatie.

**Spacing Grid**: 4px gebaseerd grid systeem voor consistente spacing.

### T
**Toast**: Tijdelijke notificatie voor success/error/warning/info messages.

**Touch Target**: Minimale grootte voor interactive elementen (44x44px).

### V
**Variant**: Verschillende stijlen van hetzelfde component type.

---

## 🌐 API Termen

### A
**Authentication**: Proces van user identiteit verificatie via email/wachtwoord.

**Authorization**: Controle of user toestemming heeft voor bepaalde acties.

### B
**Bearer Token**: JWT token type voor API authenticatie.

### C
**CORS (Cross-Origin Resource Sharing)**: Security feature voor cross-domain requests.

### E
**Endpoint**: Specifieke API URL voor bepaalde functionaliteit.

**Error Handling**: Gestandaardiseerde fout afhandeling met status codes en messages.

### H
**HTTP Methods**: GET (ophalen), POST (aanmaken), PUT (bijwerken), DELETE (verwijderen).

**HTTPS**: Encrypted HTTP voor veilige communicatie.

### J
**JSON (JavaScript Object Notation)**: Data format voor API requests/responses.

### P
**Payload**: Data verzonden in API request body.

### R
**Request Body**: Data verzonden naar server in POST/PUT requests.

**Response Body**: Data ontvangen van server.

**REST (Representational State Transfer)**: API architectuur stijl gebruikt door backend.

### S
**Status Code**: HTTP response code (200=success, 401=unauthorized, 500=error).

### T
**Test Mode Header**: `X-Test-Mode: true` voor development testing.

---

## 🚀 DevOps Termen

### A
**APK (Android Package)**: Android app installatie bestand.

**App Store**: Apple platform voor iOS app distributie.

### B
**Build**: Proces van source code naar executable app.

### C
**CI/CD (Continuous Integration/Continuous Deployment)**: Geautomatiseerde build en deployment pipelines.

### D
**Deployment**: Proces van app naar productie environment.

### E
**EAS Build**: Expo's cloud build service.

**Environment**: Configuratie set (development, staging, production).

### G
**Google Play**: Android app distributie platform.

### I
**IPA (iOS App Store Package)**: iOS app installatie bestand.

### O
**OTA (Over-The-Air)**: Updates zonder app store submission.

### P
**Prebuild**: Expo proces om native code te genereren.

**Production**: Live environment voor end users.

### R
**Release**: Nieuwe app versie naar stores.

### S
**Staging**: Test environment voor production.

**Store Submission**: Proces om app te publiceren in app stores.

### T
**TestFlight**: Apple platform voor iOS beta testing.

---

## 📊 Data & State Termen

### A
**AsyncStorage**: Locale key-value storage voor persistent data.

### C
**Cache**: Tijdelijke data opslag voor performance (TanStack Query).

**Caching Strategy**: Stale-while-revalidate voor optimale UX.

### D
**Database**: Data opslag systeem (PostgreSQL voor backend).

### L
**Local State**: Component-specifieke data (useState).

### O
**Offline Queue**: Lijst van acties wachtend op netwerk verbinding.

### P
**Persistence**: Data behoud tussen app sessies.

### Q
**Query Key**: Unieke identifier voor cached data in React Query.

### R
**Remote State**: Server data beheerd door React Query.

### S
**Server State**: Data van backend API.

**Stale Time**: Hoe lang cached data geldig blijft.

### T
**TypeScript Interfaces**: Type definities voor data structures.

---

## 🔒 Security Termen

### A
**Access Control**: Systeem om user toegang te beperken.

### E
**Encryption**: Data versleuteling voor veiligheid.

### J
**JSON Web Token**: Veilige token voor authenticatie.

### P
**Permissions**: Device toestemmingen (camera, location, motion).

### R
**RBAC**: Role-Based Access Control systeem.

### S
**Secure Storage**: Versleutelde lokale data opslag.

### T
**Token Expiration**: Automatische token verlopen voor veiligheid.

---

## 📱 Platform Termen

### A
**Android**: Google mobile operating system.

**Adaptive Icon**: Android icon met foreground/background layers.

### E
**Expo Go**: Development app voor Expo project testing.

### I
**iOS**: Apple mobile operating system.

**iPhone**: Apple smartphone lijn.

### P
**Physical Device**: Echte telefoon/tablet vs emulator.

### S
**Simulator**: Software emulatie van mobile device.

---

## 🧪 Testing Termen

### A
**Assertion**: Claim dat iets waar moet zijn in test.

### C
**Component Test**: Test van individuele UI componenten.

### E
**End-to-End Test**: Complete user journey testing.

**Expo SDK**: Software Development Kit voor Expo features.

### I
**Integration Test**: Test van component interacties.

### M
**Mock**: Nep implementatie voor testing (bijv. API responses).

### U
**Unit Test**: Test van individuele functies/componenten.

---

## 📚 Related Documentation

- **[API_REFERENCE.md](API_REFERENCE.md)**: API endpoints en termen
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)**: UI/UX concepten
- **[DOCUMENTATIE.md](../02-development/DOCUMENTATIE.md)**: Technische implementatie
- **[FAQ.md](FAQ.md)**: Veelgestelde vragen met termen
- **[COMPATIBILITY.md](COMPATIBILITY.md)**: Platform-specifieke termen

---

## 🔍 Quick Reference

### Meest Gebruikte Termen
- **JWT**: JSON Web Token voor authenticatie
- **RBAC**: Role-Based Access Control
- **Delta Update**: Verschil-gebaseerde data verzending
- **Pedometer**: Stappen detectie sensor
- **AsyncStorage**: Lokale data opslag
- **React Query**: Data fetching library
- **Expo**: Development platform
- **Component**: Herbruikbare UI element

### Nederlandse Termen
- **Deelnemer**: Participant/end user
- **Fonds**: Fund/money amount
- **Route**: Distance category
- **Stappen**: Steps
- **Dashboard**: Overview screen
- **Synchronisatie**: Synchronization

---

**Glossary Status**: ✅ Complete
**Last Updated**: 2025-11-03
**Version**: 1.0.0

**DKL Steps App Glossary** © 2025 DKL Organization. All rights reserved.