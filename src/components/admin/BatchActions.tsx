/**
 * BatchActions Component
 * 
 * Provides multi-select functionality and batch operations for route management.
 * Allows selecting multiple routes and performing bulk actions.
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, components } from '../../theme';
import { CustomButton } from '../ui';
import type { RouteFund } from '../../types';

interface BatchActionsProps {
  selectedIds: string[];
  allItems: RouteFund[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBatchDelete: () => void;
  onBatchUpdate?: (increment: number) => void;
  isProcessing?: boolean;
}

export function BatchActions({
  selectedIds,
  allItems,
  onSelectAll,
  onDeselectAll,
  onBatchDelete,
  onBatchUpdate,
  isProcessing = false,
}: BatchActionsProps) {
  const selectedCount = selectedIds.length;
  const allSelected = selectedCount === allItems.length && allItems.length > 0;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {selectedCount} geselecteerd
        </Text>
        <TouchableOpacity 
          onPress={allSelected ? onDeselectAll : onSelectAll}
          disabled={isProcessing}
        >
          <Text style={styles.selectToggle}>
            {allSelected ? 'Deselecteer alles' : 'Selecteer alles'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        {onBatchUpdate && (
          <>
            <CustomButton
              title="-10 (bulk)"
              onPress={() => onBatchUpdate(-10)}
              variant="outline"
              size="small"
              style={styles.actionButton}
              disabled={isProcessing}
            />
            <CustomButton
              title="+10 (bulk)"
              onPress={() => onBatchUpdate(10)}
              variant="outline"
              size="small"
              style={styles.actionButton}
              disabled={isProcessing}
            />
          </>
        )}
        <CustomButton
          title={`Verwijder ${selectedCount}`}
          onPress={onBatchDelete}
          variant="danger"
          size="small"
          style={styles.deleteButton}
          disabled={isProcessing}
        />
      </View>

      {isProcessing && (
        <Text style={styles.processingText}>Verwerken...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...components.card.elevated,
    margin: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.styles.h6,
    fontFamily: typography.fonts.headingBold,
    color: colors.text.primary,
  },
  selectToggle: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  deleteButton: {
    flex: 1,
    minWidth: 120,
  },
  processingText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.md,
    textAlign: 'center',
  },
});