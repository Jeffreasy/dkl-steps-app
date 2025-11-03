import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import type { RouteFund } from '../../types';

interface RouteListItemProps {
  item: RouteFund;
  onUpdate: (item: RouteFund, increment: number) => void;
  onDelete: (item: RouteFund) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function RouteListItem({
  item,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  selectable = false,
  isSelected = false,
  onToggleSelect,
}: RouteListItemProps) {
  return (
    <View style={[styles.item, isSelected && styles.itemSelected]}>
      <View style={styles.itemContent}>
        {selectable && onToggleSelect && (
          <TouchableOpacity
            onPress={() => onToggleSelect(item.id)}
            style={styles.checkbox}
          >
            <View style={[styles.checkboxInner, isSelected && styles.checkboxSelected]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        )}
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemRoute}>{item.route}</Text>
          <Text style={styles.itemAmount}>€{item.amount}</Text>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        <View style={styles.actionButton}>
          <Button
            title="-10"
            onPress={() => onUpdate(item, -10)}
            color="#f44336"
            disabled={isUpdating || isSelected}
          />
        </View>
        <View style={styles.actionButton}>
          <Button
            title="+10"
            onPress={() => onUpdate(item, 10)}
            color="#4CAF50"
            disabled={isUpdating || isSelected}
          />
        </View>
        <View style={styles.actionButton}>
          <Button
            title="🗑️"
            onPress={() => onDelete(item)}
            color="#9E9E9E"
            disabled={isDeleting || isSelected}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
  },
  itemSelected: {
    backgroundColor: `${colors.primary}10`,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkbox: {
    marginRight: spacing.md,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border.default,
    borderRadius: spacing.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.background.paper,
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemRoute: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '500',
    color: colors.text.primary,
  },
  itemAmount: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.headingBold,
    fontWeight: 'bold',
    color: colors.primary,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  actionButton: {
    minWidth: 60,
  },
});