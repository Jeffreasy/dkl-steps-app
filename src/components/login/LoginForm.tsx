import { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet
} from 'react-native';
import { colors, typography, spacing, components } from '../../theme';

interface LoginFormProps {
  email: string;
  password: string;
  error: string;
  isLoading: boolean;
  showPassword: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
}

export function LoginForm({
  email,
  password,
  error,
  isLoading,
  showPassword,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit
}: LoginFormProps) {
  const passwordInputRef = useRef<TextInput>(null);

  return (
    <View style={styles.formSection}>
      {/* Email Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput 
          style={[styles.input, error && !email ? styles.inputError : null]} 
          placeholder="jouw@email.nl" 
          value={email} 
          onChangeText={onEmailChange}
          autoCapitalize="none" 
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          editable={!isLoading}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Wachtwoord</Text>
        <View style={styles.passwordContainer}>
          <TextInput 
            ref={passwordInputRef}
            style={[styles.passwordInput, error && !password ? styles.inputError : null]} 
            placeholder="Je wachtwoord" 
            value={password} 
            onChangeText={onPasswordChange}
            secureTextEntry={!showPassword}
            returnKeyType="go"
            onSubmitEditing={onSubmit}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={onTogglePassword}
            disabled={isLoading}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      {/* Login Button */}
      <TouchableOpacity 
        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
        onPress={onSubmit}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.loginButtonText}>Inloggen...</Text>
          </View>
        ) : (
          <Text style={styles.loginButtonText}>Inloggen</Text>
        )}
      </TouchableOpacity>

      {/* Help Section */}
      <View style={styles.helpSection}>
        <Text style={styles.helpText}>Nog geen account?</Text>
        <TouchableOpacity onPress={() => {
          Linking.openURL('https://www.dekoninklijkeloop.nl/aanmelden');
        }}>
          <Text style={styles.helpLink}>Meld je aan →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formSection: {
    ...components.card.elevated,
    padding: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.styles.label,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    ...components.input.base,
    fontFamily: typography.fonts.body,
  },
  inputError: {
    ...components.input.error,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    ...components.input.base,
    fontFamily: typography.fonts.body,
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    padding: spacing.sm,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    backgroundColor: `${colors.status.error}1A`,
    padding: spacing.md,
    borderRadius: spacing.radius.default,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  error: {
    color: colors.status.error,
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    flex: 1,
  },
  loginButton: {
    ...components.button.primary.view,
    marginTop: spacing.sm,
  },
  loginButtonDisabled: {
    ...components.button.disabled.view,
  },
  loginButtonText: {
    ...components.button.primary.text,
    fontFamily: typography.fonts.bodyBold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  helpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs + 2,
  },
  helpText: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
  helpLink: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.secondary,
  },
});