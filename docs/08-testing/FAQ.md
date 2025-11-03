# ❓ DKL Steps App - Testing FAQ & Common Issues

**Project:** DKL Steps Mobile App
**Version:** 1.1.0
**Last Updated:** 26 Oktober 2025
**Status:** 🛠️ **COMPREHENSIVE TROUBLESHOOTING GUIDE**

---

## 📑 Table of Contents

1. [Getting Started Issues](#getting-started-issues)
2. [Test Execution Problems](#test-execution-problems)
3. [Mock and Setup Issues](#mock-and-setup-issues)
4. [Async Testing Challenges](#async-testing-challenges)
5. [Component Testing Issues](#component-testing-issues)
6. [Coverage and Reporting](#coverage-and-reporting)
7. [Performance Testing](#performance-testing)
8. [CI/CD Pipeline Issues](#cicd-pipeline-issues)
9. [E2E Testing Problems](#e2e-testing-problems)
10. [Debugging Techniques](#debugging-techniques)

---

## Getting Started Issues

### Q: Tests fail immediately with "Cannot find module" errors

**Symptoms:**
```
Cannot find module 'expo-constants'
Cannot find module '@react-native-async-storage/async-storage'
```

**Solutions:**

1. **Install dependencies:**
```bash
npm install
```

2. **Clear Jest cache:**
```bash
npx jest --clearCache
```

3. **Check Jest configuration:**
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Ensure transformIgnorePatterns includes problematic modules
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-navigation|@react-native-community|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-native-async-storage|@react-native-community/netinfo))',
  ],
};
```

4. **Verify Expo installation:**
```bash
npx expo install --fix
```

### Q: "ReferenceError: React is not defined" in tests

**Symptoms:**
```
ReferenceError: React is not defined
```

**Solutions:**

1. **Import React in test files:**
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
```

2. **Update Jest setup for React 17+:**
```javascript
// jest.setup.js
import 'react-native/jest/setup';
```

3. **Check tsconfig.json:**
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["es6", "dom"]
  }
}
```

### Q: Tests pass locally but fail in CI/CD

**Symptoms:**
- Local: ✅ All tests pass
- CI/CD: ❌ Tests fail with environment errors

**Solutions:**

1. **Check Node.js version consistency:**
```yaml
# .github/workflows/ci.yml
- uses: actions/setup-node@v3
  with:
    node-version: '18'
    cache: 'npm'
```

2. **Ensure all dependencies are in package-lock.json:**
```bash
rm -rf node_modules package-lock.json
npm install
```

3. **Add missing system dependencies:**
```yaml
- name: Install system dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3-dev libxss1 libasound2-dev libxtst6 xauth
```

4. **Use consistent environment variables:**
```javascript
// jest.config.js
process.env.TZ = 'UTC'; // Ensure consistent timezone
process.env.NODE_ENV = 'test';
```

---

## Test Execution Problems

### Q: Tests timeout with "Async callback was not invoked"

**Symptoms:**
```
Error: Timeout - Async callback was not invoked within the 5000 ms timeout
```

**Solutions:**

1. **Use proper async/await patterns:**
```typescript
// ❌ Wrong
it('should work', () => {
  someAsyncFunction().then(() => {
    expect(true).toBe(true);
  });
});

// ✅ Correct
it('should work', async () => {
  await someAsyncFunction();
  expect(true).toBe(true);
});
```

2. **Use waitFor for async assertions:**
```typescript
import { waitFor } from '@testing-library/react-native';

it('should show data after loading', async () => {
  const { getByText } = render(<DataComponent />);

  await waitFor(() => {
    expect(getByText('Data loaded')).toBeVisible();
  }, { timeout: 3000 });
});
```

3. **Mock async operations properly:**
```typescript
// Mock API calls
jest.mock('../api', () => ({
  fetchData: jest.fn(() =>
    Promise.resolve({ data: 'mocked data' })
  ),
}));
```

4. **Increase timeout for slow operations:**
```typescript
it('should handle slow operation', async () => {
  // ... test code
}, 10000); // 10 second timeout
```

### Q: Tests are flaky (pass/fail randomly)

**Symptoms:**
- Tests pass on local machine but fail in CI
- Tests fail intermittently
- Race conditions in async code

**Solutions:**

1. **Avoid shared state between tests:**
```typescript
// ❌ Wrong - Shared state
let counter = 0;

beforeEach(() => {
  counter = 0; // Reset in beforeEach
});

// ✅ Correct - Isolated state
beforeEach(() => {
  counter = 0;
});

it('should increment counter', () => {
  counter++;
  expect(counter).toBe(1);
});
```

2. **Clear mocks between tests:**
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers(); // If using timers
});
```

3. **Use proper cleanup:**
```typescript
afterEach(() => {
  cleanup(); // From @testing-library/react-native
  jest.clearAllTimers();
});
```

4. **Avoid timing-dependent tests:**
```typescript
// ❌ Wrong - Timing dependent
setTimeout(() => {
  expect(component.state.loaded).toBe(true);
}, 1000);

// ✅ Correct - Event driven
await waitFor(() => {
  expect(getByText('Loaded')).toBeVisible();
});
```

### Q: Memory leaks in tests

**Symptoms:**
- Tests get slower over time
- Out of memory errors
- Jest process doesn't exit cleanly

**Solutions:**

1. **Clean up after each test:**
```typescript
afterEach(() => {
  // Clean up subscriptions, timers, etc.
  jest.clearAllTimers();
  jest.clearAllMocks();
});
```

2. **Mock heavy dependencies:**
```typescript
// Mock image loading
jest.mock('expo-image', () => ({
  Image: 'MockedImage',
}));
```

3. **Use shallow rendering for complex components:**
```typescript
import { shallow } from 'enzyme'; // Or React Testing Library's render options

const { container } = render(<ComplexComponent />, {
  wrapper: ({ children }) => <View>{children}</View>,
});
```

---

## Mock and Setup Issues

### Q: Expo modules not mocked properly

**Symptoms:**
```
TypeError: Cannot read properties of undefined (reading 'OS')
Error: expo-font could not be mocked
```

**Solutions:**

1. **Check jest.setup.js mocks:**
```javascript
// jest.setup.js
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    APP_NAME: 'DKL Steps',
    BACKEND_URL: 'https://api.test.com',
  },
}));

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  Version: '15.0',
  select: (obj) => obj.ios || obj.default,
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));
```

2. **Use manual mocks for complex modules:**
```javascript
// __mocks__/expo-haptics.js
export const impactAsync = jest.fn(() => Promise.resolve());
export const notificationAsync = jest.fn(() => Promise.resolve());
export const selectionAsync = jest.fn(() => Promise.resolve());
```

3. **Mock React Navigation:**
```javascript
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

### Q: AsyncStorage/MMKV mocks not working

**Symptoms:**
```
TypeError: _reactNativeMmkv.default.getString is not a function
```

**Solutions:**

1. **Proper MMKV mocking:**
```javascript
// jest.setup.js
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
  })),
}));
```

2. **AsyncStorage mocking:**
```javascript
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));
```

3. **Test storage isolation:**
```typescript
beforeEach(() => {
  // Clear storage between tests
  const MMKV = require('react-native-mmkv').MMKV;
  const instance = new MMKV();
  instance.clearAll();
});
```

### Q: Network request mocks failing

**Symptoms:**
```
TypeError: Cannot read properties of undefined (reading 'then')
```

**Solutions:**

1. **Mock fetch globally:**
```javascript
// jest.setup.js
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })
);
```

2. **Mock axios instances:**
```typescript
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));
```

3. **Use msw (Mock Service Worker) for complex mocking:**
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ id: 1, name: 'John' }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Async Testing Challenges

### Q: act() warnings in React Testing Library

**Symptoms:**
```
Warning: An update to Component inside a test was not wrapped in act(...)
```

**Solutions:**

1. **Wrap state updates in act():**
```typescript
import { act, render } from '@testing-library/react-native';

