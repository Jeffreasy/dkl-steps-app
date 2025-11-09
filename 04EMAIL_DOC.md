# 🎨 Frontend Complete Documentation - DKL Email Service

> **Version:** 2.0 | **Backend:** V1.48.0+ | **Last Updated:** 2025-11-07
> **Complete frontend integration guide voor de DKL Email Service backend API**

---

## 📋 Table of Contents

1. [🚀 Quick Start](#-quick-start)
2. [🌐 Base URLs & Environment](#-base-urls--environment)
3. [🔐 Authentication](#-authentication)
4. [📚 API Modules Overview](#-api-modules-overview)
5. [📸 Albums & Photos API](#-albums--photos-api)
6. [🎥 Videos API](#-videos-api)
7. [🚧 Under Construction API](#-under-construction-api)
8. [📧 Email API](#-email-api)
9. [👟 Steps API](#-steps-api)
10. [🔧 Development Tools](#-development-tools)
11. [⚡ Performance & Best Practices](#-performance--best-practices)
12. [🔒 Security](#-security)
13. [🧪 Testing](#-testing)
14. [📖 TypeScript Types](#-typescript-types)
15. [❓ Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### 3 Steps to Integration

**Step 1: Start Backend**
```bash
# In backend directory
docker-compose -f docker-compose.dev.yml up -d
```
✅ Backend now running on `http://localhost:8082`

**Step 2: Configure Frontend**

Create `.env.development` in your **frontend** project:

**For Vite/React:**
```env
VITE_API_BASE_URL=http://localhost:8082/api
```

**For Next.js:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8082/api
```

**Step 3: Setup API Client**

```typescript
// src/config/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api';

export const apiClient = {
  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }
};
```

---

## 🌐 Base URLs & Environment

### Development (Docker)
- **API Base URL:** `http://localhost:8082/api`
- **WebSocket:** `ws://localhost:8082/api/chat/ws`
- **Status:** ✅ Running with full database

### Production (Render)
- **API Base URL:** `https://dklemailservice.onrender.com/api`
- **WebSocket:** `wss://dklemailservice.onrender.com/api/chat/ws`
- **Status:** ✅ Live with production data

### Environment Configuration

**For Vite/React:**
```env
VITE_API_BASE_URL=http://localhost:8082/api
VITE_WS_URL=ws://localhost:8082/api/chat/ws
VITE_ENV=development
```

**For Next.js:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8082/api
NEXT_PUBLIC_WS_URL=ws://localhost:8082/api/chat/ws
NEXT_PUBLIC_ENV=development
```

---

## 🔐 Authentication

### JWT Authentication (Admin Endpoints)

```typescript
// Login
const response = await fetch('https://dklemailservice.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    wachtwoord: 'password'
  })
});

const { access_token, refresh_token } = await response.json();

// Store token
localStorage.setItem('auth_token', access_token);

// Use in requests
headers: {
  'Authorization': `Bearer ${access_token}`
}
```

### API Key Authentication (WFC Orders)

```typescript
headers: {
  'X-API-Key': process.env.WFC_API_KEY
}
```

### Token Management

```typescript
// Axios interceptor example
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for 401 handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📚 API Modules Overview

| Module | Endpoints | Auth | Production Data | Status |
|--------|-----------|------|-----------------|--------|
| **Albums** | 9 | Public + Admin | 3 albums, 45 photos | ✅ Live |
| **Videos** | 5 | Public + Admin | 5 videos | ✅ Live |
| **Under Construction** | 5 | Public + Admin | 1 config (inactive) | ✅ Live |
| **Email (Public)** | 3 | None | Live submission | ✅ Live |
| **Email (Admin)** | 12+ | JWT | Management tools | ✅ Live |
| **Steps** | 8 | JWT | Participant tracking | ✅ Live |

---

## 📸 Albums & Photos API

### Public Endpoints (No Auth Required)

#### Get All Visible Albums
```http
GET /api/albums
```

**Response:**
```typescript
interface Album {
  id: string;
  title: string;
  description: string | null;
  cover_photo_id: string | null;
  visible: boolean;
  order_number: number;
  created_at: string;
  updated_at: string;
}
```

#### Get Albums with Cover Photos
```http
GET /api/albums?include_covers=true
```

**Response:**
```typescript
interface AlbumWithCover extends Album {
  cover_photo: Photo | null;
}

interface Photo {
  id: string;
  title: string;
  url: string;           // Cloudinary URL
  thumbnail_url: string | null;
  cloudinary_id: string;
  visible: boolean;
  width: number | null;
  height: number | null;
  format: string | null;
}
```

#### Get Photos from Album
```http
GET /api/albums/:albumId/photos
```

**Response:**
```typescript
interface PhotoWithAlbumInfo extends Photo {
  order_number: number | null;
}
```

### React Example

```typescript
import React, { useEffect, useState } from 'react';

const AlbumsGallery: React.FC = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch(
          'https://dklemailservice.onrender.com/api/albums?include_covers=true'
        );
        const data = await response.json();
        setAlbums(data);
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) return <div>Loading albums...</div>;

  return (
    <div className="albums-grid">
      {albums.map((album) => (
        <div key={album.id} className="album-card">
          {album.cover_photo && (
            <img
              src={album.cover_photo.thumbnail_url || album.cover_photo.url}
              alt={album.title}
              loading="lazy"
            />
          )}
          <h3>{album.title}</h3>
          <p>{album.description}</p>
        </div>
      ))}
    </div>
  );
};
```

### Production Data
- **3 albums:** DKL 2025, DKL-2024, Voorbereidingen
- **45 total photos**
- **Cloudinary hosted** with automatic thumbnails

---

## 🎥 Videos API

### Public Endpoints (No Auth Required)

#### Get All Visible Videos
```http
GET /api/videos
```

**Response:**
```typescript
interface Video {
  id: string;
  video_id: string;        // Streamable video ID
  url: string;             // Embed URL
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  visible: boolean;
  order_number: number;
  created_at: string;
  updated_at: string;
}
```

### Streamable Integration

```typescript
// Get embed URL
function getStreamableEmbedUrl(videoId: string): string {
  return `https://streamable.com/e/${videoId}`;
}

// Get thumbnail
function getStreamableThumbnail(videoId: string): string {
  return `https://cdn-cf-east.streamable.com/image/${videoId}.jpg`;
}
```

### React Video Player

```typescript
import React, { useState } from 'react';

interface VideoPlayerProps {
  video: Video;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnailUrl = video.thumbnail_url ||
    `https://cdn-cf-east.streamable.com/image/${video.video_id}.jpg`;

  return (
    <div className="video-player">
      {!isPlaying ? (
        <div
          className="video-thumbnail"
          onClick={() => setIsPlaying(true)}
        >
          <img src={thumbnailUrl} alt={video.title} />
          <div className="play-button">▶</div>
        </div>
      ) : (
        <iframe
          src={video.url}
          frameBorder="0"
          width="100%"
          height="360"
          allowFullScreen
          allow="autoplay"
          title={video.title}
        />
      )}
      <div className="video-info">
        <h3>{video.title}</h3>
        {video.description && <p>{video.description}</p>}
      </div>
    </div>
  );
};
```

### Production Data
- **5 videos** total
- **Streamable platform** hosting
- **Auto-generated thumbnails**

---

## 🚧 Under Construction API

### Check Maintenance Status
```http
GET /api/under-construction/active
```

**Response (when active):**
```typescript
interface UnderConstruction {
  id: number;
  is_active: boolean;
  title: string;
  message: string;
  footer_text: string | null;
  logo_url: string | null;
  expected_date: string | null;
  social_links: SocialLink[] | null;
  progress_percentage: number | null;
  contact_email: string | null;
  newsletter_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface SocialLink {
  platform: string;
  url: string;
}
```

**Response (when inactive):** `404 Not Found`

### React Maintenance Page

```typescript
import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState(null);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await fetch(
          'https://dklemailservice.onrender.com/api/under-construction/active'
        );

        if (response.ok) {
          const data = await response.json();
          setIsMaintenanceMode(true);
          setMaintenanceData(data);
        }
      } catch (error) {
        // On error, assume site is available
        setIsMaintenanceMode(false);
      }
    };

    checkMaintenance();
  }, []);

  if (isMaintenanceMode && maintenanceData) {
    return <MaintenancePage data={maintenanceData} />;
  }

  return <NormalApp />;
};
```

### Production Status
- **Current Status:** ✅ **NO MAINTENANCE MODE ACTIVE**
- Website is normally available

---

## 📧 Email API

### Public Submission Endpoints (No Auth)

#### Contact Form Submission
```http
POST /api/contact-email
```

**Request Body:**
```typescript
interface ContactFormulier {
  naam: string;
  email: string;
  telefoon?: string;
  bericht: string;
  privacy_akkoord: boolean;
  test_mode?: boolean;
}
```

#### Registration Form Submission
```http
POST /api/aanmelding-email
```

**Request Body:**
```typescript
interface AanmeldingFormulier {
  naam: string;
  email: string;
  telefoon?: string;
  rol: 'deelnemer' | 'vrijwilliger';
  afstand: '5km' | '10km' | '15km';
  ondersteuning?: string;
  bijzonderheden?: string;
  terms: boolean;
  test_mode?: boolean;
}
```

#### WFC Order Email
```http
POST /api/wfc/order-email
```

**Auth:** `X-API-Key` header required

**Request Body:**
```typescript
interface WFCOrderRequest {
  order_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  items: WFCOrderItem[];
}
```

### Admin Management Endpoints (JWT Required)

#### Contact Management
- `GET /api/contact` - List contacts
- `GET /api/contact/:id` - Get specific contact
- `PUT /api/contact/:id` - Update contact status
- `POST /api/contact/:id/antwoord` - Add reply
- `DELETE /api/contact/:id` - Delete contact

#### Registration Management
- `GET /api/aanmelding` - List registrations
- `GET /api/aanmelding/:id` - Get specific registration
- `PUT /api/aanmelding/:id` - Update registration
- `POST /api/aanmelding/:id/antwoord` - Add reply
- `DELETE /api/aanmelding/:id` - Delete registration

#### Incoming Email Management
- `GET /api/mail` - List emails (paginated)
- `GET /api/mail/:id` - Get specific email
- `PUT /api/mail/:id/processed` - Mark as processed
- `DELETE /api/mail/:id` - Delete email

### React Contact Form

```typescript
import React, { useState } from 'react';

interface ContactFormData {
  naam: string;
  email: string;
  telefoon: string;
  bericht: string;
  privacy_akkoord: boolean;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    naam: '',
    email: '',
    telefoon: '',
    bericht: '',
    privacy_akkoord: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://dklemailservice.onrender.com/api/contact-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        setFormData({
          naam: '',
          email: '',
          telefoon: '',
          bericht: '',
          privacy_akkoord: false
        });
      } else {
        setError(result.error || 'Er is een fout opgetreden');
      }
    } catch (err) {
      setError('Er is een fout opgetreden bij het versturen');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <h2>Bedankt!</h2>
        <p>Je bericht is verzonden. Je ontvangt een bevestiging per email.</p>
        <button onClick={() => setSuccess(false)}>Nieuw bericht</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="naam">Naam *</label>
        <input
          id="naam"
          type="text"
          value={formData.naam}
          onChange={(e) => setFormData({...formData, naam: e.target.value})}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>

      <div>
        <label htmlFor="bericht">Bericht *</label>
        <textarea
          id="bericht"
          value={formData.bericht}
          onChange={(e) => setFormData({...formData, bericht: e.target.value})}
          rows={5}
          required
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.privacy_akkoord}
            onChange={(e) => setFormData({...formData, privacy_akkoord: e.target.checked})}
            required
          />
          Ik ga akkoord met het privacybeleid *
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Versturen...' : 'Verstuur'}
      </button>
    </form>
  );
};
```

---

## 👟 Steps API

### Authentication Required Endpoints

#### Update Steps
```http
POST /api/steps
Authorization: Bearer {token}
```

**Request Body:**
```typescript
{
  "steps": 1000  // Delta (positive or negative)
}
```

#### Get Dashboard
```http
GET /api/participant/dashboard
Authorization: Bearer {token}
```

**Response:**
```typescript
interface ParticipantDashboard {
  steps: number;
  route: string;
  allocatedFunds: number;
  naam: string;
  email: string;
}
```

#### Get Total Steps
```http
GET /api/total-steps?year=2025
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total_steps": 125000
}
```

#### Get Funds Distribution
```http
GET /api/funds-distribution
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalX": 10000,
  "routes": {
    "6 KM": 2500,
    "10 KM": 2500,
    "15 KM": 2500,
    "20 KM": 2500
  }
}
```

### React Steps Tracker

```typescript
import React, { useState, useEffect } from 'react';

