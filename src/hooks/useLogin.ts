import { useState, useCallback, useRef } from 'react';
import { Animated, Keyboard } from 'react-native';
import { apiFetch } from '../services/api';
import { authStorage } from '../utils/authStorage';
import type { NavigationProp, LoginResponse } from '../types';
import { isAPIError, getErrorMessage } from '../types';
import { logger } from '../utils/logger';
import { haptics } from '../utils/haptics';

interface UseLoginOptions {
  navigation: NavigationProp;
}

interface UseLoginReturn {
  email: string;
  password: string;
  error: string;
  isLoading: boolean;
  showPassword: boolean;
  showSuccessModal: boolean;
  userName: string;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setShowPassword: (show: boolean) => void;
  handleLogin: () => Promise<void>;
}

export function useLogin({ navigation }: UseLoginOptions): UseLoginReturn {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userName, setUserName] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

  const handleLogin = useCallback(async () => {
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
      
      logger.info('Login attempt:', { email: normalizedEmail });
      
      const data = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: normalizedEmail,
          wachtwoord: password
        }),
      });
      
      // Validate response structure (RBAC check)
      if (!data.user?.roles || !Array.isArray(data.user.roles)) {
        throw new Error('Invalid server response: missing roles array');
      }
      
      if (!data.user?.permissions || !Array.isArray(data.user.permissions)) {
        throw new Error('Invalid server response: missing permissions array');
      }
      
      logger.success('Login success (RBAC):', {
        hasToken: !!data.token,
        userId: data.user?.id?.substring(0, 8),
        roles: data.user.roles.map(r => r.name).join(', '),
        permissions: data.user.permissions.length,
      });
      
      // Store tokens and complete user data (RBAC)
      await authStorage.saveToken(data.token);
      await authStorage.saveRefreshToken(data.refresh_token);
      await authStorage.saveUser(data.user);
      
      // Haptic feedback voor success
      await haptics.success();
      
      // Show success feedback with custom modal
      setUserName(data.user.naam);
      setShowSuccessModal(true);
      
      // Animate modal entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Auto navigate after 2.5 seconds
      setTimeout(() => {
        navigation.replace('Dashboard');
      }, 2500);
      
    } catch (error: unknown) {
      logger.error('Login failed:', error);
      
      // User-friendly error messages using type-safe error handling
      let errorMessage = 'Er ging iets mis';
      
      if (isAPIError(error)) {
        if (error.statusCode === 401) {
          errorMessage = 'Verkeerd email adres of wachtwoord';
        } else if (error.statusCode === 403) {
          errorMessage = 'Je account is niet actief. Neem contact op met DKL.';
        } else if (error.statusCode === 404) {
          errorMessage = 'Geen account gevonden met dit email adres';
        } else if (error.isServerError()) {
          errorMessage = 'Server probleem. Probeer het later opnieuw.';
        } else {
          errorMessage = getErrorMessage(error);
        }
      } else if (error instanceof Error && error.message.includes('Network')) {
        errorMessage = 'Geen internetverbinding. Check je wifi/data.';
      } else {
        errorMessage = getErrorMessage(error);
      }
      
      setError(errorMessage);
      
      // Haptic feedback voor error
      await haptics.error();
    } finally {
      setIsLoading(false);
    }
  }, [email, password, navigation, fadeAnim, scaleAnim, validateEmail]);

  return {
    email,
    password,
    error,
    isLoading,
    showPassword,
    showSuccessModal,
    userName,
    fadeAnim,
    scaleAnim,
    setEmail: (value: string) => {
      setEmail(value);
      setError('');
    },
    setPassword: (value: string) => {
      setPassword(value);
      setError('');
    },
    setShowPassword,
    handleLogin,
  };
}