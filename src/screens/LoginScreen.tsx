import { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing } from '../theme';
import type { NavigationProp } from '../types';
import { LoginHeader, LoginForm, SuccessModal, DevTools } from '../components/login';
import { useLogin } from '../hooks/useLogin';

function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  
  const {
    email,
    password,
    error,
    isLoading,
    showPassword,
    showSuccessModal,
    userName,
    fadeAnim,
    scaleAnim,
    setEmail,
    setPassword,
    setShowPassword,
    handleLogin,
  } = useLogin({ navigation });

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
          <LoginHeader />

          {/* Form Section */}
          <LoginForm
            email={email}
            password={password}
            error={error}
            isLoading={isLoading}
            showPassword={showPassword}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleLogin}
          />

          {/* Quick Test Credentials (DEVELOPMENT ONLY) */}
          <DevTools
            onSelectDeelnemer={() => {
              setEmail('diesbosje@hotmail.com');
              setPassword('DKL2025!');
            }}
            onSelectAdmin={() => {
              setEmail('admin@dekoninklijkeloop.nl');
              setPassword('Bootje@12');
            }}
          />

          {/* Footer */}
          <Text style={styles.footer}>© 2025 De Koninklijke Loop</Text>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        userName={userName}
        fadeAnim={fadeAnim}
        scaleAnim={scaleAnim}
      />
    </LinearGradient>
  );
}

// Export memoized version
export default memo(LoginScreen);

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
  footer: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    color: colors.text.disabled,
    marginTop: spacing.xl,
  },
});