import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AdminFundsScreen from '../AdminFundsScreen';
import { apiFetch } from '../../services/api';
import { storage } from '../../utils/storage';

// Mock dependencies
jest.mock('../../services/api');
jest.mock('../../utils/storage');

// Mock hooks module
const mockUseRequireAdmin = jest.fn();
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useRequireAdmin: () => mockUseRequireAdmin(),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockStorage = storage as jest.Mocked<typeof storage>;

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock React Query hooks
const mockInvalidateQueries = jest.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => mockQueryClient,
    useQuery: jest.fn(),
    useMutation: jest.fn(),
  };
});

const { useQuery, useMutation } = require('@tanstack/react-query');

describe('AdminFundsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockClear();
    mockInvalidateQueries.mockClear();
    (Alert.alert as jest.Mock).mockClear();
    
    // Default mocks
    mockStorage.getItem.mockResolvedValue('admin');
  });

  describe('Access Control', () => {
    it('shows loading screen while checking access', () => {
      mockUseRequireAdmin.mockReturnValue({ hasAccess: false, isChecking: true, userRole: null });
      useQuery.mockReturnValue({ data: undefined, isLoading: false, error: null });
      useMutation.mockReturnValue({ mutate: jest.fn(), isPending: false });

      render(<AdminFundsScreen />);

      expect(screen.getByText('Toegang controleren...')).toBeTruthy();
    });

    it('shows access denied screen when not admin', () => {
      mockUseRequireAdmin.mockReturnValue({ hasAccess: false, isChecking: false, userRole: 'deelnemer' });
      useQuery.mockReturnValue({ data: undefined, isLoading: false, error: null });
      useMutation.mockReturnValue({ mutate: jest.fn(), isPending: false });

      render(<AdminFundsScreen />);

      expect(screen.getByText('Geen toegang (403)')).toBeTruthy();
      expect(screen.getByText('Alleen Admins hebben toegang')).toBeTruthy();
    });

    it('loads data when admin access granted', async () => {
      mockUseRequireAdmin.mockReturnValue({ hasAccess: true, isChecking: false, userRole: 'admin' });
      useQuery.mockReturnValue({ 
        data: [{ id: 1, route: '5 KM', amount: 50 }], 
        isLoading: false, 
        error: null 
      });
      useMutation.mockReturnValue({ mutate: jest.fn(), isPending: false });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText('5 KM')).toBeTruthy();
      });
    });
  });

  describe('Data Loading', () => {
    beforeEach(() => {
      mockUseRequireAdmin.mockReturnValue({ hasAccess: true, isChecking: false, userRole: 'admin' });
      useMutation.mockReturnValue({ mutate: jest.fn(), isPending: false });
    });

    it('shows loading screen while fetching data', () => {
      useQuery.mockReturnValue({ data: undefined, isLoading: true, error: null });

      render(<AdminFundsScreen />);

      expect(screen.getByText('Routes laden...')).toBeTruthy();
    });

    it('shows error state when data fetch fails', async () => {
      useQuery.mockReturnValue({ 
        data: undefined, 
        isLoading: false, 
        error: new Error('Network error') 
      });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Fout bij laden routes/)).toBeTruthy();
        expect(screen.getByText(/Network error/)).toBeTruthy();
      });
    });

    it('shows retry button in error state', async () => {
      useQuery.mockReturnValue({ 
        data: undefined, 
        isLoading: false, 
        error: new Error('Network error') 
      });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Opnieuw Proberen')).toBeTruthy();
      });
    });

    it('retries loading when retry button pressed', async () => {
      useQuery.mockReturnValue({ 
        data: undefined, 
        isLoading: false, 
        error: new Error('Network error') 
      });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        const retryButton = screen.getByText('Opnieuw Proberen');
        fireEvent.press(retryButton);
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['adminRouteFunds'] });
    });

    it('shows empty state when no routes exist', async () => {
      useQuery.mockReturnValue({ data: [], isLoading: false, error: null });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Geen routes gevonden')).toBeTruthy();
      });
    });

    it('displays route list when data is available', async () => {
      useQuery.mockReturnValue({ 
        data: [
          { id: 1, route: '5 KM', amount: 50 },
          { id: 2, route: '10 KM', amount: 100 },
        ], 
        isLoading: false, 
        error: null 
      });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText('5 KM')).toBeTruthy();
        expect(screen.getByText('€50')).toBeTruthy();
        expect(screen.getByText('10 KM')).toBeTruthy();
        expect(screen.getByText('€100')).toBeTruthy();
      });
    });

    it('shows route count in section title', async () => {
      useQuery.mockReturnValue({ 
        data: [
          { id: 1, route: '5 KM', amount: 50 },
          { id: 2, route: '10 KM', amount: 100 },
        ], 
        isLoading: false, 
        error: null 
      });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Bestaande Routes \(2\)/)).toBeTruthy();
      });
    });
  });

  describe('Create Route', () => {
    let mockMutate: jest.Mock;

    beforeEach(() => {
      mockUseRequireAdmin.mockReturnValue({ hasAccess: true, isChecking: false, userRole: 'admin' });
      useQuery.mockReturnValue({ data: [], isLoading: false, error: null });
      
      mockMutate = jest.fn();
      useMutation.mockReturnValue({ mutate: mockMutate, isPending: false });
    });

    it('renders create form inputs', async () => {
      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Route (bijv. 5 KM)')).toBeTruthy();
        expect(screen.getByPlaceholderText('Bedrag (€)')).toBeTruthy();
      });
    });

    it('disables add button when route name is empty', async () => {
      render(<AdminFundsScreen />);

      // Initially both fields are empty, button should be disabled
      const addButton = screen.getByText('Toevoegen');
      expect(addButton.props.disabled).toBe(true);
    });

    it('validates invalid amount (NaN)', async () => {
      render(<AdminFundsScreen />);

      await waitFor(() => {
        const routeInput = screen.getByPlaceholderText('Route (bijv. 5 KM)');
        const amountInput = screen.getByPlaceholderText('Bedrag (€)');
        
        fireEvent.changeText(routeInput, '5 KM');
        fireEvent.changeText(amountInput, 'abc');
        
        const addButton = screen.getByText('Toevoegen');
        fireEvent.press(addButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Validatie', 'Voer een geldig bedrag in');
      });
    });

    it('validates negative amount', async () => {
      render(<AdminFundsScreen />);

      await waitFor(() => {
        const routeInput = screen.getByPlaceholderText('Route (bijv. 5 KM)');
        const amountInput = screen.getByPlaceholderText('Bedrag (€)');
        
        fireEvent.changeText(routeInput, '5 KM');
        fireEvent.changeText(amountInput, '-10');
        
        const addButton = screen.getByText('Toevoegen');
        fireEvent.press(addButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Validatie', 'Voer een geldig bedrag in');
      });
    });

    it('creates route successfully', async () => {
      render(<AdminFundsScreen />);

      await waitFor(() => {
        const routeInput = screen.getByPlaceholderText('Route (bijv. 5 KM)');
        const amountInput = screen.getByPlaceholderText('Bedrag (€)');
        
        fireEvent.changeText(routeInput, '5 KM');
        fireEvent.changeText(amountInput, '50');
        
        const addButton = screen.getByText('Toevoegen');
        fireEvent.press(addButton);
      });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({ route: '5 KM', amount: 50 });
      });
    });

    it('trims whitespace from route name', async () => {
      render(<AdminFundsScreen />);

      await waitFor(() => {
        const routeInput = screen.getByPlaceholderText('Route (bijv. 5 KM)');
        const amountInput = screen.getByPlaceholderText('Bedrag (€)');
        
        fireEvent.changeText(routeInput, '  5 KM  ');
        fireEvent.changeText(amountInput, '50');
        
        const addButton = screen.getByText('Toevoegen');
        fireEvent.press(addButton);
      });

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({ route: '5 KM', amount: 50 });
      });
    });

    it('disables inputs when mutation is pending', () => {
      useMutation.mockReturnValue({ mutate: mockMutate, isPending: true });

      render(<AdminFundsScreen />);

      const routeInput = screen.getByPlaceholderText('Route (bijv. 5 KM)');
      const amountInput = screen.getByPlaceholderText('Bedrag (€)');

      expect(routeInput.props.editable).toBe(false);
      expect(amountInput.props.editable).toBe(false);
    });
  });

  describe('Update Route', () => {
    let mockMutate: jest.Mock;

    beforeEach(() => {
      mockUseRequireAdmin.mockReturnValue({ hasAccess: true, isChecking: false, userRole: 'admin' });
      useQuery.mockReturnValue({ 
        data: [{ id: 1, route: '5 KM', amount: 50 }], 
        isLoading: false, 
        error: null 
      });
      
      mockMutate = jest.fn();
      // First call is for create, second for update, third for delete
      useMutation
        .mockReturnValueOnce({ mutate: jest.fn(), isPending: false }) // create
        .mockReturnValueOnce({ mutate: mockMutate, isPending: false }) // update
        .mockReturnValueOnce({ mutate: jest.fn(), isPending: false }); // delete
    });

    it('increases amount by 10 when +10 button pressed', async () => {
      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText('5 KM')).toBeTruthy();
      });

      const increaseButton = screen.getByText('+10');
      fireEvent.press(increaseButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({ 
          r: '5 KM', 
          body: { amount: 60 } 
        });
      });
    });

    it('decreases amount by 10 when -10 button pressed', async () => {
      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText('5 KM')).toBeTruthy();
      });

      const decreaseButton = screen.getByText('-10');
      fireEvent.press(decreaseButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({ 
          r: '5 KM', 
          body: { amount: 40 } 
        });
      });
    });

    it('prevents negative amount when decreasing', async () => {
      useQuery.mockReturnValue({ 
        data: [{ id: 1, route: '5 KM', amount: 5 }], 
        isLoading: false, 
        error: null 
      });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText('5 KM')).toBeTruthy();
      });

      const decreaseButton = screen.getByText('-10');
      fireEvent.press(decreaseButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Validatie', 'Bedrag kan niet negatief zijn');
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('Delete Route', () => {
    let mockMutate: jest.Mock;

    beforeEach(() => {
      mockUseRequireAdmin.mockReturnValue({ hasAccess: true, isChecking: false, userRole: 'admin' });
      useQuery.mockReturnValue({ 
        data: [{ id: 1, route: '5 KM', amount: 50 }], 
        isLoading: false, 
        error: null 
      });
      
      mockMutate = jest.fn();
      // First call is for create, second for update, third for delete
      useMutation
        .mockReturnValueOnce({ mutate: jest.fn(), isPending: false }) // create
        .mockReturnValueOnce({ mutate: jest.fn(), isPending: false }) // update
        .mockReturnValueOnce({ mutate: mockMutate, isPending: false }); // delete
    });

    it('shows confirmation alert when delete button pressed', async () => {
      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText('5 KM')).toBeTruthy();
      });

      const deleteButton = screen.getByText('🗑️');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Bevestigen',
          'Weet je zeker dat je "5 KM" wilt verwijderen?',
          expect.any(Array)
        );
      });
    });

    it('does not delete when canceling confirmation', async () => {
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        // Simulate pressing cancel button
        buttons[0].onPress?.();
      });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText('5 KM')).toBeTruthy();
      });

      const deleteButton = screen.getByText('🗑️');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('deletes route when confirming', async () => {
      (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
        // Simulate pressing delete button
        buttons[1].onPress?.();
      });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText('5 KM')).toBeTruthy();
      });

      const deleteButton = screen.getByText('🗑️');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith('5 KM');
      });
    });
  });

  describe('UI Elements', () => {
    beforeEach(() => {
      mockUseRequireAdmin.mockReturnValue({ hasAccess: true, isChecking: false, userRole: 'admin' });
      useMutation.mockReturnValue({ mutate: jest.fn(), isPending: false });
    });

    it('renders header with correct title and subtitle', async () => {
      useQuery.mockReturnValue({ data: [], isLoading: false, error: null });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Route Funds Beheer')).toBeTruthy();
        expect(screen.getByText('CRUD operaties voor route fondsen')).toBeTruthy();
      });
    });

    it('shows debug info with data type and length', async () => {
      useQuery.mockReturnValue({ 
        data: [{ id: 1, route: '5 KM', amount: 50 }], 
        isLoading: false, 
        error: null 
      });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Data type: Array/)).toBeTruthy();
        expect(screen.getByText(/Length: 1/)).toBeTruthy();
      });
    });

    it('shows "Nieuwe Route Toevoegen" section', async () => {
      useQuery.mockReturnValue({ data: [], isLoading: false, error: null });

      render(<AdminFundsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Nieuwe Route Toevoegen')).toBeTruthy();
      });
    });

    it('shows button text changes based on pending state', () => {
      useQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null
      });
      
      useMutation.mockReturnValue({ mutate: jest.fn(), isPending: true });

      render(<AdminFundsScreen />);

      // When mutation is pending, button text changes to "Toevoegen..."
      expect(screen.getByText('Toevoegen...')).toBeTruthy();
    });
  });
});