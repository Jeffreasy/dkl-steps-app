# 🧪 DKL Steps App - End-to-End Testing Guide

**Project:** DKL Steps Mobile App
**Version:** 1.1.0
**Last Updated:** 26 Oktober 2025
**Framework:** Detox + Jest
**Status:** 📋 **READY FOR IMPLEMENTATION**

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Setup & Installation](#setup--installation)
3. [Configuration](#configuration)
4. [Writing E2E Tests](#writing-e2e-tests)
5. [Test Structure](#test-structure)
6. [Running Tests](#running-tests)
7. [User Journey Tests](#user-journey-tests)
8. [Geofencing Tests](#geofencing-tests)
9. [Device Compatibility](#device-compatibility)
10. [CI/CD Integration](#cicd-integration)
11. [Troubleshooting](#troubleshooting)

---

## Overview

### What is E2E Testing?

End-to-End (E2E) testing validates complete user workflows from start to finish, simulating real user interactions on actual devices or emulators.

### Why E2E Testing for DKL Steps?

- **Geofencing Validation**: Test location-based features in real environments
- **Step Tracking Accuracy**: Verify pedometer integration across devices
- **Offline Sync**: Test data persistence and synchronization
- **User Authentication**: Complete login/logout flows
- **Cross-Platform**: iOS and Android compatibility
- **Real Device Testing**: Physical device behavior validation

### Current Status

- ✅ **Unit Tests**: 534 tests (100% pass rate)
- ✅ **Integration Tests**: API, hooks, components tested
- 📋 **E2E Tests**: Ready for implementation (this guide)

---

## Setup & Installation

### Prerequisites

```bash
# Node.js 18+
node --version

# React Native CLI
npm install -g @react-native-community/cli

# iOS (macOS only)
xcode-select --install

# Android
# Android Studio with SDK 33+
# JAVA 11+
```

### Install Detox

```bash
# Install Detox CLI globally
npm install -g detox-cli

# Install Detox in project
npm install --save-dev detox

# For iOS
npm install --save-dev detox applesimutils

# For Android
npm install --save-dev detox
```

### Initialize Detox

```bash
# Initialize Detox configuration
detox init -r jest
```

This creates:
- `.detoxrc.js` - Detox configuration
- `e2e/` directory with test files
- Updates `package.json` with scripts

---

## Configuration

### Detox Configuration (.detoxrc.js)

```javascript
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/DKLStepsApp.app',
      build: 'xcodebuild -workspace ios/DKLStepsApp.xcworkspace -scheme DKLStepsApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/DKLStepsApp.app',
      build: 'xcodebuild -workspace ios/DKLStepsApp.xcworkspace -scheme DKLStepsApp -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081]
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
      reversePorts: [8081]
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_33'
      }
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release'
    },
    'android.attached.debug': {
      device: 'attached',
      app: 'android.debug'
    }
  }
};
```

### Jest E2E Configuration (e2e/jest.config.js)

```javascript
module.exports = {
  preset: 'detox/jest',
  setupFilesAfterEnv: ['<rootDir>/e2e/init.js'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  testMatch: ['<rootDir>/e2e/**/*.test.js'],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!e2e/**',
    '!node_modules/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true
};
```

### E2E Init File (e2e/init.js)

```javascript
const detox = require('detox');
const config = require('../.detoxrc.js');

beforeAll(async () => {
  await detox.init(config);
});

afterAll(async () => {
  await detox.cleanup();
});
```

---

## Writing E2E Tests

### Basic Test Structure

```javascript
import { device, expect, element, by, waitFor } from 'detox';

describe('Login Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should login successfully', async () => {
    // Navigate to login screen
    await expect(element(by.id('login-screen'))).toBeVisible();

    // Enter credentials
    await element(by.id('username-input')).typeText('testuser');
    await element(by.id('password-input')).typeText('password123');

    // Submit login
    await element(by.id('login-button')).tap();

    // Verify success
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
    await expect(element(by.text('Welcome, testuser!'))).toBeVisible();
  });
});
```

### Test IDs Setup

Add testIDs to components for E2E testing:

```typescript
// LoginScreen.tsx
<TextInput
  testID="username-input"
  placeholder="Username"
  // ... other props
/>

<TextInput
  testID="password-input"
  placeholder="Password"
  secureTextEntry
  // ... other props
/>

<CustomButton
  testID="login-button"
  title="Login"
  onPress={handleLogin}
/>
```

### Common Detox Matchers

```javascript
// Element selection
by.id('test-id')
by.text('Exact text')
by.label('Accessibility label')
by.type('RCTTextInput')

// Expectations
expect(element).toBeVisible()
expect(element).toBeNotVisible()
expect(element).toHaveText('expected text')
expect(element).toHaveValue('input value')

// Actions
await element.tap()
await element.typeText('text')
await element.clearText()
await element.scroll(50, 'down')
await element.swipe('left')
```

---

## Test Structure

### Directory Structure

```
e2e/
├── jest.config.js
├── init.js
├── environment.js
├── utils/
│   ├── testData.js
│   ├── helpers.js
│   └── mockServer.js
├── tests/
│   ├── auth/
│   │   ├── login.test.js
│   │   ├── logout.test.js
│   │   └── passwordReset.test.js
│   ├── stepTracking/
│   │   ├── basicTracking.test.js
│   │   ├── offlineSync.test.js
│   │   └── geofencing.test.js
│   ├── admin/
│   │   ├── fundsManagement.test.js
│   │   └── userManagement.test.js
│   └── navigation/
│       ├── screenNavigation.test.js
│       └── deepLinking.test.js
└── fixtures/
    ├── users.json
    ├── steps.json
    └── locations.json
```

### Test Data Fixtures

```javascript
// e2e/fixtures/users.json
{
  "admin": {
    "username": "admin",
    "password": "admin123",
    "role": "admin"
  },
  "participant": {
    "username": "participant1",
    "password": "pass123",
    "role": "participant"
  },
  "organizer": {
    "username": "organizer1",
    "password": "org123",
    "role": "organizer"
  }
}

// e2e/fixtures/locations.json
{
  "eventLocation": {
    "latitude": 52.3676,
    "longitude": 4.9041,
    "radius": 100
  },
  "outsideLocation": {
    "latitude": 52.3702,
    "longitude": 4.8952,
    "radius": 100
  }
}
```

### Helper Functions

```javascript
// e2e/utils/helpers.js
import { element, by, waitFor } from 'detox';

export const login = async (username, password) => {
  await element(by.id('username-input')).typeText(username);
  await element(by.id('password-input')).typeText(password);
  await element(by.id('login-button')).tap();

  await waitFor(element(by.id('dashboard-screen')))
    .toBeVisible()
    .withTimeout(5000);
};

export const logout = async () => {
  await element(by.id('menu-button')).tap();
  await element(by.id('logout-button')).tap();
  await element(by.id('confirm-logout')).tap();

  await waitFor(element(by.id('login-screen')))
    .toBeVisible()
    .withTimeout(5000);
};

export const navigateTo = async (screenId) => {
  await element(by.id(`${screenId}-tab`)).tap();
  await expect(element(by.id(`${screenId}-screen`))).toBeVisible();
};

export const waitForElement = async (testID, timeout = 5000) => {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
};
```

---

## Running Tests

### Build Apps First

```bash
# iOS Simulator
detox build --configuration ios.sim.debug

# Android Emulator
detox build --configuration android.emu.debug

# Physical Android Device
detox build --configuration android.attached.debug
```

### Run Tests

```bash
# Run all E2E tests
detox test --configuration ios.sim.debug

# Run specific test file
detox test --configuration ios.sim.debug e2e/tests/auth/login.test.js

# Run with specific device
detox test --configuration android.emu.debug --device-name "Pixel_5_API_33"

# Run tests matching pattern
detox test --configuration ios.sim.debug --testNamePattern="login"

# Generate coverage
detox test --configuration ios.sim.debug --coverage
```

### npm Scripts (add to package.json)

```json
{
  "scripts": {
    "e2e:build:ios": "detox build --configuration ios.sim.debug",
    "e2e:build:android": "detox build --configuration android.emu.debug",
    "e2e:test:ios": "detox test --configuration ios.sim.debug",
    "e2e:test:android": "detox test --configuration android.emu.debug",
    "e2e:test": "npm run e2e:test:ios && npm run e2e:test:android",
    "e2e:coverage": "detox test --configuration ios.sim.debug --coverage"
  }
}
```

---

## User Journey Tests

### Complete Login to Dashboard Flow

```javascript
describe('User Authentication Journey', () => {
  it('should complete full login flow', async () => {
    // 1. App Launch
    await expect(element(by.id('splash-screen'))).toBeVisible();

    // 2. Navigate to Login
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // 3. Enter Credentials
    await element(by.id('username-input')).typeText('participant1');
    await element(by.id('password-input')).typeText('pass123');

    // 4. Submit Login
    await element(by.id('login-button')).tap();

    // 5. Verify Dashboard Access
    await expect(element(by.id('dashboard-screen'))).toBeVisible();
    await expect(element(by.text('Welcome back!'))).toBeVisible();

    // 6. Check Step Counter
    await expect(element(by.id('step-counter'))).toBeVisible();
    await expect(element(by.id('current-steps'))).toHaveText('0 steps');

    // 7. Navigate to Profile
    await element(by.id('profile-tab')).tap();
    await expect(element(by.id('profile-screen'))).toBeVisible();
  });
});
```

### Step Tracking Journey

```javascript
describe('Step Tracking Journey', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await login('participant1', 'pass123');
  });

  it('should track steps and sync data', async () => {
    // Navigate to dashboard
    await expect(element(by.id('dashboard-screen'))).toBeVisible();

    // Check initial state
    await expect(element(by.id('current-steps'))).toHaveText('0 steps');

    // Simulate step activity (mock pedometer)
    await device.setLocation(52.3676, 4.9041); // Event location

    // Wait for step updates
    await waitFor(element(by.id('current-steps')))
      .not.toHaveText('0 steps')
      .withTimeout(10000);

    // Manual sync
    await element(by.id('sync-button')).tap();

    // Verify sync success
    await expect(element(by.id('sync-status'))).toHaveText('Synced');

    // Check offline queue
    await element(by.id('offline-indicator')).tap();
    await expect(element(by.id('offline-queue-count'))).toHaveText('0 pending');
  });
});
```

### Admin Funds Management Journey

```javascript
describe('Admin Funds Management Journey', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await login('admin', 'admin123');
  });

  it('should manage participant funds', async () => {
    // Navigate to admin section
    await element(by.id('admin-tab')).tap();
    await expect(element(by.id('admin-dashboard'))).toBeVisible();

    // Navigate to funds management
    await element(by.id('funds-management')).tap();
    await expect(element(by.id('funds-screen'))).toBeVisible();

    // Add funds to participant
    await element(by.id('participant-selector')).tap();
    await element(by.text('participant1')).tap();

    await element(by.id('amount-input')).typeText('50');
    await element(by.id('add-funds-button')).tap();

    // Verify success
    await expect(element(by.id('success-message'))).toHaveText('Funds added successfully');

    // Check updated balance
    await expect(element(by.id('participant-balance'))).toHaveText('€50.00');
  });
});
```

---

## Geofencing Tests

### Location-Based Testing

```javascript
describe('Geofencing Features', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await login('participant1', 'pass123');
  });

  it('should detect entry into event zone', async () => {
    // Start outside event location
    await device.setLocation(52.3702, 4.8952); // Outside location

    // Verify not in zone
    await expect(element(by.id('geofence-status'))).toHaveText('Outside Event Zone');

    // Move into event location
    await device.setLocation(52.3676, 4.9041); // Event location

    // Verify zone detection
    await waitFor(element(by.id('geofence-status')))
      .toHaveText('Inside Event Zone')
      .withTimeout(5000);

    // Check step tracking activation
    await expect(element(by.id('step-tracking-active'))).toBeVisible();
  });

  it('should handle zone transitions', async () => {
    // Enter zone
    await device.setLocation(52.3676, 4.9041);
    await waitFor(element(by.id('geofence-status')))
      .toHaveText('Inside Event Zone')
      .withTimeout(5000);

    // Exit zone
    await device.setLocation(52.3702, 4.8952);
    await waitFor(element(by.id('geofence-status')))
      .toHaveText('Outside Event Zone')
      .withTimeout(5000);

    // Verify step tracking paused
    await expect(element(by.id('step-tracking-paused'))).toBeVisible();
  });

  it('should sync data on zone exit', async () => {
    // Enter zone and generate steps
    await device.setLocation(52.3676, 4.9041);
    await waitFor(element(by.id('geofence-status')))
      .toHaveText('Inside Event Zone')
      .withTimeout(5000);

    // Wait for some steps
    await waitFor(element(by.id('current-steps')))
      .not.toHaveText('0 steps')
      .withTimeout(15000);

    // Exit zone
    await device.setLocation(52.3702, 4.8952);
    await waitFor(element(by.id('geofence-status')))
      .toHaveText('Outside Event Zone')
      .withTimeout(5000);

    // Verify automatic sync
    await expect(element(by.id('sync-status'))).toHaveText('Auto-synced');
  });
});
```

### Mock Location Setup

```javascript
// e2e/utils/mockLocation.js
export const mockLocations = {
  eventZone: { latitude: 52.3676, longitude: 4.9041 },
  outsideZone: { latitude: 52.3702, longitude: 4.8952 },
  farAway: { latitude: 52.5200, longitude: 13.4050 }
};

export const setMockLocation = async (location) => {
  await device.setLocation(location.latitude, location.longitude);
};

export const simulateMovement = async (from, to, steps = 10) => {
  const latStep = (to.latitude - from.latitude) / steps;
  const lngStep = (to.longitude - from.longitude) / steps;

  for (let i = 0; i <= steps; i++) {
    const currentLat = from.latitude + (latStep * i);
    const currentLng = from.longitude + (lngStep * i);
    await device.setLocation(currentLat, currentLng);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};
```

---

## Device Compatibility

### iOS Testing

```javascript
// iOS-specific tests
describe('iOS Compatibility', () => {
  it('should handle iOS permissions', async () => {
    // Request location permission
    await device.launchApp({ permissions: { location: 'always' } });

    // Verify permission granted
    await expect(element(by.id('location-permission-granted'))).toBeVisible();
  });

  it('should work with iOS pedometer', async () => {
    // iOS pedometer simulation
    await device.setLocation(52.3676, 4.9041);
    await device.shake(); // Simulate motion

    await waitFor(element(by.id('step-detected')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

### Android Testing

```javascript
// Android-specific tests
describe('Android Compatibility', () => {
  it('should handle Android permissions', async () => {
    // Grant permissions at launch
    await device.launchApp({
      permissions: {
        location: 'allow',
        activityRecognition: 'allow'
      }
    });

    await expect(element(by.id('permissions-granted'))).toBeVisible();
  });

  it('should work with Android sensors', async () => {
    // Android sensor simulation
    await device.setLocation(52.3676, 4.9041);
    await device.sendToHome(); // Background app
    await device.launchApp(); // Resume

    // Verify step tracking resumed
    await expect(element(by.id('step-tracking-active'))).toBeVisible();
  });
});
```

### Cross-Platform Tests

```javascript
describe('Cross-Platform Features', () => {
  const platforms = ['ios', 'android'];

  platforms.forEach(platform => {
    it(`should work on ${platform}`, async () => {
      await device.selectPlatform(platform);

      // Common functionality tests
      await login('participant1', 'pass123');
      await expect(element(by.id('dashboard-screen'))).toBeVisible();

      // Platform-specific checks
      if (platform === 'ios') {
        await expect(element(by.id('ios-specific-ui'))).toBeVisible();
      } else {
        await expect(element(by.id('android-specific-ui'))).toBeVisible();
      }
    });
  });
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Setup iOS Simulator
        run: |
          xcrun simctl create "iPhone 14" "iPhone 14" iOS15.5
      - name: Install dependencies
        run: npm ci
      - name: Build iOS app
        run: detox build --configuration ios.sim.debug
      - name: Run E2E tests
        run: detox test --configuration ios.sim.debug --cleanup

  e2e-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
      - name: Setup Android Emulator
        run: |
          echo "y" | $ANDROID_HOME/tools/bin/sdkmanager --install 'system-images;android-33;google_apis;x86_64'
          echo "no" | $ANDROID_HOME/tools/bin/avdmanager create avd -n test -k 'system-images;android-33;google_apis;x86_64'
      - name: Install dependencies
        run: npm ci
      - name: Build Android app
        run: detox build --configuration android.emu.debug
      - name: Run E2E tests
        run: detox test --configuration android.emu.debug --cleanup
```

### Parallel Testing

```yaml
# Parallel E2E execution
jobs:
  e2e-tests:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest]
        include:
          - os: macos-latest
            config: ios.sim.debug
            device: iPhone 14
          - os: ubuntu-latest
            config: android.emu.debug
            device: Pixel_5_API_33
    steps:
      - uses: actions/checkout@v3
      - name: Run E2E tests
        run: |
          npm ci
          detox build --configuration ${{ matrix.config }}
          detox test --configuration ${{ matrix.config }}
```

---

## Troubleshooting

### Common Issues

#### 1. Build Failures

**iOS Build Issues:**
```bash
# Clean and rebuild
cd ios && rm -rf build && cd ..
detox build --configuration ios.sim.debug --clean
```

**Android Build Issues:**
```bash
# Clean Gradle cache
cd android && ./gradlew clean && cd ..
detox build --configuration android.emu.debug
```

#### 2. Test Timeouts

```javascript
// Increase timeout in test
it('should handle slow operation', async () => {
  await waitFor(element(by.id('slow-element')))
    .toBeVisible()
    .withTimeout(30000); // 30 seconds
}, 60000); // Test timeout
```

#### 3. Element Not Found

```javascript
// Debug element visibility
it('should find element', async () => {
  try {
    await expect(element(by.id('test-id'))).toBeVisible();
  } catch (error) {
    // Take screenshot for debugging
    await device.takeScreenshot('debug-screenshot');
    throw error;
  }
});
```

#### 4. Flaky Tests

```javascript
// Retry mechanism
const retry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

it('should handle flaky operation', async () => {
  await retry(async () => {
    await element(by.id('unstable-element')).tap();
    await expect(element(by.id('result'))).toBeVisible();
  });
});
```

#### 5. Async Operations

```javascript
// Wait for async operations
it('should handle async data loading', async () => {
  await element(by.id('load-data-button')).tap();

  // Wait for loading to complete
  await waitFor(element(by.id('loading-indicator')))
    .toBeNotVisible()
    .withTimeout(10000);

  // Verify data loaded
  await expect(element(by.id('data-list'))).toBeVisible();
});
```

### Debug Tips

1. **Screenshots**: `await device.takeScreenshot('debug');`
2. **Source Maps**: Enable for better error traces
3. **Verbose Logging**: `--loglevel verbose`
4. **Single Test**: Run one test at a time for debugging
5. **Device Logs**: Check device/emulator logs

---

## Best Practices

### Test Organization

1. **Group Related Tests**: Use `describe` blocks logically
2. **Independent Tests**: Each test should be self-contained
3. **Clear Naming**: Test names should describe behavior
4. **Setup/Teardown**: Use `beforeEach`/`afterEach` appropriately

### Performance

1. **Parallel Execution**: Run tests in parallel when possible
2. **Selective Testing**: Don't run all tests for every change
3. **Fast Feedback**: Keep tests fast for development
4. **Resource Cleanup**: Clean up after tests

### Maintenance

1. **Regular Updates**: Keep tests in sync with app changes
2. **Flakiness Monitoring**: Address flaky tests immediately
3. **Documentation**: Keep test documentation current
4. **Code Reviews**: Review test changes with app changes

---

## Implementation Checklist

- [ ] Install Detox and dependencies
- [ ] Configure Detox for iOS and Android
- [ ] Set up test directory structure
- [ ] Add testIDs to components
- [ ] Create basic authentication tests
- [ ] Implement step tracking tests
- [ ] Add geofencing tests
- [ ] Set up CI/CD pipeline
- [ ] Create device compatibility tests
- [ ] Add performance benchmarks
- [ ] Document troubleshooting guides

---

## Resources

### Documentation
- [Detox Documentation](https://wix.github.io/Detox/)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [Jest Documentation](https://jestjs.io/)

### Tools
- [Detox CLI](https://github.com/wix/Detox)
- [Appium](http://appium.io/) (alternative)
- [Maestro](https://maestro.mobile.dev/) (alternative)

### Examples
- [Detox Examples](https://github.com/wix/Detox/tree/master/examples)
- [React Native E2E Tests](https://github.com/react-native-community/react-native-template-typescript)

---

**© 2025 DKL Organization - E2E Testing Guide**
**Last Updated:** 26 Oktober 2025
**Version:** 1.1.0
**Status:** 📋 **READY FOR IMPLEMENTATION**

**Happy Testing! 🧪📱**