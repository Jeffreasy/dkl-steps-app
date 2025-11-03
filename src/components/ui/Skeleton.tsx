/**
 * Skeleton Loading Component
 * Beautiful loading placeholders with shimmer animation
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = spacing.radius.default,
  style 
}: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[{ width: width as any, height, borderRadius }, style]}>
      <Animated.View
        style={[
          styles.skeletonInner,
          {
            opacity,
          },
        ]}
      />
    </View>
  );
}

/**
 * Card Skeleton - for loading cards
 */
export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width="60%" height={24} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="100%" height={16} style={{ marginBottom: spacing.xs }} />
      <Skeleton width="80%" height={16} style={{ marginBottom: spacing.md }} />
      <View style={styles.row}>
        <Skeleton width={80} height={32} />
        <Skeleton width={80} height={32} />
      </View>
    </View>
  );
}

/**
 * List Item Skeleton - for loading list items
 */
export function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.listContent}>
        <Skeleton width="70%" height={16} style={{ marginBottom: spacing.xs }} />
        <Skeleton width="50%" height={14} />
      </View>
    </View>
  );
}

/**
 * Stat Card Skeleton - for dashboard stat cards
 */
export function StatCardSkeleton() {
  return (
    <View style={styles.statCard}>
      <Skeleton width={40} height={40} borderRadius={spacing.radius.lg} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="80%" height={32} style={{ marginBottom: spacing.xs }} />
      <Skeleton width="60%" height={14} />
    </View>
  );
}

/**
 * Progress Card Skeleton - for progress displays
 */
export function ProgressCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width="50%" height={20} style={{ marginBottom: spacing.md }} />
      <Skeleton width="100%" height={8} borderRadius={spacing.radius.full} style={{ marginBottom: spacing.sm }} />
      <View style={styles.row}>
        <Skeleton width="40%" height={14} />
        <Skeleton width="30%" height={14} />
      </View>
    </View>
  );
}

/**
 * Route Item Skeleton - for route lists
 */
export function RouteItemSkeleton() {
  return (
    <View style={styles.routeItem}>
      <Skeleton width={32} height={32} borderRadius={spacing.radius.full} style={{ marginRight: spacing.md }} />
      <View style={styles.routeContent}>
        <Skeleton width="70%" height={16} style={{ marginBottom: spacing.xs }} />
        <Skeleton width="40%" height={14} />
      </View>
      <Skeleton width={60} height={32} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonInner: {
    flex: 1,
    backgroundColor: colors.background.gray200,
    borderRadius: spacing.radius.default,
  },
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: spacing.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderRadius: spacing.radius.default,
    marginBottom: spacing.sm,
  },
  listContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCard: {
    backgroundColor: colors.background.paper,
    borderRadius: spacing.radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    minWidth: 150,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    borderRadius: spacing.radius.default,
    marginBottom: spacing.sm,
  },
  routeContent: {
    flex: 1,
  },
});