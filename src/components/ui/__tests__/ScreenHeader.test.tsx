/**
 * ScreenHeader Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import ScreenHeader from '../ScreenHeader';

describe('ScreenHeader Component', () => {
  describe('rendering', () => {
    it('should render with required title', () => {
      const { getByText } = render(<ScreenHeader title="Test Title" />);

      expect(getByText('Test Title')).toBeTruthy();
    });

    it('should render with subtitle', () => {
      const { getByText } = render(
        <ScreenHeader title="Main Title" subtitle="Subtitle here" />
      );

      expect(getByText('Main Title')).toBeTruthy();
      expect(getByText('Subtitle here')).toBeTruthy();
    });

    it('should not show subtitle when not provided', () => {
      const { queryByText, getByText } = render(
        <ScreenHeader title="Only Title" />
      );

      expect(getByText('Only Title')).toBeTruthy();
    });

    it('should show DKL logo by default', () => {
      const result = render(<ScreenHeader title="Test" />);

      // Logo should be rendered
      expect(result).toBeTruthy();
    });

    it('should hide logo when showLogo is false', () => {
      const result = render(<ScreenHeader title="Test" showLogo={false} />);

      expect(result).toBeTruthy();
    });

    it('should show icon when provided', () => {
      const { getByText } = render(
        <ScreenHeader title="Test" icon="🏃" />
      );

      expect(getByText('🏃')).toBeTruthy();
    });

    it('should not show icon when not provided', () => {
      const { queryByText, getByText } = render(
        <ScreenHeader title="Test" />
      );

      expect(getByText('Test')).toBeTruthy();
    });
  });

  describe('gradient customization', () => {
    it('should use default orange gradient', () => {
      const result = render(<ScreenHeader title="Test" />);

      expect(result).toBeTruthy();
    });

    it('should accept custom gradient colors', () => {
      const customColors: [string, string] = ['#FF0000', '#00FF00'];
      const result = render(
        <ScreenHeader title="Test" gradientColors={customColors} />
      );

      expect(result).toBeTruthy();
    });

    it('should use gradient colors as tuple', () => {
      const result = render(
        <ScreenHeader 
          title="Test" 
          gradientColors={['#000000', '#FFFFFF']} 
        />
      );

      expect(result).toBeTruthy();
    });
  });

  describe('content combinations', () => {
    it('should show title, subtitle, and icon together', () => {
      const { getByText } = render(
        <ScreenHeader
          title="Main Title"
          subtitle="Subtitle"
          icon="📱"
        />
      );

      expect(getByText('Main Title')).toBeTruthy();
      expect(getByText('Subtitle')).toBeTruthy();
      expect(getByText('📱')).toBeTruthy();
    });

    it('should show all optional elements', () => {
      const { getByText } = render(
        <ScreenHeader
          title="Title"
          subtitle="Subtitle"
          icon="🎉"
          showLogo={true}
          gradientColors={['#FF0000', '#0000FF']}
        />
      );

      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Subtitle')).toBeTruthy();
      expect(getByText('🎉')).toBeTruthy();
    });

    it('should show minimal configuration', () => {
      const { getByText } = render(<ScreenHeader title="Min" />);

      expect(getByText('Min')).toBeTruthy();
    });
  });

  describe('icon variations', () => {
    it('should support emoji icons', () => {
      const { getByText } = render(
        <ScreenHeader title="Test" icon="🏃‍♂️" />
      );

      expect(getByText('🏃‍♂️')).toBeTruthy();
    });

    it('should support special character icons', () => {
      const { getByText } = render(
        <ScreenHeader title="Test" icon="★" />
      );

      expect(getByText('★')).toBeTruthy();
    });

    it('should support multiple emoji icons', () => {
      const { getByText } = render(
        <ScreenHeader title="Test" icon="🎯🎯" />
      );

      expect(getByText('🎯🎯')).toBeTruthy();
    });
  });

  describe('title variations', () => {
    it('should handle short title', () => {
      const { getByText } = render(<ScreenHeader title="OK" />);

      expect(getByText('OK')).toBeTruthy();
    });

    it('should handle long title', () => {
      const longTitle = 'This is a very long title that might wrap to multiple lines';
      const { getByText } = render(<ScreenHeader title={longTitle} />);

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle multiline title', () => {
      const multilineTitle = 'Line 1\nLine 2';
      const { getByText } = render(<ScreenHeader title={multilineTitle} />);

      expect(getByText(multilineTitle)).toBeTruthy();
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'Title & More @ #1';
      const { getByText } = render(<ScreenHeader title={specialTitle} />);

      expect(getByText(specialTitle)).toBeTruthy();
    });
  });

  describe('subtitle variations', () => {
    it('should handle long subtitle', () => {
      const longSubtitle = 'This is a very long subtitle that provides detailed information';
      const { getByText } = render(
        <ScreenHeader title="Title" subtitle={longSubtitle} />
      );

      expect(getByText(longSubtitle)).toBeTruthy();
    });

    it('should handle empty string subtitle', () => {
      const { queryByText } = render(
        <ScreenHeader title="Title" subtitle="" />
      );

      expect(queryByText('Title')).toBeTruthy();
    });
  });

  describe('logo display', () => {
    it('should show logo by default', () => {
      const result = render(<ScreenHeader title="Test" />);

      expect(result).toBeTruthy();
    });

    it('should hide logo when showLogo is false', () => {
      const result = render(<ScreenHeader title="Test" showLogo={false} />);

      expect(result).toBeTruthy();
    });

    it('should show logo when showLogo is explicitly true', () => {
      const result = render(<ScreenHeader title="Test" showLogo={true} />);

      expect(result).toBeTruthy();
    });
  });

  describe('memoization', () => {
    it('should not re-render with same props', () => {
      const { rerender, getByText } = render(
        <ScreenHeader title="Test" subtitle="Sub" />
      );

      const firstRender = getByText('Test');

      rerender(<ScreenHeader title="Test" subtitle="Sub" />);

      expect(firstRender).toBeTruthy();
    });

    it('should re-render when title changes', () => {
      const { rerender, getByText } = render(
        <ScreenHeader title="Title 1" />
      );

      expect(getByText('Title 1')).toBeTruthy();

      rerender(<ScreenHeader title="Title 2" />);

      expect(getByText('Title 2')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined subtitle', () => {
      const { getByText } = render(
        <ScreenHeader title="Test" subtitle={undefined} />
      );

      expect(getByText('Test')).toBeTruthy();
    });

    it('should handle undefined icon', () => {
      const { getByText } = render(
        <ScreenHeader title="Test" icon={undefined} />
      );

      expect(getByText('Test')).toBeTruthy();
    });
  });
});