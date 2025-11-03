import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../theme';
import { Avatar, Badge } from '../ui';
import { useTheme } from '../../contexts/ThemeContext';

interface DashboardHeaderProps {
  userName: string;
  userRole?: string;
  greeting?: string;
  subtitle?: string;
  avatarUrl?: string;
  showLiveIndicator?: boolean;
  variant?: 'participant' | 'admin';
}

/**
 * Modern dashboard header with avatar, greeting, and role badge
 */
export function DashboardHeader({
  userName,
  userRole,
  greeting,
  subtitle,
  avatarUrl,
  showLiveIndicator = false,
  variant = 'participant'
}: DashboardHeaderProps) {
  // Try to get theme, fallback to light mode if ThemeProvider not available
  let isDark = false;
  try {
    const theme = useTheme();
    isDark = theme.isDark;
  } catch (e) {
    // ThemeProvider not available, use light mode
  }
  
  const isAdmin = variant === 'admin';
  
  // Dark mode aware gradients
  const gradientColors: readonly [string, string] = isAdmin
    ? isDark
      ? ['#e67f1c', '#d16b0f']
      : [colors.secondary, colors.secondaryDark]
    : isDark
      ? ['#1d4ed8', '#1e40af']
      : [colors.primary, colors.primaryDark];

  const defaultGreeting = isAdmin
    ? `Welkom terug, ${userName}`
    : `Hallo, ${userName}! 👋`;

  const defaultSubtitle = isAdmin
    ? 'Beheer en monitor de DKL Steps app'
    : 'Blijf in beweging voor een goed doel';

  return (
    <View>
      {showLiveIndicator && (
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>🔴 Live Updates Actief</Text>
        </View>
      )}
      
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Avatar & Name Section */}
          <View style={styles.userSection}>
            <Avatar
              name={userName}
              source={avatarUrl ? { uri: avatarUrl } : undefined}
              size="large"
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>
                {greeting || defaultGreeting}
              </Text>
              <Text style={styles.subtitle}>
                {subtitle || defaultSubtitle}
              </Text>
              {userRole && (
                <Badge
                  variant={isAdmin ? 'warning' : 'success'}
                  size="small"
                  label={userRole}
                  style={styles.roleBadge}
                />
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: '#e8f5e9',
    borderBottomWidth: 1,
    borderBottomColor: '#4ade80',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginRight: spacing.sm,
  },
  liveText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.bodyMedium,
    color: '#2e7d32',
    fontWeight: '600',
  },
  gradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: spacing.radius.xl,
    borderBottomRightRadius: spacing.radius.xl,
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  greeting: {
    ...typography.styles.h3,
    fontFamily: typography.fonts.heading,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
  },
});