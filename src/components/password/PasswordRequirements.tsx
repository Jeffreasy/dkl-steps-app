import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

export function PasswordRequirements() {
  return (
    <View style={styles.requirements}>
      <Text style={styles.requirementsTitle}>Wachtwoord vereisten:</Text>
      <Text style={styles.requirement}>• Minimaal 8 karakters</Text>
      <Text style={styles.requirement}>• Mag niet gelijk zijn aan huidig wachtwoord</Text>
      <Text style={styles.requirement}>• Aanbevolen: mix van letters, cijfers en symbolen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  requirements: {
    backgroundColor: `${colors.secondary}10`,
    padding: spacing.lg,
    borderRadius: spacing.radius.default,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.secondary}30`,
  },
  requirementsTitle: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  requirement: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
});