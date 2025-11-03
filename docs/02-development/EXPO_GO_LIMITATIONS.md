# Expo Go Limitations & Solutions

**Problem:** GPS permissions werken niet in Expo Go  
**Error:** `NSLocation*UsageDescription keys must be present in Info.plist`

---

## ⚠️ Expo Go Limitations

**Expo Go kan NIET:**
- ❌ Custom Info.plist permissions (iOS)
- ❌ Custom AndroidManifest permissions
- ❌ Background location tracking
- ❌ Foreground services (Android)
- ❌ Custom native plugins

**Expo Go KAN WEL:**
- ✅ Basis foreground location (beperkt)
- ✅ Basis functionaliteit testen
- ✅ UI/UX testen
- ✅ API integr tie testen

---

## ✅ SOLUTIONS

### Solution 1: Development Build (AANBEVOLEN voor Testing)

**Wat is Development Build:**
- Custom native build met jouw app.json permissions
- Draait local code via Metro bundler (zoals Expo Go)
- Ondersteunt alle native features
- **Beste van beide werelden!**

**Setup (15 min):**

```bash
# 1. Install EAS CLI (if not installed)
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure project
eas build:configure

# 4. Create iOS development build
eas build --profile development --platform ios

# 5. Download en install op device via link
# Scan QR code en install

# 6. Start app
npx expo start --dev-client

# 7. Scan QR in development build app
# → App nu werkt met alle permissions! ✅
```

**Android:**
```bash
eas build --profile development --platform android
# Download APK en install
```

**Result:**
- ✅ GPS permissions werken
- ✅ Background tracking werkt
- ✅ Hot reload werkt (zoals Expo Go)
- ✅ Debug logs werken

### Solution 2: Production Build

**Voor final testing:**
```bash
# iOS
eas build --profile production --platform ios

# Android  
eas build --profile production --platform android
```

**Verschil met development:**
- Production = optimized build
- Development = includes dev tools

### Solution 3: Prebuild (Local Native Projects)

**Als je Xcode/Android Studio wilt gebruiken:**

```bash
# 1. Generate native projects
npx expo prebuild

# 2. Open in Xcode/Android Studio
# iOS: open ios/dklstepsapp.xcworkspace
# Android: open android/ in Android Studio

# 3. Build en run via IDE
# Permissions worden automatisch toegevoegd uit app.json
```

---

## 🎯 Recommended Workflow

### Development (Daily Work):

```bash
# Expo Go voor UI/logic testing
expo start
# → Scan in Expo Go
# → Test UI/UX, niet GPS
```

### GPS Testing:

```bash
# Development build (1x setup, dan herbruikbaar)
eas build --profile development --platform ios
# → Install op device
# → npx expo start --dev-client
# → Test GPS features! ✅
```

### Production Deploy:

```bash
# Final production build
eas build --profile production --platform all
# → Deploy naar App Store / Play Store
```

---

## 📱 Current Situation

**Jouw setup:**
- ✅ Expo Go installed
- ❌ GPS permissions werken niet (Expo Go limitation)
- ✅ UI/logic werkt perfect
- ✅ Admin event management werkt

**Om GPS te testen:**
- Option A: Build development build (15 min setup)
- Option B: Use standalone device voor final test
- Option C: Fix events via admin, test rest later

---

## 🔧 Quick Fix: Events Eerst

**Voordat je GPS test, fix de events:**

**In Admin Event Management (app):**
```
1. Login als admin
2. Dashboard → "Event Management"
3. Tap eerste event "De Koninklijke Loop 2025"
4. Scroll naar "Actions"
5. Zie switch: "Inactief"
6. Tap switch → "Actief"
7. Event is nu active! ✅
```

**Of via backend SQL:**
```sql
UPDATE events
SET is_active = true, status = 'active'
WHERE name = 'De Koninklijke Loop 2025';
```

**Dan:**
- ❌ Log: "is_active=false" verdwijnt
- ✅ Log: "Active events: 2/2" ✅
- ✅ Participants zien event
- ✅ GeofenceManager appears

**GPS testing kan later** (met development build)

---

## 💡 Pro Tip

**Test in deze volgorde:**

```
1. ✅ Fix events (via admin toggle) - NU
   → Verify participants zien events
   
2. ✅ Test UI/UX (Expo Go) - NU  
   → Verify GeofenceManager UI
   → Verify status indicators
   
3. ⏳ Build development build - LATER (15 min)
   → eas build --profile development
   → Install op device
   
4. ⏳ Test GPS features - LATER
   → Real location testing
   → Background tracking
```

**Prioriteit:** Fix events eerst (admin kan nu!), GPS later

---

## 🎯 Action Items

**NU (5 min):**
```bash
# 1. Login als admin
# 2. Event Management → Toggle events active
# 3. Verify: Logs tonen "Active events: 2/2"
# 4. Login als deelnemer → See events! ✅
```

**LATER (15 min):**
```bash
# Build development build voor GPS testing
eas build --profile development --platform ios
# Install en test GPS
```

---

**Current Status:**  
- Expo Go: ✅ UI/Admin werkt perfect  
- GPS Testing: ⏳ Requires development build  
- Events: ⏳ Moet activated worden via admin  

**Next:** Toggle events via admin, dan werkt alles behalve GPS (dat is Expo Go limitation)!