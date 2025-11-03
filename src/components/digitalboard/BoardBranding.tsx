import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { DKLLogo } from '../ui';

export function BoardBranding() {
  return (
    <View style={styles.branding}>
      <View style={styles.logoBottomContainer}>
        <DKLLogo size="medium" style={styles.logoBottom} />
      </View>
      <Text style={styles.brandTagline}>Samen in beweging voor een goed doel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  branding: {
    position: 'absolute',
    bottom: spacing.xxxl + spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  logoBottomContainer: {
    backgroundColor: colors.background.paper,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.radius.lg,
    marginBottom: spacing.md,
  },
  logoBottom: {
    width: 220,
    height: 70,
  },
  brandTagline: {
    fontSize: 14,
    fontFamily: typography.fonts.body,
    color: '#999',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});