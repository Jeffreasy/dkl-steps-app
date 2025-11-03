import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { colors, typography, spacing, components } from '../../theme';

interface PasswordFormProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  error: string;
  isLoading: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export function PasswordForm({
  currentPassword,
  newPassword,
  confirmPassword,
  error,
  isLoading,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit
}: PasswordFormProps) {
  return (
    <View style={styles.form}>
      <Text style={styles.label}>Huidig Wachtwoord</Text>
      <TextInput
        style={styles.input}
        placeholder="Voer huidig wachtwoord in"
        value={currentPassword}
        onChangeText={onCurrentPasswordChange}
        secureTextEntry
        autoCapitalize="none"
        editable={!isLoading}
      />

      <Text style={styles.label}>Nieuw Wachtwoord</Text>
      <TextInput
        style={styles.input}
        placeholder="Minimaal 8 karakters"
        value={newPassword}
        onChangeText={onNewPasswordChange}
        secureTextEntry
        autoCapitalize="none"
        editable={!isLoading}
      />

      <Text style={styles.label}>Bevestig Nieuw Wachtwoord</Text>
      <TextInput
        style={styles.input}
        placeholder="Herhaal nieuw wachtwoord"
        value={confirmPassword}
        onChangeText={onConfirmPasswordChange}
        secureTextEntry
        autoCapitalize="none"
        editable={!isLoading}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Wijzigen...' : 'Wachtwoord Wijzigen'}
          onPress={onSubmit}
          disabled={isLoading}
          color="#4CAF50"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    ...components.card.elevated,
    margin: spacing.lg,
    marginTop: spacing.xl,
    borderTopWidth: 3,
    borderTopColor: colors.secondary,
  },
  label: {
    ...typography.styles.label,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    ...components.input.base,
    fontFamily: typography.fonts.body,
  },
  error: {
    color: colors.status.error,
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
});