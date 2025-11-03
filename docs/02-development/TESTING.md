# Testing Guide - DKL Steps App

**Version**: 1.0.0
**Date**: 2025-11-03
**Status**: 🧪 Comprehensive Testing Framework

This document provides comprehensive testing guidelines for the DKL Steps React Native application, covering unit tests, integration tests, component tests, and end-to-end testing strategies.

## 📋 Table of Contents

1. [Testing Overview](#1-testing-overview)
2. [Test Setup](#2-test-setup)
3. [Unit Testing](#3-unit-testing)
4. [Component Testing](#4-component-testing)
5. [Integration Testing](#6-integration-testing)
6. [End-to-End Testing](#7-end-to-end-testing)
7. [Mocking Strategies](#8-mocking-strategies)
8. [Test Coverage](#9-test-coverage)
9. [CI/CD Integration](#10-cicd-integration)
10. [Best Practices](#11-best-practices)

## 1. Testing Overview

### Testing Pyramid
```
E2E Tests (Slow, High Value)
    │
Integration Tests (Medium, Medium Value)
    │
Component Tests (Fast, Medium Value)
    │
Unit Tests (Fast, Low Value)
```

### Test Categories
- **Unit Tests**: Test individual functions and hooks
- **Component Tests**: Test React components in isolation
- **Integration Tests**: Test component interactions and API calls
- **E2E Tests**: Test complete user flows

### Testing Tools
- **Jest**: Test runner and assertion library
- **React Native Testing Library**: Component testing utilities
- **@testing-library/react-hooks**: Hook testing utilities
- **Mock Service Worker**: API mocking for integration tests

## 2. Test Setup

### Configuration Files
```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/?(*.)+(spec|test).(ts|tsx|js)'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
};
```

```javascript
// jest.setup.js
import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      BACKEND_URL: 'http://localhost:3000/api',
    },
  },
}));

// Mock Pedometer
jest.mock('expo-sensors', () => ({
  Pedometer: {
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    watchStepCount: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
}));

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
```

### Test File Organization
```
src/
├── components/
│   ├── StepCounter.tsx
│   └── __tests__/
│       ├── StepCounter.test.tsx
│       └── StepCounter.test-utils.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
├── services/
│   ├── api.ts
│   └── __tests__/
│       └── api.test.ts
├── screens/
│   ├── LoginScreen.tsx
│   └── __tests__/
│       └── LoginScreen.test.tsx
└── utils/
    ├── storage.ts
    └── __tests__/
        └── storage.test.ts
```

## 3. Unit Testing

### Hook Testing
```typescript
// src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual({
      id: '123',
      email: 'test@example.com',
      role: 'participant',
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle login errors', async () => {
    // Mock API failure
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Invalid credentials'))
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.login('wrong@example.com', 'wrong');
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.user).toBeNull();
  });
});
```

### Utility Function Testing
```typescript
// src/utils/__tests__/storage.test.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../storage';

describe('storage', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  describe('getItem', () => {
    it('should return parsed JSON for valid data', async () => {
      const testData = { userId: '123', token: 'abc' };
      await AsyncStorage.setItem('testKey', JSON.stringify(testData));

      const result = await storage.getItem('testKey');

      expect(result).toEqual(testData);
    });

    it('should return null for non-existent keys', async () => {
      const result = await storage.getItem('nonExistent');

      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', async () => {
      await AsyncStorage.setItem('testKey', 'invalid json');

      const result = await storage.getItem('testKey');

      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should store data as JSON string', async () => {
      const testData = { userId: '123', token: 'abc' };

      await storage.setItem('testKey', testData);

      const stored = await AsyncStorage.getItem('testKey');
      expect(JSON.parse(stored)).toEqual(testData);
    });
  });
});
```

### Service Layer Testing
```typescript
// src/services/__tests__/api.test.ts
import { apiFetch } from '../api';

describe('apiFetch', () => {
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should make GET request with correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    } as Response);

    const result = await apiFetch('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/test',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(result).toEqual({ data: 'test' });
  });

  it('should include auth token when available', async () => {
    // Mock AsyncStorage
    const mockGetItem = jest.spyOn(require('@react-native-async-storage/async-storage'), 'getItem');
    mockGetItem.mockResolvedValue('mock-token');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    } as Response);

    await apiFetch('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      })
    );
  });

  it('should handle HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    await expect(apiFetch('/test')).rejects.toThrow('Niet geauthenticeerd (401)');
  });
});
```

## 4. Component Testing

### Basic Component Testing
```typescript
// src/components/__tests__/StepCounter.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { StepCounter } from '../StepCounter';

describe('StepCounter', () => {
  const mockOnSync = jest.fn();

  beforeEach(() => {
    mockOnSync.mockClear();
  });

  it('renders with initial state', () => {
    const { getByText, getByTestId } = render(
      <StepCounter onSync={mockOnSync} />
    );

    expect(getByText('0 steps')).toBeTruthy();
    expect(getByTestId('sync-button')).toBeTruthy();
  });

  it('displays pedometer availability', () => {
    const { getByText } = render(<StepCounter onSync={mockOnSync} />);

    expect(getByText('⚠️ Pedometer niet beschikbaar')).toBeTruthy();
  });

  it('calls onSync when sync button is pressed', async () => {
    const { getByTestId } = render(<StepCounter onSync={mockOnSync} />);

    fireEvent.press(getByTestId('sync-button'));

    await waitFor(() => {
      expect(mockOnSync).toHaveBeenCalled();
    });
  });

  it('shows offline queue indicator', () => {
    // Mock offline queue
    const { getByText } = render(<StepCounter onSync={mockOnSync} />);

    // Assuming component shows queue length
    expect(getByText('Offline: 5 stappen')).toBeTruthy();
  });
});
```

### Component with Hooks
```typescript
// src/components/__tests__/Dashboard.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from '../Dashboard';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Dashboard', () => {
  it('displays loading state initially', () => {
    const { getByTestId } = renderWithProviders(<Dashboard />);

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('displays user data after loading', async () => {
    // Mock API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          steps: 1500,
          route: '10 KM',
          allocatedFunds: 150,
        }),
      })
    );

    const { getByText } = renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(getByText('1,500')).toBeTruthy();
      expect(getByText('10 KM')).toBeTruthy();
      expect(getByText('€150')).toBeTruthy();
    });
  });

  it('handles API errors gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    const { getByText } = renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(getByText('Kon data niet laden')).toBeTruthy();
    });
  });
});
```

### Custom Test Utilities
```typescript
// src/components/__tests__/test-utils.tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock navigation
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  replace: jest.fn(),
  reset: jest.fn(),
};

// Mock route params
export const mockRoute = {
  params: {},
  key: 'test-key',
  name: 'TestScreen',
};

export * from '@testing-library/react-native';
export { customRender as render };
```

## 5. Integration Testing

### API Integration Testing
```typescript
// src/__tests__/integration/auth-flow.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../services/api';

describe('Authentication Flow Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('completes full login flow', async () => {
    // Mock successful login API
    const mockApiFetch = jest.spyOn(require('../../services/api'), 'apiFetch');
    mockApiFetch.mockResolvedValueOnce({
      token: 'mock-jwt-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: '123',
        naam: 'John Doe',
        rol: 'participant',
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Perform login
    await act(async () => {
      await result.current.login('john@example.com', 'password');
    });

    // Verify state updates
    expect(result.current.user).toEqual({
      id: '123',
      naam: 'John Doe',
      rol: 'participant',
    });
    expect(result.current.isAuthenticated).toBe(true);

    // Verify API was called correctly
    expect(mockApiFetch).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'john@example.com',
        wachtwoord: 'password',
      }),
    });
  });

  it('handles login failure and retry', async () => {
    const mockApiFetch = jest.spyOn(require('../../services/api'), 'apiFetch');

    // First call fails
    mockApiFetch.mockRejectedValueOnce(new Error('Invalid credentials'));

    // Second call succeeds
    mockApiFetch.mockResolvedValueOnce({
      token: 'mock-jwt-token',
      user: { id: '123', naam: 'John Doe', rol: 'participant' },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // First login attempt fails
    await act(async () => {
      try {
        await result.current.login('wrong@example.com', 'wrong');
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.user).toBeNull();

    // Second login attempt succeeds
    await act(async () => {
      await result.current.login('john@example.com', 'password');
    });

    expect(result.current.user).toBeTruthy();
    expect(result.current.error).toBeNull();
  });
});
```

### WebSocket Integration Testing
```typescript
// src/__tests__/integration/websocket-flow.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useStepsWebSocket } from '../../hooks/useStepsWebSocket';

describe('WebSocket Integration', () => {
  let mockWebSocket: any;

  beforeEach(() => {
    // Mock WebSocket
    mockWebSocket = {
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
      send: jest.fn(),
      close: jest.fn(),
    };

    global.WebSocket = jest.fn(() => mockWebSocket);
  });

  it('connects and receives step updates', async () => {
    const { result } = renderHook(() =>
      useStepsWebSocket('user123', 'participant123')
    );

    // Simulate connection
    act(() => {
      mockWebSocket.onopen();
    });

    expect(result.current.connected).toBe(true);

    // Simulate receiving step update
    const stepUpdate = {
      type: 'step_update',
      participant_id: 'participant123',
      steps: 1500,
      delta: 100,
      route: '10 KM',
    };

    act(() => {
      mockWebSocket.onmessage({
        data: JSON.stringify(stepUpdate),
      });
    });

    expect(result.current.latestUpdate).toEqual(stepUpdate);
  });

  it('handles connection failures and retries', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() =>
      useStepsWebSocket('user123', 'participant123')
    );

    // Simulate connection failure
    act(() => {
      mockWebSocket.onerror(new Error('Connection failed'));
    });

    expect(result.current.connectionState).toBe('error');

    // Fast-forward time to trigger reconnect
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(global.WebSocket).toHaveBeenCalledTimes(2);
  });
});
```

## 6. End-to-End Testing

### Detox Setup
```bash
# Install Detox
npm install --save-dev detox

# Initialize Detox
npx detox init -r jest

# Configure for iOS/Android
npx detox build --configuration ios
npx detox test --configuration ios
```

### E2E Test Example
```javascript
// e2e/login-flow.test.js
describe('Login Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should login successfully', async () => {
    // Enter credentials
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');

    // Tap login button
    await element(by.id('login-button')).tap();

    // Wait for dashboard to appear
    await expect(element(by.id('dashboard-screen'))).toBeVisible();

    // Verify user data is displayed
    await expect(element(by.text('Welcome, Test User'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');

    await element(by.id('login-button')).tap();

    // Verify error message appears
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});

// e2e/step-tracking.test.js
describe('Step Tracking', () => {
  it('should track and sync steps', async () => {
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for dashboard
    await expect(element(by.id('dashboard-screen'))).toBeVisible();

    // Check initial step count
    await expect(element(by.id('step-count'))).toHaveText('0');

    // Simulate walking (this would need device mocking)
    // await device.shake(); // Or custom native method

    // Tap sync button
    await element(by.id('sync-button')).tap();

    // Verify steps updated
    await expect(element(by.id('step-count'))).toHaveText('500');
  });
});
```

## 7. Mocking Strategies

### API Mocking with MSW
```typescript
// src/__tests__/mocks/server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  // Mock login endpoint
  rest.post('http://localhost:3000/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: '123',
          naam: 'Test User',
          rol: 'participant',
        },
      })
    );
  }),

  // Mock dashboard data
  rest.get('http://localhost:3000/api/participant/dashboard', (req, res, ctx) => {
    return res(
      ctx.json({
        steps: 1500,
        route: '10 KM',
        allocatedFunds: 150,
      })
    );
  }),

  // Mock step sync
  rest.post('http://localhost:3000/api/steps', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
);

// Start server before tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after tests
afterAll(() => server.close());
```

### Component Mocking
```typescript
// src/__tests__/mocks/react-native.ts
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  RN.Alert.alert = jest.fn();

  return RN;
});

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));
```

## 8. Test Coverage

### Coverage Configuration
```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Coverage Goals by Category
```typescript
// High priority - Core functionality
coverageThreshold: {
  'src/hooks/useAuth.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
  },
  'src/services/api.ts': {
    branches: 85,
    functions: 85,
    lines: 85,
  },
  // Medium priority - Components
  'src/components/StepCounter.tsx': {
    branches: 80,
    functions: 80,
    lines: 80,
  },
  // Lower priority - Utilities
  'src/utils/storage.ts': {
    branches: 70,
    functions: 70,
    lines: 70,
  },
}
```

### Coverage Report Analysis
```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html

# Check coverage thresholds
npm run test:coverage:check
```

## 9. CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit

      - name: Run component tests
        run: npm run test:components

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### Test Scripts
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:coverage:check": "jest --coverage --coverageThreshold='{}'",
    "test:unit": "jest --testPathPattern=unit",
    "test:components": "jest --testPathPattern=components",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "detox test",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

## 10. Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Keep tests independent and isolated

### Mocking Guidelines
- Mock external dependencies (API, navigation, storage)
- Use realistic mock data
- Avoid over-mocking internal functions
- Clean up mocks between tests

### Async Testing
```typescript
it('handles async operations', async () => {
  // Arrange
  const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' });

  // Act
  const result = await someAsyncFunction(mockApiCall);

  // Assert
  expect(result).toEqual({ data: 'test' });
  expect(mockApiCall).toHaveBeenCalledTimes(1);
});
```

### Component Testing Best Practices
- Test user interactions, not implementation details
- Use `data-testid` for element selection
- Test accessibility features
- Mock child components when testing parent behavior

### Performance Testing
```typescript
it('renders large list efficiently', () => {
  const largeDataset = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));

  const { rerender } = render(<LargeList data={largeDataset} />);

  // Measure render time
  const startTime = performance.now();
  rerender(<LargeList data={largeDataset} />);
  const endTime = performance.now();

  expect(endTime - startTime).toBeLessThan(100); // Less than 100ms
});
```

## 🎯 Testing Checklist

### Before Committing
- [ ] All tests pass (`npm test`)
- [ ] Code coverage meets thresholds
- [ ] ESLint passes with no errors
- [ ] TypeScript compilation succeeds
- [ ] No console warnings/errors in tests

### Code Review Checklist
- [ ] Tests cover happy path and error cases
- [ ] Tests are readable and maintainable
- [ ] Mock data is realistic
- [ ] Test names are descriptive
- [ ] No flaky tests (tests should be deterministic)

### New Feature Checklist
- [ ] Unit tests for new functions/hooks
- [ ] Component tests for new UI
- [ ] Integration tests for new flows
- [ ] E2E tests for critical user journeys
- [ ] Documentation updated
- [ ] Test coverage maintained

## 📞 Support

For testing questions:
- Check existing test files for examples
- Review [STYLE_GUIDE.md](STYLE_GUIDE.md) for code standards
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines

---

**Testing Guide Status**: ✅ Complete and Ready
**Last Updated**: 2025-11-03
**Version**: 1.0.0