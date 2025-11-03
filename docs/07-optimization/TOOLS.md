# 🛠️ Optimization Tools & Resources

**Project:** DKL Steps Mobile App
**Version:** 1.0.6 (Optimized)
**Date:** November 2025

---

## 📋 Executive Summary

This guide provides comprehensive recommendations for tools and resources to support React Native optimization efforts. Tools are categorized by purpose with setup instructions, use cases, and integration examples.

### 🎯 Tool Categories

| Category | Purpose | Key Tools | Status |
|----------|---------|-----------|--------|
| **Development** | Code quality & debugging | ESLint, Prettier, React DevTools | ✅ Essential |
| **Performance** | Monitoring & profiling | Flipper, Sentry, Lighthouse | ✅ Recommended |
| **Testing** | Quality assurance | Jest, React Native Testing Library | 🟡 Planned |
| **Build** | Optimization & deployment | EAS Build, Metro, Bundle Analyzer | ✅ Implemented |
| **Design** | UI/UX optimization | Figma, Zeplin, Lottie | ⚠️ Optional |

---

## 🔧 Development Tools

### Code Quality & Linting

**1. ESLint + React Native Rules:**
```json
// .eslintrc.js - Recommended configuration
module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
  ],
  plugins: ['react-native', 'import'],
  rules: {
    // Performance rules
    'react-hooks/exhaustive-deps': 'error',
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn',

    // Code quality
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always'
    }],
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
  settings: {
    'import/resolver': {
      'babel-module': {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@utils': './src/utils',
        }
      }
    }
  }
};
```

**2. Prettier Code Formatting:**
```json
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'preserve',
      },
    },
  ],
};
```

### React Development Tools

**3. React DevTools:**
```bash
# Install globally
npm install -g react-devtools

# Start server
npx react-devtools

# In app (development only)
if (__DEV__) {
  import('react-devtools');
}
```

**4. React Query DevTools (Alternative):**
```typescript
// Since React Query DevTools doesn't work in RN, use alternatives
import { logger } from '../utils/logger';

// Debug QueryClient state
const debugQueryState = () => {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  logger.table(queries.map(q => ({
    key: q.queryKey.join(','),
    status: q.state.status,
    dataSize: JSON.stringify(q.state.data).length,
    lastUpdated: new Date(q.state.dataUpdatedAt).toLocaleTimeString(),
  })));
};
```

---

## 📊 Performance Monitoring Tools

### Flipper Desktop App

**1. Flipper Setup:**
```bash
# Install Flipper desktop app from https://fbflipper.com/

# React Native Flipper plugin
npm install --save-dev react-native-flipper

# In App.tsx (development)
if (__DEV__) {
  import('react-native-flipper');
}
```

**2. Custom Flipper Plugins:**
```typescript
// Create custom plugin for DKL app metrics
const dklMetricsPlugin = {
  getId: () => 'dkl-metrics',

  onConnect: (connection) => {
    // Send real-time metrics
    const sendMetrics = () => {
      connection.send('metrics', {
        memoryUsage: getMemoryUsage(),
        batteryLevel: getBatteryLevel(),
        networkStatus: getNetworkStatus(),
        activeQueries: queryClient.getQueryCache().getAll().length,
      });
    };

    // Send metrics every second
    const interval = setInterval(sendMetrics, 1000);

    connection.onDisconnect = () => clearInterval(interval);
  },
};
```

### Sentry Error Tracking

**3. Sentry Configuration:**
```typescript
// utils/sentry.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',

  // Performance monitoring
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,

  // Release tracking
  release: `dkl-steps-app@${process.env.npm_package_version}`,

  // Error filtering
  beforeSend: (event) => {
    // Filter development errors
    if (__DEV__ && event.exception?.values?.[0]?.value?.includes('Debug')) {
      return null;
    }

    // Add custom context
    event.tags = {
      ...event.tags,
      userType: getUserType(),
      appSection: getCurrentScreen(),
    };

    return event;
  },
});
```

**4. Performance Monitoring:**
```typescript
// Custom performance tracking
const trackPerformance = (operation: string, fn: () => Promise<any>) => {
  const transaction = Sentry.startTransaction({
    name: operation,
    op: 'function',
  });

  return fn().finally(() => transaction.finish());
};

// Usage
await trackPerformance('user-login', async () => {
  return await loginUser(credentials);
});
```

---

## 🧪 Testing Tools

### Jest + React Native Testing Library

**1. Jest Configuration:**
```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
};
```

**2. Testing Utilities:**
```typescript
// src/test-utils/index.ts
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Custom render with providers
const AllTheProviders = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (ui, options = {}) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Mock utilities
export const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

export const mockNetworkStatus = {
  isConnected: true,
  isInternetReachable: true,
};

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render, mockStorage, mockNetworkStatus };
```

