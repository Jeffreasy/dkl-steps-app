import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { memo } from 'react';

interface RouteItem {
  route: string;
  amount: number;
}

interface PrintViewProps {
  totalSteps: number;
  totalFunds: number;
  routes: RouteItem[];
  date: Date;
}

/**
 * PrintView - Simple, print-optimized layout for dashboard data
 * Designed for screenshots or PDF generation
 */
export const PrintView = memo(function PrintView({
  totalSteps,
  totalFunds,
  routes,
  date,
}: PrintViewProps) {
  const formattedDate = date.toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>DKL Stappen Dashboard</Text>
        <Text style={styles.subtitle}>Rapport voor 2025</Text>
        <Text style={styles.date}>Gegenereerd op: {formattedDate}</Text>
      </View>

      {/* Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Samenvatting</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Totaal Stappen</Text>
            <Text style={styles.summaryValue}>
              {totalSteps.toLocaleString('nl-NL')}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Totaal Fondsen</Text>
            <Text style={styles.summaryValue}>€{totalFunds}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Aantal Routes</Text>
            <Text style={styles.summaryValue}>{routes.length}</Text>
          </View>
        </View>
      </View>

      {/* Routes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Routes Overzicht</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.col1]}>#</Text>
            <Text style={[styles.tableHeader, styles.col2]}>Route</Text>
            <Text style={[styles.tableHeader, styles.col3]}>Stappen</Text>
            <Text style={[styles.tableHeader, styles.col4]}>Fondsen</Text>
            <Text style={[styles.tableHeader, styles.col5]}>%</Text>
          </View>

          {/* Table Rows */}
          {routes.map((route, index) => {
            const percentage = totalSteps > 0 
              ? ((route.amount / totalSteps) * 100).toFixed(1)
              : '0';
            
            return (
              <View key={route.route} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
                <Text style={[styles.tableCell, styles.col2, styles.bold]}>
                  {route.route}
                </Text>
                <Text style={[styles.tableCell, styles.col3]}>
                  {route.amount.toLocaleString('nl-NL')}
                </Text>
                <Text style={[styles.tableCell, styles.col4]}>
                  €{route.amount}
                </Text>
                <Text style={[styles.tableCell, styles.col5]}>{percentage}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Statistics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Statistieken</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Hoogste Route</Text>
            <Text style={styles.statValue}>
              {routes.length > 0
                ? routes.reduce((max, r) => (r.amount > max.amount ? r : max)).route
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Gemiddeld per Route</Text>
            <Text style={styles.statValue}>
              {routes.length > 0
                ? Math.round(totalSteps / routes.length).toLocaleString('nl-NL')
                : '0'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Laagste Route</Text>
            <Text style={styles.statValue}>
              {routes.length > 0
                ? routes.reduce((min, r) => (r.amount < min.amount ? r : min)).route
                : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Dit rapport is automatisch gegenereerd door de DKL Stappen App
        </Text>
        <Text style={styles.footerText}>
          © 2025 DKL Foundation - Alle rechten voorbehouden
        </Text>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    backgroundColor: colors.background.subtle,
  },
  title: {
    ...typography.styles.h2,
    fontFamily: typography.fonts.heading,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    textAlign: 'center',
  },
  section: {
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    ...typography.styles.h4,
    fontFamily: typography.fonts.heading,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.styles.h3,
    fontFamily: typography.fonts.headingBold,
    fontWeight: 'bold',
    color: colors.primary,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: spacing.radius.md,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tableHeader: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyBold,
    fontWeight: 'bold',
    color: colors.text.inverse,
    backgroundColor: colors.primary,
    padding: spacing.md,
  },
  tableCell: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.primary,
    padding: spacing.md,
  },
  bold: {
    fontWeight: '600',
  },
  col1: { width: '10%', textAlign: 'center' },
  col2: { width: '25%' },
  col3: { width: '25%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  col5: { width: '20%', textAlign: 'right' },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    padding: spacing.md,
  },
  statLabel: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.background.subtle,
  },
  footerText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});