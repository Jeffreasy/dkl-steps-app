/**
 * CustomInput Component
 * Herbruikbare text input met error states
 */

import { memo } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { components, typography, colors, spacing } from '../../theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

function CustomInput({
  label, 
  error, 
  containerStyle,
  style,
  ...props 
}: Props) {
  return (
    <View style={containerStyle}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TextInput
        style={[
          components.input.base,
          { fontFamily: typography.fonts.body },
          error && components.input.error,
          style
        ]}
        placeholderTextColor={colors.text.disabled}
        {...props}
      />
      {error && (
        <Text style={styles.error}>⚠️ {error}</Text>
      )}
    </View>
  );
}

// Export memoized version
export default memo(CustomInput);

const styles = StyleSheet.create({
  label: {
    ...typography.styles.label,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  error: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
});