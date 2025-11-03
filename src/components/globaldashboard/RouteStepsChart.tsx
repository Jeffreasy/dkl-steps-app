import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, typography, spacing, components } from '../../theme';
import { memo } from 'react';

interface RouteStepsChartProps {
  routes: Array<{ route: string; amount: number }>;
}

/**
 * RouteStepsChart - Simple bar chart showing steps per route
 */
export const RouteStepsChart = memo(function RouteStepsChart({ routes }: RouteStepsChartProps) {
  if (routes.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📊 Route Statistieken</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Geen data beschikbaar</Text>
        </View>
      </View>
    );
  }

  // Calculate max value for scaling
  const maxAmount = Math.max(...routes.map(r => r.amount));
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - spacing.lg * 4;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Route Statistieken</Text>
      <View style={styles.chartArea}>
        {routes.map((route, index) => {
          const barHeight = (route.amount / maxAmount) * 200;
          const barWidth = Math.max(chartWidth / routes.length - 8, 30);
          
          return (
            <View key={route.route} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <Text style={styles.barValue}>
                  {(route.amount / 1000).toFixed(1)}k
                </Text>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: barHeight,
                      width: barWidth,
                      backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary,
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barLabel}>{route.route}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          📈 Totaal: {routes.reduce((sum, r) => sum + r.amount, 0).toLocaleString('nl-NL')} stappen
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...components.card.base,
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
  },
  title: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 250,
    paddingHorizontal: spacing.sm,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 80,
  },
  barWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  bar: {
    borderTopLeftRadius: spacing.radius.sm,
    borderTopRightRadius: spacing.radius.sm,
    minHeight: 20,
  },
  barValue: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  barLabel: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  legend: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    alignItems: 'center',
  },
  legendText: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  emptyState: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
  },
});