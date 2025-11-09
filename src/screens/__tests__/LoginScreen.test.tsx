import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import LoginScreen from '../LoginScreen';
import { apiFetch } from '../../services/api';
import { storage } from '../../utils/storage';
import { haptics } from '../../utils/haptics';
import { useNavigation } from '@react-navigation/native';

jest.mock('../../services/api');
jest.mock('../../utils/storage');
jest.mock('../../utils/haptics');

describe('LoginScreen', () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ replace: mockReplace });
    (storage.multiSet as jest.Mock).mockResolvedValue(undefined);
    (haptics.success as jest.Mock).mockResolvedValue(undefined);
    (haptics.error as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders all form elements correctly', () => {
      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      expect(getByPlaceholderText('jouw@email.nl')).toBeTruthy();
      expect(getByPlaceholderText('Je wachtwoord')).toBeTruthy();
      expect(getByText('Inloggen')).toBeTruthy();
      expect(getByText('DKL Steps App')).toBeTruthy();
      expect(getByText('Track je stappen, maak impact!')).toBeTruthy();
    });

    it('renders help section', () => {
      const { getByText } = render(<LoginScreen />);
      expect(getByText('Nog geen account?')).toBeTruthy();
      expect(getByText('Meld je aan →')).toBeTruthy();
    });

    it('renders footer', () => {
      const { getByText } = render(<LoginScreen />);
      expect(getByText('© 2025 De Koninklijke Loop')).toBeTruthy();
    });
  });

  describe('Validation', () => {
    it('shows error for empty email', () => {
      const { getByText } = render(<LoginScreen />);
      fireEvent.press(getByText('Inloggen'));
      expect(getByText('Voer je email adres in')).toBeTruthy();
    });

    it('shows error for invalid email format', () => {
      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('jouw@email.nl'), 'invalid');
      fireEvent.press(getByText('Inloggen'));
      expect(getByText('Voer een geldig email adres in')).toBeTruthy();
    });

    it('shows error for missing password', () => {
      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('jouw@email.nl'), 'test@example.com');
      fireEvent.press(getByText('Inloggen'));
      expect(getByText('Voer je wachtwoord in')).toBeTruthy();
    });

    it('shows error for short password', () => {
      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('jouw@email.nl'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Je wachtwoord'), 'short');
      fireEvent.press(getByText('Inloggen'));
      expect(getByText('Wachtwoord moet minimaal 6 karakters zijn')).toBeTruthy();
    });

    it('clears error when user starts typing', () => {
      const { getByPlaceholderText, getByText, queryByText } = render(<LoginScreen />);
      fireEvent.press(getByText('Inloggen'));
      expect(getByText('Voer je email adres in')).toBeTruthy();
      
      fireEvent.changeText(getByPlaceholderText('jouw@email.nl'), 'test');
      expect(queryByText('Voer je email adres in')).toBeNull();
    });
  });

  describe('Password Visibility', () => {
    it('toggles password visibility', () => {
      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      const passwordInput = getByPlaceholderText('Je wachtwoord');
      
      expect(passwordInput.props.secureTextEntry).toBe(true);
      fireEvent.press(getByText('👁️‍🗨️'));
      expect(passwordInput.props.secureTextEntry).toBe(false);
      fireEvent.press(getByText('👁️'));
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  describe('Login Flow', () => {
    it('calls API with normalized email', async () => {
      (apiFetch as jest.Mock).mockResolvedValue({
        token: 'token',
        refresh_token: 'refresh',
        user: {
          id: '1',
          naam: 'User',
          email: 'test@example.com',
          is_actief: true,
          roles: [{ id: '1', name: 'user', description: 'User', assigned_at: '2023-01-01', is_active: true }],
          permissions: [{ resource: 'contact', action: 'read' }]
        },
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('jouw@email.nl'), '  TEST@EXAMPLE.COM  ');
      fireEvent.changeText(getByPlaceholderText('Je wachtwoord'), 'password123');
      fireEvent.press(getByText('Inloggen'));

      await waitFor(() => {
        expect(apiFetch).toHaveBeenCalledWith('/auth/login', expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test@example.com'),
        }));
      });
    });

    it('stores tokens on successful login', async () => {
      (apiFetch as jest.Mock).mockResolvedValue({
        token: 'fake-token',
        refresh_token: 'fake-refresh',
        user: {
          id: '123',
          naam: 'Test User',
          email: 'test@example.com',
          is_actief: true,
          roles: [{ id: '1', name: 'user', description: 'User', assigned_at: '2023-01-01', is_active: true }],
          permissions: [{ resource: 'contact', action: 'read' }]
        },
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('jouw@email.nl'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Je wachtwoord'), 'password123');
      fireEvent.press(getByText('Inloggen'));

      await waitFor(() => {
        expect(storage.setItem).toHaveBeenCalledWith('token', 'fake-token');
        expect(storage.setItem).toHaveBeenCalledWith('refresh_token', 'fake-refresh');
      });
    });

    it('shows success modal on login', async () => {
      (apiFetch as jest.Mock).mockResolvedValue({
        token: 'token',
        refresh_token: 'refresh',
        user: {
          id: '1',
          naam: 'Test User',
          email: 'test@example.com',
          is_actief: true,
          roles: [{ id: '1', name: 'user', description: 'User', assigned_at: '2023-01-01', is_active: true }],
          permissions: [{ resource: 'contact', action: 'read' }]
        },
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('jouw@email.nl'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Je wachtwoord'), 'password123');
      fireEvent.press(getByText('Inloggen'));

      await waitFor(() => {
        expect(getByText('Succesvol Ingelogd!')).toBeTruthy();
      });
    });

    it('calls haptic feedback on success', async () => {
      (apiFetch as jest.Mock).mockResolvedValue({
        token: 'token',
        refresh_token: 'refresh',
        user: {
          id: '1',
          naam: 'User',
          email: 'test@example.com',
          is_actief: true,
          roles: [{ id: '1', name: 'user', description: 'User', assigned_at: '2023-01-01', is_active: true }],
          permissions: [{ resource: 'contact', action: 'read' }]
        },
      });

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('jouw@email.nl'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Je wachtwoord'), 'password123');
      fireEvent.press(getByText('Inloggen'));

      await waitFor(() => {
        expect(haptics.success).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      (apiFetch as jest.Mock).mockRejectedValue(new Error('Test error'));

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('jouw@email.nl'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Je wachtwoord'), 'password123');
      fireEvent.press(getByText('Inloggen'));

      await waitFor(() => {
        expect(getByText('Test error')).toBeTruthy();
      });
      expect(haptics.error).toHaveBeenCalled();
    });

    it('handles network errors', async () => {
      (apiFetch as jest.Mock).mockRejectedValue(new Error('Network request failed'));

      const { getByPlaceholderText, getByText } = render(<LoginScreen />);
      fireEvent.changeText(getByPlaceholderText('jouw@email.nl'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Je wachtwoord'), 'password123');
      fireEvent.press(getByText('Inloggen'));

      await waitFor(() => {
        expect(getByText(/internetverbinding/i)).toBeTruthy();
      });
    });
  });

  describe('User Interactions', () => {
    it('opens signup link', () => {
      const openURLSpy = jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve(true));
      const { getByText } = render(<LoginScreen />);
      
      fireEvent.press(getByText('Meld je aan →'));
      expect(openURLSpy).toHaveBeenCalledWith('https://www.dekoninklijkeloop.nl/aanmelden');
    });
  });

  describe('Dev Features', () => {
    it('fills test account credentials', () => {
      const { getByText, getByPlaceholderText } = render(<LoginScreen />);
      
      if (__DEV__) {
        fireEvent.press(getByText('Deelnemer (Diesmer)'));
        expect(getByPlaceholderText('jouw@email.nl').props.value).toBe('diesbosje@hotmail.com');
        expect(getByPlaceholderText('Je wachtwoord').props.value).toBe('DKL2025!');
      }
    });

    it('fills admin credentials', () => {
      const { getByText, getByPlaceholderText } = render(<LoginScreen />);
      
      if (__DEV__) {
        fireEvent.press(getByText('Admin (SuperAdmin)'));
        expect(getByPlaceholderText('jouw@email.nl').props.value).toBe('admin@dekoninklijkeloop.nl');
        expect(getByPlaceholderText('Je wachtwoord').props.value).toBe('Bootje@12');
      }
    });
  });
});