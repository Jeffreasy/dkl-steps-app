# 📋 DKL Steps App - Test Data & Fixtures Guide

**Project:** DKL Steps Mobile App
**Version:** 1.1.0
**Last Updated:** 26 Oktober 2025
**Testing Framework:** Jest + React Native Testing Library
**Status:** 🏗️ **COMPREHENSIVE TEST DATA MANAGEMENT**

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Fixture Architecture](#fixture-architecture)
3. [User Fixtures](#user-fixtures)
4. [Step Data Fixtures](#step-data-fixtures)
5. [Location & Geofencing Fixtures](#location--geofencing-fixtures)
6. [API Response Fixtures](#api-response-fixtures)
7. [Error Scenario Fixtures](#error-scenario-fixtures)
8. [Performance Test Fixtures](#performance-test-fixtures)
9. [Factory Functions](#factory-functions)
10. [Mock Data Management](#mock-data-management)
11. [Fixture Maintenance](#fixture-maintenance)
12. [Best Practices](#best-practices)

---

## Overview

### Purpose of Test Fixtures

Test fixtures provide consistent, realistic test data that enables:

- **Reliable Testing** - Same data across test runs
- **Edge Case Coverage** - Boundary conditions and error scenarios
- **Performance Testing** - Large datasets for load testing
- **Integration Testing** - Complete data scenarios
- **Development Speed** - Quick test data generation
- **Maintenance Efficiency** - Centralized data management

### Current Fixture Status

- ✅ **User Accounts** - Admin, participant, organizer roles
- ✅ **Step Data** - Various activity levels and patterns
- ✅ **Location Data** - Geofencing coordinates and boundaries
- ✅ **API Responses** - Success and error response mocks
- ✅ **Factory Functions** - Dynamic test data generation
- ✅ **Performance Data** - Large-scale test datasets

---

## Fixture Architecture

### Directory Structure

```
e2e/
├── fixtures/
│   ├── users.json                 # User account data
│   ├── steps.json                 # Step tracking data
│   ├── locations.json             # Geofencing coordinates
│   ├── api-responses.json         # API response mocks
│   ├── error-scenarios.json       # Error condition data
│   └── performance-data.json      # Large-scale test data
├── utils/
│   ├── factories.js               # Data generation functions
│   ├── mockHelpers.js             # Mock utility functions
│   └── dataGenerators.js          # Random data generators
└── environment.js                 # Test environment setup
```

### Fixture Categories

#### Static Fixtures
- **Fixed Data** - Consistent across all test runs
- **Reference Data** - Standard test scenarios
- **Boundary Cases** - Edge conditions and limits

#### Dynamic Fixtures
- **Factory Functions** - Generate data on demand
- **Random Data** - Varied inputs for robustness testing
- **Performance Data** - Scalable datasets

#### Mock Fixtures
- **API Responses** - Simulated server responses
- **External Services** - Third-party service mocks
- **Device Sensors** - Hardware simulation data

---

## User Fixtures

### User Account Data

#### Static User Accounts
```json
// e2e/fixtures/users.json
{
  "admin": {
    "id": "admin-001",
    "username": "admin",
    "password": "admin123",
    "email": "admin@dklorganization.com",
    "role": "admin",
    "permissions": ["read", "write", "delete", "manage_users"],
    "createdAt": "2025-01-01T00:00:00Z",
    "lastLogin": "2025-10-26T10:00:00Z",
    "isActive": true
  },
  "participant1": {
    "id": "participant-001",
    "username": "participant1",
    "password": "pass123",
    "email": "participant1@test.com",
    "role": "participant",
    "permissions": ["read", "write"],
    "funds": 150.00,
    "stepGoal": 10000,
    "createdAt": "2025-01-15T00:00:00Z",
    "lastLogin": "2025-10-26T09:30:00Z",
    "isActive": true
  },
  "organizer1": {
    "id": "organizer-001",
    "username": "organizer1",
    "password": "org123",
    "email": "organizer1@test.com",
    "role": "organizer",
    "permissions": ["read", "write", "manage_events"],
    "createdAt": "2025-02-01T00:00:00Z",
    "lastLogin": "2025-10-26T08:45:00Z",
    "isActive": true
  }
}
```

#### User Factory Functions
```javascript
// e2e/utils/factories.js
export const createUser = (overrides = {}) => ({
  id: `user-${Date.now()}`,
  username: `user${Math.random().toString(36).substr(2, 9)}`,
  password: 'password123',
  email: `user${Date.now()}@test.com`,
  role: 'participant',
  permissions: ['read', 'write'],
  funds: 0,
  stepGoal: 10000,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  isActive: true,
  ...overrides
});

export const createAdminUser = (overrides = {}) =>
  createUser({
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'manage_users'],
    username: 'admin_user',
    ...overrides
  });

export const createParticipantUser = (overrides = {}) =>
  createUser({
    role: 'participant',
    funds: Math.floor(Math.random() * 500),
    stepGoal: 8000 + Math.floor(Math.random() * 4000),
    ...overrides
  });
```

### User Authentication Fixtures

#### JWT Tokens
```javascript
// Mock JWT tokens for different user types
export const mockTokens = {
  admin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  participant: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  invalid: 'invalid.jwt.token'
};
```

#### Authentication States
```javascript
export const authStates = {
  authenticated: {
    isAuthenticated: true,
    user: createParticipantUser(),
    token: mockTokens.participant
  },
  unauthenticated: {
    isAuthenticated: false,
    user: null,
    token: null
  },
  expired: {
    isAuthenticated: false,
    user: null,
    token: mockTokens.expired,
    error: 'Token expired'
  }
};
```

---

## Step Data Fixtures

### Daily Step Records

#### Realistic Step Patterns
```json
// e2e/fixtures/steps.json
{
  "normalDay": {
    "userId": "participant-001",
    "date": "2025-10-26",
    "totalSteps": 8750,
    "hourlyBreakdown": [
      0, 0, 0, 0, 0, 0,  // 00:00 - 05:00
      0, 0, 150, 450,     // 06:00 - 09:00
      1200, 800, 600,     // 10:00 - 12:00
      300, 400, 500,      // 13:00 - 15:00
      800, 1200, 1000,    // 16:00 - 18:00
      600, 300, 200, 0    // 19:00 - 23:00
    ],
    "lastSync": "2025-10-26T18:30:00Z",
    "deviceType": "iPhone",
    "accuracy": "high"
  },
  "activeDay": {
    "userId": "participant-001",
    "date": "2025-10-25",
    "totalSteps": 15200,
    "hourlyBreakdown": [
      0, 0, 0, 0, 0, 200,  // Early morning run
      800, 1200, 1000, 900, // Morning activity
      1500, 1800, 1600,     // Peak activity
      1400, 1300, 1200,     // Afternoon
      1000, 800, 600, 400   // Evening wind-down
    ],
    "lastSync": "2025-10-25T20:00:00Z",
    "deviceType": "Android",
    "accuracy": "high"
  },
  "lowActivityDay": {
    "userId": "participant-001",
    "date": "2025-10-24",
    "totalSteps": 3200,
    "hourlyBreakdown": [
      0, 0, 0, 0, 0, 0, 0, 0,  // Morning sleep-in
      200, 300, 400, 500, 600,   // Sedentary day
      400, 300, 200, 100, 0, 0   // Evening
    ],
    "lastSync": "2025-10-24T22:00:00Z",
    "deviceType": "iPhone",
    "accuracy": "medium"
  }
}
```

#### Step Factory Functions
```javascript
// Generate realistic step data
export const createStepRecord = (overrides = {}) => {
  const baseDate = new Date();
  const date = overrides.date || baseDate.toISOString().split('T')[0];

  // Generate realistic hourly distribution
  const hourlyBreakdown = generateRealisticHourlySteps();

  return {
    userId: `user-${Math.random().toString(36).substr(2, 9)}`,
    date,
    totalSteps: hourlyBreakdown.reduce((sum, steps) => sum + steps, 0),
    hourlyBreakdown,
    lastSync: new Date().toISOString(),
    deviceType: Math.random() > 0.5 ? 'iPhone' : 'Android',
    accuracy: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
    ...overrides
  };
};

const generateRealisticHourlySteps = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    let baseSteps = 0;

    // Morning routine (6-9 AM)
    if (i >= 6 && i <= 9) {
      baseSteps = 200 + Math.random() * 400;
    }
    // Work/school day (9 AM - 5 PM)
    else if (i >= 9 && i <= 17) {
      baseSteps = 300 + Math.random() * 600;
    }
    // Evening activity (5-9 PM)
    else if (i >= 17 && i <= 21) {
      baseSteps = 200 + Math.random() * 500;
    }
    // Low activity other times
    else {
      baseSteps = Math.random() * 100;
    }

    hours.push(Math.floor(baseSteps));
  }
  return hours;
};
```

### Bulk Step Data

#### Performance Testing Data
```javascript
// Generate large datasets for performance testing
export const createBulkStepData = (userCount = 100, days = 30) => {
  const data = [];

  for (let user = 1; user <= userCount; user++) {
    for (let day = 0; day < days; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      data.push(createStepRecord({
        userId: `user-${user.toString().padStart(3, '0')}`,
        date: date.toISOString().split('T')[0]
      }));
    }
  }

  return data;
};
```

---

## Location & Geofencing Fixtures

### Geofencing Coordinates

#### Event Locations
```json
// e2e/fixtures/locations.json
{
  "eventLocation": {
    "id": "event-001",
    "name": "DKL Main Event",
    "coordinates": {
      "latitude": 52.3676,
      "longitude": 4.9041
    },
    "radius": 100,
    "address": "Amsterdam, Netherlands",
    "type": "event",
    "active": true
  },
  "outsideLocation": {
    "id": "outside-001",
    "name": "Outside Event Zone",
    "coordinates": {
      "latitude": 52.3702,
      "longitude": 4.8952
    },
    "radius": 50,
    "address": "Nearby Amsterdam",
    "type": "outside",
    "active": true
  },
  "farLocation": {
    "id": "far-001",
    "name": "Far Away Location",
    "coordinates": {
      "latitude": 52.5200,
      "longitude": 13.4050
    },
    "radius": 200,
    "address": "Berlin, Germany",
    "type": "distant",
    "active": false
  }
}
```

#### Location Factory Functions
```javascript
export const createLocation = (overrides = {}) => ({
  id: `location-${Date.now()}`,
  name: `Test Location ${Math.random().toString(36).substr(2, 9)}`,
  coordinates: {
    latitude: 52.3676 + (Math.random() - 0.5) * 0.01, // Small variations
    longitude: 4.9041 + (Math.random() - 0.5) * 0.01
  },
  radius: 50 + Math.random() * 150, // 50-200 meters
  address: 'Test Address',
  type: 'test',
  active: true,
  ...overrides
});

export const createGeofenceZone = (centerLat, centerLng, radius = 100) => ({
  center: { latitude: centerLat, longitude: centerLng },
  radius,
  // Generate boundary points for testing
  boundary: generateGeofenceBoundary(centerLat, centerLng, radius)
});

const generateGeofenceBoundary = (centerLat, centerLng, radius) => {
  const points = [];
  const earthRadius = 6371000; // meters
  const radiusInDegrees = (radius / earthRadius) * (180 / Math.PI);

  for (let i = 0; i < 36; i++) { // 36 points for circle
    const angle = (i * 10) * (Math.PI / 180);
    const lat = centerLat + (radiusInDegrees * Math.sin(angle));
    const lng = centerLng + (radiusInDegrees * Math.cos(angle));
    points.push({ latitude: lat, longitude: lng });
  }

  return points;
};
```

### Movement Patterns

#### GPS Track Simulation
```javascript
export const createMovementPath = (startLocation, endLocation, steps = 20) => {
  const path = [];
  const latStep = (endLocation.latitude - startLocation.latitude) / steps;
  const lngStep = (endLocation.longitude - startLocation.longitude) / steps;

  for (let i = 0; i <= steps; i++) {
    path.push({
      latitude: startLocation.latitude + (latStep * i),
      longitude: startLocation.longitude + (lngStep * i),
      timestamp: new Date(Date.now() + (i * 1000)).toISOString(), // 1 second intervals
      accuracy: 5 + Math.random() * 10, // GPS accuracy variation
      speed: Math.sqrt(latStep * latStep + lngStep * lngStep) * 111000 / 1000 // km/h
    });
  }

  return path;
};
```

---

## API Response Fixtures

### Success Response Mocks

#### Authentication Responses
```json
// e2e/fixtures/api-responses.json
{
  "auth": {
    "loginSuccess": {
      "status": 200,
      "data": {
        "user": {
          "id": "participant-001",
          "username": "participant1",
          "role": "participant",
          "funds": 150.00
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": 3600
      }
    },
    "userProfile": {
      "status": 200,
      "data": {
        "id": "participant-001",
        "username": "participant1",
        "email": "participant1@test.com",
        "role": "participant",
        "funds": 150.00,
        "stepGoal": 10000,
        "totalSteps": 8750,
        "lastSync": "2025-10-26T18:30:00Z"
      }
    }
  }
}
```

#### Step Data Responses
```json
{
  "steps": {
    "dailySteps": {
      "status": 200,
      "data": {
        "userId": "participant-001",
        "date": "2025-10-26",
        "totalSteps": 8750,
        "hourlyBreakdown": [0, 0, 0, 0, 0, 0, 0, 0, 150, 450, 1200, 800, 600, 300, 400, 500, 800, 1200, 1000, 600, 300, 200, 0, 0],
        "lastSync": "2025-10-26T18:30:00Z",
        "syncStatus": "completed"
      }
    },
    "weeklySummary": {
      "status": 200,
      "data": {
        "userId": "participant-001",
        "weekStart": "2025-10-20",
        "weekEnd": "2025-10-26",
        "totalSteps": 45200,
        "dailyBreakdown": [
          { "date": "2025-10-20", "steps": 9200 },
          { "date": "2025-10-21", "steps": 8800 },
          { "date": "2025-10-22", "steps": 7600 },
          { "date": "2025-10-23", "steps": 3200 },
          { "date": "2025-10-24", "steps": 15200 },
          { "date": "2025-10-25", "steps": 1200 },
          { "date": "2025-10-26", "steps": 8750 }
        ],
        "averageSteps": 6460,
        "goalAchievement": 64.6
      }
    }
  }
}
```

### Error Response Mocks

#### Authentication Errors
```json
// e2e/fixtures/error-scenarios.json
{
  "auth": {
    "invalidCredentials": {
      "status": 401,
      "error": {
        "code": "INVALID_CREDENTIALS",
        "message": "Invalid username or password",
        "details": "The provided credentials do not match any active account"
      }
    },
    "accountLocked": {
      "status": 423,
      "error": {
        "code": "ACCOUNT_LOCKED",
        "message": "Account temporarily locked",
        "details": "Too many failed login attempts. Try again in 15 minutes",
        "retryAfter": 900
      }
    },
    "tokenExpired": {
      "status": 401,
      "error": {
        "code": "TOKEN_EXPIRED",
        "message": "Authentication token has expired",
        "details": "Please log in again to continue"
      }
    }
  }
}
```

#### Network Errors
```json
{
  "network": {
    "timeout": {
      "status": 408,
      "error": {
        "code": "REQUEST_TIMEOUT",
        "message": "Request timed out",
        "details": "The server took too long to respond"
      }
    },
    "serverError": {
      "status": 500,
      "error": {
        "code": "INTERNAL_SERVER_ERROR",
        "message": "Internal server error",
        "details": "An unexpected error occurred on the server"
      }
    },
    "maintenance": {
      "status": 503,
      "error": {
        "code": "SERVICE_UNAVAILABLE",
        "message": "Service temporarily unavailable",
        "details": "Scheduled maintenance in progress"
      }
    }
  }
}
```

---

## Error Scenario Fixtures

### Boundary Conditions

#### Data Limits
```javascript
export const boundaryData = {
  maxSteps: {
    userId: 'participant-001',
    date: '2025-10-26',
    totalSteps: 999999, // Maximum reasonable steps
    hourlyBreakdown: Array(24).fill(41666) // Evenly distributed
  },
  minSteps: {
    userId: 'participant-001',
    date: '2025-10-26',
    totalSteps: 0,
    hourlyBreakdown: Array(24).fill(0)
  },
  negativeSteps: {
    userId: 'participant-001',
    date: '2025-10-26',
    totalSteps: -100, // Invalid negative value
    hourlyBreakdown: Array(24).fill(-5)
  }
};
```

#### String Limits
```javascript
export const stringLimits = {
  maxUsername: 'a'.repeat(50), // Maximum username length
  minUsername: 'a', // Minimum username length
  emptyUsername: '',
  nullUsername: null,
  sqlInjection: "admin'; DROP TABLE users; --",
  xssAttempt: '<script>alert("xss")</script>',
  longString: 'a'.repeat(10000) // Very long string
};
```

### Edge Cases

#### Date and Time Edge Cases
```javascript
export const dateEdgeCases = {
  leapYear: '2024-02-29', // Leap year date
  invalidDate: '2025-02-30', // Invalid date
  futureDate: '2030-01-01', // Far future date
  pastDate: '2000-01-01', // Far past date
  nullDate: null,
  emptyDate: '',
  malformedDate: 'not-a-date'
};
```

#### Coordinate Edge Cases
```javascript
export const coordinateEdgeCases = {
  northPole: { latitude: 90, longitude: 0 },
  southPole: { latitude: -90, longitude: 0 },
  dateLine: { latitude: 0, longitude: 180 },
  invalidLat: { latitude: 91, longitude: 0 }, // Invalid latitude
  invalidLng: { latitude: 0, longitude: 181 }, // Invalid longitude
  nullCoords: { latitude: null, longitude: null }
};
```

---

## Performance Test Fixtures

### Large-Scale Data Sets

#### Bulk User Generation
```javascript
export const createBulkUsers = (count = 1000) => {
  const users = [];
  const roles = ['participant', 'organizer', 'admin'];

  for (let i = 1; i <= count; i++) {
    users.push(createUser({
      id: `bulk-user-${i.toString().padStart(4, '0')}`,
      username: `bulkuser${i}`,
      email: `bulkuser${i}@test.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      funds: Math.floor(Math.random() * 1000),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  return users;
};
```

#### High-Volume Step Data
```javascript
export const createPerformanceStepData = (userCount = 100, days = 365) => {
  const data = [];
  const startDate = new Date('2024-01-01');

  for (let user = 1; user <= userCount; user++) {
    for (let day = 0; day < days; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);

      data.push(createStepRecord({
        userId: `perf-user-${user.toString().padStart(3, '0')}`,
        date: currentDate.toISOString().split('T')[0],
        totalSteps: 5000 + Math.floor(Math.random() * 10000) // 5k-15k steps
      }));
    }
  }

  return data; // 36,500 records for 100 users over 1 year
};
```

### Load Testing Scenarios

#### Concurrent User Simulation
```javascript
export const createConcurrentLoadScenario = (userCount = 50) => {
  const scenario = {
    users: createBulkUsers(userCount),
    actions: []
  };

  // Simulate realistic concurrent activity
  scenario.users.forEach((user, index) => {
    const actions = [];

    // Login action
    actions.push({
      type: 'login',
      userId: user.id,
      delay: index * 100 // Staggered login
    });

    // Step sync actions (random throughout day)
    for (let i = 0; i < 10; i++) {
      actions.push({
        type: 'sync_steps',
        userId: user.id,
        delay: 1000 + Math.random() * 8000, // 1-9 seconds
        data: createStepRecord({ userId: user.id })
      });
    }

    // Logout action
    actions.push({
      type: 'logout',
      userId: user.id,
      delay: 10000 // 10 seconds total
    });

    scenario.actions.push(...actions);
  });

  return scenario;
};
```

---

## Factory Functions

### Generic Factory Pattern

#### Base Factory Function
```javascript
// e2e/utils/factories.js
export class TestDataFactory {
  static create(type, overrides = {}) {
    const factories = {
      user: createUser,
      stepRecord: createStepRecord,
      location: createLocation,
      geofence: createGeofenceZone
    };

    if (!factories[type]) {
      throw new Error(`Unknown factory type: ${type}`);
    }

    return factories[type](overrides);
  }

  static createMany(type, count, overrides = {}) {
    return Array.from({ length: count }, () =>
      this.create(type, overrides)
    );
  }

  static createWithVariations(type, variations = []) {
    return variations.map(variation =>
      this.create(type, variation)
    );
  }
}
```

#### Specialized Factories

##### User Factory with Relationships
```javascript
export const createUserWithSteps = (overrides = {}) => {
  const user = createUser(overrides);
  const stepRecords = createBulkStepData(1, 7); // 1 week of data

  return {
    user,
    stepRecords: stepRecords.map(record => ({
      ...record,
      userId: user.id
    }))
  };
};

export const createEventWithParticipants = (participantCount = 10) => {
  const event = createLocation({
    type: 'event',
    name: 'Test Event'
  });

  const participants = createBulkUsers(participantCount).map(user =>
    createUserWithSteps({
      ...user,
      role: 'participant'
    })
  );

  return {
    event,
    participants
  };
};
```

### Data Generators

#### Random Data Generators
```javascript
// e2e/utils/dataGenerators.js
export const random = {
  // Random strings
  string: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Random numbers within range
  number: (min = 0, max = 100) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Random dates within range
  date: (start = new Date('2020-01-01'), end = new Date()) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  },

  // Random coordinates
  coordinates: () => ({
    latitude: (Math.random() - 0.5) * 180, // -90 to 90
    longitude: (Math.random() - 0.5) * 360 // -180 to 180
  }),

  // Random from array
  fromArray: (array) => array[Math.floor(Math.random() * array.length)],

  // Random boolean
  boolean: () => Math.random() > 0.5
};
```

#### Weighted Random Selection
```javascript
export const weightedRandom = (options) => {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
  let random = Math.random() * totalWeight;

  for (const option of options) {
    random -= option.weight;
    if (random <= 0) {
      return option.value;
    }
  }
};

// Usage example
const userRoles = weightedRandom([
  { value: 'participant', weight: 80 },
  { value: 'organizer', weight: 15 },
  { value: 'admin', weight: 5 }
]);
```

---

## Mock Data Management

### Jest Mock Setup

#### Global Mock Configuration
```javascript
// jest.setup.js - Enhanced with fixture loading
import { loadFixtures } from './e2e/utils/mockHelpers';

// Load all fixtures globally
const fixtures = loadFixtures();

// Make fixtures available globally
global.testFixtures = fixtures;

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();

  // Reset fixture data
  if (global.testFixtures.storage) {
    global.testFixtures.storage.clear();
  }
});
```

#### API Mock Helpers
```javascript
// e2e/utils/mockHelpers.js
export const mockApi = {
  // Mock successful responses
  mockSuccess: (endpoint, response) => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(response)
      })
    );
  },

  // Mock error responses
  mockError: (endpoint, error) => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: error.status || 500,
        json: () => Promise.resolve(error)
      })
    );
  },

  // Mock network failure
  mockNetworkFailure: () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network request failed'))
    );
  },

  // Mock with fixtures
  mockWithFixture: (endpoint, fixtureKey) => {
    const fixture = global.testFixtures.api[fixtureKey];
    mockApi.mockSuccess(endpoint, fixture.data);
  }
};
```

### Storage Mock Management

#### MMKV/AsyncStorage Mocks
```javascript
// Enhanced storage mock with fixture support
const mockStorage = new Map();