it('should update on button press', async () => {
  const { getByText } = render(<Counter />);

  await act(async () => {
    fireEvent.press(getByText('Increment'));
  });

  expect(getByText('1')).toBeVisible();
});
```

2. **Use async utilities:**
```typescript
import { waitFor } from '@testing-library/react-native';

await waitFor(() => {
  expect(getByText('Updated')).toBeVisible();
});
```

3. **Mock async operations:**
```typescript
// Mock the async function
const mockAsyncFunction = jest.fn(() => Promise.resolve('result'));

// Use in test
await act(async () => {
  await mockAsyncFunction();
});
```

### Q: Testing hooks with async operations

**Symptoms:**
- Hook tests fail with timeout
- State updates not reflected in tests

**Solutions:**

1. **Use renderHook with waitFor:**
```typescript
import { renderHook, waitFor } from '@testing-library/react-native';

it('should load data', async () => {
  const { result } = renderHook(() => useDataHook());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data).toEqual(expectedData);
});
```

2. **Mock async dependencies:**
```typescript
const mockApiCall = jest.fn(() => Promise.resolve(mockData));

jest.mock('../api', () => ({
  fetchData: mockApiCall,
}));
```

3. **Test loading states:**
```typescript
it('should show loading state', () => {
  mockApiCall.mockImplementation(() => new Promise(() => {})); // Never resolves

  const { result } = renderHook(() => useDataHook());

  expect(result.current.loading).toBe(true);
  expect(result.current.data).toBe(null);
});
```

---

## Component Testing Issues

### Q: Component not rendering in tests

**Symptoms:**
```
TestingLibraryElementError: Unable to find an element with text: "Expected Text"
```

**Solutions:**

1. **Check component props:**
```typescript
// Ensure required props are passed
const { getByText } = render(
  <MyComponent requiredProp="value" />
);
```

2. **Debug component output:**
```typescript
const { debug } = render(<MyComponent />);
debug(); // Prints component tree
```

3. **Check for conditional rendering:**
```typescript
// Component might render differently based on state
expect(screen.queryByText('Conditional Text')).toBeNull(); // When not rendered
expect(screen.getByText('Conditional Text')).toBeVisible(); // When rendered
```

4. **Mock context providers:**
```typescript
const wrapper = ({ children }) => (
  <ThemeProvider value={mockTheme}>
    {children}
  </ThemeProvider>
);

