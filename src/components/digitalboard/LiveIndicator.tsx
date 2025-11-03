import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { usePulseAnimation } from '../../hooks/useAnimations';

interface LiveIndicatorProps {
  interval?: number;
}

export function LiveIndicator({ interval = 10 }: LiveIndicatorProps) {
  const { pulseAnim } = usePulseAnimation(true);

  return (
    <View style={styles.updateIndicator}>
      <Animated.View
        style={[
          styles.pulse,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.2],
              outputRange: [1, 0.7],
            }),
          }
        ]}
      />
      <Text style={styles.updateText}>🔴 LIVE • Updates elke {interval} sec</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  updateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxxl + spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.radius.full,
  },
  pulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.status.error,
    marginRight: spacing.md,
  },
  updateText: {
    color: '#999',
    fontFamily: typography.fonts.bodyMedium,
    fontSize: 13,
    letterSpacing: 1,
    fontWeight: '500',
  },
});