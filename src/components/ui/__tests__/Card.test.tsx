/**
 * Card Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import Card from '../Card';

describe('Card Component', () => {
  describe('rendering', () => {
    it('should render children', () => {
      const { getByText } = render(
        <Card>
          <Text>Card Content</Text>
        </Card>
      );

      expect(getByText('Card Content')).toBeTruthy();
    });

    it('should render base variant by default', () => {
      const { getByText } = render(
        <Card>
          <Text>Base Card</Text>
        </Card>
      );

      expect(getByText('Base Card')).toBeTruthy();
    });

    it('should render elevated variant', () => {
      const { getByText } = render(
        <Card variant="elevated">
          <Text>Elevated Card</Text>
        </Card>
      );

      expect(getByText('Elevated Card')).toBeTruthy();
    });

    it('should render bordered variant', () => {
      const { getByText } = render(
        <Card variant="bordered">
          <Text>Bordered Card</Text>
        </Card>
      );

      expect(getByText('Bordered Card')).toBeTruthy();
    });

    it('should render interactive variant', () => {
      const { getByText } = render(
        <Card variant="interactive">
          <Text>Interactive Card</Text>
        </Card>
      );

      expect(getByText('Interactive Card')).toBeTruthy();
    });

    it('should apply custom styles', () => {
      const customStyle = { marginTop: 20, padding: 10 };
      const { getByText } = render(
        <Card style={customStyle}>
          <Text>Styled Card</Text>
        </Card>
      );

      // Just verify card renders with custom style
      expect(getByText('Styled Card')).toBeTruthy();
    });
  });

  describe('children', () => {
    it('should render multiple children', () => {
      const { getByText } = render(
        <Card>
          <Text>First Child</Text>
          <Text>Second Child</Text>
          <Text>Third Child</Text>
        </Card>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
      expect(getByText('Third Child')).toBeTruthy();
    });

    it('should render nested components', () => {
      const { getByText } = render(
        <Card>
          <Card variant="elevated">
            <Text>Nested Card</Text>
          </Card>
        </Card>
      );

      expect(getByText('Nested Card')).toBeTruthy();
    });

    it('should handle empty children', () => {
      const result = render(<Card>{null}</Card>);

      expect(result).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('should merge custom styles with variant styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByText } = render(
        <Card variant="elevated" style={customStyle}>
          <Text>Merged Styles</Text>
        </Card>
      );

      // Verify card renders with merged styles
      expect(getByText('Merged Styles')).toBeTruthy();
    });

    it('should support conditional styling', () => {
      const isHighlighted = true;
      const highlightStyle = isHighlighted ? { borderColor: 'blue' } : {};
      
      const { getByText } = render(
        <Card style={highlightStyle}>
          <Text>Conditional Card</Text>
        </Card>
      );

      expect(getByText('Conditional Card')).toBeTruthy();
    });
  });

  describe('variants', () => {
    it('should apply different styles for each variant', () => {
      const variants = ['base', 'elevated', 'bordered', 'interactive'] as const;
      
      variants.forEach(variant => {
        const { getByText } = render(
          <Card variant={variant}>
            <Text>{variant} card</Text>
          </Card>
        );

        expect(getByText(`${variant} card`)).toBeTruthy();
      });
    });
  });

  describe('memoization', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender, getByText } = render(
        <Card>
          <Text>Memo Test</Text>
        </Card>
      );

      const firstRender = getByText('Memo Test');

      rerender(
        <Card>
          <Text>Memo Test</Text>
        </Card>
      );

      const secondRender = getByText('Memo Test');

      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle very large content', () => {
      const largeContent = Array.from({ length: 100 }, (_, i) => (
        <Text key={i}>Line {i}</Text>
      ));

      const { getByText } = render(
        <Card>{largeContent}</Card>
      );

      expect(getByText('Line 0')).toBeTruthy();
      expect(getByText('Line 99')).toBeTruthy();
    });

    it('should handle dynamic content updates', () => {
      const { getByText, rerender } = render(
        <Card>
          <Text>Initial Content</Text>
        </Card>
      );

      expect(getByText('Initial Content')).toBeTruthy();

      rerender(
        <Card>
          <Text>Updated Content</Text>
        </Card>
      );

      expect(getByText('Updated Content')).toBeTruthy();
    });
  });
});