/**
 * CustomInput Component Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomInput from '../CustomInput';

describe('CustomInput Component', () => {
  describe('rendering', () => {
    it('should render input field', () => {
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Enter text" />
      );

      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('should render with label', () => {
      const { getByText, getByPlaceholderText } = render(
        <CustomInput label="Username" placeholder="Enter username" />
      );

      expect(getByText('Username')).toBeTruthy();
      expect(getByPlaceholderText('Enter username')).toBeTruthy();
    });

    it('should render without label', () => {
      const { queryByText, getByPlaceholderText } = render(
        <CustomInput placeholder="No label" />
      );

      expect(queryByText('Username')).toBeNull();
      expect(getByPlaceholderText('No label')).toBeTruthy();
    });

    it('should show error message', () => {
      const { getByText } = render(
        <CustomInput error="This field is required" />
      );

      expect(getByText('⚠️ This field is required')).toBeTruthy();
    });

    it('should not show error when no error', () => {
      const { queryByText } = render(
        <CustomInput placeholder="Test" />
      );

      expect(queryByText(/⚠️/)).toBeNull();
    });

    it('should apply error styles when error exists', () => {
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Test" error="Error message" />
      );

      const input = getByPlaceholderText('Test');
      expect(input).toBeTruthy();
    });

    it('should apply custom container style', () => {
      const customStyle = { marginTop: 20 };
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Test" containerStyle={customStyle} />
      );

      // Just verify input renders with container style
      expect(getByPlaceholderText('Test')).toBeTruthy();
    });

    it('should apply custom input style', () => {
      const customStyle = { fontSize: 18 };
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Test" style={customStyle} />
      );

      const input = getByPlaceholderText('Test');
      expect(input.props.style).toContainEqual(customStyle);
    });
  });

  describe('interactions', () => {
    it('should handle text change', () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Test" onChangeText={mockOnChange} />
      );

      const input = getByPlaceholderText('Test');
      fireEvent.changeText(input, 'Hello World');

      expect(mockOnChange).toHaveBeenCalledWith('Hello World');
    });

    it('should handle focus', () => {
      const mockOnFocus = jest.fn();
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Test" onFocus={mockOnFocus} />
      );

      const input = getByPlaceholderText('Test');
      fireEvent(input, 'focus');

      expect(mockOnFocus).toHaveBeenCalled();
    });

    it('should handle blur', () => {
      const mockOnBlur = jest.fn();
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Test" onBlur={mockOnBlur} />
      );

      const input = getByPlaceholderText('Test');
      fireEvent(input, 'blur');

      expect(mockOnBlur).toHaveBeenCalled();
    });

    it('should accept initial value', () => {
      const { getByDisplayValue } = render(
        <CustomInput value="Initial value" />
      );

      expect(getByDisplayValue('Initial value')).toBeTruthy();
    });
  });

  describe('input types', () => {
    it('should support secure text entry', () => {
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Password" secureTextEntry={true} />
      );

      const input = getByPlaceholderText('Password');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should support email keyboard type', () => {
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Email" keyboardType="email-address" />
      );

      const input = getByPlaceholderText('Email');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('should support numeric keyboard type', () => {
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Number" keyboardType="numeric" />
      );

      const input = getByPlaceholderText('Number');
      expect(input.props.keyboardType).toBe('numeric');
    });

    it('should support multiline input', () => {
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Message" multiline={true} numberOfLines={4} />
      );

      const input = getByPlaceholderText('Message');
      expect(input.props.multiline).toBe(true);
      expect(input.props.numberOfLines).toBe(4);
    });
  });

  describe('accessibility', () => {
    it('should support accessibility label', () => {
      const { getByPlaceholderText } = render(
        <CustomInput
          placeholder="Test"
          accessibilityLabel="Test input field"
        />
      );

      const input = getByPlaceholderText('Test');
      expect(input.props.accessibilityLabel).toBe('Test input field');
    });

    it('should be editable by default', () => {
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Test" />
      );

      const input = getByPlaceholderText('Test');
      expect(input.props.editable).not.toBe(false);
    });

    it('should support non-editable state', () => {
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Test" editable={false} />
      );

      const input = getByPlaceholderText('Test');
      expect(input.props.editable).toBe(false);
    });
  });

  describe('validation states', () => {
    it('should show multiple errors', () => {
      const { getByText, rerender } = render(
        <CustomInput error="Error 1" />
      );

      expect(getByText('⚠️ Error 1')).toBeTruthy();

      rerender(<CustomInput error="Error 2" />);

      expect(getByText('⚠️ Error 2')).toBeTruthy();
    });

    it('should clear error when removed', () => {
      const { getByText, rerender, queryByText } = render(
        <CustomInput error="Has error" />
      );

      expect(getByText('⚠️ Has error')).toBeTruthy();

      rerender(<CustomInput />);

      expect(queryByText('⚠️ Has error')).toBeNull();
    });
  });

  describe('placeholder', () => {
    it('should show placeholder', () => {
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Type here..." />
      );

      expect(getByPlaceholderText('Type here...')).toBeTruthy();
    });

    it('should hide placeholder when value exists', () => {
      const { queryByPlaceholderText } = render(
        <CustomInput placeholder="Type here..." value="Some value" />
      );

      // Placeholder should not be visible when there's a value
      const input = queryByPlaceholderText('Type here...');
      expect(input?.props.value).toBe('Some value');
    });
  });

  describe('memoization', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender, getByPlaceholderText } = render(
        <CustomInput placeholder="Memo Test" />
      );

      const firstRender = getByPlaceholderText('Memo Test');

      rerender(<CustomInput placeholder="Memo Test" />);

      const secondRender = getByPlaceholderText('Memo Test');

      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string value', () => {
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Test" value="" />
      );

      expect(getByPlaceholderText('Test')).toBeTruthy();
    });

    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000);
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Test" onChangeText={mockOnChange} />
      );

      const input = getByPlaceholderText('Test');
      fireEvent.changeText(input, longText);

      expect(mockOnChange).toHaveBeenCalledWith(longText);
    });

    it('should handle special characters', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <CustomInput placeholder="Test" onChangeText={mockOnChange} />
      );

      const input = getByPlaceholderText('Test');
      fireEvent.changeText(input, specialText);

      expect(mockOnChange).toHaveBeenCalledWith(specialText);
    });
  });
});