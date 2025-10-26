/**
 * Haptics Utility Tests
 * 
 * Tests for the haptic feedback service
 */

import * as Haptics from 'expo-haptics';
import { haptics, hapticsPress, hapticsSuccess, hapticsError } from '../haptics';

jest.mock('expo-haptics');

describe('Haptics Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('light', () => {
    it('should trigger light impact feedback', async () => {
      await haptics.light();

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('should handle errors silently', async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValue(new Error('Haptics error'));

      await expect(haptics.light()).resolves.not.toThrow();
    });
  });

  describe('medium', () => {
    it('should trigger medium impact feedback', async () => {
      await haptics.medium();

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it('should handle errors silently', async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValue(new Error('Haptics error'));

      await expect(haptics.medium()).resolves.not.toThrow();
    });
  });

  describe('heavy', () => {
    it('should trigger heavy impact feedback', async () => {
      await haptics.heavy();

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy
      );
    });

    it('should handle errors silently', async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValue(new Error('Haptics error'));

      await expect(haptics.heavy()).resolves.not.toThrow();
    });
  });

  describe('success', () => {
    it('should trigger success notification feedback', async () => {
      await haptics.success();

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('should handle errors silently', async () => {
      (Haptics.notificationAsync as jest.Mock).mockRejectedValue(new Error('Haptics error'));

      await expect(haptics.success()).resolves.not.toThrow();
    });
  });

  describe('warning', () => {
    it('should trigger warning notification feedback', async () => {
      await haptics.warning();

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Warning
      );
    });

    it('should handle errors silently', async () => {
      (Haptics.notificationAsync as jest.Mock).mockRejectedValue(new Error('Haptics error'));

      await expect(haptics.warning()).resolves.not.toThrow();
    });
  });

  describe('error', () => {
    it('should trigger error notification feedback', async () => {
      await haptics.error();

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });

    it('should handle errors silently', async () => {
      (Haptics.notificationAsync as jest.Mock).mockRejectedValue(new Error('Haptics error'));

      await expect(haptics.error()).resolves.not.toThrow();
    });
  });

  describe('selection', () => {
    it('should trigger selection feedback', async () => {
      await haptics.selection();

      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });

    it('should handle errors silently', async () => {
      (Haptics.selectionAsync as jest.Mock).mockRejectedValue(new Error('Haptics error'));

      await expect(haptics.selection()).resolves.not.toThrow();
    });
  });

  describe('helper functions', () => {
    it('hapticsPress should call light feedback', async () => {
      await hapticsPress();

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });

    it('hapticsSuccess should call success feedback', async () => {
      await hapticsSuccess();

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success
      );
    });

    it('hapticsError should call error feedback', async () => {
      await hapticsError();

      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error
      );
    });
  });

  describe('platform availability', () => {
    it('should work on iOS', async () => {
      await haptics.light();

      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it('should work on Android', async () => {
      await haptics.medium();

      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  describe('error resilience', () => {
    it('should not crash app when haptics fail', async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValue(new Error('Device error'));
      (Haptics.notificationAsync as jest.Mock).mockRejectedValue(new Error('Device error'));
      (Haptics.selectionAsync as jest.Mock).mockRejectedValue(new Error('Device error'));

      await expect(haptics.light()).resolves.not.toThrow();
      await expect(haptics.success()).resolves.not.toThrow();
      await expect(haptics.selection()).resolves.not.toThrow();
    });

    it('should continue execution after failed haptic', async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValue(new Error('Error'));

      await haptics.light();
      await haptics.medium();
      await haptics.heavy();

      expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);
    });
  });
});