export const mockStorageHelpers = {
  // Load fixture data into storage
  loadFixtureData: (fixture) => {
    Object.entries(fixture).forEach(([key, value]) => {
      mockStorage.set(key, JSON.stringify(value));
    });
  },

  // Clear all storage data
  clear: () => mockStorage.clear(),

  // Get storage contents for verification
  getAllData: () => {
    const data = {};
    mockStorage.forEach((value, key) => {
      data[key] = JSON.parse(value);
    });
    return data;
  }
};
```

---

## Fixture Maintenance

### Fixture Validation

#### Schema Validation
```javascript
// e2e/utils/validators.js
import Joi from 'joi';

const userSchema = Joi.object({
  id: Joi.string().required(),
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'participant', 'organizer').required(),
  funds: Joi.number().min(0).default(0),
  isActive: Joi.boolean().default(true)
});

const stepRecordSchema = Joi.object({
  userId: Joi.string().required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  totalSteps: Joi.number().min(0).required(),
  hourlyBreakdown: Joi.array().items(Joi.number().min(0)).length(24).required()
});

export const validateFixture = (type, data) => {
  const schemas = { user: userSchema, stepRecord: stepRecordSchema };
  const schema = schemas[type];

  if (!schema) {
    throw new Error(`No validation schema for type: ${type}`);
  }

  const { error } = schema.validate(data);
  if (error) {
    throw new Error(`Fixture validation failed: ${error.details[0].message}`);
  }

  return true;
};
```

#### Automated Validation
```javascript
// Validate all fixtures on load
export const validateAllFixtures = () => {
  const fixtures = loadFixtures();
  const errors = [];

  Object.entries(fixtures).forEach(([category, categoryData]) => {
    if (Array.isArray(categoryData)) {
      categoryData.forEach((item, index) => {
        try {
          validateFixture(category.slice(0, -1), item); // Remove 's' from category
        } catch (error) {
          errors.push(`Fixture ${category}[${index}]: ${error.message}`);
        }
      });
    } else if (typeof categoryData === 'object') {
      Object.entries(categoryData).forEach(([key, item]) => {
        try {
          validateFixture(category.slice(0, -1), item);
        } catch (error) {
          errors.push(`Fixture ${category}.${key}: ${error.message}`);
        }
      });
    }
  });

  if (errors.length > 0) {
    throw new Error(`Fixture validation errors:\n${errors.join('\n')}`);
  }
};
```

### Fixture Updates

#### Version Control for Fixtures
```javascript
// Fixture versioning system
export const fixtureVersions = {
  users: '1.2.0',
  steps: '1.1.0',
  locations: '1.0.0',
  apiResponses: '1.3.0'
};

