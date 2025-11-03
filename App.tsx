import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { useTokenRefresh, defineBackgroundLocationTask } from './src/hooks';
import {
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import {
  RobotoSlab_300Light,
  RobotoSlab_400Regular,
  RobotoSlab_500Medium,
  RobotoSlab_600SemiBold,
  RobotoSlab_700Bold,
} from '@expo-google-fonts/roboto-slab';
import * as SplashScreen from 'expo-splash-screen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import NetworkStatusBanner from './src/components/NetworkStatusBanner';
import LoginScreen from './src/screens/LoginScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GlobalDashboardScreen from './src/screens/GlobalDashboardScreen';
import DigitalBoardScreen from './src/screens/DigitalBoardScreen';
import AdminFundsScreen from './src/screens/AdminFundsScreen';
import EventManagementScreen from './src/screens/EventManagementScreen';
import { colors } from './src/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Register background location task (moet VOOR App render gebeuren)
defineBackgroundLocationTask((location) => {
  console.log('📍 Background location update:', {
    lat: location.latitude.toFixed(6),
    lon: location.longitude.toFixed(6),
    accuracy: location.accuracy,
  });
});

const Stack = createNativeStackNavigator();

// QueryClient met optimale configuratie
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data blijft "fresh" voor 5 minuten
      staleTime: 5 * 60 * 1000,
      
      // Cache blijft 10 minuten in memory
      gcTime: 10 * 60 * 1000, // Was "cacheTime" in React Query v4
      
      // Retry 2x bij falen
      retry: 2,
      
      // Exponential backoff: 1s, 2s, 4s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on window focus (mobile app)
      refetchOnWindowFocus: false,
      
      // Refetch when coming back online
      refetchOnReconnect: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations 1x
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export default function App() {
  // Activate automatic token refresh (prevents "Token expired" errors)
  useTokenRefresh();

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    RobotoSlab_300Light,
    RobotoSlab_400Regular,
    RobotoSlab_500Medium,
    RobotoSlab_600SemiBold,
    RobotoSlab_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show loading screen while fonts load
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.paper }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NetworkStatusBanner />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: true,
            }}
          >
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{
                title: 'Wachtwoord Wijzigen',
              }}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'Dashboard' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Profiel' }}
            />
            <Stack.Screen
              name="GlobalDashboard"
              component={GlobalDashboardScreen}
              options={{ title: 'Globaal Dashboard' }}
            />
            <Stack.Screen
              name="DigitalBoard"
              component={DigitalBoardScreen}
              options={{ title: 'Digitaal Bord' }}
            />
            <Stack.Screen
              name="AdminFunds"
              component={AdminFundsScreen}
              options={{ title: 'Admin Fondsen' }}
            />
            <Stack.Screen
              name="EventManagement"
              component={EventManagementScreen}
              options={{ title: 'Event Management' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