render(<MyComponent />, { wrapper });
```

### Q: Fire events not working

**Symptoms:**
- fireEvent.press() has no effect
- Component state doesn't change

**Solutions:**

1. **Use correct event type:**
```typescript
// For buttons
fireEvent.press(getByRole('button'));

// For text inputs
fireEvent.changeText(getByPlaceholderText('Enter text'), 'new text');

// For scroll views
fireEvent.scroll(getByTestId('scroll-view'), {
  nativeEvent: {
    contentOffset: { y: 100 },
  },
});
```

2. **Wait for state updates:**
```typescript
await waitFor(() => {
  expect(getByText('Updated Text')).toBeVisible();
});
```

3. **Check event handlers are properly attached:**
```typescript
const mockOnPress = jest.fn();
render(<Button onPress={mockOnPress} />);

fireEvent.press(getByRole('button'));
expect(mockOnPress).toHaveBeenCalled();
```

### Q: Testing styled components

**Symptoms:**
- Style-related tests failing
- Cannot find styled component elements

**Solutions:**

1. **Test behavior over styles:**
```typescript
// ❌ Wrong - Testing implementation
expect(getByTestId('button')).toHaveStyle({ backgroundColor: 'blue' });

// ✅ Correct - Testing behavior
expect(getByRole('button')).toBeEnabled();
fireEvent.press(getByRole('button'));
expect(mockOnPress).toHaveBeenCalled();
```

2. **Mock styled-components:**
```typescript
jest.mock('styled-components', () => ({
  default: {
    div: 'div',
    button: 'button',
  },
}));
```

3. **Use test IDs for styled components:**
```typescript
// Component
<StyledButton testID="submit-button" onPress={onPress}>
  Submit
</StyledButton>

// Test
fireEvent.press(getByTestId('submit-button'));
```

---

## Coverage and Reporting

### Q: Coverage reports not generating

**Symptoms:**
- No coverage folder created
- Coverage command fails

**Solutions:**

1. **Check Jest configuration:**
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
```

