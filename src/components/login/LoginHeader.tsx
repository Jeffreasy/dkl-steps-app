import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { DKLLogo } from '../ui';

export function LoginHeader() {
  return (
    <View style={styles.logoSection}>
      <DKLLogo size="large" />
      <Text style={styles.title}>DKL Steps App</Text>
      <Text style={styles.tagline}>Track je stappen, maak impact!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl + spacing.sm,
  },
  title: {
    ...typography.styles.h1,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
});