export const updateFixtureVersion = (fixtureType, newVersion) => {
  fixtureVersions[fixtureType] = newVersion;

  // Log version change for tracking
  console.log(`Updated ${fixtureType} fixtures to version ${newVersion}`);
};
```

#### Migration Scripts
```javascript
// Fixture migration utilities
export const migrateFixtures = {
  // Migrate user fixtures from v1.0 to v1.1
  'users:1.0:1.1': (fixture) => ({
    ...fixture,
    lastLogin: fixture.lastLogin || new Date().toISOString()
  }),

  // Migrate step fixtures from v1.0 to v1.1
  'steps:1.0:1.1': (fixture) => ({
    ...fixture,
    accuracy: fixture.accuracy || 'high'
  })
};

export const applyMigrations = (fixtureType, fixture) => {
  const currentVersion = fixtureVersions[fixtureType];
  // Apply relevant migrations based on version
  // Implementation would check migration chain
};
```

---

## Best Practices

### Fixture Design Principles

#### 1. Realistic Data
```javascript
// ✅ Good: Realistic user data
const realisticUser = {
  username: 'john_doe',
  email: 'john.doe@example.com',
  funds: 47.50,
  stepGoal: 8500
};

// ❌ Bad: Obvious test data
const badUser = {
  username: 'testuser123',
  email: 'test@test.com',
  funds: 999999,
  stepGoal: 12345
};
```

#### 2. Consistent Naming
```javascript
// ✅ Good: Consistent naming patterns
const userFixtures = {
  adminUser,
  participantUser,
  organizerUser
};

