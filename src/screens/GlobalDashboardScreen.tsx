import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { apiFetch } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, shadows, components } from '../theme';
import type { NavigationProp, TotalStepsResponse, FundsDistributionResponse } from '../types';
import { ScreenHeader, LoadingScreen } from '../components/ui';

function GlobalDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const checkAccess = async () => {
      const rol = await AsyncStorage.getItem('userRole');
      const name = await AsyncStorage.getItem('userName');
      
      setUserRole(rol || '');
      setUserName(name || '');
      
      // Case-insensitive role check
      const normalizedRole = (rol || '').toLowerCase();
      const allowedRoles = ['admin', 'staff'];
      
      if (allowedRoles.includes(normalizedRole)) {
        setHasAccess(true);
      } else {
        // Show alert before going back
        Alert.alert(
          'Geen Toegang',
          'Alleen Admin en Staff hebben toegang tot het Globaal Dashboard.',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      }
      setIsChecking(false);
    };
    checkAccess();
  }, [navigation]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (hasAccess) {
        queryClient.invalidateQueries({ queryKey: ['totalSteps'] });
        queryClient.invalidateQueries({ queryKey: ['fundsDistribution'] });
      }
    }, [hasAccess, queryClient])
  );

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

  const isLoading = loadingTotals || loadingFunds;
  const hasError = errorTotals || errorFunds;

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
        <View style={styles.retryButton}>
          <Button 
            title="Opnieuw Proberen" 
            onPress={handleRefresh}
            color="#2196F3"
          />
        </View>
      </View>
    );
  }

  // Memoize calculations
  const routesData = useMemo(() =>
    funds?.routes
      ? Object.entries(funds.routes).map(([route, amount]) => ({
          route,
          amount: amount as number
        }))
      : [],
    [funds?.routes]
  );

  // Memoize sorted routes
  const sortedRoutes = useMemo(() =>
    routesData.sort((a, b) => {
      const aNum = parseInt(a.route.match(/\d+/)?.[0] || '0');
      const bNum = parseInt(b.route.match(/\d+/)?.[0] || '0');
      return aNum - bNum;
    }),
    [routesData]
  );

  const totalSteps = totals?.total_steps ?? 0;
  const totalFunds = funds?.totalX ?? 0;

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
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Totaal Stappen (2025)</Text>
          <Text style={styles.summaryValue}>
            {totalSteps.toLocaleString('nl-NL')}
          </Text>
          <Text style={styles.summarySubtext}>
            {(totalSteps / 1000).toFixed(1)}K stappen verzameld
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Totaal Fondsen</Text>
          <Text style={styles.summaryValueHighlight}>
            €{totalFunds.toLocaleString('nl-NL')}
          </Text>
          <Text style={styles.summarySubtext}>
            Verdeeld over {sortedRoutes.length} routes
          </Text>
        </View>
      </View>

      {/* Routes Distribution */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fondsen per Route</Text>
          {sortedRoutes.length > 0 && (
            <Text style={styles.routeCount}>{sortedRoutes.length} routes</Text>
          )}
        </View>
        
        {sortedRoutes.length > 0 ? (
          <View style={styles.routesList}>
            {sortedRoutes.map((item, index) => (
              <View key={item.route} style={styles.routeItem}>
                <View style={styles.routeNumber}>
                  <Text style={styles.routeNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeName}>{item.route}</Text>
                  <Text style={styles.routeAmount}>€{item.amount}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>Geen routes geconfigureerd</Text>
            <Text style={styles.emptySubtext}>
              Admins kunnen routes toevoegen via Admin Funds Beheer
            </Text>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      {sortedRoutes.length > 0 && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📈 Statistieken</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Gemiddeld per route:</Text>
            <Text style={styles.statValue}>
              €{Math.round(totalFunds / sortedRoutes.length)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Hoogste fonds:</Text>
            <Text style={styles.statValue}>
              €{Math.max(...sortedRoutes.map(r => r.amount))}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Laagste fonds:</Text>
            <Text style={styles.statValue}>
              €{Math.min(...sortedRoutes.map(r => r.amount))}
            </Text>
          </View>
        </View>
      )}

      {/* Admin Actions */}
      {userRole.toLowerCase() === 'admin' && (
        <View style={styles.adminSection}>
          <TouchableOpacity 
            style={styles.adminButton}
            onPress={() => navigation.navigate('AdminFunds')}
            activeOpacity={0.7}
          >
            <Text style={styles.adminButtonIcon}>⚙️</Text>
            <View style={styles.adminButtonContent}>
              <Text style={styles.adminButtonTitle}>Admin Funds Beheer</Text>
              <Text style={styles.adminButtonSubtitle}>
                Routes toevoegen, wijzigen of verwijderen
              </Text>
            </View>
            <Text style={styles.adminButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Refresh Hint */}
      <View style={styles.refreshHint}>
        <Text style={styles.refreshHintText}>
          ↓ Trek naar beneden om te vernieuwen
        </Text>
      </View>
    </ScrollView>
  );
}

// Export memoized version
export default memo(GlobalDashboardScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.subtle, // Warme achtergrond
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  summaryCard: {
    ...components.card.elevated,
    margin: spacing.lg,
    backgroundColor: colors.background.paper,
    borderTopWidth: 4,
    borderTopColor: colors.primary,
  },
  summaryItem: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 36,
    fontFamily: typography.fonts.headingBold,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  summaryValueHighlight: {
    fontSize: 36,
    fontFamily: typography.fonts.headingBold,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summarySubtext: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    marginTop: spacing.xs,
  },
  divider: {
    ...components.divider.horizontal,
    marginVertical: spacing.lg,
  },
  section: {
    ...components.card.elevated,
    margin: spacing.lg,
    backgroundColor: colors.background.paper,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.styles.h4,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
  },
  routeCount: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    backgroundColor: colors.background.gray50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radius.lg,
  },
  routesList: {
    gap: 0,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.gray100,
  },
  routeNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.secondary}1A`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  routeNumberText: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyBold,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  routeInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeName: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  routeAmount: {
    ...typography.styles.h4,
    fontFamily: typography.fonts.headingBold,
    fontWeight: 'bold',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl + spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    textAlign: 'center',
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    color: colors.text.disabled,
    paddingHorizontal: spacing.lg,
  },
  statsCard: {
    ...components.card.elevated,
    margin: spacing.lg,
    backgroundColor: colors.background.paper,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  statsTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.gray50,
  },
  statLabel: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
  statValue: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyBold,
    fontWeight: '700',
    color: colors.secondary,
  },
  adminSection: {
    margin: spacing.lg,
    marginBottom: spacing.lg,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.warning,
    padding: spacing.lg,
    borderRadius: spacing.radius.lg,
    ...shadows.md,
  },
  adminButtonIcon: {
    fontSize: 32,
    marginRight: spacing.lg,
  },
  adminButtonContent: {
    flex: 1,
  },
  adminButtonTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    fontWeight: 'bold',
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  adminButtonSubtitle: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.primaryLight,
  },
  adminButtonArrow: {
    fontSize: 24,
    color: colors.text.inverse,
    fontWeight: 'bold',
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
  loading: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    marginTop: spacing.md,
    color: colors.text.secondary,
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