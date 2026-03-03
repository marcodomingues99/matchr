import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { popTo } from '../utils/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Team } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { TeamGamesSheet } from '../components/TeamGamesSheet';
import { Colors, Gradients, Typography, TextStyles, Spacing, Radii, Shadows } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { calcStats } from '../utils/scoring';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Podium'>;

interface PodiumEntry {
  pos: number;
  name: string;
  players: string;
  sets: string;
  team: Team;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_COLORS = [Colors.yellow, Colors.silver, Colors.bronze];
const PODIUM_HEIGHTS = [110, 80, 65];

export const PodiumScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);
  const [sheetTeam, setSheetTeam] = React.useState<Team | null>(null);

  // Derive ranking from actual team stats
  const ranking: PodiumEntry[] = React.useMemo(() => {
    if (!vertente) return [];
    return vertente.teams
      .filter(t => !t.withdrawn)
      .map(team => {
        const stats = calcStats(team.id, mockGames);
        return {
          pos: 0,
          name: team.name,
          players: team.players.map(p => p.name).join(' & '),
          sets: `${stats.gamesWon}-${stats.gamesLost}`,
          team,
          _sortKey: stats.pts * 10000 + (stats.gamesWon - stats.gamesLost),
        };
      })
      .sort((a, b) => b._sortKey - a._sortKey)
      .map(({ _sortKey, ...rest }, i) => ({ ...rest, pos: i + 1 }));
  }, [vertente]);

  if (!tournament || !vertente) {
    return (
      <View style={s.container}>
        <LinearGradient colors={Gradients.header} style={s.header}>
          <SafeAreaView edges={['top']}>
            <HeaderNav backLabel="Voltar" onBack={() => navigation.goBack()} />
            <Text style={s.title}>🏆 Pódio Final</Text>
          </SafeAreaView>
        </LinearGradient>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg }}>
          <Text style={{ fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily, color: Colors.muted, textAlign: 'center' }}>
            Torneio ou sub-torneio não encontrado.
          </Text>
        </View>
      </View>
    );
  }

  // Reorder top 3 for podium display: 2nd, 1st, 3rd
  const top3 = ranking.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = top3.length >= 3
    ? [PODIUM_HEIGHTS[1], PODIUM_HEIGHTS[0], PODIUM_HEIGHTS[2]]
    : top3.map((_, i) => PODIUM_HEIGHTS[i]);

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${VERTENTE_CONFIG[vertente.type].labelShort} ${vertente.level}`}
            onBack={() => navigation.goBack()}
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
                <TouchableOpacity onPress={() => setSheetTeam(team.team)}>
                  <Text style={[s.podiumTeam, { textDecorationLine: 'underline' }]} numberOfLines={2}>{team.name}</Text>
                </TouchableOpacity>
                <View style={[s.podiumBlock, { height: podiumHeights[i], backgroundColor: PODIUM_COLORS[realPos - 1] }]}>
                  <Text style={s.podiumPos}>{realPos}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Full ranking list */}
        <Text style={s.sectionLabel}>Classificação Completa</Text>
        {ranking.map((entry) => (
          <TouchableOpacity key={entry.name} style={s.rankCard} onPress={() => setSheetTeam(entry.team)}>
            <View style={[s.rankBadge, entry.pos <= 3 && { backgroundColor: PODIUM_COLORS[entry.pos - 1] }]}>
              {entry.pos <= 3 ? (
                <Text style={s.rankMedal}>{MEDALS[entry.pos - 1]}</Text>
              ) : (
                <Text style={[s.rankNum, { color: Colors.white }]}>{entry.pos}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rankTeam}>{entry.name}</Text>
              <Text style={s.rankPlayers}>{entry.players}</Text>
            </View>
            <View style={s.rankStats}>
              <Text style={s.rankSets}>{entry.sets}</Text>
              <Text style={s.rankSetsLabel}>sets W-L</Text>
            </View>
          </TouchableOpacity>
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
      <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
      <TeamGamesSheet
        visible={sheetTeam !== null}
        team={sheetTeam}
        vertente={vertente}
        games={mockGames}
        onClose={() => setSheetTeam(null)}
      />
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
