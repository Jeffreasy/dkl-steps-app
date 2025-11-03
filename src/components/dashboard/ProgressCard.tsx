import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, components } from '../../theme';
import { useMemo, useEffect, useRef } from 'react';

interface ProgressCardProps {
  currentSteps: number;
  goalSteps?: number;
  showDelta?: boolean;
  delta?: number;
}

export function ProgressCard({
  currentSteps,
  goalSteps = 10000,
  showDelta = false,
  delta = 0
}: ProgressCardProps) {
  const progressPercentage = useMemo(() =>
    Math.min(currentSteps / goalSteps * 100, 100),
    [currentSteps, goalSteps]
  );

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const deltaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progressPercentage,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [progressPercentage]);

  useEffect(() => {
    if (showDelta && delta > 0) {
      deltaAnim.setValue(0);
      Animated.sequence([
        Animated.spring(deltaAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
        Animated.delay(2000),
        Animated.timing(deltaAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showDelta, delta]);

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Jouw Voortgang</Text>
        <Text style={styles.progressPercentage}>{progressPercentage.toFixed(0)}%</Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBarFill, { width: animatedWidth }]}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        </View>
      </View>
      
      <View style={styles.progressStats}>
        <View style={styles.progressStat}>
          <Text style={styles.progressStatValue}>
            {currentSteps.toLocaleString('nl-NL')}
          </Text>
          {showDelta && delta > 0 && (
            <Animated.Text
              style={[
                styles.progressStatDelta,
                {
                  opacity: deltaAnim,
                  transform: [
                    {
                      translateY: deltaAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              +{delta}
            </Animated.Text>
          )}
          <Text style={styles.progressStatLabel}>Huidige Stappen</Text>
        </View>
        <View style={styles.progressStatDivider} />
        <View style={styles.progressStat}>
          <Text style={styles.progressStatValue}>
            {goalSteps.toLocaleString('nl-NL')}
          </Text>
          <Text style={styles.progressStatLabel}>Doel</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    ...components.card.elevated,
    margin: spacing.lg,
    backgroundColor: colors.background.paper,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
  },
  progressPercentage: {
    ...typography.styles.h3,
    fontFamily: typography.fonts.headingBold,
    color: colors.primary,
  },
  progressBarContainer: {
    marginBottom: spacing.lg,
  },
  progressBarBackground: {
    ...components.progress.container,
    height: 14,
    backgroundColor: colors.background.gray200,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: spacing.radius.full,
    overflow: 'hidden',
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStat: {
    flex: 1,
    alignItems: 'center',
  },
  progressStatValue: {
    ...typography.styles.h4,
    fontFamily: typography.fonts.headingBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  progressStatLabel: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
  },
  progressStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border.default,
  },
  progressStatDelta: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    color: '#4ade80',
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});