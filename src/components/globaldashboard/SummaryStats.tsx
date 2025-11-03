import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, components } from '../../theme';

interface SummaryStatsProps {
  totalSteps: number;
  totalFunds: number;
  routesCount: number;
}

export function SummaryStats({ totalSteps, totalFunds, routesCount }: SummaryStatsProps) {
  return (
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
          Verdeeld over {routesCount} routes
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});