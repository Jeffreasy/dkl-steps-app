/**
 * Error Boundary Component
 * Catches unhandled errors en toont fallback UI
 * Voorkomt dat de app crashed zonder feedback
 */

import { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing, shadows } from '../theme';
import { logger } from '../utils/logger';
import DKLLogo from './ui/DKLLogo';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state zodat de volgende render de fallback UI toont
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details voor debugging
    logger.error('Error Boundary caught:', error);
    logger.error('Component Stack:', errorInfo.componentStack);
    
    // Optioneel: Stuur naar error tracking service
    // if (!__DEV__) {
    //   Sentry.captureException(error, { 
    //     contexts: { react: errorInfo } 
    //   });
    // }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI indien meegegeven
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.reset);
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          {/* DKL Logo */}
          <View style={styles.logoContainer}>
            <DKLLogo size="medium" />
          </View>
          
          {/* Error Icon */}
          <Text style={styles.emoji}>😕</Text>
          
          {/* Error Message */}
          <Text style={styles.title}>Er ging iets mis</Text>
          <Text style={styles.message}>
            De app heeft een onverwachte fout tegengekomen.
            Je kunt proberen de app opnieuw te starten.
          </Text>
          
          {/* Error Details (Development Only) */}
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorTitle}>🔍 Error Details (Dev Only):</Text>
              <Text style={styles.errorName}>{this.state.error.name}</Text>
              <Text style={styles.errorMessage}>{this.state.error.message}</Text>
              {this.state.error.stack && (
                <Text style={styles.errorStack}>
                  {this.state.error.stack.substring(0, 300)}...
                </Text>
              )}
            </View>
          )}
          
          {/* Reset Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={this.reset}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>🔄 Opnieuw Proberen</Text>
          </TouchableOpacity>
          
          {/* Support Text */}
          <Text style={styles.support}>
            Als het probleem blijft bestaan, neem contact op met DKL support.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.subtle,
  },
  logoContainer: {
    backgroundColor: colors.background.paper,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: spacing.radius.lg,
    marginBottom: spacing.xxxl,
    ...shadows.lg,
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.styles.h2,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md + 4,
    borderRadius: spacing.radius.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  buttonText: {
    ...typography.styles.button,
    fontFamily: typography.fonts.bodyBold,
    color: colors.text.inverse,
    fontSize: 16,
  },
  support: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  errorDetails: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: spacing.radius.default,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    width: '100%',
    borderWidth: 2,
    borderColor: colors.status.error,
  },
  errorTitle: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyBold,
    color: colors.status.error,
    marginBottom: spacing.md,
  },
  errorName: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  errorStack: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.mono,
    color: colors.text.secondary,
    fontSize: 10,
    lineHeight: 14,
  },
});