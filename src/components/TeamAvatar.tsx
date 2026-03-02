import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface Props { initials: string; color?: string; size?: number; }

export default function TeamAvatar({ initials, color = Colors.blue, size = 44 }: Props) {
  return (
    <View style={[s.av, { width: size, height: size, borderRadius: size * 0.25, backgroundColor: color }]}>
      <Text style={[s.text, { fontSize: size * 0.3 }]}>{initials}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  av: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontFamily: 'Nunito_900Black' },
});