2. **Run coverage command:**
```bash
npm run test:coverage
# or
npx jest --coverage
```

3. **Check file patterns:**
```javascript
// Ensure test files are included
coverageReporters: [
  'text',
  'lcov',
  'html',
  'json-summary'
],
```

### Q: Coverage not meeting thresholds

**Symptoms:**
- Coverage below required percentage
- CI/CD pipeline failing

**Solutions:**

1. **Identify uncovered code:**
```bash
# Generate detailed HTML report
npm run test:coverage

# Open coverage/index.html to see uncovered lines
```

2. **Add targeted tests:**
```typescript
// For uncovered error handling
it('should handle API errors', async () => {
  mockApiCall.mockRejectedValue(new Error('API Error'));

  render(<DataComponent />);

  await waitFor(() => {
    expect(getByText('Error loading data')).toBeVisible();
  });
});
```

3. **Exclude generated files:**
```javascript
coveragePathIgnorePatterns: [
  '/node_modules/',
  '/coverage/',
  'jest.config.js',
  'babel.config.js',
],
```

### Q: Coverage fluctuations between runs

**Symptoms:**
- Coverage percentage varies slightly between runs

**Solutions:**

1. **Use consistent test data:**
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  // Reset any global state
});
```

2. **Avoid random data in tests:**
```typescript
// ❌ Wrong
const randomId = Math.random();

