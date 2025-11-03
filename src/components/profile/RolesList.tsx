/**
 * RolesList Component
 * Displays user roles with descriptions and active status
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, shadows } from '../../theme';
import { Badge } from '../ui';
import type { Role } from '../../types/api';

interface RolesListProps {
  roles: Role[];
}

export default function RolesList({ roles }: RolesListProps) {
  if (!roles || roles.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Rollen</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔐</Text>
          <Text style={styles.emptyText}>Geen rollen toegewezen</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Rollen ({roles.length})</Text>
      
      <View style={styles.rolesList}>
        {roles.map((role, index) => (
          <View key={role.id || index} style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <View style={styles.roleLeft}>
                <Text style={styles.roleIcon}>🎭</Text>
                <Text style={styles.roleName}>{role.name}</Text>
              </View>
              <Badge
                label={role.is_active !== false ? 'Actief' : 'Inactief'}
                variant={role.is_active !== false ? 'success' : 'neutral'}
                size="small"
                dot
              />
            </View>
            
            {role.description && (
              <Text style={styles.roleDescription}>{role.description}</Text>
            )}
            
            {role.assigned_at && (
              <Text style={styles.roleDate}>
                Toegewezen: {new Date(role.assigned_at).toLocaleDateString('nl-NL', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: spacing.radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.styles.h4,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  rolesList: {
    gap: spacing.md,
  },
  roleCard: {
    backgroundColor: colors.background.gray100,
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  roleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  roleName: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyBold,
    color: colors.text.primary,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  roleDescription: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  roleDate: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
});