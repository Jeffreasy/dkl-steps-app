# API Reference - DKL Steps App

**Version**: 1.0.0
**Date**: 2025-11-03
**Status**: 📡 Complete API Documentation

Deze documentatie beschrijft alle beschikbare API endpoints voor de DKL Steps App. Alle endpoints zijn JWT-gebaseerd en vereisen authenticatie behalve waar expliciet aangegeven.

## 📋 Overzicht

### Base URL
```
https://dklemailservice.onrender.com/api
```

### Authenticatie
Alle endpoints (behalve `/auth/login`) vereisen een Bearer token in de Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Response Format
Alle responses zijn in JSON format met consistente error handling.

### Rate Limiting
- 100 requests per minuut per gebruiker
- 1000 requests per uur per IP

---

## 🔐 Authentication Endpoints

### POST /auth/login
Gebruiker authenticatie en JWT token verkrijgen.

**Request Body:**
```json
{
  "email": "deelnemer@dkl.nl",
  "wachtwoord": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": 123,
    "naam": "Jan Jansen",
    "rol": "Deelnemer"
  }
}
```

**Error Responses:**
- `400`: Ongeldige request (missing fields)
- `401`: Ongeldige credentials
- `429`: Te veel pogingen

**Example:**
```bash
curl -X POST https://dklemailservice.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"deelnemer@dkl.nl","wachtwoord":"password123"}'
```

### POST /auth/reset-password
Wachtwoord wijzigen voor geauthenticeerde gebruiker.

**Request Body:**
```json
{
  "huidig_wachtwoord": "oldpassword",
  "nieuw_wachtwoord": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Wachtwoord succesvol gewijzigd"
}
```

**Error Responses:**
- `400`: Validatie fouten
- `401`: Niet geauthenticeerd
- `403`: Ongeldig huidig wachtwoord

---

## 👤 Participant Endpoints

### GET /participant/dashboard
Persoonlijke dashboard data voor ingelogde gebruiker.

**Query Parameters:** None (user ID from JWT)

**Response (200):**
```json
{
  "participant_id": 123,
  "naam": "Jan Jansen",
  "route": "6 KM",
  "toegewezen_fonds": 150.00,
  "totaal_stappen": 8750,
  "laatste_sync": "2025-11-03T17:30:00Z"
}
```

