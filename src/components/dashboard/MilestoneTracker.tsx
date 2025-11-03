import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, components } from '../../theme';

interface MilestoneTrackerProps {
  currentSteps: number;
  milestones?: number[];
}

export function MilestoneTracker({ 
  currentSteps,
  milestones = [2500, 5000, 7500, 10000]
}: MilestoneTrackerProps) {
  if (currentSteps === 0) {
    return null;
  }

  return (
    <View style={styles.milestoneCard}>
      <Text style={styles.milestoneTitle}>🎯 Mijlpalen</Text>
      <View style={styles.milestones}>
        {milestones.map((milestone, index) => (
          <View key={milestone} style={styles.milestoneGroup}>
            <View style={styles.milestone}>
              <View style={[
                styles.milestoneCircle, 
                currentSteps >= milestone && styles.milestoneCircleActive
              ]}>
                <Text style={styles.milestoneCheck}>
                  {currentSteps >= milestone ? '✓' : ''}
                </Text>
              </View>
              <Text style={styles.milestoneText}>
                {milestone.toLocaleString('nl-NL')}
              </Text>
            </View>
            {index < milestones.length - 1 && (
              <View style={styles.milestoneLine} />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  milestoneCard: {
    ...components.card.elevated,
    margin: spacing.lg,
    backgroundColor: `${colors.primary}08`,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  milestoneTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  milestones: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestoneGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  milestone: {
    alignItems: 'center',
  },
  milestoneCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  milestoneCircleActive: {
    backgroundColor: colors.primary,
  },
  milestoneCheck: {
    fontSize: 20,
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
  milestoneText: {
    fontSize: 11,
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  milestoneLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.background.gray200,
    marginHorizontal: spacing.xs,
  },
});