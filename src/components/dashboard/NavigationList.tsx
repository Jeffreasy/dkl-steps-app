import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';

interface NavigationItem {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

interface NavigationListProps {
  title: string;
  items: NavigationItem[];
}

export function NavigationList({ title, items }: NavigationListProps) {
  return (
    <View style={styles.navigationSection}>
      <Text style={styles.navigationTitle}>{title}</Text>
      
      {items.map((item, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.navCard}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          <View style={styles.navIconContainer}>
            <Text style={styles.navIcon}>{item.icon}</Text>
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>{item.title}</Text>
            <Text style={styles.navSubtitle}>{item.subtitle}</Text>
          </View>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navigationSection: {
    margin: spacing.lg,
  },
  navigationTitle: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.heading,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: spacing.radius.lg,
    marginBottom: spacing.md,
    ...shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  navIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  navIcon: {
    fontSize: 24,
  },
  navContent: {
    flex: 1,
  },
  navTitle: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  navSubtitle: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
  navArrow: {
    fontSize: 32,
    color: colors.border.default,
    fontWeight: '300',
  },
});