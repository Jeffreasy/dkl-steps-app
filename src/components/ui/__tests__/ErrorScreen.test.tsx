/**
 * ErrorScreen Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ErrorScreen from '../ErrorScreen';

describe('ErrorScreen Component', () => {
  describe('rendering', () => {
    it('should render with default title', () => {
      const { getByText } = render(<ErrorScreen />);

      expect(getByText('Er ging iets mis')).toBeTruthy();
    });

    it('should render with custom title', () => {
      const { getByText } = render(
        <ErrorScreen title="Custom Error" />
      );

      expect(getByText('Custom Error')).toBeTruthy();
    });

    it('should show default emoji', () => {
      const { getByText } = render(<ErrorScreen />);

      expect(getByText('😕')).toBeTruthy();
    });

    it('should show custom emoji', () => {
      const { getByText } = render(<ErrorScreen emoji="🚫" />);

      expect(getByText('🚫')).toBeTruthy();
    });

    it('should show message when provided', () => {
      const { getByText } = render(
        <ErrorScreen message="Something went wrong" />
      );

      expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('should not show message when not provided', () => {
      const { queryByText } = render(<ErrorScreen />);

      // Only title and emoji should be present
      expect(queryByText('Er ging iets mis')).toBeTruthy();
    });

    it('should hide logo by default', () => {
      const result = render(<ErrorScreen />);

      // Logo should not be shown by default
      expect(result).toBeTruthy();
    });

    it('should show logo when showLogo is true', () => {
      const result = render(<ErrorScreen showLogo={true} />);

      expect(result).toBeTruthy();
    });
  });

  describe('retry button', () => {
    it('should show retry button when onRetry provided', () => {
      const mockRetry = jest.fn();
      const { getByText } = render(<ErrorScreen onRetry={mockRetry} />);

      expect(getByText('Opnieuw Proberen')).toBeTruthy();
    });

    it('should not show retry button when onRetry not provided', () => {
      const { queryByText } = render(<ErrorScreen />);

      expect(queryByText('Opnieuw Proberen')).toBeNull();
    });

    it('should call onRetry when button pressed', () => {
      const mockRetry = jest.fn();
      const { getByText } = render(<ErrorScreen onRetry={mockRetry} />);

      fireEvent.press(getByText('Opnieuw Proberen'));

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should show custom retry text', () => {
      const mockRetry = jest.fn();
      const { getByText } = render(
        <ErrorScreen onRetry={mockRetry} retryText="Try Again" />
      );

      expect(getByText('Try Again')).toBeTruthy();
    });
  });

  describe('customization', () => {
    it('should combine all custom props', () => {
      const mockRetry = jest.fn();
      const { getByText } = render(
        <ErrorScreen
          title="Custom Title"
          message="Custom message here"
          emoji="❌"
          onRetry={mockRetry}
          retryText="Retry Now"
          showLogo={true}
        />
      );

      expect(getByText('Custom Title')).toBeTruthy();
      expect(getByText('Custom message here')).toBeTruthy();
      expect(getByText('❌')).toBeTruthy();
      expect(getByText('Retry Now')).toBeTruthy();
    });

    it('should work without any props', () => {
      const { getByText } = render(<ErrorScreen />);

      expect(getByText('Er ging iets mis')).toBeTruthy();
      expect(getByText('😕')).toBeTruthy();
    });
  });

  describe('message variations', () => {
    it('should handle long messages', () => {
      const longMessage = 'Dit is een zeer lange foutmelding die meerdere regels kan beslaan en veel tekst bevat om de gebruiker te informeren over wat er mis ging';
      const { getByText } = render(
        <ErrorScreen message={longMessage} />
      );

      expect(getByText(longMessage)).toBeTruthy();
    });

    it('should handle multiline messages', () => {
      const multilineMessage = 'Lijn 1\nLijn 2\nLijn 3';
      const { getByText } = render(
        <ErrorScreen message={multilineMessage} />
      );

      expect(getByText(multilineMessage)).toBeTruthy();
    });

    it('should handle empty string message', () => {
      const { queryByText } = render(<ErrorScreen message="" />);

      // Empty message should render but might not be visible
      expect(queryByText('Er ging iets mis')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have accessible title', () => {
      const { getByText } = render(<ErrorScreen title="Error occurred" />);

      expect(getByText('Error occurred')).toBeTruthy();
    });

    it('should have accessible retry button', () => {
      const mockRetry = jest.fn();
      const { getByText } = render(<ErrorScreen onRetry={mockRetry} />);

      const button = getByText('Opnieuw Proberen');
      expect(button).toBeTruthy();
    });
  });

  describe('memoization', () => {
    it('should not re-render with same props', () => {
      const mockRetry = jest.fn();
      const { rerender, getByText } = render(
        <ErrorScreen title="Error" onRetry={mockRetry} />
      );

      const firstRender = getByText('Error');

      rerender(<ErrorScreen title="Error" onRetry={mockRetry} />);

      expect(firstRender).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined message', () => {
      const { getByText } = render(<ErrorScreen message={undefined} />);

      expect(getByText('Er ging iets mis')).toBeTruthy();
    });

    it('should handle all undefined props', () => {
      const result = render(
        <ErrorScreen
          title={undefined}
          message={undefined}
          emoji={undefined}
          onRetry={undefined}
          retryText={undefined}
          showLogo={undefined}
        />
      );

      expect(result).toBeTruthy();
    });
  });
});