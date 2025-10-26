import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiFetch } from '../services/api';
import StepCounter from '../components/StepCounter';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { colors, typography, spacing, shadows, components } from '../theme';
import type { NavigationProp, DashboardResponse } from '../types';
import { useAuth, useRefreshOnFocus } from '../hooks';
import { DKLLogo } from '../components/ui';

function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use custom hooks
  const { logout: handleLogout, getUserInfo } = useAuth();
  
  // Load user info
  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfo = await getUserInfo();
      setUserRole(userInfo.role);
      setUserName(userInfo.name || 'Gebruiker');
    };
    loadUserInfo();
  }, [getUserInfo]);

  // Auto-refresh when screen comes into focus
  useRefreshOnFocus(() => {
    queryClient.invalidateQueries({ queryKey: ['personalDashboard'] });
  });
  
  // Check if user is Admin or Staff (from gebruiker table) - case insensitive
  const normalizedRole = (userRole || '').toLowerCase();
  const isAdminOrStaff = normalizedRole === 'admin' || normalizedRole === 'staff';
  
  // Only fetch participant dashboard for actual participants (deelnemer table)
  const { data, isLoading, error } = useQuery<DashboardResponse>({
    queryKey: ['personalDashboard'],
    queryFn: async () => {
      return apiFetch<DashboardResponse>(`/participant/dashboard`);
    },
    enabled: !isAdminOrStaff, // Only fetch if NOT admin/staff
    retry: false, // Don't retry - admin/staff don't have participant data
  });

  // Memoize calculations BEFORE any conditional returns (Rules of Hooks)
  const progressPercentage = useMemo(() =>
    Math.min((data?.steps || 0) / 10000 * 100, 100),
    [data?.steps]
  );
  
  const progressColor = useMemo(() =>
    progressPercentage >= 75 ? '#4CAF50' :
    progressPercentage >= 50 ? '#FF9800' :
    progressPercentage >= 25 ? '#FFC107' : '#9E9E9E',
    [progressPercentage]
  );

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

  // Admin/Staff Dashboard (no participant data)
  if (isAdminOrStaff) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Header - Gradient zoals website */}
        <View style={styles.adminHeaderContainer}>
          <View style={styles.adminLogoContainer}>
            <DKLLogo size="medium" />
          </View>
          <LinearGradient
            colors={[colors.secondary, colors.secondaryDark]}
            style={styles.adminHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Welkom, {userName}</Text>
          </LinearGradient>
        </View>

        {/* Role Badge */}
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            🎯 {userRole === 'admin' || userRole === 'Admin' ? 'Administrator' : 'Staff Lid'}
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Jouw Toegang</Text>
          <View style={styles.accessList}>
            <View style={styles.accessItem}>
              <Text style={styles.accessIcon}>✅</Text>
              <Text style={styles.accessText}>Globaal Dashboard (monitoring)</Text>
            </View>
            <View style={styles.accessItem}>
              <Text style={styles.accessIcon}>✅</Text>
              <Text style={styles.accessText}>Digitaal Bord (live display)</Text>
            </View>
            {(normalizedRole === 'admin') && (
              <View style={styles.accessItem}>
                <Text style={styles.accessIcon}>✅</Text>
                <Text style={styles.accessText}>Admin Funds (route beheer)</Text>
              </View>
            )}
          </View>
          <View style={styles.infoNote}>
            <Text style={styles.infoNoteText}>
              💡 Als admin/staff heb je geen persoonlijke stappen tracking, maar wel toegang tot alle monitoring functionaliteit.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Snelle Toegang</Text>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('GlobalDashboard')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🌍</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Globaal Dashboard</Text>
              <Text style={styles.actionSubtitle}>Bekijk totale statistieken en fondsen</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('DigitalBoard')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📺</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Digitaal Bord</Text>
              <Text style={styles.actionSubtitle}>Live display van totale stappen</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          {(normalizedRole === 'admin') && (
            <TouchableOpacity 
              style={[styles.actionCard, styles.actionCardAdmin]}
              onPress={() => navigation.navigate('AdminFunds')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, styles.actionTitleAdmin]}>Admin Funds Beheer</Text>
                <Text style={[styles.actionSubtitle, styles.actionSubtitleAdmin]}>Routes configureren en beheren</Text>
              </View>
              <Text style={[styles.actionArrow, styles.actionArrowAdmin]}>→</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardSecondary]}
            onPress={() => navigation.navigate('ChangePassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🔐</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Wachtwoord Wijzigen</Text>
              <Text style={styles.actionSubtitle}>Wijzig je beveiligde toegang</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Uitloggen</Text>
          </TouchableOpacity>
        </View>

        {/* Pull to Refresh Hint */}
        <View style={styles.refreshHint}>
          <Text style={styles.refreshHintText}>↓ Trek naar beneden om te vernieuwen</Text>
        </View>
      </ScrollView>
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

  // Participant Dashboard (normal flow with steps tracking)
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={['#4CAF50']}
          tintColor="#4CAF50"
        />
      }
    >
      {/* Header with Greeting - Gradient zoals website */}
      <View>
        <View style={styles.participantLogoContainer}>
          <DKLLogo size="medium" />
        </View>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Hallo, {userName}! 👋</Text>
            <Text style={styles.headerSubtitle}>Blijf in beweging voor een goed doel</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Step Counter Component */}
      <StepCounter onSync={handleRefresh} />

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Jouw Voortgang</Text>
          <Text style={styles.progressPercentage}>{progressPercentage.toFixed(0)}%</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage}%` }
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>
        
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>{data?.steps?.toLocaleString('nl-NL') || 0}</Text>
            <Text style={styles.progressStatLabel}>Huidige Stappen</Text>
          </View>
          <View style={styles.progressStatDivider} />
          <View style={styles.progressStat}>
            <Text style={styles.progressStatValue}>10,000</Text>
            <Text style={styles.progressStatLabel}>Doel</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🏃</Text>
          <Text style={styles.statValue}>{data?.route || 'N/A'}</Text>
          <Text style={styles.statLabel}>Jouw Route</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValueHighlight}>€{data?.allocatedFunds || 0}</Text>
          <Text style={styles.statLabel}>Toegewezen Fonds</Text>
        </View>
      </View>

      {/* Milestone Progress */}
      {data?.steps !== undefined && (
        <View style={styles.milestoneCard}>
          <Text style={styles.milestoneTitle}>🎯 Mijlpalen</Text>
          <View style={styles.milestones}>
            <View style={styles.milestone}>
              <View style={[styles.milestoneCircle, data.steps >= 2500 && styles.milestoneCircleActive]}>
                <Text style={styles.milestoneCheck}>{data.steps >= 2500 ? '✓' : ''}</Text>
              </View>
              <Text style={styles.milestoneText}>2,500</Text>
            </View>
            <View style={styles.milestoneLine} />
            <View style={styles.milestone}>
              <View style={[styles.milestoneCircle, data.steps >= 5000 && styles.milestoneCircleActive]}>
                <Text style={styles.milestoneCheck}>{data.steps >= 5000 ? '✓' : ''}</Text>
              </View>
              <Text style={styles.milestoneText}>5,000</Text>
            </View>
            <View style={styles.milestoneLine} />
            <View style={styles.milestone}>
              <View style={[styles.milestoneCircle, data.steps >= 7500 && styles.milestoneCircleActive]}>
                <Text style={styles.milestoneCheck}>{data.steps >= 7500 ? '✓' : ''}</Text>
              </View>
              <Text style={styles.milestoneText}>7,500</Text>
            </View>
            <View style={styles.milestoneLine} />
            <View style={styles.milestone}>
              <View style={[styles.milestoneCircle, data.steps >= 10000 && styles.milestoneCircleActive]}>
                <Text style={styles.milestoneCheck}>{data.steps >= 10000 ? '✓' : ''}</Text>
              </View>
              <Text style={styles.milestoneText}>10,000</Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Navigation */}
      <View style={styles.navigationSection}>
        <Text style={styles.navigationTitle}>Meer Functies</Text>
        
        <TouchableOpacity 
          style={styles.navCard}
          onPress={() => navigation.navigate('GlobalDashboard')}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Text style={styles.navIcon}>🌍</Text>
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>Globaal Dashboard</Text>
            <Text style={styles.navSubtitle}>Bekijk totale statistieken van alle deelnemers</Text>
          </View>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navCard}
          onPress={() => navigation.navigate('DigitalBoard')}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Text style={styles.navIcon}>📺</Text>
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>Digitaal Bord</Text>
            <Text style={styles.navSubtitle}>Live display van totale stappen</Text>
          </View>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navCard}
          onPress={() => navigation.navigate('ChangePassword')}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Text style={styles.navIcon}>🔐</Text>
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>Wachtwoord Wijzigen</Text>
            <Text style={styles.navSubtitle}>Wijzig je beveiligde toegang</Text>
          </View>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Uitloggen</Text>
        </TouchableOpacity>
      </View>

      {/* Pull to Refresh Hint */}
      <View style={styles.refreshHint}>
        <Text style={styles.refreshHintText}>↓ Trek naar beneden om te vernieuwen</Text>
      </View>
    </ScrollView>
  );
}

// Export memoized version
export default memo(DashboardScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.subtle, // Warme achtergrond ipv wit
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.default,
  },
  
  // Header Styles (oranje gradient zoals website)
  participantLogoContainer: {
    backgroundColor: colors.background.paper,
    paddingTop: Platform.OS === 'ios' ? 60 : spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  header: {
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: spacing.radius.xl,
    borderBottomRightRadius: spacing.radius.xl,
  },
  headerContent: {
    paddingHorizontal: spacing.xl,
  },
  greeting: {
    ...typography.styles.h2,
    fontFamily: typography.fonts.heading,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  // Admin Header (blauw accent zoals website)
  adminHeaderContainer: {
    backgroundColor: colors.background.paper,
  },
  adminLogoContainer: {
    backgroundColor: colors.background.paper,
    paddingTop: Platform.OS === 'ios' ? 60 : spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  adminHeader: {
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: spacing.radius.xl,
    borderBottomRightRadius: spacing.radius.xl,
  },
  title: {
    ...typography.styles.h2,
    fontFamily: typography.fonts.heading,
    color: colors.text.inverse,
  },
  subtitle: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.secondaryLight,
    marginTop: spacing.xs,
  },
  
  // Role Badge
  roleBadge: {
    margin: spacing.lg,
    marginBottom: 0,
    backgroundColor: colors.background.paper,
    padding: spacing.md,
    borderRadius: spacing.radius.xl,
    alignSelf: 'center',
    ...shadows.sm,
  },
  roleBadgeText: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
    color: colors.secondary,
  },
  
  // Info Card (subtiele kleur achtergrond)
  infoCard: {
    ...components.card.elevated,
    margin: spacing.lg,
    backgroundColor: colors.background.paper,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  infoTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  accessList: {
    gap: spacing.md,
  },
  accessItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  accessText: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
  infoNote: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: `${colors.secondary}1A`,
    borderRadius: spacing.radius.default,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  infoNoteText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.secondaryDark,
    lineHeight: 18,
  },
  
  // Progress Card (subtiele oranje accent)
  progressCard: {
    ...components.card.elevated,
    margin: spacing.lg,
    backgroundColor: colors.background.paper,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
  },
  progressPercentage: {
    ...typography.styles.h3,
    fontFamily: typography.fonts.headingBold,
    color: colors.primary,
  },
  progressBarContainer: {
    marginBottom: spacing.lg,
  },
  progressBarBackground: {
    ...components.progress.container,
    height: 14,
    backgroundColor: colors.background.gray200,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: spacing.radius.full,
    overflow: 'hidden',
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStat: {
    flex: 1,
    alignItems: 'center',
  },
  progressStatValue: {
    ...typography.styles.h4,
    fontFamily: typography.fonts.headingBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  progressStatLabel: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
  },
  progressStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border.default,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    ...components.card.base,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderTopWidth: 3,
    borderTopColor: colors.primaryLight,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.styles.h4,
    fontFamily: typography.fonts.headingBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statValueHighlight: {
    ...typography.styles.h3,
    fontFamily: typography.fonts.headingBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    textAlign: 'center',
  },
  
  // Milestone Card (warm achtergrond met oranje accent)
  milestoneCard: {
    ...components.card.elevated,
    margin: spacing.lg,
    backgroundColor: `${colors.primary}08`, // Zeer lichte oranje tint
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  milestoneTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  milestones: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestone: {
    alignItems: 'center',
  },
  milestoneCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  milestoneCircleActive: {
    backgroundColor: colors.primary,
  },
  milestoneCheck: {
    fontSize: 20,
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  milestoneText: {
    fontSize: 11,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  milestoneLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.background.gray200,
    marginHorizontal: spacing.xs,
  },
  
  // Quick Actions & Navigation
  quickActions: {
    margin: spacing.lg,
  },
  quickActionsTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  navigationSection: {
    margin: spacing.lg,
  },
  navigationTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    ...components.card.base,
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.background.paper,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryLight,
  },
  actionCardAdmin: {
    backgroundColor: colors.status.warning,
  },
  actionCardSecondary: {
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: spacing.lg,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  actionTitleAdmin: {
    color: colors.text.inverse,
  },
  actionSubtitle: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
  },
  actionSubtitleAdmin: {
    color: colors.primaryLight,
  },
  actionArrow: {
    fontSize: 28,
    color: colors.text.disabled,
    fontWeight: 'bold',
  },
  actionArrowAdmin: {
    color: colors.text.inverse,
  },
  
  // Nav Cards
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: spacing.radius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}20`, // Meer zichtbare oranje tint
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  navIcon: {
    fontSize: 24,
  },
  navContent: {
    flex: 1,
  },
  navTitle: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  navSubtitle: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
  navArrow: {
    fontSize: 32,
    color: colors.border.default,
    fontWeight: '300',
  },
  
  // Logout
  logoutSection: {
    margin: spacing.lg,
    marginTop: spacing.sm,
  },
  logoutButton: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: spacing.radius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.status.error,
  },
  logoutText: {
    color: colors.status.error,
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
  },
  
  // Misc
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