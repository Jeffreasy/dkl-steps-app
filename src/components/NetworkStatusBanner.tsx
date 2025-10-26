/**
 * NetworkStatusBanner Component
 * 
 * Toont een banner wanneer de app offline is.
 * Geeft users duidelijke feedback over hun connectie status.
 * 
 * Features:
 * - Auto-hide wanneer online
 * - Smooth slide-in animatie
 * - Sticky positioning (blijft bovenaan)
 * - Clear messaging over offline queue
 */

import { memo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '../hooks';
import { colors, typography, spacing } from '../theme';

function NetworkStatusBanner() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [slideAnim] = useState(new Animated.Value(-100));
  
  // Determine if we should show the banner
  const isOffline = !isConnected || isInternetReachable === false;

  useEffect(() => {
    if (isOffline) {
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, slideAnim]);

  // Don't render anything if online
  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>📡</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Offline Modus</Text>
          <Text style={styles.subtitle}>
            Stappen worden lokaal opgeslagen en gesynchroniseerd zodra je weer online bent
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// Export memoized version
export default memo(NetworkStatusBanner);

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.status.warning,
    paddingTop: 50, // Account for status bar
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyBold,
    color: colors.text.inverse,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
});