import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../../theme';
import { useEffect, useRef } from 'react';
import triggerHaptic from '../../utils/haptics';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unlocked: boolean;
  color?: string;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  onPress?: (achievement: Achievement) => void;
}

/**
 * Visual achievement badge with progress indicator
 */
export function AchievementBadge({
  achievement,
  size = 'medium',
  onPress
}: AchievementBadgeProps) {
  const progress = Math.min((achievement.current / achievement.target) * 100, 100);
  const isUnlocked = achievement.unlocked || progress >= 100;
  
  const sizeStyles = {
    small: { size: 60, iconSize: 24, fontSize: 10 },
    medium: { size: 80, iconSize: 32, fontSize: 12 },
    large: { size: 100, iconSize: 40, fontSize: 14 },
  };
  
  const style = sizeStyles[size];
  const badgeColor = achievement.color || colors.primary;

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Haptic feedback on unlock
    if (isUnlocked && achievement.current >= achievement.target) {
      triggerHaptic.success();
    }

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    // Pulse effect when unlocked
    if (isUnlocked) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isUnlocked]);

  const animatedProgressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const handlePress = () => {
    if (onPress) {
      triggerHaptic.selection();
      onPress(achievement);
    }
  };

  const BadgeWrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress: handlePress, activeOpacity: 0.8 } : {};

  return (
    <View style={styles.container}>
      <BadgeWrapper {...wrapperProps}>
      <Animated.View
        style={[
          styles.badge,
          {
            width: style.size,
            height: style.size,
            transform: [
              { scale: scaleAnim },
              { scale: isUnlocked ? pulseAnim : 1 },
            ],
          }
        ]}
      >
        {isUnlocked ? (
          <LinearGradient
            colors={[badgeColor, `${badgeColor}CC`]}
            style={[styles.badgeContent, { borderRadius: style.size / 2 }]}
          >
            <Text style={[styles.icon, { fontSize: style.iconSize }]}>
              {achievement.icon}
            </Text>
          </LinearGradient>
        ) : (
          <View style={[styles.lockedBadge, { borderRadius: style.size / 2 }]}>
            <Text style={[styles.icon, styles.lockedIcon, { fontSize: style.iconSize }]}>
              {achievement.icon}
            </Text>
            <View style={styles.progressRing}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: animatedProgressWidth,
                    backgroundColor: badgeColor,
                  }
                ]}
              />
            </View>
          </View>
        )}
      </Animated.View>
      </BadgeWrapper>
      
      <View style={styles.info}>
        <Text style={[styles.title, { fontSize: style.fontSize }]} numberOfLines={1}>
          {achievement.title}
        </Text>
        {!isUnlocked && (
          <Text style={[styles.progress, { fontSize: style.fontSize - 2 }]}>
            {achievement.current}/{achievement.target}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 100,
  },
  badge: {
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedBadge: {
    flex: 1,
    backgroundColor: colors.background.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  icon: {
    textAlign: 'center',
  },
  lockedIcon: {
    opacity: 0.5,
  },
  progressRing: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.background.gray200,
  },
  progressFill: {
    height: '100%',
  },
  info: {
    alignItems: 'center',
  },
  title: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 2,
  },
  progress: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    fontSize: 10,
  },
});