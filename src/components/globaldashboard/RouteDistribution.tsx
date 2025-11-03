import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, components } from '../../theme';

interface RouteItem {
  route: string;
  amount: number;
}

interface RouteDistributionProps {
  routes: RouteItem[];
  onRoutePress?: (route: RouteItem) => void;
}

export function RouteDistribution({ routes, onRoutePress }: RouteDistributionProps) {
  if (routes.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fondsen per Route</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyText}>Geen routes geconfigureerd</Text>
          <Text style={styles.emptySubtext}>
            Admins kunnen routes toevoegen via Admin Funds Beheer
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fondsen per Route</Text>
        <Text style={styles.routeCount}>{routes.length} routes</Text>
      </View>
      
      <View style={styles.routesList}>
        {routes.map((item, index) => (
          <TouchableOpacity
            key={item.route}
            style={styles.routeItem}
            onPress={() => onRoutePress?.(item)}
            activeOpacity={0.7}
          >
            <View style={styles.routeNumber}>
              <Text style={styles.routeNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeName}>{item.route}</Text>
              <Text style={styles.routeAmount}>€{item.amount}</Text>
            </View>
            <Text style={styles.routeChevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    ...components.card.elevated,
    margin: spacing.lg,
    backgroundColor: colors.background.paper,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.styles.h4,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
  },
  routeCount: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    backgroundColor: colors.background.gray50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.radius.lg,
  },
  routesList: {
    gap: 0,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.gray100,
  },
  routeNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.secondary}1A`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  routeNumberText: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyBold,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  routeInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeName: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
  },
  routeAmount: {
    ...typography.styles.h4,
    fontFamily: typography.fonts.headingBold,
    fontWeight: 'bold',
    color: colors.primary,
  },
  routeChevron: {
    fontSize: 24,
    color: colors.text.disabled,
    marginLeft: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl + spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    textAlign: 'center',
    color: colors.text.secondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    color: colors.text.disabled,
    paddingHorizontal: spacing.lg,
  },
});