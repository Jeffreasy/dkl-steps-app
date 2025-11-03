# Database Setup Scripts

Scripts voor het opzetten van test events voor geofencing.

---

## 📁 Overzicht Scripts

### 1. `setup_local_test_event.sql`
**Voor:** Local Docker development  
**Database:** localhost:5433  
**Coordinaten:** Utrecht Domplein (52.0907, 5.1214)  
**Radius:** 500 meter  
**Use Case:** Development testing met emulator GPS spoofing

### 2. `setup_production_test_event.sql`
**Voor:** Render production deployment  
**Database:** Render PostgreSQL  
**Coordinaten:** Dronten Spiegelstraat (52.5185, 5.7220)  
**Radius:** 500 meter  
**Use Case:** Production testing op fysieke locatie

---

## 🚀 Local Setup (Docker)

### Stap 1: Start Docker Services

```bash
# In de backend directory
cd path/to/backend
docker-compose -f docker-compose.dev.yml up -d

# Verify services running
docker-compose ps

# Should show:
# - postgres (port 5433)
# - redis (port 6380)
# - app (port 8082)
```

### Stap 2: Run Local Script

```bash
# Option A: Via psql
psql -h localhost -p 5433 -U postgres -d dkl_db \
  -f database/scripts/setup_local_test_event.sql

# Option B: Via Docker exec
docker exec -i dkl-postgres psql -U postgres -d dkl_db \
  < database/scripts/setup_local_test_event.sql
```

### Stap 3: Verify

```bash
# Test API endpoint
curl http://localhost:8082/api/events/active

# Expected response:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "De Koninklijke Loop 2025 - LOCAL TEST",
  "geofences": [
    {
      "type": "start",
      "lat": 52.0907,
      "long": 5.1214,
      "radius": 500,
      "name": "Start - Utrecht Domplein"
    }
  ],
  "status": "active",
  "is_active": true
}
```

### Stap 4: Test in Mobile App

```bash
# 1. Update BACKEND_URL in app.json (if needed)
"extra": {
  "BACKEND_URL": "http://localhost:8082/api"  # Voor iOS simulator
  # OF "http://10.0.2.2:8082/api"             # Voor Android emulator
}

# 2. Start app
cd path/to/dkl-steps-app
expo start

# 3. Test flow
# - Login als deelnemer
# - Enable "Event Locatie Tracking"
# - Spoof GPS naar 52.0907, 5.1214
# - Status: "✓ Binnen Gebied" ✅
```

---

## 🌐 Production Setup (Render)

### Stap 1: Access Render Shell

```bash
# 1. Ga naar Render Dashboard
# 2. Select je service: dklemailservice
# 3. Click "Shell" tab
# 4. Wacht tot shell verbinding maakt
```

### Stap 2: Run Production Script

```bash
# In Render Shell:

# 1. Connect to database
psql $DATABASE_URL

# 2. Copy-paste entire script content of:
#    database/scripts/setup_production_test_event.sql
#    (hele inhoud kopiëren en plakken in shell)

# 3. Script output toont:
# ✅ Production test event created successfully!
# 📍 Event: De Koninklijke Loop 2025 - GPS Test
# 📍 Location: Spiegelstraat 6, Dronten
# ... etc

# 4. Exit
\q
```

### Stap 3: Verify

```bash
# Test production API
curl https://dklemailservice.onrender.com/api/events/active

# Expected response:
{
  "id": "4fb1dd30-1465-4a0d-b5e0-6ae814109182",
  "name": "De Koninklijke Loop 2025 - GPS Test",
  "geofences": [
    {
      "type": "start",
      "lat": 52.5185,
      "long": 5.7220,
      "radius": 500,
      "name": "Start - Dronten Spiegelstraat"
    }
  ],
  "status": "active",
  "is_active": true
}
```

### Stap 4: Test in Mobile App

```bash
# Mobile app gebruikt al:
"BACKEND_URL": "https://dklemailservice.onrender.com/api"

# Test flow:
# 1. Login als deelnemer
# 2. Enable "Event Locatie Tracking"
# 3. Grant GPS permission
# 4. Spoof GPS naar 52.5185, 5.7220 (emulator)
#    OR loop fysiek naar Spiegelstraat 6, Dronten (device)
# 5. Status: "✓ Binnen Gebied" ✅
```

