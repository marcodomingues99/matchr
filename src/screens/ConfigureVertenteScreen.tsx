import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, VertenteType } from '../types';
import { mockTournaments } from '../mock/data';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ConfigureVertente'>;

const LEVELS: Record<string, string[]> = {
  M: ['M6','M5','M4','M3','M2','M1'],
  F: ['F6','F5','F4','F3','F2','F1'],
  MX: ['MX6','MX5','MX4','MX3','MX2','MX1','Sem'],
};

export const ConfigureVertenteScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertenteIdx = route.params.vertenteIndex;
  const existingVert = tournament.vertentes[vertenteIdx];

  const [type, setType] = useState<VertenteType>(existingVert?.type ?? 'M');
  const [level, setLevel] = useState(existingVert?.level ?? 'M5');
  const [maxTeams, setMaxTeams] = useState(existingVert?.maxTeams ?? 16);
  const [courts, setCourts] = useState(existingVert?.courts ?? 2);

  const typeConfig = { M: { label: 'Masculino', emoji: '👨', color: Colors.blue }, F: { label: 'Feminino', emoji: '👩', color: '#D4006A' }, MX: { label: 'Misto', emoji: '👫', color: '#C87800' } };

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Torneio</Text>
          </TouchableOpacity>
          <Text style={s.title}>Configurar Sub-torneio</Text>
          <Text style={s.subtitle}>{tournament.name}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        <Text style={s.sectionLabel}>Modalidade</Text>
        <View style={s.typeRow}>
          {(['M','F','MX'] as VertenteType[]).map(t => {
            const cfg = typeConfig[t];
            const active = type === t;
            return (
              <TouchableOpacity
                key={t}
                style={[s.typeCard, active && { borderColor: cfg.color, borderWidth: 2 }]}
                onPress={() => { setType(t); setLevel(LEVELS[t][1]); }}
              >
                <Text style={s.typeEmoji}>{cfg.emoji}</Text>
                <Text style={[s.typeTxt, active && { color: cfg.color }]}>{cfg.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={s.sectionLabel}>Nível</Text>
        <View style={s.levelGrid}>
          {LEVELS[type].map(l => (
            <TouchableOpacity
              key={l}
              style={[s.levelBtn, level === l && s.levelBtnActive]}
              onPress={() => setLevel(l)}
            >
              <Text style={[s.levelTxt, level === l && s.levelTxtActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLabel}>Máximo de duplas</Text>
        <View style={s.optionRow}>
          {[8,12,16,24,32].map(n => (
            <TouchableOpacity key={n} style={[s.optBtn, maxTeams === n && s.optBtnActive]} onPress={() => setMaxTeams(n)}>
              <Text style={[s.optTxt, maxTeams === n && s.optTxtActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionLabel}>Courts disponíveis</Text>
        <View style={s.optionRow}>
          {[1,2,3,4,5,6].map(n => (
            <TouchableOpacity key={n} style={[s.optBtn, courts === n && s.optBtnActive]} onPress={() => setCourts(n)}>
              <Text style={[s.optTxt, courts === n && s.optTxtActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
        <TouchableOpacity
          style={s.saveBtn}
          onPress={() => {
            if (route.params.isLast) {
              navigation.navigate('TournamentDetail', { tournamentId: tournament.id });
            } else {
              navigation.navigate('ConfigureVertente', {
                tournamentId: tournament.id,
                vertenteIndex: vertenteIdx + 1,
                isLast: false,
              });
            }
          }}
        >
          <LinearGradient colors={Gradients.primary} style={s.saveGrad}>
            <Text style={s.saveTxt}>{route.params.isLast ? '✓ Concluir Configuração' : 'Próximo Sub-torneio →'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  back: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8, marginBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginTop: 4 },
  scroll: { flex: 1 },
  sectionLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  typeCard: { flex: 1, backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', ...Shadows.card },
  typeEmoji: { fontSize: 24, marginBottom: 6 },
  typeTxt: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  levelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radii.md, backgroundColor: '#fff', borderWidth: 1.5, borderColor: 'transparent', ...Shadows.card },
  levelBtnActive: { borderColor: Colors.blue, backgroundColor: '#EEF4FF' },
  levelTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  levelTxtActive: { color: Colors.blue },
  optionRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  optBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radii.md, backgroundColor: '#fff', borderWidth: 1.5, borderColor: 'transparent', ...Shadows.card },
  optBtnActive: { borderColor: Colors.blue, backgroundColor: '#EEF4FF' },
  optTxt: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  optTxtActive: { color: Colors.blue },
  saveBtn: { borderRadius: Radii.lg, overflow: 'hidden' },
  saveGrad: { padding: 15, alignItems: 'center' },
  saveTxt: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
});
