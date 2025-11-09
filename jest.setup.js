// Mock React Native Platform globally
global.Platform = {
  OS: 'ios',
  Version: '14.0',
  select: (obj) => obj.ios || obj.default,
  isPad: false,
  isTVOS: false,
  isTV: false,
};

// Mock AppState globally
global.AppState = {
  currentState: 'active',
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
};

// Mock AppState from react-native
jest.mock('react-native/Libraries/AppState/AppState', () => ({
  currentState: 'active',
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
}));

// Mock AppState from react-native
jest.mock('react-native/Libraries/AppState/AppState', () => ({
  currentState: 'active',
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

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

jest.mock('expo-task-manager', () => ({
  TaskManager: {
    defineTask: jest.fn(),
    getRegisteredTasksAsync: jest.fn(() => Promise.resolve([])),
    unregisterTaskAsync: jest.fn(),
    unregisterAllTasksAsync: jest.fn(),
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({
    status: 'granted',
    granted: true,
    canAskAgain: true,
  })),
  requestBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({
    status: 'granted',
    granted: true,
    canAskAgain: true,
  })),
  getForegroundPermissionsAsync: jest.fn(() => Promise.resolve({
    status: 'granted',
    granted: true,
    canAskAgain: true,
  })),
  getBackgroundPermissionsAsync: jest.fn(() => Promise.resolve({
    status: 'granted',
    granted: true,
    canAskAgain: true,
  })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 52.3676,
      longitude: 4.9041,
      altitude: 10,
      accuracy: 5,
      altitudeAccuracy: 1,
      heading: 90,
      speed: 0,
    },
    timestamp: Date.now(),
  })),
  watchPositionAsync: jest.fn(() => Promise.resolve({
    remove: jest.fn(),
  })),
  getLastKnownPositionAsync: jest.fn(() => Promise.resolve({
    coords: {
      latitude: 52.3676,
      longitude: 4.9041,
      altitude: 10,
      accuracy: 5,
      altitudeAccuracy: 1,
      heading: 90,
      speed: 0,
    },
    timestamp: Date.now() - 10000,
  })),
  geocodeAsync: jest.fn(() => Promise.resolve([{
    latitude: 52.3676,
    longitude: 4.9041,
    accuracy: 0.5,
    altitude: 10,
    name: 'Amsterdam',
    region: 'North Holland',
    city: 'Amsterdam',
    postalCode: '1012 JS',
    country: 'Netherlands',
    isoCountryCode: 'NL',
    street: 'Dam Square',
    streetNumber: '1',
    district: 'Centrum',
    subregion: 'Amsterdam',
    timezone: 'Europe/Amsterdam',
  }])),
  reverseGeocodeAsync: jest.fn(() => Promise.resolve([{
    latitude: 52.3676,
    longitude: 4.9041,
    accuracy: 0.5,
    altitude: 10,
    name: 'Dam Square',
    region: 'North Holland',
    city: 'Amsterdam',
    postalCode: '1012 JS',
    country: 'Netherlands',
    isoCountryCode: 'NL',
    street: 'Dam Square',
    streetNumber: '1',
    district: 'Centrum',
    subregion: 'Amsterdam',
    timezone: 'Europe/Amsterdam',
  }])),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Medium: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
  LocationAccuracy: {
    Lowest: 1,
    Low: 2,
    Medium: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
  LocationActivityType: {
    AutomotiveNavigation: 'automotiveNavigation',
    Fitness: 'fitness',
    OtherNavigation: 'otherNavigation',
    Other: 'other',
  },
  LocationGeofencingEventType: {
    Enter: 'enter',
    Exit: 'exit',
  },
  LocationGeofencingRegionState: {
    Inside: 'inside',
    Outside: 'outside',
    Unknown: 'unknown',
  },
  LocationSubscriptionBehavior: {
    BackgroundLocationUpdates: 'backgroundLocationUpdates',
    BackgroundLocationUpdatesAndActivity: 'backgroundLocationUpdatesAndActivity',
  },
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

// Mock React Query - simple version
jest.mock('@tanstack/react-query', () => {
  const mockQueryClient = {
    invalidateQueries: jest.fn(),
    clear: jest.fn(),
    getQueryData: jest.fn(),
    setQueryData: jest.fn(),
  };
  
  return {
    QueryClient: jest.fn(() => mockQueryClient),
    useQueryClient: jest.fn(() => mockQueryClient),
    QueryClientProvider: ({ children }) => children,
    useQuery: jest.fn(() => ({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })),
    useMutation: jest.fn(() => ({
      mutate: jest.fn(),
      isPending: false,
    })),
  };
});

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
  info: jest.fn(),
  group: jest.fn(),
  groupCollapsed: jest.fn(),
  groupEnd: jest.fn(),
  table: jest.fn(),
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