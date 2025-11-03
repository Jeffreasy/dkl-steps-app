/**
 * Toast Component
 * Non-blocking notifications met animations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors, spacing, shadows, typography } from '../../theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  visible: boolean;
}

export default function Toast({
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  visible,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in and fade in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      dismissToast();
    }
  }, [visible, duration]);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  // Don't render if never shown
  if (!visible) {
    return null;
  }

  const getIconForType = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ⓘ';
    }
  };

  const getColorsForType = () => {
    switch (type) {
      case 'success':
        return {
          bg: colors.status.success,
          text: colors.text.inverse,
        };
      case 'error':
        return {
          bg: colors.status.error,
          text: colors.text.inverse,
        };
      case 'warning':
        return {
          bg: colors.status.warning,
          text: colors.text.inverse,
        };
      case 'info':
      default:
        return {
          bg: colors.status.info,
          text: colors.text.inverse,
        };
    }
  };

  const typeColors = getColorsForType();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: typeColors.bg,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={dismissToast}
        activeOpacity={0.9}
      >
        <Text style={[styles.icon, { color: typeColors.text }]}>
          {getIconForType()}
        </Text>
        <Text style={[styles.message, { color: typeColors.text }]} numberOfLines={2}>
          {message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: spacing.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.lg,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: spacing.md,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.bodyMedium,
    lineHeight: 20,
  },
});