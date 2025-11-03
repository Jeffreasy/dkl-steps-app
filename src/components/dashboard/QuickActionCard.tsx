import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, components, shadows } from '../../theme';

interface QuickActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  variant?: 'default' | 'admin' | 'secondary';
}

export function QuickActionCard({ 
  icon, 
  title, 
  subtitle, 
  onPress,
  variant = 'default'
}: QuickActionCardProps) {
  const isAdmin = variant === 'admin';
  const isSecondary = variant === 'secondary';
  
  return (
    <TouchableOpacity 
      style={[
        styles.actionCard,
        isAdmin && styles.actionCardAdmin,
        isSecondary && styles.actionCardSecondary
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <View style={styles.actionContent}>
        <Text style={[
          styles.actionTitle,
          isAdmin && styles.actionTitleAdmin
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.actionSubtitle,
          isAdmin && styles.actionSubtitleAdmin
        ]}>
          {subtitle}
        </Text>
      </View>
      <Text style={[
        styles.actionArrow,
        isAdmin && styles.actionArrowAdmin
      ]}>
        →
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});