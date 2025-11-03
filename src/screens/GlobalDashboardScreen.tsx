import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { apiFetch } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, shadows } from '../theme';
import type { NavigationProp, TotalStepsResponse, FundsDistributionResponse } from '../types';
import { ScreenHeader, LoadingScreen, CustomButton } from '../components/ui';
import {
  SummaryStats,
  RouteDistribution,
  QuickStats,
  RouteStepsChart,
  DashboardFilters,
  RouteDetailModal,
  PrintView
} from '../components/globaldashboard';
import { useAccessControl, useRefreshOnFocus, useAuth } from '../hooks';

function GlobalDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { getPrimaryRole } = useAuth();
  
  // Use new permission-based access control
  const { hasAccess, isChecking, userRole, userRoles } = useAccessControl({
    requiredAnyPermission: [
      ['admin', 'access'],
      ['staff', 'access'],
    ],
    alertMessage: 'Je hebt de vereiste rechten niet voor het Globaal Dashboard.',
  });

  // Get user name and role for display
  const [userName, setUserName] = useState('Gebruiker');
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRoute, setSelectedRoute] = useState<{ route: string; amount: number } | null>(null);
  const [printMode, setPrintMode] = useState(false);
  
  useEffect(() => {
    const loadUserInfo = async () => {
      const role = await getPrimaryRole();
      setUserName(role);
    };
    if (hasAccess) {
      loadUserInfo();
    }
  }, [hasAccess, getPrimaryRole]);

  // Auto-refresh when screen comes into focus
  useRefreshOnFocus(() => {
    if (hasAccess) {
      queryClient.invalidateQueries({ queryKey: ['totalSteps'] });
      queryClient.invalidateQueries({ queryKey: ['fundsDistribution'] });
    }
  }, hasAccess);

  const {
    data: totals,
    isLoading: loadingTotals,
    error: errorTotals,
    refetch: refetchTotals
  } = useQuery<TotalStepsResponse>({
    queryKey: ['totalSteps'],
    queryFn: () => apiFetch<TotalStepsResponse>('/total-steps?year=2025'),
    enabled: hasAccess,
    retry: 2,
    retryDelay: 1000,
  });

  const {
    data: funds,
    isLoading: loadingFunds,
    error: errorFunds,
    refetch: refetchFunds
  } = useQuery<FundsDistributionResponse>({
    queryKey: ['fundsDistribution'],
    queryFn: () => apiFetch<FundsDistributionResponse>('/funds-distribution'),
    enabled: hasAccess,
    retry: 2,
    retryDelay: 1000,
  });

  const handleRefresh = useCallback(() => {
    refetchTotals();
    refetchFunds();
  }, [refetchTotals, refetchFunds]);

  // ⚠️ BELANGRIJK: Alle hooks MOETEN boven conditional returns!
  // Memoize calculations EERST (Rules of Hooks)
  const routesData = useMemo(() =>
    funds?.routes
      ? Object.entries(funds.routes).map(([route, amount]) => ({
          route,
          amount: amount as number
        }))
      : [],
    [funds?.routes]
  );

  // Filter and sort routes
  const filteredAndSortedRoutes = useMemo(() => {
    // First filter by search query
    let result = searchQuery.trim()
      ? routesData.filter(route =>
          route.route.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : routesData;

    // Then sort
    result = [...result].sort((a, b) => {
      const aNum = parseInt(a.route.match(/\d+/)?.[0] || '0');
      const bNum = parseInt(b.route.match(/\d+/)?.[0] || '0');
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    });

    return result;
  }, [routesData, searchQuery, sortOrder]);

  const totalSteps = totals?.total_steps ?? 0;
  const totalFunds = funds?.totalX ?? 0;
  const isLoading = loadingTotals || loadingFunds;
  const hasError = errorTotals || errorFunds;
  const isAdmin = userRoles.some(r => r.toLowerCase() === 'admin');
  
  // Route click handler
  const handleRoutePress = useCallback((route: { route: string; amount: number }) => {
    setSelectedRoute(route);
  }, []);

  // Nu kunnen we conditional returns doen
  if (isChecking) {
    return <LoadingScreen message="Toegang controleren..." color={colors.secondary} />;
  }

  if (!hasAccess) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Geen toegang (403)</Text>
        <Text style={styles.errorDetail}>Alleen Admin en Staff hebben toegang</Text>
      </View>
    );
  }

  if (isLoading && !totals && !funds) {
    return <LoadingScreen message="Dashboard laden..." color={colors.secondary} />;
  }

  // Show error state with retry
  if (hasError && !totals && !funds) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>⚠️ Fout bij laden</Text>
        <Text style={styles.errorDetail}>
          {(errorTotals as Error)?.message || (errorFunds as Error)?.message}
        </Text>
        <CustomButton
          title="Opnieuw Proberen"
          onPress={handleRefresh}
          variant="secondary"
          style={styles.retryButton}
        />
      </View>
    );
  }

  // Print Mode View
  if (printMode) {
    return (
      <View style={styles.container}>
        <View style={styles.printHeader}>
          <CustomButton
            title="← Terug naar Dashboard"
            onPress={() => setPrintMode(false)}
            variant="secondary"
            size="small"
          />
        </View>
        <PrintView
          totalSteps={totalSteps}
          totalFunds={totalFunds}
          routes={filteredAndSortedRoutes}
          date={new Date()}
        />
      </View>
    );
  }

  // Normal Dashboard View
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={['#2196F3']}
          tintColor="#2196F3"
        />
      }
    >
      {/* Header with user info */}
      <ScreenHeader
        title="Globaal Dashboard"
        subtitle={`${userName} • ${userRole}`}
        gradientColors={[colors.secondary, colors.secondaryDark]}
      />

      {/* Summary Statistics */}
      <SummaryStats
        totalSteps={totalSteps}
        totalFunds={totalFunds}
        routesCount={filteredAndSortedRoutes.length}
      />

      {/* Filters */}
      <DashboardFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      {/* Chart Visualization */}
      <RouteStepsChart routes={filteredAndSortedRoutes} />

      {/* Routes Distribution */}
      <RouteDistribution
        routes={filteredAndSortedRoutes}
        onRoutePress={handleRoutePress}
      />

      {/* Quick Stats */}
      <QuickStats routes={filteredAndSortedRoutes} totalFunds={totalFunds} />

      {/* Actions Section */}
      <View style={styles.actionsSection}>
        {/* Print Mode Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setPrintMode(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonIcon}>🖨️</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Print Weergave</Text>
            <Text style={styles.actionButtonSubtitle}>
              Optimale layout voor screenshot/PDF
            </Text>
          </View>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>

        {/* Admin Actions - shown to admins only */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.actionButton, styles.adminButton]}
            onPress={() => navigation.navigate('AdminFunds')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>⚙️</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Admin Funds Beheer</Text>
              <Text style={styles.actionButtonSubtitle}>
                Routes toevoegen, wijzigen of verwijderen
              </Text>
            </View>
            <Text style={styles.actionButtonArrow}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Refresh Hint */}
      <View style={styles.refreshHint}>
        <Text style={styles.refreshHintText}>
          ↓ Trek naar beneden om te vernieuwen
        </Text>
      </View>

      {/* Route Detail Modal */}
      <RouteDetailModal
        visible={selectedRoute !== null}
        route={selectedRoute}
        totalSteps={totalSteps}
        onClose={() => setSelectedRoute(null)}
      />
    </ScrollView>
  );
}

// Export memoized version
export default memo(GlobalDashboardScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.subtle,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  printHeader: {
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  actionsSection: {
    margin: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: spacing.radius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  adminButton: {
    backgroundColor: colors.status.warning,
    borderColor: colors.status.warning,
  },
  actionButtonIcon: {
    fontSize: 32,
    marginRight: spacing.lg,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  actionButtonSubtitle: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
  actionButtonArrow: {
    fontSize: 24,
    color: colors.text.secondary,
    fontWeight: 'bold',
  },
  adminSection: {
    margin: spacing.lg,
    marginBottom: spacing.lg,
  },
  refreshHint: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  refreshHintText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
  },
  retryButton: {
    marginTop: spacing.lg,
    minWidth: 200,
  },
  error: {
    color: colors.status.error,
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  errorDetail: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    color: colors.text.secondary,
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
});