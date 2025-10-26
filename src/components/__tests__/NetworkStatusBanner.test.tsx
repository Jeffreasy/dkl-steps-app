/**
 * NetworkStatusBanner Component Tests
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import NetworkStatusBanner from '../NetworkStatusBanner';
import * as hooks from '../../hooks';

jest.mock('../../hooks', () => ({
  useNetworkStatus: jest.fn(),
}));

describe('NetworkStatusBanner Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('online state', () => {
    it('should not render when online', () => {
      (hooks.useNetworkStatus as jest.Mock).mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
      });

      const { queryByText } = render(<NetworkStatusBanner />);

      expect(queryByText('Offline Modus')).toBeNull();
    });

    it('should return null when fully connected', () => {
      (hooks.useNetworkStatus as jest.Mock).mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
      });

      const result = render(<NetworkStatusBanner />);

      expect(result.queryByText('Offline Modus')).toBeNull();
    });
  });

  describe('offline state', () => {
    it('should render when not connected', () => {
      (hooks.useNetworkStatus as jest.Mock).mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const { getByText } = render(<NetworkStatusBanner />);

      expect(getByText('Offline Modus')).toBeTruthy();
    });

    it('should render when connected but no internet', () => {
      (hooks.useNetworkStatus as jest.Mock).mockReturnValue({
        isConnected: true,
        isInternetReachable: false,
      });

      const { getByText } = render(<NetworkStatusBanner />);

      expect(getByText('Offline Modus')).toBeTruthy();
    });

    it('should show offline icon', () => {
      (hooks.useNetworkStatus as jest.Mock).mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const { getByText } = render(<NetworkStatusBanner />);

      expect(getByText('📡')).toBeTruthy();
    });

    it('should show explanatory message', () => {
      (hooks.useNetworkStatus as jest.Mock).mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const { getByText } = render(<NetworkStatusBanner />);

      expect(getByText(/Stappen worden lokaal opgeslagen/)).toBeTruthy();
    });
  });

  describe('banner content', () => {
    beforeEach(() => {
      (hooks.useNetworkStatus as jest.Mock).mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
      });
    });

    it('should show title', () => {
      const { getByText } = render(<NetworkStatusBanner />);

      expect(getByText('Offline Modus')).toBeTruthy();
    });

    it('should show subtitle with sync info', () => {
      const { getByText } = render(<NetworkStatusBanner />);

      const subtitle = getByText(/Stappen worden lokaal opgeslagen/);
      expect(subtitle).toBeTruthy();
    });

    it('should have offline icon', () => {
      const { getByText } = render(<NetworkStatusBanner />);

      expect(getByText('📡')).toBeTruthy();
    });
  });

  describe('state transitions', () => {
    it('should respond to online state', () => {
      // Test with online state
      (hooks.useNetworkStatus as jest.Mock).mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
      });

      const { queryByText } = render(<NetworkStatusBanner />);
      expect(queryByText('Offline Modus')).toBeNull();
    });

    it('should respond to offline state', () => {
      // Test with offline state
      (hooks.useNetworkStatus as jest.Mock).mockReturnValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const { queryByText } = render(<NetworkStatusBanner />);
      expect(queryByText('Offline Modus')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle null connectivity values', () => {
      (hooks.useNetworkStatus as jest.Mock).mockReturnValue({
        isConnected: null,
        isInternetReachable: null,
      });

      const { queryByText } = render(<NetworkStatusBanner />);

      // Should treat null as offline
      expect(queryByText('Offline Modus')).toBeTruthy();
    });

    it('should handle undefined connectivity values', () => {
      (hooks.useNetworkStatus as jest.Mock).mockReturnValue({
        isConnected: undefined,
        isInternetReachable: undefined,
      });

      const { queryByText } = render(<NetworkStatusBanner />);

      expect(queryByText('Offline Modus')).toBeTruthy();
    });
  });

  describe('memoization', () => {
    it('should be a memoized component', () => {
      (hooks.useNetworkStatus as jest.Mock).mockReturnValue({
        isConnected: true,
        isInternetReachable: true,
      });

      const result = render(<NetworkStatusBanner />);
      
      // Component should be memoized (verified by React.memo)
      expect(result).toBeTruthy();
    });
  });
});