/**
 * DKL Shared Component Styles
 * Herbruikbare component styles gebaseerd op website design
 */

import { TextStyle, ViewStyle } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { typography } from './typography';

export const components = {
  // Button styles (zoals website)
  button: {
    primary: {
      view: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: spacing.radius.default,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        ...shadows.sm,
      } as ViewStyle,
      text: {
        color: colors.text.inverse,
        ...typography.styles.button,
      } as TextStyle,
      pressed: {
        backgroundColor: colors.primaryDark,
      } as ViewStyle,
    },
    
    secondary: {
      view: {
        backgroundColor: colors.secondary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: spacing.radius.default,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        ...shadows.sm,
      } as ViewStyle,
      text: {
        color: colors.text.inverse,
        ...typography.styles.button,
      } as TextStyle,
      pressed: {
        backgroundColor: colors.secondaryDark,
      } as ViewStyle,
    },
    
    outline: {
      view: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
        paddingVertical: spacing.md - 2,
        paddingHorizontal: spacing.xl - 2,
        borderRadius: spacing.radius.default,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      } as ViewStyle,
      text: {
        color: colors.primary,
        ...typography.styles.button,
      } as TextStyle,
      pressed: {
        backgroundColor: colors.primary,
      } as ViewStyle,
      pressedText: {
        color: colors.text.inverse,
      } as TextStyle,
    },
    
    ghost: {
      view: {
        backgroundColor: 'transparent',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: spacing.radius.default,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      } as ViewStyle,
      text: {
        color: colors.primary,
        ...typography.styles.button,
      } as TextStyle,
      pressed: {
        backgroundColor: `${colors.primary}1A`, // 10% opacity
      } as ViewStyle,
    },
    
    danger: {
      view: {
        backgroundColor: colors.status.error,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: spacing.radius.default,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        ...shadows.sm,
      } as ViewStyle,
      text: {
        color: colors.text.inverse,
        ...typography.styles.button,
      } as TextStyle,
    },
    
    disabled: {
      view: {
        backgroundColor: colors.background.gray200,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: spacing.radius.default,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      } as ViewStyle,
      text: {
        color: colors.text.disabled,
        ...typography.styles.button,
      } as TextStyle,
    },
  },
  
  // Card styles (zoals website)
  card: {
    base: {
      backgroundColor: colors.background.paper,
      borderRadius: spacing.radius.lg,
      padding: spacing.lg,
      ...shadows.md,
    } as ViewStyle,
    
    elevated: {
      backgroundColor: colors.background.paper,
      borderRadius: spacing.radius.lg,
      padding: spacing.lg,
      ...shadows.lg,
    } as ViewStyle,
    
    bordered: {
      backgroundColor: colors.background.paper,
      borderRadius: spacing.radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border.default,
    } as ViewStyle,
    
    interactive: {
      backgroundColor: colors.background.paper,
      borderRadius: spacing.radius.lg,
      padding: spacing.lg,
      ...shadows.md,
      // Add activeOpacity in component usage
    } as ViewStyle,
  },
  
  // Input styles (zoals website)
  input: {
    base: {
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border.default,
      borderRadius: spacing.radius.default,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      ...typography.styles.body,
      color: colors.text.primary,
    } as TextStyle,
    
    focused: {
      borderColor: colors.primary,
      borderWidth: 2,
    } as ViewStyle,
    
    error: {
      borderColor: colors.status.error,
      borderWidth: 2,
    } as ViewStyle,
    
    disabled: {
      backgroundColor: colors.background.gray100,
      color: colors.text.disabled,
    } as TextStyle,
  },
  
  // Badge styles
  badge: {
    base: {
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs,
      borderRadius: spacing.radius.full,
      alignSelf: 'flex-start' as const,
    } as ViewStyle,
    
    primary: {
      backgroundColor: `${colors.primary}1A`, // 10% opacity
    } as ViewStyle,
    
    success: {
      backgroundColor: '#16a34a1A',
    } as ViewStyle,
    
    warning: {
      backgroundColor: '#ca8a041A',
    } as ViewStyle,
    
    danger: {
      backgroundColor: '#dc26261A',
    } as ViewStyle,
    
    text: {
      ...typography.styles.caption,
      fontWeight: '500',
    } as TextStyle,
  },
  
  // Divider
  divider: {
    horizontal: {
      height: 1,
      backgroundColor: colors.border.default,
      marginVertical: spacing.md,
    } as ViewStyle,
    
    vertical: {
      width: 1,
      backgroundColor: colors.border.default,
      marginHorizontal: spacing.md,
    } as ViewStyle,
  },
  
  // Avatar
  avatar: {
    small: {
      width: 32,
      height: 32,
      borderRadius: 16,
    } as ViewStyle,
    
    medium: {
      width: 48,
      height: 48,
      borderRadius: 24,
    } as ViewStyle,
    
    large: {
      width: 64,
      height: 64,
      borderRadius: 32,
    } as ViewStyle,
    
    xlarge: {
      width: 96,
      height: 96,
      borderRadius: 48,
    } as ViewStyle,
  },
  
  // Progress bar
  progress: {
    container: {
      height: 8,
      backgroundColor: colors.background.gray200,
      borderRadius: spacing.radius.full,
      overflow: 'hidden' as const,
    } as ViewStyle,
    
    bar: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: spacing.radius.full,
    } as ViewStyle,
    
    barSuccess: {
      backgroundColor: colors.status.success,
    } as ViewStyle,
    
    barWarning: {
      backgroundColor: colors.status.warning,
    } as ViewStyle,
    
    barDanger: {
      backgroundColor: colors.status.error,
    } as ViewStyle,
  },
} as const;

export type ComponentKey = keyof typeof components;