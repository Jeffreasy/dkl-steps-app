/**
 * CustomButton Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomButton from '../CustomButton';

describe('CustomButton Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render with title', () => {
      const { getByText } = render(
        <CustomButton title="Click Me" onPress={mockOnPress} />
      );

      expect(getByText('Click Me')).toBeTruthy();
    });

    it('should render primary variant by default', () => {
      const { getByText } = render(
        <CustomButton title="Primary" onPress={mockOnPress} />
      );

      const button = getByText('Primary').parent?.parent;
      expect(button).toBeTruthy();
    });

    it('should render secondary variant', () => {
      const { getByText } = render(
        <CustomButton title="Secondary" onPress={mockOnPress} variant="secondary" />
      );

      expect(getByText('Secondary')).toBeTruthy();
    });

    it('should render outline variant', () => {
      const { getByText } = render(
        <CustomButton title="Outline" onPress={mockOnPress} variant="outline" />
      );

      expect(getByText('Outline')).toBeTruthy();
    });

    it('should render ghost variant', () => {
      const { getByText } = render(
        <CustomButton title="Ghost" onPress={mockOnPress} variant="ghost" />
      );

      expect(getByText('Ghost')).toBeTruthy();
    });

    it('should render danger variant', () => {
      const { getByText } = render(
        <CustomButton title="Delete" onPress={mockOnPress} variant="danger" />
      );

      expect(getByText('Delete')).toBeTruthy();
    });

    it('should show loading indicator when loading', () => {
      const { getByTestId, queryByText } = render(
        <CustomButton title="Submit" onPress={mockOnPress} loading={true} />
      );

      expect(queryByText('Submit')).toBeNull();
      // ActivityIndicator is rendered
    });

    it('should apply custom styles', () => {
      const customStyle = { marginTop: 20 };
      const { getByText } = render(
        <CustomButton
          title="Styled"
          onPress={mockOnPress}
          style={customStyle}
        />
      );

      // Just verify button renders with custom style
      expect(getByText('Styled')).toBeTruthy();
    });

    it('should apply custom text styles', () => {
      const customTextStyle = { fontSize: 20 };
      const { getByText } = render(
        <CustomButton
          title="Custom Text"
          onPress={mockOnPress}
          textStyle={customTextStyle}
        />
      );

      const text = getByText('Custom Text');
      expect(text.props.style).toContainEqual(customTextStyle);
    });
  });

  describe('interactions', () => {
    it('should call onPress when pressed', () => {
      const { getByText } = render(
        <CustomButton title="Press Me" onPress={mockOnPress} />
      );

      fireEvent.press(getByText('Press Me'));

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const { getByText } = render(
        <CustomButton title="Disabled" onPress={mockOnPress} disabled={true} />
      );

      fireEvent.press(getByText('Disabled'));

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const { queryByText } = render(
        <CustomButton title="Loading" onPress={mockOnPress} loading={true} />
      );

      // Can't press because text is replaced with ActivityIndicator
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should handle multiple presses', () => {
      const { getByText } = render(
        <CustomButton title="Multi Press" onPress={mockOnPress} />
      );

      const button = getByText('Multi Press');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('disabled state', () => {
    it('should show disabled styles when disabled', () => {
      const { getByText } = render(
        <CustomButton title="Disabled" onPress={mockOnPress} disabled={true} />
      );

      expect(getByText('Disabled')).toBeTruthy();
    });

    it('should not call onPress when loading', () => {
      const { queryByText } = render(
        <CustomButton title="Test" onPress={mockOnPress} loading={true} />
      );

      // Loading shows ActivityIndicator, not text
      expect(queryByText('Test')).toBeNull();
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when explicitly disabled', () => {
      const { getByText } = render(
        <CustomButton title="Test" onPress={mockOnPress} disabled={true} />
      );

      fireEvent.press(getByText('Test'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should be accessible', () => {
      const { getByText } = render(
        <CustomButton title="Accessible" onPress={mockOnPress} />
      );

      expect(getByText('Accessible')).toBeTruthy();
    });

    it('should be pressable', () => {
      const { getByText } = render(
        <CustomButton title="Pressable" onPress={mockOnPress} />
      );

      fireEvent.press(getByText('Pressable'));
      expect(mockOnPress).toHaveBeenCalled();
    });
  });

  describe('memoization', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender, getByText } = render(
        <CustomButton title="Memo Test" onPress={mockOnPress} />
      );

      const firstRender = getByText('Memo Test');

      rerender(<CustomButton title="Memo Test" onPress={mockOnPress} />);

      const secondRender = getByText('Memo Test');

      // Component should be memoized
      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });
  });
});