interface DashboardData {
  steps: number;
  route: string;
  allocatedFunds: number;
  naam: string;
  email: string;
}

const StepsTracker: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [inputSteps, setInputSteps] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [dashboardRes, totalRes] = await Promise.all([
        fetch('/api/participant/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/total-steps', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const dashboardData = await dashboardRes.json();
      const totalData = await totalRes.json();

      setDashboard(dashboardData);
      setTotalSteps(totalData.total_steps);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateSteps = async (delta: number) => {
    setLoading(true);
    try {
      await fetch('/api/steps', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ steps: delta })
      });
      setInputSteps('');
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating steps:', error);
      alert('Kon stappen niet bijwerken');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const delta = parseInt(inputSteps, 10);
    if (isNaN(delta) || delta === 0) {
      alert('Voer een geldig aantal stappen in');
      return;
    }
    updateSteps(delta);
  };

  if (!dashboard) return <div>Loading...</div>;

  return (
    <div className="steps-tracker">
      <section className="personal-stats">
        <h2>Mijn Voortgang</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Stappen</h3>
            <p className="stat-value">{dashboard.steps.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Route</h3>
            <p className="stat-value">{dashboard.route}</p>
          </div>
          <div className="stat-card">
            <h3>Toegewezen Fonds</h3>
            <p className="stat-value">€{dashboard.allocatedFunds}</p>
          </div>
        </div>
      </section>

      <section className="add-steps">
        <h3>Stappen Toevoegen</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="number"
              value={inputSteps}
              onChange={(e) => setInputSteps(e.target.value)}
              placeholder="Aantal stappen"
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Bezig...' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </section>

      <section className="global-stats">
        <h3>Totaal Stappen</h3>
        <p className="big-number">{totalSteps.toLocaleString()}</p>
        <p className="subtitle">door alle deelnemers samen</p>
      </section>
    </div>
  );
};
```

---

## 🔧 Development Tools

### Test Scripts

All modules have dedicated test scripts:

| Script | Description | Usage |
|--------|-------------|-------|
| `test_albums.ps1` | Test album endpoints | `.\test_albums.ps1 -Environment production` |
| `test_videos.ps1` | Test video endpoints | `.\test_videos.ps1 -Environment production` |
| `test_under_construction.ps1` | Test maintenance mode | `.\test_under_construction.ps1 -Environment production` |
| `test_email_api.ps1` | Test email endpoints | `.\test_email_api.ps1 -Environment production -TestType public` |

**All-in-one test:**
```powershell
# Test everything in production
.\test_albums.ps1 -Environment production
.\test_videos.ps1 -Environment production
.\test_under_construction.ps1 -Environment production
.\test_email_api.ps1 -Environment production -TestType public
```

### WebSocket Testing

```typescript
// Steps WebSocket client
import StepsWebSocketClient from './steps-websocket-client';

const client = new StepsWebSocketClient(
  'ws://localhost:8082/ws/steps',
  token,
  userId,
  participantId
);

client.on('step_update', (data) => {
  console.log('Steps updated:', data);
});

client.connect();
```

### Public Steps Counter Component

```typescript
import React, { useState, useEffect, useRef } from 'react';

export const PublicStepsCounter: React.FC = () => {
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [connected, setConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = `wss://dklemailservice.onrender.com/api/ws/steps?user_id=public`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({
        type: 'subscribe',
        channels: ['total_updates']
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'total_update') {
        setTotalSteps(message.total_steps);
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="public-steps-counter">
      <div className="counter-status">
        <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢' : '🔴'}
        </span>
        <span className="status-text">
          {connected ? 'Live Updates' : 'Updates Every 5s'}
        </span>
      </div>

      <div className="counter-display">
        <div className="counter-label">Totaal Gelopen Stappen</div>
        <div className="counter-value">
          {totalSteps.toLocaleString('nl-NL')}
        </div>
      </div>
    </div>
  );
};
```

---

## ⚡ Performance & Best Practices

### Image Optimization

```typescript
// Use thumbnails for grids
<img
  src={photo.thumbnail_url || photo.url}
  loading="lazy"
  alt={photo.title}
/>

// Use full size for lightbox
<img
  src={photo.url}
  alt={photo.title}
/>
```

### Video Lazy Loading

```typescript
const [playing, setPlaying] = useState(false);

{!playing ? (
  <img
    src={`https://cdn-cf-east.streamable.com/image/${video.video_id}.jpg`}
    onClick={() => setPlaying(true)}
  />
) : (
  <iframe src={video.url} allowFullScreen />
)}
```

### Caching Strategy

```typescript
// SWR for data fetching
import useSWR from 'swr';

const { data: albums } = useSWR('/api/albums?include_covers=true', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0, // Albums don't change often
});

const { data: maintenanceStatus } = useSWR('/api/under-construction/active', fetcher, {
  refreshInterval: 60000, // Check every minute
  shouldRetryOnError: false,
});
```

### Request Deduplication

```typescript
// React Query
import { useQuery } from '@tanstack/react-query';

const useAlbums = () => {
  return useQuery({
    queryKey: ['albums'],
    queryFn: () => apiClient.getAlbums(true),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Error Handling

```typescript
async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  errorMessage = 'Er is een fout opgetreden'
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error);

      if (error.status === 429) {
        throw new Error('Te veel verzoeken. Probeer het later opnieuw.');
      }
      if (error.status === 401) {
        throw new Error('Niet geautoriseerd. Log opnieuw in.');
      }
      if (error.status >= 500) {
        throw new Error('Server fout. Probeer het later opnieuw.');
      }
    }

    throw new Error(errorMessage);
  }
}
```

---

## 🔒 Security

### HTTPS Only in Production
- All production requests must use HTTPS
- CORS configured for common development ports
- API keys never exposed client-side

### Authentication Best Practices
- Store JWT tokens securely (httpOnly cookies preferred)
- Implement token refresh logic
- Clear tokens on logout/401 responses
- Never store sensitive data in localStorage

### Input Validation
- Validate all user inputs on both client and server
- Sanitize HTML content to prevent XSS
- Use proper email validation
- Implement rate limiting awareness

### CSRF Protection
- Use SameSite cookies
- Implement CSRF tokens for state-changing operations
- Validate origins in production

---

## 🧪 Testing

### Jest Test Example

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactForm from './ContactForm';

describe('ContactForm', () => {
  it('should submit contact form successfully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          message: 'Email verzonden'
        })
      })
    );

    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/naam/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/bericht/i), {
      target: { value: 'Test message' }
    });
    fireEvent.click(screen.getByLabelText(/privacy/i));

    fireEvent.click(screen.getByText(/verstuur/i));

    await waitFor(() => {
      expect(screen.getByText(/bedankt/i)).toBeInTheDocument();
    });
  });
});
```

### API Testing with cURL

```bash
# Test contact form
curl -X POST "https://dklemailservice.onrender.com/api/contact-email" \
  -H "Content-Type: application/json" \
  -d '{
    "naam": "Test User",
    "email": "test@example.com",
    "bericht": "Test message",
    "privacy_akkoord": true
  }'

