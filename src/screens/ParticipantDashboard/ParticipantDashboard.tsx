import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import {
  DashboardHeader,
  SimpleStepDisplay,
  StatsOverview,
  ProgressCard,
  AchievementBadge,
  type Achievement
} from '../../components/dashboard';
import { CustomButton } from '../../components/ui';
import { GeofenceManager } from '../../components/geofencing';
import type { NavigationProp } from '../../types';
import { useMemo, useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useEventData, useGeofencing } from '../../hooks';
import { getPrimaryGeofence } from '../../types/geofencing';
import type { GeofenceStatus } from '../../types/geofencing';

interface ParticipantDashboardProps {
  userName: string;
  displaySteps: number;
  displayRoute: string;
  displayFunds: number;
  wsTotalSteps: number;
  wsConnected: boolean;
  showDelta: boolean;
  delta?: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  navigation: NavigationProp;
}

export function ParticipantDashboard({
  userName,
  displaySteps,
  displayRoute,
  displayFunds,
  wsTotalSteps,
  wsConnected,
  showDelta,
  delta,
  isRefreshing,
  onRefresh,
  onLogout,
  navigation
}: ParticipantDashboardProps) {
  const { showToast } = useToast();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [geofenceStatusState, setGeofenceStatusState] = useState<GeofenceStatus>('unknown');
  const [enableGeofencing, setEnableGeofencing] = useState(false); // Start disabled, enable via UI
  
  // Haal actief event op van backend (alleen als geofencing enabled)
  const { activeEvent, isLoading: isLoadingEvent } = useEventData({
    enabled: enableGeofencing,
    refetchInterval: 5 * 60 * 1000, // 5 minuten
  });
  
  // Get primary geofence voor tracking
  const primaryGeofence = activeEvent ? getPrimaryGeofence(activeEvent) : null;
  
  // Start geofence monitoring (alleen als enabled en event bestaat)
  const { status: geofenceStatus } = useGeofencing({
    geofence: enableGeofencing ? primaryGeofence : null,
    onEnter: (location) => {
      showToast('📍 Je bent binnen het event gebied! Stappen tracking is gestart.', 'success');
    },
    onExit: (location) => {
      showToast('📍 Je hebt het event gebied verlaten. Tracking is gepauzeerd.', 'warning');
    },
  });
  
  // Handle achievement tap
  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    const message = achievement.unlocked
      ? `🎉 ${achievement.title} ontgrendeld!`
      : `${achievement.current}/${achievement.target} - ${achievement.description}`;
    showToast(message, achievement.unlocked ? 'success' : 'info');
  };
  
  // Calculate statistics - altijd 3 kolommen
  const stats = useMemo(() => [
    {
      icon: '🏃',
      label: 'Jouw Route',
      value: displayRoute || 'Niet ingesteld',
      color: colors.primary,
    },
    {
      icon: '💰',
      label: 'Toegewezen Fonds',
      value: displayFunds ? `€${displayFunds}` : '€0',
      color: colors.status.success,
    },
    {
      icon: '🌍',
      label: 'Wereldwijd Totaal',
      value: wsTotalSteps >= 0 ? wsTotalSteps.toLocaleString('nl-NL') : '0',
      color: '#6366f1', // Indigo color voor wereldwijd
    },
  ], [displayRoute, displayFunds, wsTotalSteps]);

  // Define achievements
  const achievements = useMemo((): Achievement[] => [
    {
      id: '1',
      icon: '🏆',
      title: 'Eerste Stap',
      description: 'Maak je eerste stappen',
      target: 100,
      current: displaySteps,
      unlocked: displaySteps >= 100,
      color: '#FFA500',
    },
    {
      id: '2',
      icon: '🎯',
      title: 'Doelgericht',
      description: 'Bereik 2500 stappen',
      target: 2500,
      current: displaySteps,
      unlocked: displaySteps >= 2500,
      color: colors.primary,
    },
    {
      id: '3',
      icon: '⭐',
      title: 'Halve Marathon',
      description: 'Bereik 5000 stappen',
      target: 5000,
      current: displaySteps,
      unlocked: displaySteps >= 5000,
      color: '#9333EA',
    },
    {
      id: '4',
      icon: '🔥',
      title: 'In de Flow',
      description: 'Bereik 7500 stappen',
      target: 7500,
      current: displaySteps,
      unlocked: displaySteps >= 7500,
      color: '#DC2626',
    },
    {
      id: '5',
      icon: '👑',
      title: 'Kampioen',
      description: 'Bereik het doel van 10000',
      target: 10000,
      current: displaySteps,
      unlocked: displaySteps >= 10000,
      color: '#F59E0B',
    },
  ], [displaySteps]);

  // Quick actions - alleen de belangrijkste voor participants
  const quickActions = [
    {
      icon: '👤',
      label: 'Profiel',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      icon: '🔐',
      label: 'Wachtwoord',
      onPress: () => navigation.navigate('ChangePassword'),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Modern Header */}
      <DashboardHeader
        userName={userName}
        variant="participant"
        showLiveIndicator={wsConnected}
      />

      {/* Simple Step Display - User Friendly */}
      <SimpleStepDisplay
        onSync={onRefresh}
        geofenceStatus={enableGeofencing ? geofenceStatus : undefined}
        hasActiveEvent={enableGeofencing && activeEvent !== null}
        enableConditionalTracking={enableGeofencing}
      />
      
      {/* Geofencing Toggle (Beta Feature) */}
      {!enableGeofencing && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Beta Feature</Text>
          <TouchableOpacity
            style={styles.betaCard}
            onPress={() => setEnableGeofencing(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.betaIcon}>📍</Text>
            <View style={styles.betaContent}>
              <Text style={styles.betaTitle}>Event Locatie Tracking</Text>
              <Text style={styles.betaDescription}>
                Automatisch stappen tellen wanneer je binnen event gebied bent
              </Text>
            </View>
            <Text style={styles.betaArrow}>→</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Geofence Manager - Alleen tonen als enabled */}
      {enableGeofencing && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Event Locatie Tracking</Text>
            <TouchableOpacity
              onPress={() => setEnableGeofencing(false)}
              style={styles.disableButton}
            >
              <Text style={styles.disableButtonText}>Uitschakelen</Text>
            </TouchableOpacity>
          </View>
          {activeEvent ? (
            <GeofenceManager
              onStatusChange={(status, isInside) => {
                setGeofenceStatusState(status);
              }}
              showDebugInfo={false}
            />
          ) : (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingText}>
                {isLoadingEvent ? 'Event data laden...' : 'Geen actief event beschikbaar'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Progress Card */}
      <ProgressCard 
        currentSteps={displaySteps}
        showDelta={showDelta}
        delta={delta}
      />

      {/* Statistics Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Jouw Statistieken</Text>
        <StatsOverview stats={stats} columns={3} />
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Prestaties</Text>
        <Text style={styles.sectionSubtitle}>
          Ontgrendel badges door doelen te bereiken
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.achievementsScroll}
          contentContainerStyle={styles.achievementsContent}
        >
          {achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              size="medium"
              onPress={handleAchievementPress}
            />
          ))}
        </ScrollView>
      </View>

      {/* Quick Actions - Compact row */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Snelle Acties</Text>
        <View style={styles.actionsRow}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonIcon}>{action.icon}</Text>
              <Text style={styles.actionButtonLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
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
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  achievementsScroll: {
    marginLeft: spacing.lg,
  },
  achievementsContent: {
    paddingRight: spacing.lg,
    gap: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.background.paper,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonIcon: {
    fontSize: 20,
  },
  actionButtonLabel: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
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
  betaCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: spacing.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: `${colors.primary}40`,
    borderStyle: 'dashed',
  },
  betaIcon: {
    fontSize: 32,
  },
  betaContent: {
    flex: 1,
  },
  betaTitle: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  betaDescription: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  betaArrow: {
    fontSize: 24,
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  disableButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.gray200,
    borderRadius: spacing.radius.md,
  },
  disableButtonText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  loadingCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.background.paper,
    padding: spacing.xl,
    borderRadius: spacing.radius.lg,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
});