**3. Component Testing Example:**
```typescript
// __tests__/components/StepCounter.test.tsx
import { render, fireEvent, waitFor } from '../../test-utils';

describe('StepCounter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders step count correctly', () => {
    const { getByText } = render(<StepCounter />);

    expect(getByText('0 steps')).toBeTruthy();
  });

  it('handles step increment', async () => {
    const { getByText } = render(<StepCounter />);

    fireEvent.press(getByText('Add Step'));

    await waitFor(() => {
      expect(getByText('1 steps')).toBeTruthy();
    });
  });

  it('syncs steps when online', async () => {
    mockNetworkStatus.isConnected = true;

    const { getByText } = render(<StepCounter />);

    fireEvent.press(getByText('Sync Steps'));

    await waitFor(() => {
      expect(getByText('Steps synced successfully')).toBeTruthy();
    });
  });
});
```

### MSW for API Mocking

**4. Mock Service Worker Setup:**
```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/native';
import { rest } from 'msw';

export const server = setupServer(
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    }));
  }),

  rest.post('/api/steps', (req, res, ctx) => {
    return res(ctx.json({
      success: true,
      syncedSteps: 150,
    }));
  }),
);

// Start server in test setup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 📦 Build & Bundle Tools

### Metro Bundle Analyzer

**1. Bundle Analysis:**
```bash
# Install bundle analyzer
npm install -g @expo/cli

# Analyze bundle
expo bundle:analyze android

# Or use custom script
npx metro-bundle-analyzer dist/android/index.android.bundle
```

**2. Bundle Size Monitoring:**
```javascript
// scripts/analyze-bundle.js
const fs = require('fs');
const path = require('path');

const analyzeBundle = (platform) => {
  const bundlePath = `dist/${platform}/index.android.bundle`;
  const stats = fs.statSync(bundlePath);

  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  const gzipSizeMB = (stats.size * 0.3 / 1024 / 1024).toFixed(2); // Rough gzip estimate

  console.log(`${platform} Bundle Analysis:`);
  console.log(`- Size: ${sizeMB}MB`);
  console.log(`- Estimated Gzipped: ${gzipSizeMB}MB`);

  // Check against limits
  const MAX_SIZE = 3; // MB
  if (parseFloat(sizeMB) > MAX_SIZE) {
    console.error(`❌ Bundle size exceeds limit of ${MAX_SIZE}MB`);
    process.exit(1);
  } else {
    console.log(`✅ Bundle size within limits`);
  }
};
```

### EAS Build Optimization

**3. EAS Build Configuration:**
```json
// eas.json - Optimized build settings
{
  "build": {
    "production": {
      "env": {
        "EXPO_USE_HERMES": "1",
        "EXPO_USE_FAST_RESYNC": "1",
        "NODE_ENV": "production"
      },
      "config": {
        "publicUrl": "https://your-app-url.com"
      },
      "developmentClient": false,
      "distribution": "store",
      "buildType": "app-bundle"
    },
    "preview": {
      "env": {
        "EXPO_USE_HERMES": "1"
      },
      "distribution": "internal",
      "buildType": "apk"
    }
  }
}
```

---

## 🎨 Design & UI Tools

### Lottie for Animations

**1. Lottie Integration:**
```typescript
// components/LottieAnimation.tsx
import LottieView from 'lottie-react-native';
import { useRef } from 'react';

export const LottieAnimation = ({ source, style, autoPlay = true }) => {
  const animationRef = useRef<LottieView>(null);

  return (
    <LottieView
      ref={animationRef}
      source={source}
      style={style}
      autoPlay={autoPlay}
      loop={false}
      speed={1}
      onAnimationFinish={() => {
        // Handle completion
      }}
    />
  );
};
```

**2. Performance-Optimized Lottie:**
```typescript
// Optimized Lottie with battery awareness
export const SmartLottieAnimation = ({ source, style }) => {
  const batteryLevel = useBatteryLevel();
  const { features } = useProgressiveFeatures();

  // Skip animations on low battery
  if (!features.animations || batteryLevel < 0.15) {
    return <View style={style} />; // Placeholder
  }

  return (
    <LottieView
      source={source}
      style={style}
      autoPlay={true}
      loop={false}
      // Reduce quality on medium battery
      renderMode={batteryLevel < 0.3 ? 'software' : 'hardware'}
    />
  );
};
```

### React Native Reanimated

**3. Performance Animations:**
```typescript
// hooks/useOptimizedAnimation.ts
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

export const useOptimizedAnimation = () => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const animateIn = () => {
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });
  };

  const animateOut = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(50, { duration: 200 });
  };

  return {
    animatedStyle,
    animateIn,
    animateOut,
  };
};
```

---

## 🔍 Code Analysis Tools

### TypeScript Compiler

**1. Strict TypeScript Configuration:**
```json
// tsconfig.json - Strict settings
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitThis": true
  }
}
```

### Code Complexity Analysis

**2. Complexity Monitoring:**
```javascript
// scripts/analyze-complexity.js
const escomplex = require('escomplex');

