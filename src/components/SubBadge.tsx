import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { VertenteType, VertenteLevel } from '../types';
import { Colors, Radii, Typography } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';

interface SubBadgeProps {
  type: VertenteType;
  level: VertenteLevel;
  small?: boolean;
}

export const SubBadge: React.FC<SubBadgeProps> = React.memo(({ type, level, small = false }) => {
  const config = VERTENTE_CONFIG[type];
  return (
    <LinearGradient colors={config.gradient} style={[styles.badge, small && styles.small]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} accessibilityLabel={`${config.label} ${level}`}>
      <Text style={styles.emoji}>{config.emoji}</Text>
      <View>
        <Text style={[styles.name, small && styles.nameSmall]}>{config.label}</Text>
      </View>
      {!small && <View style={styles.levelBadge}><Text style={styles.levelText}>{level}</Text></View>}
    </LinearGradient>
  );
});

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
  emoji: { fontSize: Typography.fontSize.lg },
  name: { color: Colors.white, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily },
  nameSmall: { fontSize: Typography.fontSize.sm },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  levelText: { color: Colors.white, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBlack },
});
