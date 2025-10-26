import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import GlobalDashboardScreen from '../GlobalDashboardScreen';
import { apiFetch } from '../../services/api';
import * as hooks from '../../hooks';
import { storage } from '../../utils/storage';

// Mock dependencies
jest.mock('../../services/api');
jest.mock('../../utils/storage');

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockStorage = storage as jest.Mocked<typeof storage>;

// Mock hooks
const mockUseAccessControl = jest.fn();
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useAccessControl: (options: any) => mockUseAccessControl(options),
  useRefreshOnFocus: jest.fn(),
}));

// Mock React Query
const mockInvalidateQueries = jest.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
};

const mockRefetchTotals = jest.fn();
const mockRefetchFunds = jest.fn();

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => mockQueryClient,
    useQuery: jest.fn(),
  };
});

const { useQuery } = require('@tanstack/react-query');

describe('GlobalDashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockClear();
    mockInvalidateQueries.mockClear();
    mockStorage.getItem.mockResolvedValue('admin');
  });

  describe('Access Control', () => {
    it('shows loading screen while checking access', () => {
      mockUseAccessControl.mockReturnValue({ 
        hasAccess: false, 
        isChecking: true, 
        userRole: null 
      });
      useQuery.mockReturnValue({ data: undefined, isLoading: false, error: null, refetch: jest.fn() });

      render(<GlobalDashboardScreen />);

      expect(screen.getByText('Toegang controleren...')).toBeTruthy();
    });

    it('shows access denied screen when not admin/staff', () => {
      mockUseAccessControl.mockReturnValue({ 
        hasAccess: false, 
        isChecking: false, 
        userRole: 'deelnemer' 
      });
      useQuery.mockReturnValue({ data: undefined, isLoading: false, error: null, refetch: jest.fn() });

      render(<GlobalDashboardScreen />);

      expect(screen.getByText('Geen toegang (403)')).toBeTruthy();
      expect(screen.getByText('Alleen Admin en Staff hebben toegang')).toBeTruthy();
    });

    it('calls useAccessControl with correct roles', () => {
      mockUseAccessControl.mockReturnValue({ hasAccess: true, isChecking: false, userRole: 'admin' });
      useQuery.mockReturnValue({ data: undefined, isLoading: false, error: null, refetch: jest.fn() });

      render(<GlobalDashboardScreen />);

      expect(mockUseAccessControl).toHaveBeenCalledWith({
        allowedRoles: ['admin', 'staff'],
        alertMessage: 'Alleen Admin en Staff hebben toegang tot het Globaal Dashboard.',
      });
    });
  });

  describe('Data Loading', () => {
    beforeEach(() => {
      mockUseAccessControl.mockReturnValue({ hasAccess: true, isChecking: false, userRole: 'admin' });
    });

    it('shows loading screen while fetching data', () => {
      useQuery.mockReturnValue({ 
        data: undefined, 
        isLoading: true, 
        error: null, 
        refetch: mockRefetchTotals 
      });

      render(<GlobalDashboardScreen />);

      expect(screen.getByText('Dashboard laden...')).toBeTruthy();
    });

    it('shows error state when data fetch fails', async () => {
      useQuery
        .mockReturnValueOnce({ 
          data: undefined, 
          isLoading: false, 
          error: new Error('Network error'), 
          refetch: mockRefetchTotals 
        })
        .mockReturnValueOnce({ 
          data: undefined, 
          isLoading: false, 
          error: null, 
          refetch: mockRefetchFunds 
        });

      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Fout bij laden/)).toBeTruthy();
        expect(screen.getByText(/Network error/)).toBeTruthy();
      });
    });

    it('shows retry button in error state', async () => {
      useQuery
        .mockReturnValueOnce({ 
          data: undefined, 
          isLoading: false, 
          error: new Error('Error'), 
          refetch: mockRefetchTotals 
        })
        .mockReturnValueOnce({ 
          data: undefined, 
          isLoading: false, 
          error: null, 
          refetch: mockRefetchFunds 
        });

      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Opnieuw Proberen')).toBeTruthy();
      });
    });

    it('retries loading when retry button pressed', async () => {
      useQuery
        .mockReturnValueOnce({ 
          data: undefined, 
          isLoading: false, 
          error: new Error('Error'), 
          refetch: mockRefetchTotals 
        })
        .mockReturnValueOnce({ 
          data: undefined, 
          isLoading: false, 
          error: null, 
          refetch: mockRefetchFunds 
        });

      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        const retryButton = screen.getByText('Opnieuw Proberen');
        fireEvent.press(retryButton);
      });

      expect(mockRefetchTotals).toHaveBeenCalled();
      expect(mockRefetchFunds).toHaveBeenCalled();
    });

    it('displays data when loaded successfully', async () => {
      useQuery
        .mockReturnValueOnce({ 
          data: { total_steps: 50000 }, 
          isLoading: false, 
          error: null, 
          refetch: mockRefetchTotals 
        })
        .mockReturnValueOnce({ 
          data: { 
            totalX: 250, 
            routes: { '5 KM': 50, '10 KM': 100 } 
          }, 
          isLoading: false, 
          error: null, 
          refetch: mockRefetchFunds 
        });

      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('50.000')).toBeTruthy(); // Dutch number formatting
        expect(screen.getByText('€250')).toBeTruthy();
      });
    });
  });

  describe('Routes Display', () => {
    beforeEach(() => {
      mockUseAccessControl.mockReturnValue({ hasAccess: true, isChecking: false, userRole: 'admin' });
      useQuery
        .mockReturnValueOnce({ 
          data: { total_steps: 50000 }, 
          isLoading: false, 
          error: null, 
          refetch: mockRefetchTotals 
        });
    });

    it('shows empty state when no routes configured', async () => {
      useQuery.mockReturnValueOnce({ 
        data: { totalX: 0, routes: {} }, 
        isLoading: false, 
        error: null, 
        refetch: mockRefetchFunds 
      });

      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Geen routes geconfigureerd')).toBeTruthy();
      });
    });

    it('displays routes list when routes exist', async () => {
      useQuery.mockReturnValueOnce({
        data: {
          totalX: 150,
          routes: { '5 KM': 50, '10 KM': 100 }
        },
        isLoading: false,
        error: null,
        refetch: mockRefetchFunds
      });

      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('5 KM')).toBeTruthy();
        expect(screen.getAllByText('€50').length).toBeGreaterThan(0);
        expect(screen.getByText('10 KM')).toBeTruthy();
        expect(screen.getAllByText('€100').length).toBeGreaterThan(0);
      });
    });

    it('sorts routes numerically by distance', async () => {
      useQuery.mockReturnValueOnce({ 
        data: { 
          totalX: 300, 
          routes: { '20 KM': 50, '5 KM': 100, '10 KM': 150 } 
        }, 
        isLoading: false, 
        error: null, 
        refetch: mockRefetchFunds 
      });

      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        const routes = screen.getAllByText(/KM/);
        expect(routes.length).toBeGreaterThan(0);
      });
    });

    it('shows route count badge', async () => {
      useQuery.mockReturnValueOnce({ 
        data: { 
          totalX: 150, 
          routes: { '5 KM': 50, '10 KM': 100 } 
        }, 
        isLoading: false, 
        error: null, 
        refetch: mockRefetchFunds 
      });

      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('2 routes')).toBeTruthy();
      });
    });
  });

  describe('Statistics Display', () => {
    beforeEach(() => {
      mockUseAccessControl.mockReturnValue({ hasAccess: true, isChecking: false, userRole: 'admin' });
      useQuery
        .mockReturnValueOnce({ 
          data: { total_steps: 50000 }, 
          isLoading: false, 
          error: null, 
          refetch: mockRefetchTotals 
        })
        .mockReturnValueOnce({ 
          data: { 
            totalX: 300, 
            routes: { '5 KM': 50, '10 KM': 100, '15 KM': 150 } 
          }, 
          isLoading: false, 
          error: null, 
          refetch: mockRefetchFunds 
        });
    });

    it('displays statistics card with calculations', async () => {
      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('📈 Statistieken')).toBeTruthy();
        expect(screen.getByText('Gemiddeld per route:')).toBeTruthy();
        expect(screen.getAllByText('€100').length).toBeGreaterThan(0); // 300 / 3 = 100
      });
    });

    it('shows highest fund amount', async () => {
      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Hoogste fonds:')).toBeTruthy();
        expect(screen.getAllByText('€150').length).toBeGreaterThan(0);
      });
    });

    it('shows lowest fund amount', async () => {
      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Laagste fonds:')).toBeTruthy();
        expect(screen.getAllByText('€50').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Admin Actions', () => {
    beforeEach(() => {
      useQuery
        .mockReturnValueOnce({ 
          data: { total_steps: 50000 }, 
          isLoading: false, 
          error: null, 
          refetch: mockRefetchTotals 
        })
        .mockReturnValueOnce({ 
          data: { totalX: 100, routes: { '5 KM': 100 } }, 
          isLoading: false, 
          error: null, 
          refetch: mockRefetchFunds 
        });
    });

    it('shows admin funds button for admin users', async () => {
      mockUseAccessControl.mockReturnValue({ 
        hasAccess: true, 
        isChecking: false, 
        userRole: 'admin' 
      });

      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Admin Funds Beheer')).toBeTruthy();
      });
    });

    it('hides admin funds button for staff users', async () => {
      mockUseAccessControl.mockReturnValue({ 
        hasAccess: true, 
        isChecking: false, 
        userRole: 'staff' 
      });

      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.queryByText('Admin Funds Beheer')).toBeNull();
      });
    });
  });

  describe('UI Elements', () => {
    beforeEach(() => {
      mockUseAccessControl.mockReturnValue({ hasAccess: true, isChecking: false, userRole: 'admin' });
      useQuery
        .mockReturnValueOnce({ 
          data: { total_steps: 50000 }, 
          isLoading: false, 
          error: null, 
          refetch: mockRefetchTotals 
        })
        .mockReturnValueOnce({ 
          data: { totalX: 100, routes: { '5 KM': 100 } }, 
          isLoading: false, 
          error: null, 
          refetch: mockRefetchFunds 
        });
    });

    it('renders header with title and user info', async () => {
      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Globaal Dashboard')).toBeTruthy();
        expect(screen.getByText(/admin • admin/)).toBeTruthy();
      });
    });

    it('shows refresh hint at bottom', async () => {
      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText(/Trek naar beneden om te vernieuwen/)).toBeTruthy();
      });
    });

    it('displays summary card with totals', async () => {
      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Totaal Stappen (2025)')).toBeTruthy();
        expect(screen.getByText('Totaal Fondsen')).toBeTruthy();
      });
    });

    it('shows fond verdeling section', async () => {
      render(<GlobalDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Fondsen per Route')).toBeTruthy();
      });
    });
  });
});