const analyzeFile = (filePath) => {
  const source = fs.readFileSync(filePath, 'utf8');
  const result = escomplex.analyze(source, {
    logicalor: true,
    switchcase: true,
    forin: false,
    trycatch: false,
  });

  return {
    file: filePath,
    complexity: result.aggregate.cyclomatic,
    functions: result.functions.map(f => ({
      name: f.name,
      complexity: f.cyclomatic,
      line: f.line,
    })),
  };
};

// Check complexity thresholds
const checkComplexity = (analysis) => {
  const issues = [];

  if (analysis.complexity > 10) {
    issues.push(`High file complexity: ${analysis.complexity}`);
  }

  analysis.functions.forEach(func => {
    if (func.complexity > 5) {
      issues.push(`Complex function ${func.name}: ${func.complexity}`);
    }
  });

  return issues;
};
```

---

## 📊 CI/CD Integration

### GitHub Actions Workflow

**1. Performance Testing Pipeline:**
```yaml
# .github/workflows/performance.yml
name: Performance Tests
on: pull_request

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run tests
        run: npm run test -- --coverage

      - name: Bundle analysis
        run: npm run analyze-bundle

      - name: Performance tests
        run: npm run performance-test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

      - name: Comment PR with results
        uses: dorny/test-reporter@v1
        if: success() || failure()
        with:
          name: Performance Tests
          path: 'test-results/*.xml'
          reporter: java-junit
```

### Automated Tool Updates

**2. Dependency Update Automation:**
```yaml
# .github/workflows/dependency-updates.yml
name: Dependency Updates
on:
  schedule:
    - cron: '0 2 * * 1'  # Every Monday at 2 AM
  workflow_dispatch:

jobs:
  update-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Update dependencies
        run: |
          npm update
          npm audit fix

      - name: Run tests
        run: npm test

      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v4
        with:
          title: 'chore: update dependencies'
          body: 'Automated dependency updates'
          branch: automated/dependency-updates
```

---

## 📋 Tool Implementation Checklist

### Immediate Setup (This Week)
- [ ] Configure ESLint with React Native rules
- [ ] Set up Prettier code formatting
- [ ] Install and configure Sentry
- [ ] Set up Flipper for development
- [ ] Configure Metro bundle analyzer

### Medium-term (This Month)
- [ ] Implement Jest testing framework
- [ ] Set up React Native Testing Library
- [ ] Configure MSW for API mocking
- [ ] Add CI/CD performance checks
- [ ] Implement automated dependency updates

### Long-term (This Quarter)
- [ ] Add Lottie animations
- [ ] Implement React Native Reanimated
- [ ] Set up code complexity monitoring
- [ ] Configure automated bundle size tracking
- [ ] Add performance regression alerts

---

## 🔧 Tool Troubleshooting

### Common Tool Issues

**ESLint Performance:**
```javascript
// .eslintrc.js - Performance optimizations
module.exports = {
  // Cache results
  cache: true,
  cacheLocation: '.eslintcache',

  // Only lint changed files in CI
  extensions: ['.ts', '.tsx'],

  // Ignore patterns
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    '.expo/',
    '.expo-shared/',
  ],
};
```

**Jest Slow Tests:**
```javascript
// jest.config.js - Performance optimizations
module.exports = {
  // Run tests in parallel
  maxWorkers: '50%',

  // Cache test results
  cache: true,

  // Only run changed tests in watch mode
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
  ],

  // Use faster test environment
  testEnvironment: 'jsdom', // For components without RN-specific features
};
```

**Bundle Analysis Issues:**
```bash
# Fix Metro bundle analyzer issues
# 1. Ensure bundle exists
ls -la dist/android/index.android.bundle

# 2. Check bundle size
du -sh dist/android/index.android.bundle

# 3. Validate JSON structure
head -n 20 dist/android/index.android.bundle
```

---

## 📚 Related Documentation

- **[BUNDLE_OPTIMIZATION.md](BUNDLE_OPTIMIZATION.md)** - Bundle size optimization
- **[PROFILING.md](PROFILING.md)** - Performance monitoring
- **[MAINTENANCE.md](MAINTENANCE.md)** - Ongoing maintenance
- **[AUDIT.md](AUDIT.md)** - Post-optimization audit

---

## 🎯 Success Metrics

| Tool Category | Adoption Target | Current Status | Impact |
|---------------|-----------------|----------------|---------|
| **Code Quality** | 100% | 95% | ✅ High |
| **Testing** | 70% coverage | 0% (planned) | 🟡 Medium |
| **Performance Monitoring** | 100% | 90% | ✅ High |
| **CI/CD Integration** | 100% | 75% | 🟡 Medium |
| **Bundle Analysis** | Automated | Manual | 🟡 Medium |

---

**© 2025 DKL Organization - Optimization Tools & Resources Guide**