# Test albums
curl "https://dklemailservice.onrender.com/api/albums?include_covers=true"

# Test videos
curl "https://dklemailservice.onrender.com/api/videos"
```

---

## 📖 TypeScript Types

### Complete API Types

```typescript
// ============================================
// ALBUMS & PHOTOS
// ============================================
export interface Album {
  id: string;
  title: string;
  description: string | null;
  cover_photo_id: string | null;
  visible: boolean;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  cloudinary_id: string;
  visible: boolean;
  width: number | null;
  height: number | null;
  format: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlbumWithCover extends Album {
  cover_photo: Photo | null;
}

export interface PhotoWithAlbumInfo extends Photo {
  order_number: number | null;
}

// ============================================
// VIDEOS
// ============================================
export interface Video {
  id: string;
  video_id: string;
  url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  visible: boolean;
  order_number: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// UNDER CONSTRUCTION
// ============================================
export interface UnderConstruction {
  id: number;
  is_active: boolean;
  title: string;
  message: string;
  footer_text: string | null;
  logo_url: string | null;
  expected_date: string | null;
  social_links: SocialLink[] | null;
  progress_percentage: number | null;
  contact_email: string | null;
  newsletter_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

// ============================================
// EMAIL - PUBLIC SUBMISSION
// ============================================
export interface ContactFormulier {
  naam: string;
  email: string;
  telefoon?: string;
  bericht: string;
  privacy_akkoord: boolean;
  test_mode?: boolean;
}

export interface AanmeldingFormulier {
  naam: string;
  email: string;
  telefoon?: string;
  rol: 'deelnemer' | 'vrijwilliger';
  afstand: '5km' | '10km' | '15km';
  ondersteuning?: string;
  bijzonderheden?: string;
  terms: boolean;
  test_mode?: boolean;
}

export interface WFCOrderRequest {
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_address?: string;
  customer_city?: string;
  customer_postal?: string;
  customer_country?: string;
  total_amount: number;
  items: WFCOrderItem[];
}

export interface WFCOrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface EmailSubmissionResponse {
  success: boolean;
  message: string;
  test_mode?: boolean;
  error?: string;
}

// ============================================
// EMAIL - ADMIN MANAGEMENT
// ============================================
export interface Contact {
  id: string;
  naam: string;
  email: string;
  telefoon: string | null;
  bericht: string;
  status: 'nieuw' | 'in_behandeling' | 'beantwoord' | 'gesloten';
  privacy_akkoord: boolean;
  notities: string | null;
  beantwoord: boolean;
  antwoord_tekst: string | null;
  antwoord_datum: string | null;
  antwoord_door: string | null;
  behandeld_door: string | null;
  behandeld_op: string | null;
  created_at: string;
  updated_at: string;
  antwoorden?: ContactAntwoord[];
}

export interface ContactAntwoord {
  id: string;
  contact_id: string;
  tekst: string;
  verzond_door: string;
  email_verzonden: boolean;
  created_at: string;
}

export interface Aanmelding {
  id: string;
  naam: string;
  email: string;
  telefoon: string | null;
  rol: string;
  afstand: string;
  ondersteuning: string | null;
  bijzonderheden: string | null;
  status: string;
  terms: boolean;
  test_mode: boolean;
  email_verzonden: boolean;
  email_verzonden_op: string | null;
  behandeld_door: string | null;
  behandeld_op: string | null;
  notities: string | null;
  created_at: string;
  updated_at: string;
  gebruiker_id: string | null;
  antwoorden?: AanmeldingAntwoord[];
}

export interface AanmeldingAntwoord {
  id: string;
  aanmelding_id: string;
  tekst: string;
  verzond_door: string;
  email_verzonden: boolean;
  created_at: string;
}

export interface MailResponse {
  id: string;
  message_id: string;
  sender: string;
  to: string;
  subject: string;
  html: string;
  content_type: string;
  received_at: string;
  uid: string;
  account_type: 'info' | 'inschrijving';
  read: boolean;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedMailResponse {
  emails: MailResponse[];
  totalCount: number;
}

// ============================================
// STEPS API
// ============================================
export interface ParticipantDashboard {
  steps: number;
  route: string;
  allocatedFunds: number;
  naam: string;
  email: string;
}

export interface RouteFund {
  id: string;
  route: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  participant_id: string;
  naam: string;
  steps: number;
  achievement_points: number;
  total_score: number;
  route: string;
  badge_count: number;
}

export interface LeaderboardUpdateMessage {
  type: 'leaderboard_update';
  top_n: number;
  entries: LeaderboardEntry[];
  timestamp: number;
}

export interface StepUpdateMessage {
  type: 'step_update';
  participant_id: string;
  naam: string;
  steps: number;
  delta: number;
  route: string;
  allocated_funds: number;
  timestamp: number;
}

export interface TotalUpdateMessage {
  type: 'total_update';
  total_steps: number;
  year: number;
  timestamp: number;
}

export interface BadgeEarnedMessage {
  type: 'badge_earned';
  participant_id: string;
  badge_name: string;
  badge_icon: string;
  points: number;
  timestamp: number;
}
```

---

## ❓ Troubleshooting

### Common Issues

**CORS Error?**
- Check if frontend runs on allowed port (3000, 5173, etc.)
- Backend CORS configured for common development ports

**Connection Refused?**
- Ensure backend is running: `docker-compose -f docker-compose.dev.yml up -d`
- Check if port 8082 is available

**401 Unauthorized?**
- Login again, token may be expired
- Check if token is properly stored in localStorage

**WebSocket not connecting?**
- Ensure correct WebSocket URL (ws:// for dev, wss:// for prod)
- Check if subscription message is sent after connection

**Images not loading?**
- Cloudinary URLs are direct - check network tab
- Thumbnails may not exist for all images

**Email not sending in test mode?**
- Test mode prevents actual email sending (by design)
- Check response for `test_mode: true`

### Debug Tools

```typescript
// Enable debug logging
const DEBUG = import.meta.env.DEV;

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
}

// API error handler
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (!response.ok) {
      debugLog('API Error', { endpoint, status: response.status, data });
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    debugLog('API Success', { endpoint, data });
    return data;
  } catch (error) {
    debugLog('API Exception', { endpoint, error });
    throw error;
  }
}
```

### Performance Monitoring

```typescript
// Measure API response times
async function timedApiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const start = performance.now();

