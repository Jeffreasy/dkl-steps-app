import { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  Image,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, shadows, components } from '../theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<any>();
  const passwordInputRef = useRef<TextInput>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleLogin = async () => {
    // Clear previous errors
    setError('');
    Keyboard.dismiss();
    
    // Validate inputs
    if (!email.trim()) {
      setError('Voer je email adres in');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Voer een geldig email adres in');
      return;
    }
    
    if (!password) {
      setError('Voer je wachtwoord in');
      return;
    }
    
    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters zijn');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Normalize email (lowercase, trim)
      const normalizedEmail = email.trim().toLowerCase();
      
      console.log('Login attempt:', { email: normalizedEmail });
      
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ 
          email: normalizedEmail, 
          wachtwoord: password 
        }),
      });
      
      console.log('Login success:', { 
        hasToken: !!data.token,
        userId: data.user?.id?.substring(0, 8),
        role: data.user?.rol 
      });
      
      // Store tokens and user data
      await AsyncStorage.multiSet([
        ['authToken', data.token],
        ['refreshToken', data.refresh_token || ''],
        ['participantId', data.user.id],
        ['userRole', data.user.rol],
        ['userName', data.user.naam],
      ]);
      
      // Show success feedback
      Alert.alert(
        '✅ Succesvol Ingelogd',
        `Welkom, ${data.user.naam}!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Dashboard')
          }
        ]
      );
      
    } catch (err: any) {
      console.error('Login failed:', err);
      
      // User-friendly error messages
      let errorMessage = err.message || 'Er ging iets mis';
      
      if (errorMessage.includes('401')) {
        errorMessage = 'Verkeerd email adres of wachtwoord';
      } else if (errorMessage.includes('403')) {
        errorMessage = 'Je account is niet actief. Neem contact op met DKL.';
      } else if (errorMessage.includes('404')) {
        errorMessage = 'Geen account gevonden met dit email adres';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server probleem. Probeer het later opnieuw.';
      } else if (errorMessage.includes('Network')) {
        errorMessage = 'Geen internetverbinding. Check je wifi/data.';
      }
      
      setError(errorMessage);
      
      // Haptic feedback on error (vibrate)
      if (Platform.OS === 'ios') {
        // iOS haptic available
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.background.subtle, colors.background.paper]}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Logo/Header Section */}
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/dkl-logo.webp')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>DKL Steps App</Text>
            <Text style={styles.tagline}>Track je stappen, maak impact!</Text>
          </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput 
              style={[styles.input, error && !email ? styles.inputError : null]} 
              placeholder="jouw@email.nl" 
              value={email} 
              onChangeText={(text) => {
                setEmail(text);
                setError(''); // Clear error on type
              }}
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
                onChangeText={(text) => {
                  setPassword(text);
                  setError(''); // Clear error on type
                }}
                secureTextEntry={!showPassword}
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
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
            onPress={handleLogin}
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

          {/* Quick Test Credentials (DEVELOPMENT ONLY) */}
          {__DEV__ && (
            <View style={styles.devSection}>
              <Text style={styles.devTitle}>🧪 Test Accounts</Text>
              <TouchableOpacity 
                style={styles.devButton}
                onPress={() => {
                  setEmail('diesbosje@hotmail.com');
                  setPassword('DKL2025!');
                }}
              >
                <Text style={styles.devButtonText}>Deelnemer (Diesmer)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.devButton}
                onPress={() => {
                  setEmail('admin@dekoninklijkeloop.nl');
                  setPassword('Bootje@12');
                }}
              >
                <Text style={styles.devButtonText}>Admin (SuperAdmin)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>© 2025 De Koninklijke Loop</Text>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl + spacing.sm,
  },
  logo: {
    width: 280,
    height: 100,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.styles.h1,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
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
  devSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  devTitle: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  devButton: {
    backgroundColor: colors.background.gray50,
    padding: spacing.md,
    borderRadius: spacing.radius.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  devButtonText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  footer: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    color: colors.text.disabled,
    marginTop: spacing.xl,
  },
});