/**
 * Badge Component
 * Small status indicators and labels
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string | number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  label,
  variant = 'primary',
  size = 'medium',
  dot = false,
  style,
  textStyle,
}: BadgeProps) {
  const variantColors = {
    primary: {
      bg: `${colors.primary}1A`,
      text: colors.primary,
      dot: colors.primary,
    },
    success: {
      bg: `${colors.status.success}1A`,
      text: colors.status.success,
      dot: colors.status.success,
    },
    warning: {
      bg: `${colors.status.warning}1A`,
      text: colors.status.warning,
      dot: colors.status.warning,
    },
    danger: {
      bg: `${colors.status.error}1A`,
      text: colors.status.error,
      dot: colors.status.error,
    },
    info: {
      bg: `${colors.status.info}1A`,
      text: colors.status.info,
      dot: colors.status.info,
    },
    neutral: {
      bg: colors.background.gray200,
      text: colors.text.secondary,
      dot: colors.text.secondary,
    },
  };

  const sizeStyles = {
    small: {
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      fontSize: 10,
      dotSize: 6,
    },
    medium: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      fontSize: 12,
      dotSize: 8,
    },
    large: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      fontSize: 14,
      dotSize: 10,
    },
  };

  const variantStyle = variantColors[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.bg,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        },
        style,
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,
            {
              width: sizeStyle.dotSize,
              height: sizeStyle.dotSize,
              backgroundColor: variantStyle.dot,
            },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: variantStyle.text,
            fontSize: sizeStyle.fontSize,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: spacing.radius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: spacing.radius.full,
    marginRight: spacing.xs,
  },
  text: {
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '500',
  },
});