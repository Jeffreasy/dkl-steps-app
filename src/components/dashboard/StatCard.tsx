import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, components } from '../../theme';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  highlight?: boolean;
}

export function StatCard({ icon, value, label, highlight = false }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: colors.primary,
  },
  statLabel: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    textAlign: 'center',
  },
});