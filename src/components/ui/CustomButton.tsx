/**
 * CustomButton Component
 * Herbruikbare button met verschillende variants
 */

import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors, components, typography } from '../../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function CustomButton({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle 
}: Props) {
  const buttonStyle = disabled 
    ? components.button.disabled.view
    : components.button[variant].view;
    
  const buttonTextStyle = disabled
    ? components.button.disabled.text
    : components.button[variant].text;

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.inverse} size="small" />
      ) : (
        <Text style={[
          buttonTextStyle, 
          { fontFamily: typography.fonts.bodyBold },
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Styles kunnen hier als override
});