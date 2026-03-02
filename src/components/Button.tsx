import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii, Shadows } from '../theme';

type Variant = 'primary' | 'secondary' | 'green' | 'red' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  style?: ViewStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onPress, variant = 'primary', style, disabled }) => {
  if (variant === 'primary' || variant === 'green' || variant === 'red') {
    const colors = {
      primary: [Colors.blue, Colors.teal] as string[],
      green: [Colors.green, '#00AA66'] as string[],
      red: ['#9B0000', Colors.red] as string[],
    }[variant];
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.base, style]} activeOpacity={0.85}>
        <LinearGradient colors={colors} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.primaryText}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, styles.secondary, variant === 'ghost' && styles.ghost, style]}
      activeOpacity={0.85}
    >
      <Text style={[styles.secondaryText, variant === 'ghost' && styles.ghostText]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: 8 },
  gradient: { paddingVertical: 14, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  secondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.gl,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryText: { color: Colors.navy, fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  ghost: { borderColor: 'transparent', backgroundColor: 'transparent' },
  ghostText: { color: Colors.muted },
});
