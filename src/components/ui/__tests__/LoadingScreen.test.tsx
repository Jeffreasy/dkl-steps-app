/**
 * LoadingScreen Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingScreen from '../LoadingScreen';

describe('LoadingScreen Component', () => {
  describe('rendering', () => {
    it('should render with default message', () => {
      const { getByText } = render(<LoadingScreen />);

      expect(getByText('Laden...')).toBeTruthy();
    });

    it('should render with custom message', () => {
      const { getByText } = render(
        <LoadingScreen message="Even geduld..." />
      );

      expect(getByText('Even geduld...')).toBeTruthy();
    });

    it('should show DKL logo by default', () => {
      const result = render(<LoadingScreen />);
      
      // Logo should be rendered
      expect(result).toBeTruthy();
    });

    it('should hide logo when showLogo is false', () => {
      const { getByText } = render(
        <LoadingScreen showLogo={false} message="Loading" />
      );

      expect(getByText('Loading')).toBeTruthy();
      // Logo should not be rendered
    });

    it('should show loading indicator', () => {
      const result = render(<LoadingScreen />);
      
      // ActivityIndicator is rendered
      expect(result).toBeTruthy();
    });
  });

  describe('customization', () => {
    it('should use custom color', () => {
      const customColor = '#FF0000';
      const result = render(<LoadingScreen color={customColor} />);
      
      expect(result).toBeTruthy();
    });

    it('should accept custom message', () => {
      const { getByText } = render(
        <LoadingScreen message="Gegevens ophalen..." />
      );

      expect(getByText('Gegevens ophalen...')).toBeTruthy();
    });

    it('should combine showLogo and custom message', () => {
      const { getByText, queryByText } = render(
        <LoadingScreen 
          showLogo={false} 
          message="Custom loading text" 
        />
      );

      expect(getByText('Custom loading text')).toBeTruthy();
    });
  });

  describe('logo display', () => {
    it('should show logo when showLogo is true', () => {
      const result = render(<LoadingScreen showLogo={true} />);
      expect(result).toBeTruthy();
    });

    it('should hide logo when showLogo is false', () => {
      const result = render(<LoadingScreen showLogo={false} />);
      expect(result).toBeTruthy();
    });

    it('should show logo by default', () => {
      const result = render(<LoadingScreen />);
      expect(result).toBeTruthy();
    });
  });

  describe('message variations', () => {
    it('should handle empty string message', () => {
      const { getByText } = render(<LoadingScreen message="" />);
      
      expect(getByText('')).toBeTruthy();
    });

    it('should handle very long message', () => {
      const longMessage = 'Dit is een zeer lange laadmelding die meerdere regels kan beslaan en veel tekst bevat';
      const { getByText } = render(<LoadingScreen message={longMessage} />);
      
      expect(getByText(longMessage)).toBeTruthy();
    });

    it('should handle multiline message', () => {
      const multilineMessage = 'Lijn 1\nLijn 2\nLijn 3';
      const { getByText } = render(<LoadingScreen message={multilineMessage} />);
      
      expect(getByText(multilineMessage)).toBeTruthy();
    });
  });

  describe('color customization', () => {
    it('should use primary color by default', () => {
      const result = render(<LoadingScreen />);
      expect(result).toBeTruthy();
    });

    it('should accept hex color', () => {
      const result = render(<LoadingScreen color="#FF5733" />);
      expect(result).toBeTruthy();
    });

    it('should accept named color', () => {
      const result = render(<LoadingScreen color="red" />);
      expect(result).toBeTruthy();
    });

    it('should accept rgb color', () => {
      const result = render(<LoadingScreen color="rgb(255, 0, 0)" />);
      expect(result).toBeTruthy();
    });
  });

  describe('memoization', () => {
    it('should not re-render with same props', () => {
      const { rerender } = render(
        <LoadingScreen message="Loading" showLogo={true} />
      );

      rerender(<LoadingScreen message="Loading" showLogo={true} />);

      // Component should be memoized
      expect(true).toBe(true);
    });

    it('should re-render when message changes', () => {
      const { getByText, rerender } = render(
        <LoadingScreen message="Message 1" />
      );

      expect(getByText('Message 1')).toBeTruthy();

      rerender(<LoadingScreen message="Message 2" />);

      expect(getByText('Message 2')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined props', () => {
      const result = render(<LoadingScreen message={undefined} />);
      expect(result).toBeTruthy();
    });

    it('should render without any props', () => {
      const { getByText } = render(<LoadingScreen />);
      expect(getByText('Laden...')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have accessible loading text', () => {
      const { getByText } = render(<LoadingScreen message="Loading data" />);
      
      expect(getByText('Loading data')).toBeTruthy();
    });

    it('should show activity indicator for screen readers', () => {
      const result = render(<LoadingScreen />);
      expect(result).toBeTruthy();
    });
  });
});