import { Modal, View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';
import { DKLLogo } from '../ui';

interface SuccessModalProps {
  visible: boolean;
  userName: string;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
}

export function SuccessModal({ visible, userName, fadeAnim, scaleAnim }: SuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => {}}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.successModal,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Logo */}
          <View style={styles.successLogoContainer}>
            <DKLLogo size="medium" style={styles.successLogo} />
          </View>
          
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          
          {/* Success Text */}
          <Text style={styles.successTitle}>Succesvol Ingelogd!</Text>
          <Text style={styles.successMessage}>
            Welkom, <Text style={styles.successNameHighlight}>{userName}</Text>!
          </Text>
          
          {/* Loading indicator */}
          <View style={styles.successLoadingContainer}>
            <ActivityIndicator
              size="small"
              color={colors.primary}
            />
            <Text style={styles.successLoadingText}>
              Dashboard wordt geladen...
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successModal: {
    backgroundColor: colors.background.paper,
    borderRadius: spacing.radius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    ...shadows.xxl,
  },
  successLogoContainer: {
    marginBottom: spacing.lg,
  },
  successLogo: {
    width: 200,
    height: 70,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: spacing.radius.full,
    backgroundColor: colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  successIcon: {
    fontSize: 48,
    color: colors.text.inverse,
    fontWeight: '700' as const,
  },
  successTitle: {
    ...typography.styles.h2,
    fontFamily: typography.fonts.headingBold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successMessage: {
    ...typography.styles.body,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  successNameHighlight: {
    fontFamily: typography.fonts.bodyBold,
    color: colors.primary,
  },
  successLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  successLoadingText: {
    ...typography.styles.caption,
    fontFamily: typography.fonts.body,
    color: colors.text.secondary,
  },
});