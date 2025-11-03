import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { apiFetch } from '../services/api';
import type { NavigationProp, ChangePasswordRequest } from '../types';
import { getErrorMessage } from '../types';

interface UseChangePasswordOptions {
  navigation: NavigationProp;
}

interface UseChangePasswordReturn {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  error: string;
  isLoading: boolean;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  handleChangePassword: () => Promise<void>;
}

export function useChangePassword({ navigation }: UseChangePasswordOptions): UseChangePasswordReturn {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = useCallback(async () => {
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
      const requestBody: ChangePasswordRequest = {
        huidig_wachtwoord: currentPassword,
        nieuw_wachtwoord: newPassword,
      };
      
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(requestBody),
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
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      setError(message || 'Fout bij wijzigen wachtwoord');
    } finally {
      setIsLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, navigation]);

  return {
    currentPassword,
    newPassword,
    confirmPassword,
    error,
    isLoading,
    setCurrentPassword: (value: string) => {
      setCurrentPassword(value);
      setError('');
    },
    setNewPassword: (value: string) => {
      setNewPassword(value);
      setError('');
    },
    setConfirmPassword: (value: string) => {
      setConfirmPassword(value);
      setError('');
    },
    handleChangePassword,
  };
}