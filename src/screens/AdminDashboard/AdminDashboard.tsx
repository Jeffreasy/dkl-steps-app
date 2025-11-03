import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../theme';
import { DashboardHeader, StatsOverview, QuickActionCard } from '../../components/dashboard';
import { CustomButton, Badge } from '../../components/ui';
import type { NavigationProp } from '../../types';
import { useMemo, useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import { logger } from '../../utils/logger';

interface AdminDashboardProps {
  userName: string;
  userRole: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  navigation: NavigationProp;
}

export function AdminDashboard({
  userName,
  userRole,
  isRefreshing,
  onRefresh,
  onLogout,
  navigation
}: AdminDashboardProps) {
  const normalizedRole = userRole.toLowerCase();
  const isAdmin = normalizedRole === 'admin';

  // Fetch real admin stats with better error handling
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalRoutes, setTotalRoutes] = useState<number>(0);
  const [activeToday, setActiveToday] = useState<number>(0);
  const [statsError, setStatsError] = useState<string>('');
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    setStatsLoading(true);
    setStatsError('');
    
    try {
      logger.info('📊 Fetching admin stats...');
      
      // Strategy 1: Try funds distribution endpoint (most reliable)
      try {
        logger.debug('Trying /funds-distribution endpoint');
        const fundsData = await apiFetch<any>('/funds-distribution');
        logger.debug('Funds distribution response:', fundsData);
        
        if (fundsData?.routes && typeof fundsData.routes === 'object') {
          const routesCount = Object.keys(fundsData.routes).length;
          setTotalRoutes(routesCount);
          logger.info(`✅ Found ${routesCount} routes from funds-distribution`);
          setStatsLoading(false);
          return; // Success
        }
      } catch (error) {
        logger.warn('⚠️ funds-distribution endpoint failed:', error);
      }

      // Strategy 2: Try admin route funds endpoint
      try {
        logger.debug('Trying /steps/admin/route-funds endpoint');
        const routeFunds = await apiFetch<any>('/steps/admin/route-funds');
        logger.debug('Route funds response:', routeFunds);
        
        if (Array.isArray(routeFunds)) {
          setTotalRoutes(routeFunds.length);
          logger.info(`✅ Found ${routeFunds.length} routes from route-funds`);
          setStatsLoading(false);
          return; // Success
        }
      } catch (error) {
        logger.warn('⚠️ route-funds endpoint failed:', error);
      }

      // Strategy 3: Try total steps endpoint for activity
      try {
        logger.debug('Trying /total-steps endpoint');
        const totalSteps = await apiFetch<any>('/total-steps?year=2025');
        logger.debug('Total steps response:', totalSteps);
        
        if (totalSteps?.total_steps) {
          // We have step data, show that at least
          logger.info(`✅ Got total steps: ${totalSteps.total_steps}`);
        }
      } catch (error) {
        logger.warn('⚠️ total-steps endpoint failed:', error);
      }

      // If we get here, show helpful message
      logger.warn('⚠️ Could not fetch complete admin stats');
      setStatsError('Beperkte gegevens beschikbaar - gebruik Global Dashboard voor volledig overzicht');
      
    } catch (error) {
      logger.error('❌ Failed to fetch any admin stats:', error);
      setStatsError('Kon geen statistieken ophalen - check je netwerk verbinding');
    } finally {
      setStatsLoading(false);
    }
  };

  // Admin capabilities
  const capabilities = useMemo(() => [
    {
      icon: '🌍',
      title: 'Monitoring',
      description: 'Volg alle deelnemers en routes in real-time',
      available: true,
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'Bekijk gedetailleerde statistieken en rapporten',
      available: true,
    },
    {
      icon: '📺',
      title: 'Live Display',
      description: 'Toon totale stappen op digitaal bord',
      available: true,
    },
    {
      icon: '⚙️',
      title: 'Route Beheer',
      description: 'Configureer en beheer alle routes',
      available: isAdmin,
    },
  ], [isAdmin]);

  // Quick access stats - toon wat beschikbaar is
  const adminStats = useMemo(() => {
    if (statsLoading) {
      return [
        {
          icon: '⏳',
          label: 'Laden...',
          value: 'Even geduld',
          color: colors.text.disabled,
        },
      ];
    }

    if (statsError) {
      return [
        {
          icon: '⚠️',
          label: 'Status',
          value: 'Zie Global Dashboard',
          color: colors.status.warning,
        },
      ];
    }

    return [
      {
        icon: '👥',
        label: 'Totale Deelnemers',
        value: totalUsers > 0 ? totalUsers.toString() : 'Zie Global Dashboard',
        color: colors.primary,
      },
      {
        icon: '🏃',
        label: 'Actieve Routes',
        value: totalRoutes > 0 ? totalRoutes.toString() : 'Geen routes gevonden',
        color: colors.secondary,
      },
      {
        icon: '📈',
        label: 'Vandaag Actief',
        value: activeToday > 0 ? activeToday.toString() : 'Zie live updates',
        color: colors.status.success,
      },
    ];
  }, [totalUsers, totalRoutes, activeToday, statsLoading, statsError]);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={async () => {
            await fetchAdminStats();
            onRefresh();
          }}
          colors={[colors.secondary]}
          tintColor={colors.secondary}
        />
      }
    >
      {/* Modern Header */}
      <DashboardHeader
        userName={userName}
        userRole={userRole}
        variant="admin"
      />

      {/* Admin Stats Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Systeem Overzicht</Text>
        {statsError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerIcon}>ℹ️</Text>
            <Text style={styles.errorBannerText}>{statsError}</Text>
          </View>
        )}
        <StatsOverview stats={adminStats} columns={statsError ? 2 : 3} />
      </View>

      {/* Capabilities Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Jouw Mogelijkheden</Text>
        <View style={styles.capabilitiesCard}>
          {capabilities.map((capability, index) => (
            <View key={index} style={styles.capabilityItem}>
              <View style={styles.capabilityHeader}>
                <Text style={styles.capabilityIcon}>{capability.icon}</Text>
                <Text style={styles.capabilityTitle}>{capability.title}</Text>
                {capability.available ? (
                  <Badge label="✓" variant="success" size="small" />
                ) : (
                  <Badge label="Admin" variant="warning" size="small" />
                )}
              </View>
              <Text style={styles.capabilityDescription}>
                {capability.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Snelle Toegang</Text>
        
        <QuickActionCard
          icon="🌍"
          title="Globaal Dashboard"
          subtitle="Bekijk totale statistieken en fondsen verdeling"
          onPress={() => navigation.navigate('GlobalDashboard')}
        />

        <QuickActionCard
          icon="📺"
          title="Digitaal Bord"
          subtitle="Live display van totale stappen en voortgang"
          onPress={() => navigation.navigate('DigitalBoard')}
        />

        {isAdmin && (
          <QuickActionCard
            icon="⚙️"
            title="Admin Funds Beheer"
            subtitle="Routes configureren en fondsen beheren"
            onPress={() => navigation.navigate('AdminFunds')}
            variant="admin"
          />
        )}

        {isAdmin && (
          <QuickActionCard
            icon="📍"
            title="Event Management"
            subtitle="Beheer events en geofences voor GPS tracking"
            onPress={() => navigation.navigate('EventManagement')}
            variant="admin"
          />
        )}

        <QuickActionCard
          icon="👤"
          title="Mijn Profiel"
          subtitle="Bekijk je account en permissies"
          onPress={() => navigation.navigate('Profile')}
          variant="secondary"
        />

        <QuickActionCard
          icon="🔐"
          title="Wachtwoord Wijzigen"
          subtitle="Update je beveiligde toegang"
          onPress={() => navigation.navigate('ChangePassword')}
          variant="secondary"
        />
      </View>

      {/* Admin Tips */}
      <View style={styles.section}>
        <View style={styles.tipsCard}>
          <LinearGradient
            colors={[`${colors.secondary}1A`, `${colors.secondary}0D`]}
            style={styles.tipsGradient}
          >
            <Text style={styles.tipsIcon}>💡</Text>
            <Text style={styles.tipsTitle}>Admin Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>
                • Trek naar beneden om de nieuwste gegevens te laden
              </Text>
              <Text style={styles.tipItem}>
                • Gebruik het Digitaal Bord voor presentaties
              </Text>
              <Text style={styles.tipItem}>
                • Check het Globaal Dashboard voor overzichten
              </Text>
              {isAdmin && (
                <Text style={styles.tipItem}>
                  • Beheer routes in Admin Funds voor optimale verdeling
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <CustomButton
          title="Uitloggen"
          onPress={onLogout}
          variant="outline"
          size="large"
          fullWidth
        />
      </View>

      {/* Pull to Refresh Hint */}
      <View style={styles.refreshHint}>
        <Text style={styles.refreshHintText}>
          ↓ Trek naar beneden om te vernieuwen
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.subtle,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.status.warning}1A`,
    borderLeftWidth: 4,
    borderLeftColor: colors.status.warning,
    padding: spacing.md,
    borderRadius: spacing.radius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorBannerIcon: {
    fontSize: 20,
  },
  errorBannerText: {
    flex: 1,
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  section: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  capabilitiesCard: {
    backgroundColor: colors.background.paper,
    borderRadius: spacing.radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  capabilityItem: {
    gap: spacing.sm,
  },
  capabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  capabilityIcon: {
    fontSize: 24,
  },
  capabilityTitle: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  capabilityDescription: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginLeft: 32,
  },
  tipsCard: {
    overflow: 'hidden',
    borderRadius: spacing.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsGradient: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: spacing.radius.lg,
  },
  tipsIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  tipsTitle: {
    ...typography.styles.h6,
    fontFamily: typography.fonts.heading,
    color: colors.secondaryDark,
    marginBottom: spacing.md,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  logoutSection: {
    margin: spacing.lg,
    marginTop: spacing.xl,
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
});