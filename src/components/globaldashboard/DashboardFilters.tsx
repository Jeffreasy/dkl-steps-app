import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, components } from '../../theme';
import { memo, useState } from 'react';

interface DashboardFiltersProps {
  onSearchChange: (query: string) => void;
  onSortChange: (order: 'asc' | 'desc') => void;
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
}

/**
 * DashboardFilters - Search and sorting controls for dashboard
 */
export const DashboardFilters = memo(function DashboardFilters({
  onSearchChange,
  onSortChange,
  sortOrder,
  searchQuery,
}: DashboardFiltersProps) {
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Zoek route..."
          placeholderTextColor={colors.text.disabled}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sort Controls */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sorteren:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortOrder === 'asc' && styles.sortButtonActive]}
          onPress={() => onSortChange('asc')}
          activeOpacity={0.7}
        >
          <Text style={[styles.sortButtonText, sortOrder === 'asc' && styles.sortButtonTextActive]}>
            ↑ A-Z
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortOrder === 'desc' && styles.sortButtonActive]}
          onPress={() => onSortChange('desc')}
          activeOpacity={0.7}
        >
          <Text style={[styles.sortButtonText, sortOrder === 'desc' && styles.sortButtonTextActive]}>
            ↓ Z-A
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...components.card.base,
    margin: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background.paper,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.subtle,
    borderRadius: spacing.radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearIcon: {
    fontSize: 20,
    color: colors.text.disabled,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
    color: colors.text.secondary,
    marginRight: spacing.md,
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radius.md,
    backgroundColor: colors.background.subtle,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  sortButtonText: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  sortButtonTextActive: {
    color: colors.text.inverse,
  },
});