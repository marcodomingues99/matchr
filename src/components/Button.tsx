import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme';
import clsx from 'clsx';

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
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        className={clsx('rounded-lg overflow-hidden mb-sm', disabled && 'opacity-50')}
        style={style}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        <LinearGradient colors={GRADIENT_COLORS[variant]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="py-md items-center">
          <Text className="text-white text-lg font-nunito">{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={clsx(
        'rounded-lg overflow-hidden mb-sm',
        variant === 'ghost'
          ? 'border-transparent bg-transparent'
          : 'bg-white border-2 border-gl',
        disabled && 'opacity-50',
      )}
      style={[variant !== 'ghost' ? { paddingVertical: 13 } : undefined, style]}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text
        className={clsx(
          'text-lg font-nunito self-center',
          variant === 'ghost' ? 'text-muted' : 'text-navy',
        )}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});
