import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const normalizedRole = role.toLowerCase();
  const isAdmin = normalizedRole === 'admin';
  
  const displayText = isAdmin ? '🎯 Administrator' : '🎯 Staff Lid';
  
  return (
    <View style={styles.roleBadge}>
      <Text style={styles.roleBadgeText}>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});