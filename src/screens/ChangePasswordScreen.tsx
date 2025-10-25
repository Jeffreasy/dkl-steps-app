import { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, shadows, components } from '../theme';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleChangePassword = async () => {
    setError('');

    // Validatie
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Alle velden zijn verplicht');
      return;
    }

    if (newPassword.length < 8) {
      setError('Nieuw wachtwoord moet minimaal 8 karakters zijn');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Nieuwe wachtwoorden komen niet overeen');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Nieuw wachtwoord moet verschillen van het huidige wachtwoord');
      return;
    }

    setIsLoading(true);

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          huidig_wachtwoord: currentPassword,
          nieuw_wachtwoord: newPassword,
        }),
      });

      Alert.alert(
        'Succes',
        'Wachtwoord succesvol gewijzigd',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Fout bij wijzigen wachtwoord');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/dkl-logo.webp')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <LinearGradient
          colors={[colors.secondary, colors.secondaryDark]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerIcon}>🔐</Text>
            <Text style={styles.title}>Wachtwoord Wijzigen</Text>
          </View>
          <Text style={styles.subtitle}>
            Wijzig hier je wachtwoord wanneer je dat wilt
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Huidig Wachtwoord</Text>
        <TextInput
          style={styles.input}
          placeholder="Voer huidig wachtwoord in"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        <Text style={styles.label}>Nieuw Wachtwoord</Text>
        <TextInput
          style={styles.input}
          placeholder="Minimaal 8 karakters"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        <Text style={styles.label}>Bevestig Nieuw Wachtwoord</Text>
        <TextInput
          style={styles.input}
          placeholder="Herhaal nieuw wachtwoord"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        <View style={styles.requirements}>
          <Text style={styles.requirementsTitle}>Wachtwoord vereisten:</Text>
          <Text style={styles.requirement}>• Minimaal 8 karakters</Text>
          <Text style={styles.requirement}>• Mag niet gelijk zijn aan huidig wachtwoord</Text>
          <Text style={styles.requirement}>• Aanbevolen: mix van letters, cijfers en symbolen</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonContainer}>
          <Button
            title={isLoading ? 'Wijzigen...' : 'Wachtwoord Wijzigen'}
            onPress={handleChangePassword}
            disabled={isLoading}
            color="#4CAF50"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.subtle,
  },
  content: {
    flexGrow: 1,
  },
  logoContainer: {
    backgroundColor: colors.background.paper,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  headerLogo: {
    width: 240,
    height: 75,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: spacing.radius.xl,
    borderBottomRightRadius: spacing.radius.xl,
    marginBottom: spacing.xl,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  headerIcon: {
    fontSize: 28,
  },
  title: {
    ...typography.styles.h2,
    fontFamily: typography.fonts.heading,
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    textAlign: 'center',
  },
  form: {
    ...components.card.elevated,
    margin: spacing.lg,
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
  requirements: {
    backgroundColor: `${colors.secondary}10`,
    padding: spacing.lg,
    borderRadius: spacing.radius.default,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.secondary}30`,
  },
  requirementsTitle: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  requirement: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
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