**Error Responses:**
- `401`: Niet geauthenticeerd
- `404`: Gebruiker niet gevonden

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://dklemailservice.onrender.com/api/participant/dashboard
```

### POST /steps
Stappen delta verzenden (positief = toevoegen, negatief = corrigeren).

**Request Body:**
```json
{
  "steps": 150
}
```

**Response (200):**
```json
{
  "success": true,
  "nieuw_totaal": 8900,
  "delta_toegepast": 150
}
```

**Error Responses:**
- `400`: Ongeldige stappen waarde
- `401`: Niet geauthenticeerd

**Example:**
```bash
curl -X POST https://dklemailservice.onrender.com/api/steps \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"steps": 150}'
```

---

## 🌍 Global Statistics Endpoints

### GET /total-steps
Totale stappen voor alle deelnemers in een jaar.

**Query Parameters:**
- `year` (required): Jaar (bijv. 2025)

**Response (200):**
```json
{
  "year": 2025,
  "total_steps": 456789,
  "participant_count": 89,
  "last_updated": "2025-11-03T18:00:00Z"
}
```

**Error Responses:**
- `400`: Ongeldig jaar
- `404`: Geen data voor jaar

**Example:**
```bash
curl https://dklemailservice.onrender.com/api/total-steps?year=2025
```

### GET /funds-distribution
Overzicht van alle routes met toegewezen fondsen.

**Response (200):**
```json
{
  "routes": [
    {
      "route": "6 KM",
      "fonds": 150.00,
      "deelnemers": 25
    },
    {
      "route": "12 KM",
      "fonds": 300.00,
      "deelnemers": 18
    }
  ],
  "totaal_fonds": 10500.00,
  "last_updated": "2025-11-03T18:00:00Z"
}
```

**Example:**
```bash
curl https://dklemailservice.onrender.com/api/funds-distribution
```

---

## ⚙️ Admin Endpoints

### GET /steps/admin/route-funds
Alle route funds ophalen (Admin only).

**Response (200):**
```json
[
  {
    "route": "6 KM",
    "amount": 150.00
  },
  {
    "route": "12 KM",
    "amount": 300.00
  }
]
```

**Error Responses:**
- `403`: Geen admin rechten

### POST /steps/admin/route-funds
Nieuwe route toevoegen (Admin only).

**Request Body:**
```json
{
  "route": "25 KM",
  "amount": 500.00
}
```

**Response (201):**
```json
{
  "success": true,
  "route": "25 KM",
  "amount": 500.00
}
```

**Error Responses:**
- `400`: Ongeldige data
- `403`: Geen admin rechten
- `409`: Route bestaat al

### PUT /steps/admin/route-funds/{route}
Route fund bijwerken (Admin only).

**Path Parameters:**
- `route`: URL-encoded route naam

**Request Body:**
```json
{
  "amount": 175.00
}
```

**Response (200):**
```json
{
  "success": true,
  "route": "6 KM",
  "old_amount": 150.00,
  "new_amount": 175.00
}
```

**Error Responses:**
- `403`: Geen admin rechten
- `404`: Route niet gevonden

**Example:**
```bash
curl -X PUT https://dklemailservice.onrender.com/api/steps/admin/route-funds/6%20KM \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 175.00}'
```

### DELETE /steps/admin/route-funds/{route}
Route verwijderen (Admin only).

**Path Parameters:**
- `route`: URL-encoded route naam

**Response (200):**
```json
{
  "success": true,
  "deleted_route": "25 KM"
}
```

**Error Responses:**
- `403`: Geen admin rechten
- `404`: Route niet gevonden

---

## 📊 Data Models

### User Model
```typescript
interface User {
  id: number;
  naam: string;
  rol: 'Deelnemer' | 'Staff' | 'Admin';
  email: string;
}
```

### RouteFund Model
```typescript
interface RouteFund {
  route: string;
  amount: number;
}
```

### Dashboard Data Model
```typescript
interface DashboardData {
  participant_id: number;
  naam: string;
  route: string;
  toegewezen_fonds: number;
  totaal_stappen: number;
  laatste_sync: string; // ISO 8601 date
}
```

### Step Update Model
```typescript
interface StepUpdate {
  steps: number; // Delta value (positive or negative)
}
```

---

## 🚨 Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ongeldige input data",
    "details": {
      "field": "amount",
      "reason": "Moet groter zijn dan 0"
    }
  }
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (resource exists)
- `429`: Too Many Requests
- `500`: Internal Server Error

---

## 🔧 Development & Testing

### Test Mode Header
Voor development, voeg `X-Test-Mode: true` header toe om test data te gebruiken:

```bash
curl -H "X-Test-Mode: true" \
  https://dklemailservice.onrender.com/api/total-steps?year=2025
```

### API Health Check
```bash
curl https://dklemailservice.onrender.com/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-03T18:00:00Z",
  "version": "1.0.0"
}
```

---

## 📚 Related Documentation

- **[DOCUMENTATIE.md](../02-development/DOCUMENTATIE.md)**: Technische implementatie details
- **[CHANGELOG.md](CHANGELOG.md)**: API changes per versie
- **[GLOSSARY.md](GLOSSARY.md)**: API termen en definities
- **[COMPATIBILITY.md](COMPATIBILITY.md)**: API versie compatibiliteit
- **[FAQ.md](FAQ.md)**: API gerelateerde vragen

---

## 🔗 Quick Links

- **API Base URL**: https://dklemailservice.onrender.com/api
- **Health Check**: https://dklemailservice.onrender.com/api/health
- **Interactive Docs**: https://dklemailservice.onrender.com/api/docs (indien beschikbaar)

---

**API Reference Status**: ✅ Complete
**Last Updated**: 2025-11-03
**Version**: 1.0.0

**DKL Steps App API** © 2025 DKL Organization. All rights reserved.