/**
 * Animation Utilities
 * Reusable animation configurations and presets
 */

import { Animated, Easing } from 'react-native';

/**
 * Standard animation durations (in ms)
 */
export const ANIMATION_DURATIONS = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

/**
 * Spring animation configurations
 */
export const SPRING_CONFIGS = {
  // Gentle bounce effect
  gentle: {
    tension: 70,
    friction: 10,
    useNativeDriver: true,
  },
  // Standard bounce
  standard: {
    tension: 100,
    friction: 12,
    useNativeDriver: true,
  },
  // Snappy, responsive feel
  snappy: {
    tension: 150,
    friction: 15,
    useNativeDriver: true,
  },
  // Bouncy, playful
  bouncy: {
    tension: 50,
    friction: 7,
    useNativeDriver: true,
  },
  // Stiff, minimal bounce
  stiff: {
    tension: 200,
    friction: 20,
    useNativeDriver: true,
  },
} as const;

/**
 * Timing configurations for different animation types
 */
export const TIMING_CONFIGS = {
  fadeIn: {
    duration: ANIMATION_DURATIONS.normal,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  fadeOut: {
    duration: ANIMATION_DURATIONS.normal,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  },
  slideIn: {
    duration: ANIMATION_DURATIONS.normal,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  slideOut: {
    duration: ANIMATION_DURATIONS.normal,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  },
  scale: {
    duration: ANIMATION_DURATIONS.fast,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
  pulse: {
    duration: ANIMATION_DURATIONS.slow,
    easing: Easing.inOut(Easing.ease),
    useNativeDriver: true,
  },
} as const;

/**
 * Easing presets for common animation curves
 */
export const EASINGS = {
  linear: Easing.linear,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  cubic: Easing.bezier(0.4, 0.0, 0.2, 1),
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
} as const;

/**
 * Animation presets for common patterns
 */
export const ANIMATION_PRESETS = {
  // Fade animations
  fadeIn: (animatedValue: Animated.Value, onComplete?: () => void) => {
    return Animated.timing(animatedValue, {
      toValue: 1,
      ...TIMING_CONFIGS.fadeIn,
    }).start(onComplete);
  },

  fadeOut: (animatedValue: Animated.Value, onComplete?: () => void) => {
    return Animated.timing(animatedValue, {
      toValue: 0,
      ...TIMING_CONFIGS.fadeOut,
    }).start(onComplete);
  },

  // Scale animations
  scaleIn: (animatedValue: Animated.Value, onComplete?: () => void) => {
    return Animated.spring(animatedValue, {
      toValue: 1,
      ...SPRING_CONFIGS.gentle,
    }).start(onComplete);
  },

  scaleOut: (animatedValue: Animated.Value, onComplete?: () => void) => {
    return Animated.timing(animatedValue, {
      toValue: 0,
      ...TIMING_CONFIGS.scale,
    }).start(onComplete);
  },

  // Slide animations
  slideInFromBottom: (animatedValue: Animated.Value, onComplete?: () => void) => {
    return Animated.timing(animatedValue, {
      toValue: 0,
      ...TIMING_CONFIGS.slideIn,
    }).start(onComplete);
  },

  slideOutToBottom: (animatedValue: Animated.Value, targetValue: number, onComplete?: () => void) => {
    return Animated.timing(animatedValue, {
      toValue: targetValue,
      ...TIMING_CONFIGS.slideOut,
    }).start(onComplete);
  },

  // Pulse animation (continuous loop)
  pulse: (animatedValue: Animated.Value) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.2,
          ...TIMING_CONFIGS.pulse,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          ...TIMING_CONFIGS.pulse,
        }),
      ])
    );
  },

  // Press animation (scale down and back)
  press: (animatedValue: Animated.Value, onComplete?: () => void) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.95,
        duration: ANIMATION_DURATIONS.fast,
        useNativeDriver: true,
      }),
      Animated.spring(animatedValue, {
        toValue: 1,
        ...SPRING_CONFIGS.snappy,
      }),
    ]).start(onComplete);
  },

  // Shake animation (for errors)
  shake: (animatedValue: Animated.Value, onComplete?: () => void) => {
    return Animated.sequence([
      Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(animatedValue, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(onComplete);
  },
};

/**
 * Create a staggered animation sequence
 */
export const createStaggerAnimation = (
  animations: Array<{ value: Animated.Value; toValue: number }>,
  delay: number = 100,
  config = TIMING_CONFIGS.fadeIn
) => {
  const staggered = animations.map((anim, index) =>
    Animated.timing(anim.value, {
      toValue: anim.toValue,
      delay: index * delay,
      ...config,
    })
  );

  return Animated.parallel(staggered);
};

/**
 * Counter animation with spring effect
 */
export const animateCounter = (
  animatedValue: Animated.Value,
  targetValue: number,
  onComplete?: () => void
) => {
  return Animated.sequence([
    // Quick scale down
    Animated.timing(animatedValue, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }),
    // Spring back with overshoot
    Animated.spring(animatedValue, {
      toValue: 1,
      ...SPRING_CONFIGS.bouncy,
    }),
  ]).start(onComplete);
};

/**
 * Number counter transition (for changing numeric values)
 */
export const createNumberTransition = (
  from: number,
  to: number,
  duration: number = ANIMATION_DURATIONS.normal
) => {
  const animatedValue = new Animated.Value(from);
  
  Animated.timing(animatedValue, {
    toValue: to,
    duration,
    easing: EASINGS.easeOut,
    useNativeDriver: false, // Can't use native driver for non-transform values
  }).start();

  return animatedValue;
};

/**
 * Page transition configurations
 */
export const PAGE_TRANSITIONS = {
  slideFromRight: {
    cardStyleInterpolator: ({ current, layouts }: any) => ({
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    }),
  },
  slideFromBottom: {
    cardStyleInterpolator: ({ current, layouts }: any) => ({
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
    }),
  },
  fade: {
    cardStyleInterpolator: ({ current }: any) => ({
      cardStyle: {
        opacity: current.progress,
      },
    }),
  },
  modal: {
    cardStyleInterpolator: ({ current }: any) => ({
      cardStyle: {
        opacity: current.progress,
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
      },
    }),
  },
};

/**
 * Interpolate color between two values
 */
export const interpolateColor = (
  animatedValue: Animated.Value,
  inputRange: number[],
  outputRange: string[]
) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
  });
};