// ❌ Bad: Inconsistent naming
const fixtures = {
  admin,
  user_participant,
  orgUser
};
```

#### 3. Minimal but Complete
```javascript
// ✅ Good: Minimal required fields
const minimalUser = {
  id: 'user-001',
  username: 'testuser',
  role: 'participant'
};

// ❌ Bad: Unnecessary fields
const bloatedUser = {
  id: 'user-001',
  username: 'testuser',
  role: 'participant',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  deletedAt: null,
  version: 1,
  metadata: {}
};
```

### Maintenance Guidelines

#### Regular Updates
- Review fixtures quarterly for realism
- Update based on production data patterns
- Remove obsolete test scenarios
- Add new edge cases as discovered

#### Documentation
- Document fixture purposes and usage
- Maintain change logs for fixture updates
- Include examples in fixture files
- Update tests when fixtures change

#### Performance Considerations
- Keep fixture files reasonably sized
- Use lazy loading for large datasets
- Compress fixtures if needed
- Monitor fixture loading performance

---

## Implementation Checklist

### Fixture Setup Checklist
- [x] Create fixture directory structure
- [x] Implement user account fixtures
- [x] Create step data fixtures
- [x] Add location/geofencing fixtures
- [x] Develop API response mocks
- [x] Build factory functions
- [x] Set up mock helpers
- [x] Create validation system
- [x] Implement maintenance utilities

### Quality Assurance Checklist
- [x] Validate all fixture data
- [x] Test fixture loading performance
- [x] Ensure realistic test data
- [x] Verify edge case coverage
- [x] Document fixture usage
- [x] Set up automated validation
- [x] Create update procedures
- [x] Monitor fixture effectiveness

---

## Resources

### Testing Libraries
- [Faker.js](https://github.com/faker-js/faker) - Fake data generation
- [Joi](https://joi.dev/) - Schema validation
- [Chance.js](https://chancejs.com/) - Random data generation

### Internal Documentation
- [`COMPLETE_TESTING_GUIDE.md`](../COMPLETE_TESTING_GUIDE.md) - Main testing documentation
- [`jest.setup.js`](../../jest.setup.js) - Test environment setup
- [`e2e/`](../e2e/) - End-to-end test directory

---

**© 2025 DKL Organization - Test Data & Fixtures Guide**
**Last Updated:** 26 Oktober 2025
**Version:** 1.1.0
**Status:** 🏗️ **COMPREHENSIVE TEST DATA MANAGEMENT**

**Data-Driven Testing! 📊✨**