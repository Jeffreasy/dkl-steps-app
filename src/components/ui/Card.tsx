/**
 * Card Component
 * Herbruikbare card container met verschillende variants
 */

import { memo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { components } from '../../theme';

interface Props {
  children: React.ReactNode;
  variant?: 'base' | 'elevated' | 'bordered' | 'interactive';
  style?: ViewStyle;
}

function Card({ children, variant = 'base', style }: Props) {
  return (
    <View style={[components.card[variant], style]}>
      {children}
    </View>
  );
}

// Export memoized version
export default memo(Card);