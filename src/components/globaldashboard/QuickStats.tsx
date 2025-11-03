import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, components } from '../../theme';

interface RouteItem {
  route: string;
  amount: number;
}

interface QuickStatsProps {
  routes: RouteItem[];
  totalFunds: number;
}

export function QuickStats({ routes, totalFunds }: QuickStatsProps) {
  if (routes.length === 0) {
    return null;
  }

  const avgPerRoute = Math.round(totalFunds / routes.length);
  const maxFund = Math.max(...routes.map(r => r.amount));
  const minFund = Math.min(...routes.map(r => r.amount));

  return (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>📈 Statistieken</Text>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Gemiddeld per route:</Text>
        <Text style={styles.statValue}>€{avgPerRoute}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Hoogste fonds:</Text>
        <Text style={styles.statValue}>€{maxFund}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Laagste fonds:</Text>
        <Text style={styles.statValue}>€{minFund}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});