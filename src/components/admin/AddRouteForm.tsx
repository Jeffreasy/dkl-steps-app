import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { colors, typography, spacing, components } from '../../theme';

interface AddRouteFormProps {
  route: string;
  amount: string;
  onRouteChange: (text: string) => void;
  onAmountChange: (text: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function AddRouteForm({
  route,
  amount,
  onRouteChange,
  onAmountChange,
  onSubmit,
  isSubmitting = false
}: AddRouteFormProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Nieuwe Route Toevoegen</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Route (bijv. 5 KM)" 
        value={route} 
        onChangeText={onRouteChange}
        editable={!isSubmitting}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Bedrag (€)" 
        value={amount} 
        onChangeText={onAmountChange} 
        keyboardType="numeric"
        editable={!isSubmitting}
      />
      <Button 
        title={isSubmitting ? "Toevoegen..." : "Toevoegen"} 
        onPress={onSubmit} 
        disabled={!route || !amount || isSubmitting}
        color="#FF9800"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    ...components.card.elevated,
    margin: spacing.lg,
    marginTop: spacing.xl,
    borderTopWidth: 3,
    borderTopColor: colors.status.warning,
  },
  sectionTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    marginBottom: spacing.lg,
    color: colors.text.primary,
  },
  input: {
    ...components.input.base,
    marginVertical: spacing.sm,
    fontFamily: typography.fonts.body,
  },
});