import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { popTo } from '../utils/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList, Team } from '../types';
import { api } from '../api/client';
import { tournamentKeys, matchKeys } from '../api/queryKeys';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { TeamMatchesSheet } from '../components/TeamMatchesSheet';
import { Colors, Gradients } from '../theme';
import { CATEGORY_CONFIG } from '../utils/categoryConfig';
import { calcStats } from '../utils/scoring';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Podium'>;

interface PodiumEntry {
  pos: number;
  name: string;
  players: string;
  sets: string;
  team: Team;
}

const MEDALS = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
const PODIUM_COLORS = [Colors.yellow, Colors.silver, Colors.bronze];
const PODIUM_HEIGHTS = [110, 80, 65];

export const PodiumScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { tournamentId, categoryId } = route.params;
  const { data: tournament } = useQuery({
    queryKey: tournamentKeys.detail(tournamentId),
    queryFn: () => api.getTournament(tournamentId),
  });
  const category = tournament?.categories.find(v => v.id === categoryId);
  const { data: categoryMatches = [] } = useQuery({
    queryKey: matchKeys.byCategory(categoryId),
    queryFn: () => api.getMatchesByCategory(categoryId),
    enabled: !!category,
  });
  const [sheetTeam, setSheetTeam] = React.useState<Team | null>(null);

  // Derive ranking from actual team stats
  const ranking: PodiumEntry[] = React.useMemo(() => {
    if (!category) return [];
    return category.teams
      .filter(t => !t.withdrawn)
      .map(team => {
        const stats = calcStats(team.id, categoryMatches, category.pointsPerWin);
        return {
          pos: 0,
          name: team.name,
          players: team.players.map(p => p.name).join(' & '),
          sets: `${stats.setsWon}-${stats.setsLost}`,
          team,
          _sortKey: stats.pts * 10000 + (stats.setsWon - stats.setsLost),
        };
      })
      .sort((a, b) => b._sortKey - a._sortKey)
      .map(({ _sortKey, ...rest }, i) => ({ ...rest, pos: i + 1 }));
  }, [category, categoryMatches]);

  if (!tournament || !category) {
    return (
      <View className="flex-1 bg-gbg">
        <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
          <SafeAreaView edges={['top']}>
            <HeaderNav backLabel="Voltar" onBack={() => navigation.goBack()} />
            <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-sm">{'\u{1F3C6}'} Pódio Final</Text>
          </SafeAreaView>
        </LinearGradient>
        <View className="flex-1 items-center justify-center p-lg">
          <Text className="text-lg font-nunito text-muted text-center">
            Torneio ou categoria não encontrado.
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
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${CATEGORY_CONFIG[category.type].labelShort} ${category.level}`}
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={category.type} level={category.level} />
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-sm">{'\u{1F3C6}'} Pódio Final</Text>
          <Text className="text-white/75 text-base font-nunito-semibold mt-xs">{tournament.name}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-lg">
        <Container>
          {/* Podium visual */}
          <View className="flex-row items-end justify-center bg-white rounded-xl p-lg mb-lg shadow-card gap-sm">
            {podiumOrder.map((team, i) => {
              const realPos = team.pos;
              return (
                <View key={team.name} className="flex-1 items-center">
                  <Text className="text-[24px] mb-xs">{MEDALS[realPos - 1]}</Text>
                  <TouchableOpacity onPress={() => setSheetTeam(team.team)}>
                    <Text className="text-xs font-nunito text-navy text-center mb-[6px] px-[2px] underline" numberOfLines={2}>{team.name}</Text>
                  </TouchableOpacity>
                  <View
                    className="w-full rounded-t-[8px] items-center justify-center"
                    style={{ height: podiumHeights[i], backgroundColor: PODIUM_COLORS[realPos - 1] }}
                  >
                    <Text className="text-[24px] font-nunito-black text-black/40">{realPos}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Full ranking list */}
          <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-[10px]">Classificação Completa</Text>
          {ranking.map((entry) => (
            <TouchableOpacity key={entry.name} className="bg-white rounded-md p-md flex-row items-center gap-md mb-sm shadow-card" onPress={() => setSheetTeam(entry.team)}>
              <View
                className="w-[40px] h-[40px] rounded-full items-center justify-center"
                style={{ backgroundColor: entry.pos <= 3 ? PODIUM_COLORS[entry.pos - 1] : Colors.gbg }}
              >
                {entry.pos <= 3 ? (
                  <Text className="text-2xl">{MEDALS[entry.pos - 1]}</Text>
                ) : (
                  <Text className="text-xl font-nunito-black text-white">{entry.pos}</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-nunito text-navy">{entry.name}</Text>
                <Text className="text-sm font-nunito-semibold text-muted mt-[2px]">{entry.players}</Text>
              </View>
              <View className="items-end">
                <Text className="text-lg font-nunito-black text-navy">{entry.sets}</Text>
                <Text className="text-xxs font-nunito-bold text-muted">sets W-L</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View className="h-xl" />

          <TouchableOpacity
            className="rounded-lg overflow-hidden"
            onPress={() => navigation.navigate('Export', { tournamentId: route.params.tournamentId, categoryId: route.params.categoryId })}
          >
            <LinearGradient colors={Gradients.primary} className="p-[15px] items-center">
              <Text className="text-white text-[15px] font-nunito">{'\u{1F4E5}'} Exportar Resultados</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View className="h-2xl" />
        </Container>
      </ScrollView>
      <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
      <TeamMatchesSheet
        visible={sheetTeam !== null}
        team={sheetTeam}
        category={category}
        matches={categoryMatches}
        onClose={() => setSheetTeam(null)}
      />
    </View>
  );
};
