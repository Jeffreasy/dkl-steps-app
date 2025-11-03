import { memo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../theme';
import type { NavigationProp } from '../types';
import { ScreenHeader } from '../components/ui';
import { PasswordForm, PasswordRequirements } from '../components/password';
import { useChangePassword } from '../hooks/useChangePassword';

function ChangePasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    error,
    isLoading,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleChangePassword,
  } = useChangePassword({ navigation });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Wachtwoord Wijzigen"
        subtitle="Wijzig hier je wachtwoord wanneer je dat wilt"
        gradientColors={[colors.secondary, colors.secondaryDark]}
        icon="🔐"
      />

      <PasswordRequirements />

      <PasswordForm
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        error={error}
        isLoading={isLoading}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onSubmit={handleChangePassword}
      />
    </ScrollView>
  );
}

// Export memoized version
export default memo(ChangePasswordScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.subtle,
  },
  content: {
    flexGrow: 1,
  },
});