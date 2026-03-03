import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Typography, TextStyles, Spacing, Radii, Shadows } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Podium'>;

const MOCK_PODIUM = [
  { pos: 1, name: 'Os Invencíveis', players: 'João Silva & Miguel Costa', sets: '12-4' },
  { pos: 2, name: 'Power Smash', players: 'Carlos Lopes & Pedro Martins', sets: '10-7' },
  { pos: 3, name: 'Net Hunters', players: 'Tiago Rocha & Hugo Pinto', sets: '9-8' },
  { pos: 4, name: 'Ace Force', players: 'Ricardo Alves & Vítor Cunha', sets: '7-9' },
];

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_COLORS = [Colors.yellow, Colors.silver, Colors.bronze];
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
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${VERTENTE_CONFIG[vertente.type].labelShort} ${vertente.level}`}
            onBack={() => navigation.navigate('VertenteHub', { tournamentId: tournament.id, vertenteId: vertente.id })}
          />
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
                <Text style={[s.rankNum, { color: Colors.white }]}>{team.pos}</Text>
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
      <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 8 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilySemiBold, marginTop: 4 },
  scroll: { flex: 1 },
  podiumArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: Colors.white, borderRadius: Radii.xl, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.card, gap: 8 },
  podiumCol: { flex: 1, alignItems: 'center' },
  podiumMedal: { fontSize: 24, marginBottom: 4 },
  podiumTeam: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily, color: Colors.navy, textAlign: 'center', marginBottom: 6, paddingHorizontal: 2 },
  podiumBlock: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, alignItems: 'center', justifyContent: 'center' },
  podiumPos: { fontSize: 24, fontFamily: Typography.fontFamilyBlack, color: 'rgba(0,0,0,0.4)' },
  sectionLabel: { ...TextStyles.sectionLabel, marginBottom: 10 },
  rankCard: { backgroundColor: Colors.white, borderRadius: Radii.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.sm, ...Shadows.card },
  rankBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gbg, alignItems: 'center', justifyContent: 'center' },
  rankMedal: { fontSize: Typography.fontSize.xxl },
  rankNum: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamilyBlack, color: Colors.muted },
  rankTeam: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
  rankPlayers: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 2 },
  rankStats: { alignItems: 'flex-end' },
  rankSets: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBlack, color: Colors.navy },
  rankSetsLabel: { fontSize: Typography.fontSize.xxs, fontFamily: Typography.fontFamilyBold, color: Colors.muted },
  exportBtn: { borderRadius: Radii.lg, overflow: 'hidden' },
  exportGrad: { padding: 15, alignItems: 'center' },
  exportTxt: { color: Colors.white, fontSize: 15, fontFamily: Typography.fontFamily },
});
