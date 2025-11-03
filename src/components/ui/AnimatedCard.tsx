/**
 * AnimatedCard Component
 * Card with tap animations and micro-interactions
 */

import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  Animated,
} from 'react-native';
import { colors, spacing, shadows } from '../../theme';
import { haptics } from '../../utils/haptics';
import { useScaleAnimation } from '../../hooks/useAnimations';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
  variant?: 'elevated' | 'outlined' | 'filled';
  animationType?: 'scale' | 'press' | 'none';
}

function AnimatedCard({
  children,
  onPress,
  style,
  disabled = false,
  hapticFeedback = true,
  variant = 'elevated',
  animationType = 'scale',
}: AnimatedCardProps) {
  const { scaleAnim, press } = useScaleAnimation(1);

  const handlePress = () => {
    if (disabled) return;
    
    if (hapticFeedback) {
      haptics.light();
    }
    
    if (animationType === 'press') {
      press();
    }
    
    onPress?.();
  };

  const variantStyles = {
    elevated: {
      backgroundColor: colors.background.paper,
      ...shadows.md,
    },
    outlined: {
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    filled: {
      backgroundColor: colors.background.subtle,
    },
  };

  const CardWrapper = onPress ? Pressable : View;

  const animatedStyle = animationType !== 'none' ? {
    transform: [{ scale: scaleAnim }],
  } : {};

  return (
    <CardWrapper
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        variantStyles[variant],
        pressed && !disabled && animationType === 'scale' && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        {children}
      </Animated.View>
    </CardWrapper>
  );
}

export default memo(AnimatedCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.radius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  content: {
    width: '100%',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});