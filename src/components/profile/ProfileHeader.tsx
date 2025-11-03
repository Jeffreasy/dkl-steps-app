/**
 * ProfileHeader Component
 * Displays user avatar, name, email, and account status
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar, Badge } from '../ui';
import { colors, spacing, typography } from '../../theme';

interface ProfileHeaderProps {
  name: string;
  email: string;
  isActive: boolean;
  primaryRole: string;
}

export default function ProfileHeader({
  name,
  email,
  isActive,
  primaryRole,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <Avatar name={name} size="xlarge" style={styles.avatar} />
      
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
        
        <View style={styles.badges}>
          <Badge
            label={primaryRole}
            variant="primary"
            size="medium"
            style={styles.badge}
          />
          <Badge
            label={isActive ? 'Actief' : 'Inactief'}
            variant={isActive ? 'success' : 'neutral'}
            size="medium"
            dot
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  avatar: {
    marginBottom: spacing.md,
  },
  info: {
    alignItems: 'center',
  },
  name: {
    ...typography.styles.h3,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    marginHorizontal: 0,
  },
});