  try {
    const result = await apiCall<T>(endpoint, options);
    const duration = performance.now() - start;

    debugLog(`API Call Duration: ${duration.toFixed(2)}ms`, { endpoint });

    if (duration > 2000) {
      console.warn(`Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`API Call Failed after ${duration.toFixed(2)}ms:`, endpoint, error);
    throw error;
  }
}
```

---

## 📚 Related Documentation

- [`AUTH_AND_RBAC.md`](docs/AUTH_AND_RBAC.md) - Complete RBAC system
- [`DATABASE_REFERENCE.md`](docs/DATABASE_REFERENCE.md) - Database schema
- [`README.md`](README.md) - Documentation hub
- [`docs/`](docs/) - All documentation files

---

## 🎯 Success Checklist

- ✅ **Backend running** on `http://localhost:8082`
- ✅ **Environment configured** (.env.development)
- ✅ **API client setup** with proper error handling
- ✅ **Authentication implemented** (JWT for admin, API key for WFC)
- ✅ **All modules integrated** (Albums, Videos, Email, Steps)
- ✅ **WebSocket connected** for real-time updates
- ✅ **Error handling** and loading states
- ✅ **TypeScript types** properly defined
- ✅ **Performance optimized** (caching, lazy loading)
- ✅ **Security implemented** (HTTPS, input validation)
- ✅ **Testing completed** with test scripts

---

**🎉 You're now ready to build amazing frontend experiences with the DKL Email Service!**

For questions or issues, check the specific module documentation or contact the backend team.