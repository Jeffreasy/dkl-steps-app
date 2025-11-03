import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, components } from '../../theme';
import { useEffect, useRef } from 'react';

interface Stat {
  icon: string;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: string;
}

interface StatsOverviewProps {
  stats: Stat[];
  columns?: 2 | 3;
}

/**
 * Modern stats overview grid with trend indicators
 */
export function StatsOverview({ stats, columns = 2 }: StatsOverviewProps) {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <AnimatedStatCard
          key={index}
          stat={stat}
          index={index}
          columns={columns}
        />
      ))}
    </View>
  );
}

function AnimatedStatCard({
  stat,
  index,
  columns
}: {
  stat: Stat;
  index: number;
  columns: 2 | 3;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        columns === 3 && styles.statCardThreeCol,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
          <LinearGradient
            colors={[
              stat.color ? `${stat.color}1A` : `${colors.primary}1A`,
              stat.color ? `${stat.color}0D` : `${colors.primary}0D`,
            ]}
            style={styles.gradient}
          >
            <Text style={styles.icon}>{stat.icon}</Text>
            <Text style={styles.value}>{stat.value}</Text>
            {stat.trend && (
              <View style={styles.trendContainer}>
                <Text
                  style={[
                    styles.trendText,
                    stat.trend.direction === 'up'
                      ? styles.trendUp
                      : styles.trendDown,
                  ]}
                >
                  {stat.trend.direction === 'up' ? '↑' : '↓'}{' '}
                  {Math.abs(stat.trend.value)}%
                </Text>
              </View>
            )}
            <Text style={styles.label}>{stat.label}</Text>
          </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    maxWidth: '48%',
  },
  statCardThreeCol: {
    minWidth: '30%',
    maxWidth: '32%',
  },
  gradient: {
    ...components.card.base,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  icon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  value: {
    ...typography.styles.h3,
    fontFamily: typography.fonts.headingBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    textAlign: 'center',
  },
  trendContainer: {
    marginBottom: spacing.xs,
  },
  trendText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
  },
  trendUp: {
    color: colors.status.success,
  },
  trendDown: {
    color: colors.status.error,
  },
});