import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, components, shadows } from '../../theme';
import { memo } from 'react';

interface RouteDetailModalProps {
  visible: boolean;
  route: { route: string; amount: number } | null;
  totalSteps: number;
  onClose: () => void;
}

/**
 * RouteDetailModal - Detailed view of a single route with statistics
 */
export const RouteDetailModal = memo(function RouteDetailModal({
  visible,
  route,
  totalSteps,
  onClose,
}: RouteDetailModalProps) {
  if (!route) return null;

  const percentage = totalSteps > 0 ? ((route.amount / totalSteps) * 100).toFixed(1) : '0';
  const avgPerDay = (route.amount / 365).toFixed(0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>📍 {route.route}</Text>
                <TouchableOpacity 
                  onPress={onClose}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Main Stats */}
              <View style={styles.mainStat}>
                <Text style={styles.mainStatLabel}>Totaal Stappen</Text>
                <Text style={styles.mainStatValue}>
                  {route.amount.toLocaleString('nl-NL')}
                </Text>
              </View>

              {/* Additional Stats */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>📊</Text>
                  <Text style={styles.statLabel}>Percentage</Text>
                  <Text style={styles.statValue}>{percentage}%</Text>
                  <Text style={styles.statSubtext}>van totaal</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>📅</Text>
                  <Text style={styles.statLabel}>Gemiddeld/Dag</Text>
                  <Text style={styles.statValue}>{avgPerDay}</Text>
                  <Text style={styles.statSubtext}>stappen per dag</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>🎯</Text>
                  <Text style={styles.statLabel}>Status</Text>
                  <Text style={styles.statValue}>
                    {route.amount > 5000 ? '✓' : '○'}
                  </Text>
                  <Text style={styles.statSubtext}>
                    {route.amount > 5000 ? 'Actief' : 'Klein'}
                  </Text>
                </View>
              </View>

              {/* Info Section */}
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>ℹ️ Route Informatie</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Route ID:</Text>
                  <Text style={styles.infoValue}>{route.route}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Contributie:</Text>
                  <Text style={styles.infoValue}>{percentage}% van totaal</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Totaal voor 2025:</Text>
                  <Text style={styles.infoValue}>
                    {route.amount.toLocaleString('nl-NL')} stappen
                  </Text>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>Sluiten</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 450,
  },
  modalContent: {
    backgroundColor: colors.background.paper,
    borderRadius: spacing.radius.lg,
    padding: spacing.xl,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.styles.h4,
    fontFamily: typography.fonts.heading,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.subtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: colors.text.secondary,
  },
  mainStat: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    marginBottom: spacing.lg,
  },
  mainStatLabel: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  mainStatValue: {
    ...typography.styles.h2,
    fontFamily: typography.fonts.headingBold,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    ...typography.styles.h5,
    fontFamily: typography.fonts.headingBold,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statSubtext: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.disabled,
    fontSize: 10,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: colors.background.subtle,
    borderRadius: spacing.radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    ...typography.styles.body,
    fontFamily: typography.fonts.heading,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
  infoValue: {
    ...typography.styles.bodySmall,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: spacing.radius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionButtonText: {
    ...typography.styles.body,
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '600',
    color: colors.text.inverse,
  },
});