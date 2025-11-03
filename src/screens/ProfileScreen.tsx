/**
 * ProfileScreen - Gebruikersvriendelijke versie
 * Simpel profiel voor participants, alleen essentiële info
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme';
import { useAuth } from '../hooks';
import { CustomButton, Avatar } from '../components/ui';
import type { User } from '../types/api';
import type { NavigationProp } from '../types';

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { getUser, logout } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserData = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Profiel laden...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorText}>Kon profielgegevens niet laden</Text>
        <CustomButton
          title="Opnieuw Proberen"
          onPress={handleRefresh}
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Header */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.header}
        >
          <Avatar
            name={user.naam}
            size="xlarge"
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.naam}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.is_actief && (
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Account Actief</Text>
            </View>
          )}
        </LinearGradient>

        {/* Account Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>📋 Account Informatie</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Naam</Text>
            <Text style={styles.infoValue}>{user.naam}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, styles.statusActive]}>
              {user.is_actief ? '✓ Actief' : '○ Niet actief'}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>⚙️ Instellingen</Text>
          
          <CustomButton
            title="🔐 Wachtwoord Wijzigen"
            onPress={handleChangePassword}
            variant="secondary"
            size="large"
            fullWidth
            style={styles.actionButton}
          />

          <View style={styles.helpText}>
            <Text style={styles.helpIcon}>💡</Text>
            <Text style={styles.helpTextContent}>
              Wijzig regelmatig je wachtwoord voor extra beveiliging
            </Text>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <CustomButton
            title="Uitloggen"
            onPress={logout}
            variant="outline"
            size="large"
            fullWidth
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>DKL Tracker • Versie 1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Trek naar beneden om te vernieuwen
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.subtle,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.subtle,
  },
  loadingText: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.styles.h4,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    minWidth: 200,
  },
  header: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: spacing.radius.xl,
    borderBottomRightRadius: spacing.radius.xl,
  },
  avatar: {
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: spacing.lg,
  },
  name: {
    ...typography.styles.h2,
    fontFamily: typography.fonts.heading,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.md,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radius.full,
    gap: spacing.xs,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  activeText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  infoCard: {
    margin: spacing.lg,
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: spacing.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    ...typography.styles.h6,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  statusActive: {
    color: colors.status.success,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.sm,
  },
  actionsCard: {
    margin: spacing.lg,
    marginTop: 0,
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: spacing.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
  helpText: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: `${colors.primary}0D`,
    borderRadius: spacing.radius.default,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    gap: spacing.sm,
  },
  helpIcon: {
    fontSize: 16,
  },
  helpTextContent: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  logoutSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    fontSize: 11,
  },
});