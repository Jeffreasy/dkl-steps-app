/**
 * CustomButton Component
 * Enhanced herbruikbare button met animations, variants en haptic feedback
 */

import { memo, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  Pressable,
  View
} from 'react-native';
import { colors, components, typography } from '../../theme';
import { haptics } from '../../utils/haptics';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
}

function CustomButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  hapticFeedback = true
}: Props) {
  // Get base styles
  const buttonStyle = disabled
    ? components.button.disabled.view
    : components.button[variant].view;
    
  const buttonTextStyle = disabled
    ? components.button.disabled.text
    : components.button[variant].text;

  // Size-specific styles
  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 32,
    },
  };

  const textSizeStyles = {
    small: { fontSize: 14 },
    medium: { fontSize: 16 },
    large: { fontSize: 18 },
  };

  // Handle press with haptic feedback
  const handlePress = useCallback(() => {
    if (hapticFeedback && !disabled && !loading) {
      haptics.light();
    }
    onPress();
  }, [onPress, disabled, loading, hapticFeedback]);

  // Get spinner color based on variant
  const getSpinnerColor = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return colors.primary;
    }
    return colors.text.inverse;
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        buttonStyle,
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}
      android_ripple={{
        color: variant === 'outline' || variant === 'ghost'
          ? `${colors.primary}30`
          : 'rgba(255, 255, 255, 0.3)'
      }}
    >
      {loading ? (
        <ActivityIndicator color={getSpinnerColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={[
            buttonTextStyle,
            { fontFamily: typography.fonts.bodyBold },
            textSizeStyles[size],
            textStyle
          ]}>
            {title}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
}

// Export memoized version
export default memo(CustomButton);

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});