/**
 * AccountInfo Component
 * Displays account details like ID, last login, created date
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, shadows } from '../../theme';

interface AccountInfoProps {
  userId: string;
  lastLogin?: string;
  createdAt?: string;
  isActive: boolean;
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.iconEmoji}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function AccountInfo({
  userId,
  lastLogin,
  createdAt,
  isActive,
}: AccountInfoProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('nl-NL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Account Informatie</Text>
      
      <View style={styles.content}>
        <InfoRow
          icon="👤"
          label="Gebruikers ID"
          value={userId || 'N/A'}
        />
        
        <InfoRow
          icon="✅"
          label="Status"
          value={isActive ? 'Actief' : 'Inactief'}
        />
        
        {lastLogin && (
          <InfoRow
            icon="🕐"
            label="Laatste login"
            value={formatDate(lastLogin)}
          />
        )}
        
        {createdAt && (
          <InfoRow
            icon="📅"
            label="Account aangemaakt"
            value={formatDate(createdAt)}
          />
        )}
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
  content: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  label: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    flex: 1,
  },
  value: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'right',
  },
});