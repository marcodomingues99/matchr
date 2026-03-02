import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors, Gradients, Spacing } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  rightAction?: { label: string; onPress: () => void };
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title, subtitle, onBack, backLabel = '← Voltar',
  rightAction, children,
}) => {
  const navigation = useNavigation();
  const handleBack = onBack ?? (() => navigation.goBack());

  return (
    <LinearGradient colors={Gradients.header} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.row}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.back}>{backLabel}</Text>
        </TouchableOpacity>
        {rightAction && (
          <TouchableOpacity style={styles.rightBtn} onPress={rightAction.onPress}>
            <Text style={styles.rightBtnText}>{rightAction.label}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 56,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  back: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Nunito_900Black',
    marginTop: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    marginTop: 4,
  },
  rightBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  rightBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },
});
