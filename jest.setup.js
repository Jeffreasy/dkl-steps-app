// Mock React Native Platform globally
global.Platform = {
  OS: 'ios',
  Version: '14.0',
  select: (obj) => obj.ios || obj.default,
  isPad: false,
  isTVOS: false,
  isTV: false,
};

// Mock Expo modules that are not available in tests
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      BACKEND_URL: 'https://test-api.example.com/api',
    },
  },
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(),
  preventAutoHideAsync: jest.fn(),
}));

jest.mock('expo-sensors', () => ({
  Pedometer: {
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    watchStepCount: jest.fn(() => ({ remove: jest.fn() })),
    getStepCountAsync: jest.fn(() => Promise.resolve({ steps: 0 })),
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

// Mock MMKV with in-memory storage (must be prefixed with "mock")
const mockMMKVStorage = new Map();

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    getString: jest.fn((key) => mockMMKVStorage.get(key) || null),
    set: jest.fn((key, value) => mockMMKVStorage.set(key, value)),
    delete: jest.fn((key) => mockMMKVStorage.delete(key)),
    clearAll: jest.fn(() => mockMMKVStorage.clear()),
    getAllKeys: jest.fn(() => Array.from(mockMMKVStorage.keys())),
  })),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    replace: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  })),
  useRoute: jest.fn(() => ({
    params: {},
  })),
  useFocusEffect: jest.fn(),
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    clear: jest.fn(),
    getQueryData: jest.fn(),
    setQueryData: jest.fn(),
  })),
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(() => ({
    exp: Date.now() / 1000 + 3600,
    userId: 'test-user-id',
    role: 'deelnemer',
  })),
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })
);

// Mock Alert - Must be done before any imports
global.Alert = {
  alert: jest.fn(),
};

// Setup test environment
beforeEach(() => {
  jest.clearAllMocks();
  // Clear in-memory MMKV storage between tests
  mockMMKVStorage.clear();
});