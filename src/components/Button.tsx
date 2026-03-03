import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii, Spacing, Typography } from '../theme';

type Variant = 'primary' | 'secondary' | 'green' | 'red' | 'ghost';

const GRADIENT_COLORS: Record<'primary' | 'green' | 'red', readonly [string, string]> = {
  primary: [Colors.blue, Colors.teal],
  green: [Colors.green, Colors.greenDark],
  red: [Colors.redDark, Colors.red],
};

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  style?: ViewStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = React.memo(({ label, onPress, variant = 'primary', style, disabled }) => {
  if (variant === 'primary' || variant === 'green' || variant === 'red') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.base, disabled && styles.disabled, style]} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}>
        <LinearGradient colors={GRADIENT_COLORS[variant]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.primaryText}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, styles.secondary, variant === 'ghost' && styles.ghost, disabled && styles.disabled, style]}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.secondaryText, variant === 'ghost' && styles.ghostText]}>{label}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  base: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: 8 },
  gradient: { paddingVertical: Spacing.md, alignItems: 'center' },
  primaryText: { color: Colors.white, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily },
  secondary: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gl,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryText: { color: Colors.navy, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily },
  ghost: { borderColor: 'transparent', backgroundColor: 'transparent' },
  ghostText: { color: Colors.muted },
  disabled: { opacity: 0.5 },
});
