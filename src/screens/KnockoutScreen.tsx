import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp, StackActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList, ResolvedMatch, Team } from '../types';
import { mockTournaments, mockMatches, mockTeamMap } from '../mock/data';
import { resolveMatches } from '../utils/resolveMatch';
import { MatchCard } from '../components/MatchCard';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { TeamMatchesSheet } from '../components/TeamMatchesSheet';
import { Colors, Gradients } from '../theme';
import { CATEGORY_CONFIG } from '../utils/categoryConfig';
import { BRACKET_ROUND_ORDER, MATCH_STATUS } from '../utils/constants';
import { BRACKET_ROUND_LABEL } from '../utils/labels';
import { propagateBracket, isPlaceholderTeam } from '../utils/bracketPropagation';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Knockout'>;

interface BracketRound {
  label: string;
  key: string;
  matches: ResolvedMatch[];
}

// --- Screen ---
export const KnockoutScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const category = tournament?.categories.find(v => v.id === route.params.categoryId);

  const [activeRound, setActiveRound] = React.useState(0);
  const [sheetTeam, setSheetTeam] = React.useState<Team | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // Derive bracket rounds from actual game data, with propagation
  const { rounds, allBracketMatches } = React.useMemo(() => {
    if (!category) return { rounds: [] as BracketRound[], allBracketMatches: [] as ResolvedMatch[] };

    const teamIds = new Set(category.teams.map(t => t.id));
    const rawBracketMatches = mockMatches.filter(
      g => (teamIds.has(g.team1Id) || teamIds.has(g.team2Id)) && g.phase !== 'groups',
    );

    const bracketMatches = resolveMatches(propagateBracket(rawBracketMatches), mockTeamMap);

    const byPhase: Record<string, ResolvedMatch[]> = {};
    bracketMatches.forEach(g => {
      if (!byPhase[g.phase]) byPhase[g.phase] = [];
      byPhase[g.phase].push(g);
    });

    if (byPhase['3rd']) {
      if (!byPhase['final']) byPhase['final'] = [];
      byPhase['final'].push(...byPhase['3rd']);
      delete byPhase['3rd'];
    }

    const built = BRACKET_ROUND_ORDER
      .filter(phase => byPhase[phase]?.length)
      .map(phase => ({
        label: BRACKET_ROUND_LABEL[phase] ?? phase,
        key: phase,
        matches: byPhase[phase],
      }));

    return { rounds: built, allBracketMatches: bracketMatches };
  }, [category]);

  if (!tournament || !category) {
    return (
      <View className="flex-1 bg-gbg">
        <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
          <SafeAreaView edges={['top']}>
            <HeaderNav backLabel="Voltar" onBack={() => navigation.goBack()} />
            <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-sm">Eliminatórias {'\u{1F3C6}'}</Text>
          </SafeAreaView>
        </LinearGradient>
        <View className="flex-1 items-center justify-center p-lg">
          <Text className="text-lg font-nunito text-muted text-center">Torneio ou categoria não encontrado.</Text>
        </View>
      </View>
    );
  }

  const currentRound = rounds[activeRound];

  return (
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${CATEGORY_CONFIG[category.type].labelShort} ${category.level}`}
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={category.type} level={category.level} />
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-sm">Eliminatórias {'\u{1F3C6}'}</Text>
        </SafeAreaView>
      </LinearGradient>

      {rounds.length === 0 ? (
        <View className="flex-1 items-center justify-center p-lg">
          <Text className="text-[40px] mb-md">{'\u{1F3C6}'}</Text>
          <Text className="text-lg font-nunito text-navy text-center mb-xs">Eliminatórias ainda não disponíveis</Text>
          <Text className="text-md font-nunito-semibold text-muted text-center">
            Os jogos de eliminação aparecerão aqui quando a fase de grupos terminar.
          </Text>
        </View>
      ) : (
        <>
          {/* Round selector tabs */}
          <View className="flex-row bg-white border-b-[1.5px] border-b-gl" accessibilityRole="tablist">
            {rounds.map((round, i) => {
              const hasLive = round.matches.some(g => g.status === MATCH_STATUS.LIVE);
              const isActive = i === activeRound;
              return (
                <TouchableOpacity
                  key={round.key}
                  className={clsx(
                    'flex-1 items-center py-[10px] px-xs border-b-[3px] relative',
                    isActive ? 'border-b-blue' : 'border-b-transparent',
                  )}
                  onPress={() => setActiveRound(i)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`${round.label}, ${round.matches.length} jogos${hasLive ? ', ao vivo' : ''}`}
                >
                  {hasLive && <View className="absolute top-[6px] right-sm w-[6px] h-[6px] rounded-full bg-red" />}
                  <Text className={clsx('text-xs font-nunito', isActive ? 'text-blue' : 'text-muted')}>{round.label}</Text>
                  <Text className={clsx('text-xxs font-nunito-semibold mt-[1px]', isActive ? 'text-blue' : 'text-muted')}>
                    {round.matches.length} {round.matches.length === 1 ? 'jogo' : 'jogos'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FlatList
            data={currentRound?.matches ?? []}
            keyExtractor={g => g.id}
            contentContainerClassName="p-md pb-2xl max-w-content w-full self-center"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} colors={[Colors.blue]} />
            }
            renderItem={({ item: match, index }) => {
              const advanceLabel = (() => {
                if (match.status !== MATCH_STATUS.FINISHED || !match.winnerId) return undefined;
                const winnerName = match.winnerId === match.team1.id ? match.team1.name : match.team2.name;
                return activeRound + 1 < rounds.length
                  ? `${winnerName} \u2192 ${rounds[activeRound + 1].label}`
                  : undefined;
              })();

              return (
                <View>
                  {match.phase === '3rd' && (
                    <View className="flex-row items-center gap-sm my-xs mb-sm" accessibilityRole="header">
                      <View className="flex-1 h-[1px] bg-gl" />
                      <Text className="text-sm font-nunito text-orange">{'\u{1F949}'} 3º vs 4º Lugar</Text>
                      <View className="flex-1 h-[1px] bg-gl" />
                    </View>
                  )}
                  <MatchCard
                    match={match}
                    showDoneBadge
                    onTeamPress={setSheetTeam}
                    advanceText={advanceLabel}
                    onEdit={() => navigation.navigate('EditMatch', {
                      tournamentId: tournament.id, categoryId: category.id, matchId: match.id,
                    })}
                    onEnterResult={
                      isPlaceholderTeam(match.team1Id) || isPlaceholderTeam(match.team2Id)
                        ? undefined
                        : () => navigation.navigate('EnterResult', {
                            tournamentId: tournament.id, categoryId: category.id, matchId: match.id,
                          })
                    }
                  />
                </View>
              );
            }}
          />
        </>
      )}

      <TeamMatchesSheet
        visible={sheetTeam !== null}
        team={sheetTeam}
        category={category}
        matches={allBracketMatches}
        onClose={() => setSheetTeam(null)}
      />
      <HomeFAB onPress={() => navigation.dispatch(StackActions.pop(2))} />
    </View>
  );
};
