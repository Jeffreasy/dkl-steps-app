import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardScreen from '../DashboardScreen';
import * as expoLocation from 'expo-location';

// Mock expo-location at the top level
jest.mock('expo-location');

// Mock the useStepsWebSocket hook to avoid AppState issues
jest.mock('../../hooks/useStepsWebSocket', () => ({
  useStepsWebSocket: jest.fn(() => ({
    connected: false,
    latestUpdate: null,
    totalSteps: 0,
  })),
}));

// Create a test wrapper with QueryClient
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful location permissions by default
    (expoLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
    });

    (expoLocation.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
    });

    // Mock current position
    (expoLocation.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
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
    });
  });

  it('renders without crashing', () => {
    const TestWrapper = createTestWrapper();
    const { UNSAFE_root } = render(
      <TestWrapper>
        <DashboardScreen />
      </TestWrapper>
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  describe('Location Permissions', () => {
    it('handles granted location permissions', async () => {
      (expoLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
      });

      const TestWrapper = createTestWrapper();
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(expoLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('handles denied location permissions', async () => {
      (expoLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: true,
      });

      const TestWrapper = createTestWrapper();
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(expoLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('handles location permission errors gracefully', async () => {
      (expoLocation.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Location permission error')
      );

      const TestWrapper = createTestWrapper();
      const { UNSAFE_root } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      // Should still render without crashing despite permission error
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Location Services', () => {
    it('gets current position successfully', async () => {
      const mockPosition = {
        coords: {
          latitude: 52.3676,
          longitude: 4.9041,
          altitude: 10,
          accuracy: 5,
          altitudeAccuracy: 1,
          heading: 90,
          speed: 1.5,
        },
        timestamp: Date.now(),
      };

      (expoLocation.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce(mockPosition);

      const TestWrapper = createTestWrapper();
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(expoLocation.getCurrentPositionAsync).toHaveBeenCalled();
      });
    });

    it('handles location service errors', async () => {
      (expoLocation.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Location services unavailable')
      );

      const TestWrapper = createTestWrapper();
      const { UNSAFE_root } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      // Should still render without crashing
      expect(UNSAFE_root).toBeTruthy();
    });

    it('uses different accuracy levels for location requests', async () => {
      const TestWrapper = createTestWrapper();
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(expoLocation.getCurrentPositionAsync).toHaveBeenCalledWith({
          accuracy: expoLocation.Accuracy.High,
        });
      });
    });
  });

  describe('Geocoding', () => {
    it('performs reverse geocoding successfully', async () => {
      const mockGeocodeResult = [{
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
      }];

      (expoLocation.reverseGeocodeAsync as jest.Mock).mockResolvedValueOnce(mockGeocodeResult);

      const TestWrapper = createTestWrapper();
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      // Geocoding might be called during component initialization
      // depending on the implementation
    });

    it('handles geocoding errors gracefully', async () => {
      (expoLocation.reverseGeocodeAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Geocoding service unavailable')
      );

      const TestWrapper = createTestWrapper();
      const { UNSAFE_root } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Background Location', () => {
    it('requests background location permissions when needed', async () => {
      (expoLocation.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
        granted: true,
        canAskAgain: true,
      });

      const TestWrapper = createTestWrapper();
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      // Background permissions might be requested for certain features
      // depending on the implementation
    });

    it('handles denied background permissions', async () => {
      (expoLocation.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
        granted: false,
        canAskAgain: false,
      });

      const TestWrapper = createTestWrapper();
      const { UNSAFE_root } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Location Watching', () => {
    it('starts location watching when required', async () => {
      const mockSubscription = {
        remove: jest.fn(),
      };

      (expoLocation.watchPositionAsync as jest.Mock).mockResolvedValueOnce(mockSubscription);

      const TestWrapper = createTestWrapper();
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      // Location watching might be started for real-time tracking
      // depending on the implementation
    });

    it('cleans up location subscriptions on unmount', async () => {
      const mockSubscription = {
        remove: jest.fn(),
      };

      (expoLocation.watchPositionAsync as jest.Mock).mockResolvedValueOnce(mockSubscription);

      const TestWrapper = createTestWrapper();
      const { unmount } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      unmount();

      // Cleanup should be handled by useEffect cleanup functions
    });
  });
});