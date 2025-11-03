import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';

interface DevToolsProps {
  onSelectDeelnemer: () => void;
  onSelectAdmin: () => void;
}

export function DevTools({ onSelectDeelnemer, onSelectAdmin }: DevToolsProps) {
  // Only show in development
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.devSection}>
      <Text style={styles.devTitle}>🧪 Test Accounts</Text>
      <TouchableOpacity 
        style={styles.devButton}
        onPress={onSelectDeelnemer}
      >
        <Text style={styles.devButtonText}>Deelnemer (Diesmer)</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.devButton}
        onPress={onSelectAdmin}
      >
        <Text style={styles.devButtonText}>Admin (SuperAdmin)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  devSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  devTitle: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  devButton: {
    backgroundColor: colors.background.gray50,
    padding: spacing.md,
    borderRadius: spacing.radius.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  devButtonText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});