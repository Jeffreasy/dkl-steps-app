import { render } from '@testing-library/react-native';
import StepCounter from '../StepCounter';
import { useStepTracking } from '../../hooks/useStepTracking';

jest.mock('../../hooks/useStepTracking');

describe('StepCounter', () => {
  const mockOnSync = jest.fn();

  beforeEach(() => {
    (useStepTracking as jest.Mock).mockReturnValue({
      stepsDelta: 100,
      isAvailable: true,
      isSyncing: false,
      debugInfo: 'Test info',
      permissionStatus: 'granted',
      hasAuthError: false,
      lastSyncTime: new Date(),
      offlineQueue: [],
      handleManualSync: jest.fn(),
      handleCorrection: jest.fn(),
      handleDiagnostics: jest.fn(),
      handleTestAdd: jest.fn(),
      openSettings: jest.fn(),
    });
  });

  it('renders display and controls correctly', () => {
    const { getByText } = render(<StepCounter onSync={mockOnSync} />);
    // Assuming some text in sub-components
    expect(getByText('100')).toBeTruthy(); // stepsDelta
    // Add more assertions based on rendered content
  });

  // Add tests for props passing, conditional rendering, etc.
});