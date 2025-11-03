import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, components } from '../../theme';
import { RouteListItem } from './RouteListItem';
import type { RouteFund } from '../../types';

interface RoutesListProps {
  routes: RouteFund[];
  onUpdate: (item: RouteFund, increment: number) => void;
  onDelete: (item: RouteFund) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  showDebug?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

export function RoutesList({
  routes,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  showDebug = false,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
}: RoutesListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Bestaande Routes {routes ? `(${routes.length})` : ''}
      </Text>
      
      {/* Debug info */}
      {showDebug && (
        <Text style={styles.debugInfo}>
          Data type: {Array.isArray(routes) ? 'Array' : typeof routes}{'\n'}
          Length: {routes?.length ?? 'undefined'}
        </Text>
      )}
      
      {routes && Array.isArray(routes) && routes.length > 0 ? (
        <View>
          {routes.map((item: RouteFund) => (
            <RouteListItem
              key={item.id}
              item={item}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
              selectable={selectable}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Geen routes gevonden</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    ...components.card.elevated,
    margin: spacing.lg,
    marginTop: spacing.xl,
    borderTopWidth: 3,
    borderTopColor: colors.status.warning,
  },
  sectionTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    marginBottom: spacing.lg,
    color: colors.text.primary,
  },
  emptyText: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    color: colors.text.disabled,
    fontStyle: 'italic',
    paddingVertical: spacing.lg,
  },
  debugInfo: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.mono,
    color: colors.secondary,
    backgroundColor: `${colors.secondary}1A`,
    padding: spacing.sm,
    borderRadius: spacing.radius.sm,
    marginBottom: spacing.md,
  },
});