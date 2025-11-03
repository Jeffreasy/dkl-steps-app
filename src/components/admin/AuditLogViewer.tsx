/**
 * AuditLogViewer Component
 * 
 * Displays audit trail of actions performed in the admin panel.
 * Shows who did what, when, with filtering capabilities.
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, components } from '../../theme';
import type { AuditLogEntry } from '../../hooks/useAuditLog';

interface AuditLogViewerProps {
  entries: AuditLogEntry[];
  maxEntries?: number;
  onExport?: () => void;
  onClear?: () => void;
}

export function AuditLogViewer({
  entries,
  maxEntries = 50,
  onExport,
  onClear,
}: AuditLogViewerProps) {
  const displayEntries = entries.slice(-maxEntries).reverse();

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return colors.status.success;
      case 'update': return colors.status.info;
      case 'delete': return colors.status.error;
      case 'batch_delete': return colors.status.error;
      case 'import': return colors.secondary;
      default: return colors.text.secondary;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'batch_delete': return '🗑️🗑️';
      case 'import': return '📥';
      case 'export': return '📤';
      default: return '📝';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (displayEntries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Audit Log</Text>
        <Text style={styles.emptyText}>Geen acties gelogd</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Audit Log ({entries.length} totaal, {displayEntries.length} getoond)
        </Text>
        <View style={styles.headerActions}>
          {onExport && (
            <TouchableOpacity onPress={onExport} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>📤</Text>
            </TouchableOpacity>
          )}
          {onClear && (
            <TouchableOpacity onPress={onClear} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.logScroll} nestedScrollEnabled>
        {displayEntries.map((entry) => (
          <View key={entry.id} style={styles.logEntry}>
            <View style={styles.logHeader}>
              <Text style={styles.logIcon}>{getActionIcon(entry.action)}</Text>
              <View style={styles.logInfo}>
                <Text style={[styles.logAction, { color: getActionColor(entry.action) }]}>
                  {entry.action.toUpperCase()}
                </Text>
                <Text style={styles.logResource}>{entry.resource}</Text>
              </View>
              <Text style={styles.logTime}>{formatTimestamp(entry.timestamp)}</Text>
            </View>
            
            <Text style={styles.logUser}>
              👤 {entry.userName} (ID: {entry.userId})
            </Text>
            
            {entry.details && (
              <Text style={styles.logDetails}>
                {JSON.stringify(entry.details, null, 2)}
              </Text>
            )}
            
            {entry.previousValue && entry.newValue && (
              <View style={styles.logChanges}>
                <Text style={styles.logChangeLabel}>Voor: {JSON.stringify(entry.previousValue)}</Text>
                <Text style={styles.logChangeLabel}>Na: {JSON.stringify(entry.newValue)}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...components.card.elevated,
    margin: spacing.lg,
    marginTop: spacing.xl,
    borderTopWidth: 3,
    borderTopColor: colors.status.info,
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerButtonText: {
    fontSize: 18,
  },
  emptyText: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    color: colors.text.disabled,
    fontStyle: 'italic',
    paddingVertical: spacing.lg,
  },
  logScroll: {
    maxHeight: 300,
  },
  logEntry: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  logInfo: {
    flex: 1,
  },
  logAction: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '700',
  },
  logResource: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
  logTime: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.mono,
    color: colors.text.secondary,
  },
  logUser: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  logDetails: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.mono,
    color: colors.text.secondary,
    backgroundColor: colors.background.gray50,
    padding: spacing.xs,
    marginTop: spacing.xs,
    borderRadius: spacing.radius.sm,
  },
  logChanges: {
    marginTop: spacing.xs,
    padding: spacing.xs,
    backgroundColor: `${colors.status.info}10`,
    borderRadius: spacing.radius.sm,
  },
  logChangeLabel: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.mono,
    color: colors.text.secondary,
  },
});