/**
 * useAnimations Hook
 * Custom hooks for common animation patterns
 */

import { useRef, useEffect, useCallback } from 'react';
import { Animated } from 'react-native';
import { ANIMATION_PRESETS, SPRING_CONFIGS, TIMING_CONFIGS } from '../utils/animations';

/**
 * Fade animation hook
 */
export const useFadeAnimation = (initialValue: number = 0) => {
  const fadeAnim = useRef(new Animated.Value(initialValue)).current;

  const fadeIn = useCallback((onComplete?: () => void) => {
    ANIMATION_PRESETS.fadeIn(fadeAnim, onComplete);
  }, [fadeAnim]);

  const fadeOut = useCallback((onComplete?: () => void) => {
    ANIMATION_PRESETS.fadeOut(fadeAnim, onComplete);
  }, [fadeAnim]);

  return { fadeAnim, fadeIn, fadeOut };
};

/**
 * Scale animation hook
 */
export const useScaleAnimation = (initialValue: number = 1) => {
  const scaleAnim = useRef(new Animated.Value(initialValue)).current;

  const scaleIn = useCallback((onComplete?: () => void) => {
    ANIMATION_PRESETS.scaleIn(scaleAnim, onComplete);
  }, [scaleAnim]);

  const scaleOut = useCallback((onComplete?: () => void) => {
    ANIMATION_PRESETS.scaleOut(scaleAnim, onComplete);
  }, [scaleAnim]);

  const press = useCallback((onComplete?: () => void) => {
    ANIMATION_PRESETS.press(scaleAnim, onComplete);
  }, [scaleAnim]);

  return { scaleAnim, scaleIn, scaleOut, press };
};

/**
 * Pulse animation hook (continuous loop)
 */
export const usePulseAnimation = (autoStart: boolean = true) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const start = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
    animationRef.current = ANIMATION_PRESETS.pulse(pulseAnim);
    animationRef.current.start();
  }, [pulseAnim]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      // Reset to normal size
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [pulseAnim]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      stop();
    };
  }, [autoStart, start, stop]);

  return { pulseAnim, start, stop };
};

/**
 * Slide animation hook
 */
export const useSlideAnimation = (initialValue: number = 100) => {
  const slideAnim = useRef(new Animated.Value(initialValue)).current;

  const slideIn = useCallback((onComplete?: () => void) => {
    ANIMATION_PRESETS.slideInFromBottom(slideAnim, onComplete);
  }, [slideAnim]);

  const slideOut = useCallback((targetValue: number = 100, onComplete?: () => void) => {
    ANIMATION_PRESETS.slideOutToBottom(slideAnim, targetValue, onComplete);
  }, [slideAnim]);

  return { slideAnim, slideIn, slideOut };
};

/**
 * Shake animation hook (for errors)
 */
export const useShakeAnimation = () => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback((onComplete?: () => void) => {
    ANIMATION_PRESETS.shake(shakeAnim, onComplete);
  }, [shakeAnim]);

  return { shakeAnim, shake };
};

/**
 * Counter animation hook with number transition
 */
export const useCounterAnimation = (initialValue: number = 0) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const valueAnim = useRef(new Animated.Value(initialValue)).current;

  const animateChange = useCallback((newValue: number, onComplete?: () => void) => {
    // Animate the scale first
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...SPRING_CONFIGS.bouncy,
      }),
    ]).start(onComplete);

    // Animate the value change
    Animated.timing(valueAnim, {
      toValue: newValue,
      duration: 300,
      useNativeDriver: false, // Value animations can't use native driver
    }).start();
  }, [scaleAnim, valueAnim]);

  return { scaleAnim, valueAnim, animateChange };
};

/**
 * Spring animation hook
 */
export const useSpringAnimation = (
  initialValue: number = 0,
  config: keyof typeof SPRING_CONFIGS = 'standard'
) => {
  const springAnim = useRef(new Animated.Value(initialValue)).current;

  const animate = useCallback((toValue: number, onComplete?: () => void) => {
    Animated.spring(springAnim, {
      toValue,
      ...SPRING_CONFIGS[config],
    }).start(onComplete);
  }, [springAnim, config]);

  return { springAnim, animate };
};

/**
 * Rotation animation hook
 */
export const useRotationAnimation = (duration: number = 1000) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const start = useCallback(() => {
    rotateAnim.setValue(0);
    animationRef.current = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      })
    );
    animationRef.current.start();
  }, [rotateAnim, duration]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return { rotateAnim, rotate, start, stop };
};

/**
 * Combined entry animation hook
 * Combines fade and slide for smooth entry
 */
export const useEntryAnimation = (delay: number = 0) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const animate = useCallback((onComplete?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay,
        ...TIMING_CONFIGS.fadeIn,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        delay,
        ...TIMING_CONFIGS.slideIn,
      }),
    ]).start(onComplete);
  }, [fadeAnim, slideAnim, delay]);

  useEffect(() => {
    animate();
  }, [animate]);

  return { fadeAnim, slideAnim };
};

/**
 * Progress animation hook
 */
export const useProgressAnimation = (initialValue: number = 0) => {
  const progressAnim = useRef(new Animated.Value(initialValue)).current;

  const animateToProgress = useCallback((progress: number, duration: number = 500) => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  return { progressAnim, animateToProgress };
};

/**
 * Staggered animation hook for lists
 */
export const useStaggerAnimation = (itemCount: number, delay: number = 100) => {
  const animations = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(0))
  ).current;

  const startStagger = useCallback(() => {
    const staggered = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        delay: index * delay,
        ...TIMING_CONFIGS.fadeIn,
      })
    );

    Animated.stagger(delay, staggered).start();
  }, [animations, delay]);

  useEffect(() => {
    startStagger();
  }, [startStagger]);

  return animations;
};