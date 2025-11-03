/**
 * PermissionsList Component
 * Displays user permissions grouped by resource
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography, shadows } from '../../theme';
import { Badge } from '../ui';
import type { Permission } from '../../types/api';

interface PermissionsListProps {
  permissions: Permission[];
}

interface GroupedPermissions {
  [resource: string]: string[];
}

export default function PermissionsList({ permissions }: PermissionsListProps) {
  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    const grouped: GroupedPermissions = {};
    
    permissions.forEach(permission => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission.action);
    });
    
    return grouped;
  }, [permissions]);

  const resourceIcons: { [key: string]: string } = {
    'contact': '📧',
    'deelnemer': '👥',
    'route': '🗺️',
    'audit': '📋',
    'funds': '💰',
    'default': '🔒',
  };

  const getResourceIcon = (resource: string): string => {
    return resourceIcons[resource.toLowerCase()] || resourceIcons['default'];
  };

  const actionVariants: { [key: string]: 'success' | 'info' | 'warning' | 'primary' } = {
    'read': 'info',
    'write': 'success',
    'delete': 'warning',
    'create': 'primary',
  };

  const getActionVariant = (action: string): 'success' | 'info' | 'warning' | 'primary' => {
    return actionVariants[action.toLowerCase()] || 'primary';
  };

  if (!permissions || permissions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Permissies</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔐</Text>
          <Text style={styles.emptyText}>Geen permissies toegewezen</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Permissies ({permissions.length})
      </Text>
      
      <View style={styles.permissionsList}>
        {Object.entries(groupedPermissions).map(([resource, actions]) => (
          <View key={resource} style={styles.resourceCard}>
            <View style={styles.resourceHeader}>
              <Text style={styles.resourceIcon}>
                {getResourceIcon(resource)}
              </Text>
              <Text style={styles.resourceName}>{resource}</Text>
              <Badge
                label={actions.length}
                variant="neutral"
                size="small"
              />
            </View>
            
            <View style={styles.actionsContainer}>
              {actions.map((action, index) => (
                <Badge
                  key={`${resource}-${action}-${index}`}
                  label={action}
                  variant={getActionVariant(action)}
                  size="small"
                  style={styles.actionBadge}
                />
              ))}
            </View>
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
  permissionsList: {
    gap: spacing.md,
  },
  resourceCard: {
    backgroundColor: colors.background.gray100,
    borderRadius: spacing.radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  resourceIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  resourceName: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyBold,
    color: colors.text.primary,
    fontWeight: '700',
    textTransform: 'capitalize',
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actionBadge: {
    marginRight: 0,
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