---

## 🗺️ GPS Coordinaten

### Local Test Event (Utrecht)

**Start/Finish:**
- Adres: Domplein, Utrecht
- Lat/Long: 52.0907, 5.1214
- Radius: 500m
- Google Maps: https://goo.gl/maps/utrechtdom

**Voor Emulator Testing:**
```
iOS: Debug > Simulate Location > Custom (52.0907, 5.1214)
Android: Extended Controls > Location (52.0907, 5.1214)
```

### Production Test Event (Dronten)

**Start/Finish:**
- Adres: Spiegelstraat 6, 8251 JG Dronten
- Lat/Long: 52.5185, 5.7220
- Radius: 500m
- Google Maps: https://goo.gl/maps/drontenspiegelstraat

**Voor Physical Device Testing:**
- Loop naar Spiegelstraat 6, Dronten
- Bij <500m van adres → Binnen geofence

---

## 🔧 Troubleshooting

### Script Fails met "relation does not exist"

**Oorzaak:** Migration V1.53 nog niet uitgevoerd

**Fix:**
```bash
# Check migrations
SELECT filename, executed_at 
FROM migraties 
WHERE filename LIKE '%V1_53%';

# Als leeg - run migration:
# [Backend moet redeployed worden met V1.53]
```

### "404 Not Found" na Script

**Check:**
```sql
-- Check event exists
SELECT id, name, status, is_active 
FROM events 
WHERE name LIKE '%GPS Test%';

-- Als exists maar 404:
UPDATE events
SET is_active = true, status = 'active'
WHERE name LIKE '%GPS Test%';
```

### Multiple Events Active

**Check:**
```sql
-- See alle active events
SELECT id, name, created_at 
FROM events 
WHERE is_active = true 
ORDER BY created_at DESC;

-- Deactiveer oude events, houd alleen test event:
UPDATE events
SET is_active = false
WHERE name NOT LIKE '%GPS Test%';
```

---

## 📊 Quick Reference

### Local (Docker)

```bash
# Database: localhost:5433
# Run script:
psql -h localhost -p 5433 -U postgres -d dkl_db \
  -f database/scripts/setup_local_test_event.sql

# Test API:
curl http://localhost:8082/api/events/active

# GPS Test Coordinates:
52.0907, 5.1214 (Utrecht)
```

### Production (Render)

```bash
# Database: Render PostgreSQL (via $DATABASE_URL)
# Run script:
# → Via Render Shell: psql $DATABASE_URL
# → Copy-paste script content

# Test API:
curl https://dklemailservice.onrender.com/api/events/active

# GPS Test Coordinates:
52.5185, 5.7220 (Dronten - Spiegelstraat 6)
```

---

## ✅ Success Criteria

Na het runnen van scripts, verify:

**Local:**
- [ ] `curl http://localhost:8082/api/events/active` → 200 OK
- [ ] Event name bevat "LOCAL TEST"
- [ ] Geofences count = 4
- [ ] Utrecht coordinates (52.0907, 5.1214)

**Production:**
- [ ] `curl https://dklemailservice.onrender.com/api/events/active` → 200 OK
- [ ] Event name bevat "GPS Test"
- [ ] Geofences count = 4
- [ ] Dronten coordinates (52.5185, 5.7220)

---

## 🎯 Next Steps

1. **Run Local Script** (development)
   ```bash
   psql -h localhost -p 5433 -U postgres -d dkl_db \
     -f database/scripts/setup_local_test_event.sql
   ```

2. **Run Production Script** (Render)
   ```bash
   # Via Render Shell
   psql $DATABASE_URL
   # Copy-paste script content
   ```

3. **Test Mobile App**
   ```bash
   # Development
   expo start
   # Test met Utrecht coordinates

   # Production
   # Build app + test op device bij Dronten
   ```

---

**Scripts Ready:** ✅  
**Local Setup:** ⏳ Run `setup_local_test_event.sql`  
**Production Setup:** ⏳ Run `setup_production_test_event.sql` via Render Shell  
**Mobile Testing:** ⏳ After backend events created