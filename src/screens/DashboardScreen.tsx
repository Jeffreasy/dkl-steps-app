import { useQuery, useQueryClient } from '@tanstack/react-query';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { apiFetch } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useCallback, memo } from 'react';
import { colors, typography, spacing } from '../theme';
import type { NavigationProp, DashboardResponse } from '../types';
import { useAuth, useRefreshOnFocus, useStepsWebSocket } from '../hooks';
import { AdminDashboard } from './AdminDashboard';
import { ParticipantDashboard } from './ParticipantDashboard';

function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [participantId, setParticipantId] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDelta, setShowDelta] = useState(false);
  
  // Use custom hooks
  const { logout: handleLogout, getUser } = useAuth();
  
  // Load user info
  useEffect(() => {
    const loadUserInfo = async () => {
      const user = await getUser();
      if (user) {
        const primaryRole = user.roles.length > 0 ? user.roles[0].name : 'user';
        setUserRole(primaryRole);
        setUserName(user.naam || 'Gebruiker');
        setUserId(user.id || '');
        setParticipantId(user.id || '');
      }
    };
    loadUserInfo();
  }, [getUser]);

  // WebSocket hook for real-time updates (only for participants)
  const normalizedRole = (userRole || '').toLowerCase();
  const isAdminOrStaff = normalizedRole === 'admin' || normalizedRole === 'staff';
  
  const {
    connected: wsConnected,
    latestUpdate,
    totalSteps: wsTotalSteps,
  } = useStepsWebSocket(
    userId,
    !isAdminOrStaff ? participantId : undefined
  );

  // Show delta animation when WebSocket update received
  useEffect(() => {
    if (latestUpdate?.delta && latestUpdate.delta > 0) {
      setShowDelta(true);
      const timer = setTimeout(() => setShowDelta(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [latestUpdate?.delta]);

  // Auto-refresh when screen comes into focus
  useRefreshOnFocus(() => {
    queryClient.invalidateQueries({ queryKey: ['personalDashboard'] });
  });
  
  // Only fetch participant dashboard for actual participants (deelnemer table)
  const { data, isLoading, error } = useQuery<DashboardResponse>({
    queryKey: ['personalDashboard'],
    queryFn: async () => {
      return apiFetch<DashboardResponse>(`/participant/dashboard`);
    },
    enabled: !isAdminOrStaff,
    retry: false,
  });

  // Use WebSocket data if available, otherwise fallback to REST data
  const displaySteps = latestUpdate?.steps ?? data?.steps ?? 0;
  const displayRoute = latestUpdate?.route ?? data?.route ?? 'N/A';
  const displayFunds = latestUpdate?.allocated_funds ?? data?.allocatedFunds ?? 0;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['personalDashboard'] });
    setIsRefreshing(false);
  }, [queryClient]);

  if (isLoading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loading}>Dashboard laden...</Text>
      </View>
    );
  }

  // Admin/Staff Dashboard
  if (isAdminOrStaff) {
    return (
      <AdminDashboard
        userName={userName}
        userRole={userRole || 'staff'}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
        navigation={navigation}
      />
    );
  }

  // Error handling for participants
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.error}>Kon dashboard niet laden</Text>
        <Text style={styles.errorDetail}>{(error as Error).message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Opnieuw Proberen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Participant Dashboard
  return (
    <ParticipantDashboard
      userName={userName}
      displaySteps={displaySteps}
      displayRoute={displayRoute}
      displayFunds={displayFunds}
      wsTotalSteps={wsTotalSteps}
      wsConnected={wsConnected}
      showDelta={showDelta}
      delta={latestUpdate?.delta}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
      onLogout={handleLogout}
      navigation={navigation}
    />
  );
}

// Export memoized version
export default memo(DashboardScreen);

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.default,
  },
  loading: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    marginTop: spacing.md,
    color: colors.text.secondary,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.status.error,
    ...typography.styles.h4,
    fontFamily: typography.fonts.heading,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  errorDetail: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md + 2,
    borderRadius: spacing.radius.md,
  },
  retryButtonText: {
    color: colors.text.inverse,
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
  },
});