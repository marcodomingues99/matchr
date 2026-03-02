import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { VertenteType, VertenteLevel } from '../types';
import { Colors, Spacing, Radii } from '../theme';

interface SubBadgeProps {
  type: VertenteType;
  level: VertenteLevel;
  small?: boolean;
}

const typeConfig = {
  M: { emoji: '👨', label: 'Masculino', colors: ['#0D2C6B', '#1A5AC8'] as string[] },
  F: { emoji: '👩', label: 'Feminino', colors: ['#8B0050', '#D4006A'] as string[] },
  MX: { emoji: '👫', label: 'Misto', colors: ['#5C3A00', '#C87800'] as string[] },
};

export const SubBadge: React.FC<SubBadgeProps> = ({ type, level, small = false }) => {
  const config = typeConfig[type];
  return (
    <LinearGradient colors={config.colors} style={[styles.badge, small && styles.small]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
      <Text style={styles.emoji}>{config.emoji}</Text>
      <View>
        <Text style={[styles.name, small && styles.nameSmall]}>{config.label}</Text>
        {!small && <Text style={styles.level}>{level}</Text>}
      </View>
      {!small && <View style={styles.levelBadge}><Text style={styles.levelText}>{level}</Text></View>}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emoji: { fontSize: 14 },
  name: { color: '#fff', fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  nameSmall: { fontSize: 11 },
  level: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontFamily: 'Nunito_700Bold' },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  levelText: { color: '#fff', fontSize: 11, fontFamily: 'Nunito_900Black' },
});
