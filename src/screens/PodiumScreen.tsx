import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Podium'>;

const MOCK_PODIUM = [
  { pos: 1, name: 'Os Invencíveis', players: 'João Silva & Miguel Costa', sets: '12-4' },
  { pos: 2, name: 'Power Smash', players: 'Carlos Lopes & Pedro Martins', sets: '10-7' },
  { pos: 3, name: 'Net Hunters', players: 'Tiago Rocha & Hugo Pinto', sets: '9-8' },
  { pos: 4, name: 'Ace Force', players: 'Ricardo Alves & Vítor Cunha', sets: '7-9' },
];

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_COLORS = ['#FFD600', '#C0C0C0', '#CD7F32'];
const PODIUM_HEIGHTS = [110, 80, 65];

export const PodiumScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];

  // Reorder for podium display: 2nd, 1st, 3rd
  const podiumOrder = [MOCK_PODIUM[1], MOCK_PODIUM[0], MOCK_PODIUM[2]];
  const podiumHeights = [PODIUM_HEIGHTS[1], PODIUM_HEIGHTS[0], PODIUM_HEIGHTS[2]];

  return (
    <View style={s.container}>
      <LinearGradient colors={['#0D2C6B', '#1A5AC8', '#00A5C8']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Voltar</Text>
          </TouchableOpacity>
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>🏆 Pódio Final</Text>
          <Text style={s.subtitle}>{tournament.name}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        {/* Podium visual */}
        <View style={s.podiumArea}>
          {podiumOrder.map((team, i) => {
            const realPos = team.pos;
            return (
              <View key={team.name} style={[s.podiumCol, i === 1 && { marginBottom: 0 }]}>
                <Text style={s.podiumMedal}>{MEDALS[realPos - 1]}</Text>
                <Text style={s.podiumTeam} numberOfLines={2}>{team.name}</Text>
                <View style={[s.podiumBlock, { height: podiumHeights[i], backgroundColor: PODIUM_COLORS[realPos - 1] }]}>
                  <Text style={s.podiumPos}>{realPos}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Full ranking list */}
        <Text style={s.sectionLabel}>Classificação Completa</Text>
        {MOCK_PODIUM.map((team) => (
          <View key={team.name} style={s.rankCard}>
            <View style={[s.rankBadge, team.pos <= 3 && { backgroundColor: PODIUM_COLORS[team.pos - 1] }]}>
              {team.pos <= 3 ? (
                <Text style={s.rankMedal}>{MEDALS[team.pos - 1]}</Text>
              ) : (
                <Text style={[s.rankNum, { color: '#fff' }]}>{team.pos}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rankTeam}>{team.name}</Text>
              <Text style={s.rankPlayers}>{team.players}</Text>
            </View>
            <View style={s.rankStats}>
              <Text style={s.rankSets}>{team.sets}</Text>
              <Text style={s.rankSetsLabel}>sets W-L</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 24 }} />

        <TouchableOpacity
          style={s.exportBtn}
          onPress={() => navigation.navigate('Export', { tournamentId: route.params.tournamentId, vertenteId: route.params.vertenteId })}
        >
          <LinearGradient colors={Gradients.primary} style={s.exportGrad}>
            <Text style={s.exportTxt}>📥 Exportar Resultados</Text>
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
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 8 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginTop: 4 },
  scroll: { flex: 1 },
  podiumArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: '#fff', borderRadius: Radii.xl, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.card, gap: 8 },
  podiumCol: { flex: 1, alignItems: 'center' },
  podiumMedal: { fontSize: 24, marginBottom: 4 },
  podiumTeam: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy, textAlign: 'center', marginBottom: 6, paddingHorizontal: 2 },
  podiumBlock: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: 'center', justifyContent: 'center' },
  podiumPos: { fontSize: 24, fontFamily: 'Nunito_900Black', color: 'rgba(0,0,0,0.4)' },
  sectionLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  rankCard: { backgroundColor: '#fff', borderRadius: Radii.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.sm, ...Shadows.card },
  rankBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gbg, alignItems: 'center', justifyContent: 'center' },
  rankMedal: { fontSize: 20 },
  rankNum: { fontSize: 16, fontFamily: 'Nunito_900Black', color: Colors.muted },
  rankTeam: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  rankPlayers: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginTop: 2 },
  rankStats: { alignItems: 'flex-end' },
  rankSets: { fontSize: 14, fontFamily: 'Nunito_900Black', color: Colors.navy },
  rankSetsLabel: { fontSize: 9, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  exportBtn: { borderRadius: Radii.lg, overflow: 'hidden' },
  exportGrad: { padding: 15, alignItems: 'center' },
  exportTxt: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
});
