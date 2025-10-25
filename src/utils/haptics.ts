/**
 * Haptics Utility
 * 
 * Centraal beheer voor haptic/tactile feedback in de app.
 * Gebruikt expo-haptics voor native trillings-feedback.
 * 
 * @example
 * ```typescript
 * import { haptics } from '@/utils/haptics';
 * 
 * // Bij succesvolle actie
 * haptics.success();
 * 
 * // Bij button press
 * haptics.light();
 * 
 * // Bij error
 * haptics.error();
 * ```
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Check of haptics beschikbaar zijn op dit device
 */
const isHapticsAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Haptics helper functies
 */
export const haptics = {
  /**
   * Lichte tactile feedback - voor button presses, selections
   */
  light: async () => {
    if (isHapticsAvailable) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Silently fail - haptics zijn nice-to-have
      }
    }
  },

  /**
   * Medium tactile feedback - voor belangrijkere acties
   */
  medium: async () => {
    if (isHapticsAvailable) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Silently fail
      }
    }
  },

  /**
   * Zware tactile feedback - voor zeer belangrijke acties
   */
  heavy: async () => {
    if (isHapticsAvailable) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (error) {
        // Silently fail
      }
    }
  },

  /**
   * Success feedback - voor succesvolle acties (login, sync, etc.)
   */
  success: async () => {
    if (isHapticsAvailable) {
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch (error) {
        // Silently fail
      }
    }
  },

  /**
   * Warning feedback - voor waarschuwingen
   */
  warning: async () => {
    if (isHapticsAvailable) {
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
      } catch (error) {
        // Silently fail
      }
    }
  },

  /**
   * Error feedback - voor errors en failures
   */
  error: async () => {
    if (isHapticsAvailable) {
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
      } catch (error) {
        // Silently fail
      }
    }
  },

  /**
   * Selection feedback - voor scrolling door opties, pickers
   */
  selection: async () => {
    if (isHapticsAvailable) {
      try {
        await Haptics.selectionAsync();
      } catch (error) {
        // Silently fail
      }
    }
  },
};

/**
 * Haptic feedback voor button presses
 * Gebruik in TouchableOpacity onPress
 */
export const hapticsPress = () => haptics.light();

/**
 * Haptic feedback voor succesvolle acties
 */
export const hapticsSuccess = () => haptics.success();

/**
 * Haptic feedback voor errors
 */
export const hapticsError = () => haptics.error();

/**
 * Default export
 */
export default haptics;