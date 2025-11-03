/**
 * FeedbackAnimation Component
 * Animated feedback for success/error states with icons
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Modal } from 'react-native';
import { colors, spacing, typography, shadows } from '../../theme';
import { useScaleAnimation, useFadeAnimation } from '../../hooks/useAnimations';
import { haptics } from '../../utils/haptics';

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FeedbackAnimationProps {
  visible: boolean;
  type: FeedbackType;
  title: string;
  message?: string;
  duration?: number;
  onDismiss?: () => void;
}

export default function FeedbackAnimation({
  visible,
  type,
  title,
  message,
  duration = 2000,
  onDismiss,
}: FeedbackAnimationProps) {
  const { scaleAnim } = useScaleAnimation(0);
  const { fadeAnim } = useFadeAnimation(0);

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      if (type === 'success') {
        haptics.success();
      } else if (type === 'error') {
        haptics.error();
      } else {
        haptics.light();
      }

      // Start entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissAnimation();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, type, duration]);

  const dismissAnimation = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✓', color: colors.status.success, bg: `${colors.status.success}15` };
      case 'error':
        return { icon: '✕', color: colors.status.error, bg: `${colors.status.error}15` };
      case 'warning':
        return { icon: '⚠', color: colors.status.warning, bg: `${colors.status.warning}15` };
      case 'info':
      default:
        return { icon: 'ⓘ', color: colors.status.info, bg: `${colors.status.info}15` };
    }
  };

  const { icon, color, bg } = getIconAndColor();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: bg }]}>
            <Text style={[styles.icon, { color }]}>{icon}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: spacing.radius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: '80%',
    ...shadows.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fonts.headingBold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});