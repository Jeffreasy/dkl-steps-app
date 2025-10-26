import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ChangePasswordScreen from '../ChangePasswordScreen';
import { apiFetch } from '../../services/api';
import { useNavigation } from '@react-navigation/native';

jest.mock('../../services/api');

describe('ChangePasswordScreen', () => {
  const mockGoBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({ goBack: mockGoBack });
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      buttons?.[0]?.onPress?.();
    });
  });

  describe('Rendering', () => {
    it('renders all form fields correctly', () => {
      const { getByPlaceholderText, getByText } = render(<ChangePasswordScreen />);
      expect(getByPlaceholderText('Voer huidig wachtwoord in')).toBeTruthy();
      expect(getByPlaceholderText('Minimaal 8 karakters')).toBeTruthy();
      expect(getByPlaceholderText('Herhaal nieuw wachtwoord')).toBeTruthy();
      expect(getByText('Wachtwoord vereisten:')).toBeTruthy();
    });

    it('renders password requirements', () => {
      const { getByText } = render(<ChangePasswordScreen />);
      expect(getByText('• Minimaal 8 karakters')).toBeTruthy();
      expect(getByText('• Mag niet gelijk zijn aan huidig wachtwoord')).toBeTruthy();
      expect(getByText('• Aanbevolen: mix van letters, cijfers en symbolen')).toBeTruthy();
    });

    it('renders header correctly', () => {
      const { getAllByText } = render(<ChangePasswordScreen />);
      const titles = getAllByText('Wachtwoord Wijzigen');
      expect(titles.length).toBeGreaterThan(0);
    });
  });

  describe('Validation', () => {
    it('shows error when all fields are empty', () => {
      const { getAllByText } = render(<ChangePasswordScreen />);
      const buttons = getAllByText('Wachtwoord Wijzigen');
      const submitButton = buttons[buttons.length - 1];
      
      fireEvent.press(submitButton);
      expect(getAllByText('Alle velden zijn verplicht').length).toBeGreaterThan(0);
    });

    it('shows error for short new password', () => {
      const { getByPlaceholderText, getAllByText, getByText } = render(<ChangePasswordScreen />);
      const buttons = getAllByText('Wachtwoord Wijzigen');
      const submitButton = buttons[buttons.length - 1];
      
      fireEvent.changeText(getByPlaceholderText('Voer huidig wachtwoord in'), 'oldpass');
      fireEvent.changeText(getByPlaceholderText('Minimaal 8 karakters'), 'short');
      fireEvent.changeText(getByPlaceholderText('Herhaal nieuw wachtwoord'), 'short');
      fireEvent.press(submitButton);
      
      expect(getByText('Nieuw wachtwoord moet minimaal 8 karakters zijn')).toBeTruthy();
    });

    it('shows error when passwords do not match', () => {
      const { getByPlaceholderText, getAllByText, getByText } = render(<ChangePasswordScreen />);
      const buttons = getAllByText('Wachtwoord Wijzigen');
      const submitButton = buttons[buttons.length - 1];
      
      fireEvent.changeText(getByPlaceholderText('Voer huidig wachtwoord in'), 'oldpass123');
      fireEvent.changeText(getByPlaceholderText('Minimaal 8 karakters'), 'newpass123');
      fireEvent.changeText(getByPlaceholderText('Herhaal nieuw wachtwoord'), 'different123');
      fireEvent.press(submitButton);
      
      expect(getByText('Nieuwe wachtwoorden komen niet overeen')).toBeTruthy();
    });

    it('shows error when new password equals current password', () => {
      const { getByPlaceholderText, getAllByText, getByText } = render(<ChangePasswordScreen />);
      const buttons = getAllByText('Wachtwoord Wijzigen');
      const submitButton = buttons[buttons.length - 1];
      
      fireEvent.changeText(getByPlaceholderText('Voer huidig wachtwoord in'), 'samepass123');
      fireEvent.changeText(getByPlaceholderText('Minimaal 8 karakters'), 'samepass123');
      fireEvent.changeText(getByPlaceholderText('Herhaal nieuw wachtwoord'), 'samepass123');
      fireEvent.press(submitButton);
      
      expect(getByText('Nieuw wachtwoord moet verschillen van het huidige wachtwoord')).toBeTruthy();
    });
  });

  describe('Successful Password Change', () => {
    it('calls API with correct data', async () => {
      (apiFetch as jest.Mock).mockResolvedValue({});

      const { getByPlaceholderText, getAllByText } = render(<ChangePasswordScreen />);
      const buttons = getAllByText('Wachtwoord Wijzigen');
      const submitButton = buttons[buttons.length - 1];
      
      fireEvent.changeText(getByPlaceholderText('Voer huidig wachtwoord in'), 'oldpass123');
      fireEvent.changeText(getByPlaceholderText('Minimaal 8 karakters'), 'newpass123');
      fireEvent.changeText(getByPlaceholderText('Herhaal nieuw wachtwoord'), 'newpass123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(apiFetch).toHaveBeenCalledWith('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({
            huidig_wachtwoord: 'oldpass123',
            nieuw_wachtwoord: 'newpass123',
          }),
        });
      });
    });

    it('shows success alert and navigates back', async () => {
      (apiFetch as jest.Mock).mockResolvedValue({});

      const { getByPlaceholderText, getAllByText } = render(<ChangePasswordScreen />);
      const buttons = getAllByText('Wachtwoord Wijzigen');
      const submitButton = buttons[buttons.length - 1];
      
      fireEvent.changeText(getByPlaceholderText('Voer huidig wachtwoord in'), 'oldpass123');
      fireEvent.changeText(getByPlaceholderText('Minimaal 8 karakters'), 'newpass123');
      fireEvent.changeText(getByPlaceholderText('Herhaal nieuw wachtwoord'), 'newpass123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Succes',
          'Wachtwoord succesvol gewijzigd',
          expect.any(Array)
        );
      });

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('displays API error message', async () => {
      (apiFetch as jest.Mock).mockRejectedValue(new Error('Current password incorrect'));

      const { getByPlaceholderText, getAllByText, getByText } = render(<ChangePasswordScreen />);
      const buttons = getAllByText('Wachtwoord Wijzigen');
      const submitButton = buttons[buttons.length - 1];
      
      fireEvent.changeText(getByPlaceholderText('Voer huidig wachtwoord in'), 'wrongpass');
      fireEvent.changeText(getByPlaceholderText('Minimaal 8 karakters'), 'newpass123');
      fireEvent.changeText(getByPlaceholderText('Herhaal nieuw wachtwoord'), 'newpass123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Current password incorrect')).toBeTruthy();
      });
    });
  });

  describe('Security', () => {
    it('uses secure text entry for all password fields', () => {
      const { getByPlaceholderText } = render(<ChangePasswordScreen />);
      expect(getByPlaceholderText('Voer huidig wachtwoord in').props.secureTextEntry).toBe(true);
      expect(getByPlaceholderText('Minimaal 8 karakters').props.secureTextEntry).toBe(true);
      expect(getByPlaceholderText('Herhaal nieuw wachtwoord').props.secureTextEntry).toBe(true);
    });

    it('disables auto-capitalize for all fields', () => {
      const { getByPlaceholderText } = render(<ChangePasswordScreen />);
      expect(getByPlaceholderText('Voer huidig wachtwoord in').props.autoCapitalize).toBe('none');
      expect(getByPlaceholderText('Minimaal 8 karakters').props.autoCapitalize).toBe('none');
      expect(getByPlaceholderText('Herhaal nieuw wachtwoord').props.autoCapitalize).toBe('none');
    });
  });
});