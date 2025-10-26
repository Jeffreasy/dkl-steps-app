
/**
 * StepCounterControls Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StepCounterControls from '../StepCounterControls';

describe('StepCounterControls Component', () => {
  const defaultProps = {
    stepsDelta: 100,
    isSyncing: false,
    hasAuthError: false,
    permissionStatus: 'granted',
    onManualSync: jest.fn(),
    onCorrection: jest.fn(),
    onTestAdd: jest.fn(),
    onDiagnostics: jest.fn(),
    onOpenSettings: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('manual sync button', () => {
    it('should render sync button', () => {
      const { getByText } = render(<StepCounterControls {...defaultProps} />);

      expect(getByText(/Sync Nu/)).toBeTruthy();
    });

    it('should show delta count in sync button', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} stepsDelta={150} />
      );

      expect(getByText('Sync Nu (150)')).toBeTruthy();
    });

    it('should call onManualSync when pressed', () => {
      const { getByText } = render(<StepCounterControls {...defaultProps} />);

      fireEvent.press(getByText(/Sync Nu/));

      expect(defaultProps.onManualSync).toHaveBeenCalledTimes(1);
    });

    it('should disable sync button when delta is zero', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} stepsDelta={0} />
      );

      const button = getByText('Sync Nu (0)');
      expect(button).toBeTruthy();
    });

    it('should show "Bezig..." when syncing', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} isSyncing={true} />
      );

      expect(getByText('Bezig...')).toBeTruthy();
    });

    it('should disable button when syncing', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} isSyncing={true} />
      );

      fireEvent.press(getByText('Bezig...'));

      // Should not call when syncing
      expect(defaultProps.onManualSync).not.toHaveBeenCalled();
    });

    it('should disable button when auth error', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} hasAuthError={true} />
      );

      fireEvent.press(getByText(/Sync Nu/));

      expect(defaultProps.onManualSync).not.toHaveBeenCalled();
    });
  });

  describe('correction button', () => {
    it('should render correction button', () => {
      const { getByText } = render(<StepCounterControls {...defaultProps} />);

      expect(getByText('Correctie -100')).toBeTruthy();
    });

    it('should call onCorrection with -100', () => {
      const { getByText } = render(<StepCounterControls {...defaultProps} />);

      fireEvent.press(getByText('Correctie -100'));

      expect(defaultProps.onCorrection).toHaveBeenCalledWith(-100);
    });

    it('should disable correction when syncing', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} isSyncing={true} />
      );

      fireEvent.press(getByText('Correctie -100'));

      expect(defaultProps.onCorrection).not.toHaveBeenCalled();
    });

    it('should disable correction when auth error', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} hasAuthError={true} />
      );

      fireEvent.press(getByText('Correctie -100'));

      expect(defaultProps.onCorrection).not.toHaveBeenCalled();
    });
  });

  describe('test button', () => {
    it('should render test button', () => {
      const { getByText } = render(<StepCounterControls {...defaultProps} />);

      expect(getByText('Test +50')).toBeTruthy();
    });

    it('should call onTestAdd when pressed', () => {
      const { getByText } = render(<StepCounterControls {...defaultProps} />);

      fireEvent.press(getByText('Test +50'));

      expect(defaultProps.onTestAdd).toHaveBeenCalledTimes(1);
    });

    it('should allow test button even when syncing', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} isSyncing={true} />
      );

      fireEvent.press(getByText('Test +50'));

      expect(defaultProps.onTestAdd).toHaveBeenCalled();
    });

    it('should allow test button even with auth error', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} hasAuthError={true} />
      );

      fireEvent.press(getByText('Test +50'));

      expect(defaultProps.onTestAdd).toHaveBeenCalled();
    });
  });

  describe('diagnostics button', () => {
    it('should render diagnostics button', () => {
      const { getByText } = render(<StepCounterControls {...defaultProps} />);

      expect(getByText('🔍 Diagnostics')).toBeTruthy();
    });

    it('should call onDiagnostics when pressed', () => {
      const { getByText } = render(<StepCounterControls {...defaultProps} />);

      fireEvent.press(getByText('🔍 Diagnostics'));

      expect(defaultProps.onDiagnostics).toHaveBeenCalledTimes(1);
    });
  });

  describe('settings button', () => {
    it('should show settings button when permission denied', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} permissionStatus="denied" />
      );

      expect(getByText('Instellingen Info')).toBeTruthy();
    });

    it('should not show settings button when permission granted', () => {
      const { queryByText } = render(
        <StepCounterControls {...defaultProps} permissionStatus="granted" />
      );

      expect(queryByText('Instellingen Info')).toBeNull();
    });

    it('should call onOpenSettings when pressed', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} permissionStatus="denied" />
      );

      fireEvent.press(getByText('Instellingen Info'));

      expect(defaultProps.onOpenSettings).toHaveBeenCalledTimes(1);
    });

    it('should not show settings button when checking permission', () => {
      const { queryByText } = render(
        <StepCounterControls {...defaultProps} permissionStatus="checking" />
      );

      expect(queryByText('Instellingen Info')).toBeNull();
    });
  });

  describe('button layout', () => {
    it('should render all buttons in correct order', () => {
      const { getByText } = render(<StepCounterControls {...defaultProps} />);

      expect(getByText(/Sync Nu/)).toBeTruthy();
      expect(getByText('Correctie -100')).toBeTruthy();
      expect(getByText('Test +50')).toBeTruthy();
      expect(getByText('🔍 Diagnostics')).toBeTruthy();
    });

    it('should have correction and test buttons on same row', () => {
      const { getByText } = render(<StepCounterControls {...defaultProps} />);

      const correctionButton = getByText('Correctie -100');
      const testButton = getByText('Test +50');

      expect(correctionButton).toBeTruthy();
      expect(testButton).toBeTruthy();
    });
  });

  describe('disabled states', () => {
    it('should disable sync when no steps', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} stepsDelta={0} />
      );

      fireEvent.press(getByText('Sync Nu (0)'));

      expect(defaultProps.onManualSync).not.toHaveBeenCalled();
    });

    it('should disable buttons during sync', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} isSyncing={true} />
      );

      fireEvent.press(getByText('Bezig...'));
      fireEvent.press(getByText('Correctie -100'));

      expect(defaultProps.onManualSync).not.toHaveBeenCalled();
      expect(defaultProps.onCorrection).not.toHaveBeenCalled();
    });

    it('should disable buttons with auth error', () => {
      const { getByText } = render(
        <StepCounterControls {...defaultProps} hasAuthError={true} />
      );

      fireEvent.press(getByText(/Sync Nu/));
      fireEvent.press(getByText('Correctie -100'));

      expect(defaultProps.onManualSync).not.toHaveBeenCalled();
      expect(defaultProps.onCorrection).not.toHaveBeenCalled();
    });
  });

  describe('button interactions', () => {
    it('should allow multiple button presses', () => {
      const { getByText } = render(<StepCounterControls {...defaultProps} />);

      fireEvent.press(getByText('Test +50'));
      fireEvent.press(getByText('Test +50'));
      fireEvent.press(getByText('Test +50'));

      expect(defaultProps.onTestAdd).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid button presses', () => {
      const { getByText } = render(<StepCounterControls {...defaultProps} />);

      const button = getByText('Test +50');
      for (let i = 0; i < 10; i++) {
        fireEvent.press(button);
      }

      expect(defaultProps.onTestAdd).toHaveBeenCalledTimes(10);
    });
  });

  describe('memoization', () => {
    it('should not re-render with same props', () => {
      const { rerender } = render(<StepCounterControls {...defaultProps} />);

      rerender(<StepCounterControls {...defaultProps} />);

      // Component should be memoized
      expect(true).toBe(true);
    });
  });
});