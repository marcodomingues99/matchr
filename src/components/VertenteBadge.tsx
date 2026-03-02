import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VertenteType, VertenteLevel } from '../types';
import { Colors, Spacing, Radii } from '../theme';

const EMOJI: Record<VertenteType, string> = { M: '👨', F: '👩', MX: '👫' };
const LABEL: Record<VertenteType, string> = { M: 'Masculino', F: 'Feminino', MX: 'Misto' };
const BG: Record<VertenteType, string> = {
  M: 'rgba(26,90,200,0.15)',
  F: 'rgba(212,0,106,0.15)',
  MX: 'rgba(200,120,0,0.15)',
};
const BORDER: Record<VertenteType, string> = {
  M: Colors.blue, F: '#D4006A', MX: Colors.orange,
};

interface Props { type: VertenteType; level: VertenteLevel; tournamentName?: string; }

export default function VertenteBadge({ type, level, tournamentName }: Props) {
  return (
    <View style={[s.container, { backgroundColor: BG[type], borderColor: BORDER[type] }]}>
      <Text style={s.emoji}>{EMOJI[type]}</Text>
      <View>
        <Text style={[s.name, { color: BORDER[type] }]}>
          {LABEL[type]}{level !== 'Sem' ? ` ${level}` : ''}
        </Text>
        {tournamentName ? <Text style={s.sub}>{tournamentName}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1.5, borderRadius: Radii.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2 },
  emoji: { fontSize: 18 },
  name: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  sub: { fontSize: 10, color: Colors.muted, marginTop: 1 },
});
