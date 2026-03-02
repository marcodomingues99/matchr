import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radii, Shadows, Gradients } from '../theme';

// ─── GradientButton ────────────────────────────────────────────────────────────
interface GradientButtonProps {
  label: string;
  onPress: () => void;
  colors?: string[];
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  onPress,
  colors = Gradients.blueToTeal,
  style,
  textStyle,
  disabled,
  loading,
  icon,
}) => (
  <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8} style={[styles.btnWrapper, style]}>
    <LinearGradient colors={colors as any} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={[styles.btnText, textStyle]}>{icon ? `${icon}  ${label}` : label}</Text>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = Colors.teal,
  bg = 'rgba(0,201,167,0.15)',
}) => (
  <View style={[styles.badge, { backgroundColor: bg }]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

// ─── StatusBadge ──────────────────────────────────────────────────────────────
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: '● Em Curso', color: Colors.teal, bg: 'rgba(0,201,167,0.15)' },
    draft: { label: '○ Rascunho', color: Colors.gray300, bg: 'rgba(148,163,184,0.15)' },
    completed: { label: '✓ Concluído', color: Colors.gold, bg: 'rgba(255,215,0,0.15)' },
    scheduled: { label: '○ Agendado', color: Colors.gray300, bg: 'rgba(148,163,184,0.12)' },
    in_progress: { label: '● A Jogar', color: Colors.accent, bg: 'rgba(255,107,53,0.15)' },
  };
  const c = config[status] ?? { label: status, color: Colors.gray300, bg: Colors.cardBg };
  return <Badge label={c.label} color={c.color} bg={c.bg} />;
};

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
  </View>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, action }) => (
  <View style={styles.emptyState}>
    {icon && <Text style={styles.emptyIcon}>{icon}</Text>}
    <Text style={styles.emptyTitle}>{title}</Text>
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    {action && (
      <GradientButton label={action.label} onPress={action.onPress} style={{ marginTop: Spacing.lg }} />
    )}
  </View>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
export const Divider: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.divider, style]} />
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Button
  btnWrapper: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  btnGradient: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 0.5,
  },

  // Card
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.base,
    ...Shadows.sm,
  },

  // Badge
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 0.3,
  },

  // Section
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
  },
  sectionSubtitle: {
    color: Colors.gray300,
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    marginTop: 2,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    color: Colors.gray300,
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: Spacing.md,
  },
});