// ✅ Correct
const fixedId = 'test-id-123';
```

3. **Use deterministic date/time:**
```typescript
// Mock Date
const mockDate = new Date('2025-01-01T12:00:00Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
```

---

## Performance Testing

### Q: Performance tests are slow

**Symptoms:**
- Performance tests take too long
- CI/CD timeouts

**Solutions:**

1. **Profile before optimizing:**
```typescript
// Add performance marks
console.time('component-render');

render(<HeavyComponent />);

console.timeEnd('component-render');
```

2. **Mock heavy operations:**
```typescript
// Mock image loading
jest.mock('expo-image', () => 'MockImage');

// Mock analytics
jest.mock('@segment/analytics-react-native', () => ({
  track: jest.fn(),
}));
```

3. **Use shallow rendering:**
```typescript
import { shallow } from 'enzyme';

const wrapper = shallow(<HeavyComponent />);
expect(wrapper.find('ChildComponent')).toHaveLength(1);
```

### Q: Memory leaks in performance tests

**Symptoms:**
- Memory usage increases over test runs
- Out of memory errors

**Solutions:**

1. **Clean up after tests:**
```typescript
afterEach(() => {
  // Clean up any subscriptions, timers
  jest.clearAllTimers();
  jest.clearAllMocks();
});
```

2. **Mock resource-intensive operations:**
```typescript
// Mock storage operations
jest.mock('../storage', () => ({
  saveData: jest.fn(() => Promise.resolve()),
}));
```

3. **Limit test data size:**
```typescript
// Use smaller datasets for unit tests
const smallDataset = generateTestData(10); // Instead of 1000
```

---

## CI/CD Pipeline Issues

### Q: Tests fail in CI but pass locally

**Symptoms:**
- Local: ✅ Pass
- CI: ❌ Fail

**Solutions:**

1. **Check environment differences:**
```yaml
# Ensure consistent Node version
- uses: actions/setup-node@v3
  with:
    node-version: '18'
```

2. **Install system dependencies:**
```yaml
- name: Install dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y libgtk2.0-0 libgtk-3-0
```

3. **Clear caches:**
```yaml
- name: Clear caches
  run: |
    npm cache clean --force
    npx jest --clearCache
```

4. **Use consistent timezone:**
```javascript
// jest.setup.js
process.env.TZ = 'UTC';
```

### Q: Jest cache issues in CI

**Symptoms:**
- Tests fail with module resolution errors
- Different behavior between runs

**Solutions:**

1. **Clear cache in CI:**
```yaml
- name: Clear Jest cache
  run: npx jest --clearCache
```

2. **Use consistent cache keys:**
```yaml
- name: Cache Jest
  uses: actions/cache@v3
  with:
    path: .jest
    key: jest-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
```

3. **Isolate test runs:**
```yaml
- name: Run tests
  run: npm test -- --runInBand --detectOpenHandles
```

---

## E2E Testing Problems

### Q: Detox tests timing out

**Symptoms:**
- E2E tests fail with timeout errors
- Device/simulator becomes unresponsive

**Solutions:**

1. **Increase timeouts:**
```javascript
// e2e/config.js
module.exports = {
  testTimeout: 120000, // 2 minutes
  device: {
    launchTimeout: 30000,
  },
};
```

2. **Add proper waits:**
```javascript
await waitFor(element(by.id('loading-indicator')))
  .toBeNotVisible()
  .withTimeout(10000);
```

3. **Check device state:**
```javascript
beforeEach(async () => {
  await device.reloadReactNative();
  await device.setLocation(52.3676, 4.9041); // Reset location
});
```

### Q: Element not found in E2E tests

**Symptoms:**
```
DetoxRuntimeError: Cannot find UI element
```

**Solutions:**

1. **Add testID to components:**
```typescript
<View testID="main-container">
  <Text testID="welcome-text">Welcome</Text>
</View>
```

2. **Use proper selectors:**
```javascript
// By testID
element(by.id('welcome-text'))

// By text
element(by.text('Welcome'))

// By accessibility label
element(by.label('Welcome message'))
```

3. **Wait for elements:**
```javascript
await expect(element(by.id('welcome-text'))).toBeVisible();
```

---

## Debugging Techniques

### General Debugging Tips

1. **Use debug() to inspect component trees:**
```typescript
const { debug } = render(<Component />);
debug(); // Prints current component tree
```

2. **Log test execution:**
```typescript
it('should work', () => {
  console.log('Starting test');
  // ... test code
  console.log('Test completed');
});
```

3. **Use Jest debugger:**
```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

4. **Check test isolation:**
```typescript
// Ensure tests don't affect each other
beforeEach(() => {
  jest.clearAllMocks();
  // Reset any global state
});
```

### Common Debug Commands

```bash
# Run specific test
npm test -- --testNamePattern="should handle error"

# Run with verbose output
npm test -- --verbose

# Run with coverage
npm test -- --coverage --watchAll=false

# Debug specific file
npx jest --testPathPattern=Component.test.tsx --no-coverage
```

### Performance Debugging

```typescript
// Measure test execution time
console.time('test-execution');

it('should perform well', async () => {
  const start = performance.now();
  // ... test code
  const end = performance.now();
  console.log(`Test took ${end - start} milliseconds`);
});

console.timeEnd('test-execution');
```

---

## Quick Reference

### Most Common Issues & Solutions

| Issue | Quick Fix |
|-------|-----------|
| Module not found | `npm install && npx jest --clearCache` |
| Async timeout | Use `await` and `waitFor()` |
| Flaky tests | Clear mocks, avoid shared state |
| Mock errors | Check jest.setup.js mocks |
| Coverage low | Add tests for uncovered branches |
| CI failures | Check environment consistency |

### Useful Commands

```bash
# Clear all caches
npm cache clean --force && npx jest --clearCache && rm -rf node_modules/.cache

# Run tests with debugging
NODE_OPTIONS="--inspect-brk" npm test -- --runInBand

# Generate coverage report
npm run test:coverage && open coverage/lcov-report/index.html

# Run specific test file
npx jest src/components/Button.test.tsx

# Run tests matching pattern
npx jest --testNamePattern="error handling"
```

---

## Getting Help

### Internal Resources
- [`COMPLETE_TESTING_GUIDE.md`](../COMPLETE_TESTING_GUIDE.md) - Comprehensive testing documentation
- [`jest.setup.js`](../../jest.setup.js) - Test environment setup
- [`jest.config.js`](../../jest.config.js) - Jest configuration

### External Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)
- [Testing Library Docs](https://testing-library.com/docs/react-native-testing-library/intro/)

---

**© 2025 DKL Organization - Testing FAQ & Troubleshooting**
**Last Updated:** 26 Oktober 2025
**Version:** 1.1.0
**Status:** 🛠️ **COMPREHENSIVE TROUBLESHOOTING GUIDE**

**Happy Testing & Debugging! 🧪🐛**