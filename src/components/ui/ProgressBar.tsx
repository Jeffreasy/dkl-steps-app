/**
 * ProgressBar Component
 * Visual progress indicators with animations
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme';

type ProgressVariant = 'primary' | 'success' | 'warning' | 'danger';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: ProgressVariant;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

export default function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  height = 8,
  showLabel = false,
  animated = true,
  style,
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.spring(animatedWidth, {
        toValue: percentage,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      animatedWidth.setValue(percentage);
    }
  }, [percentage, animated]);

  const variantColors = {
    primary: colors.primary,
    success: colors.status.success,
    warning: colors.status.warning,
    danger: colors.status.error,
  };

  const barColor = variantColors[variant];

  const interpolatedWidth = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: `${barColor}20`,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.bar,
            {
              width: interpolatedWidth,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    borderRadius: spacing.radius.full,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: spacing.radius.full,
  },
  label: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});