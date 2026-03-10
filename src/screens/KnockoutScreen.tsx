import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp, StackActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList, Game, Team } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { GameCard } from '../components/GameCard';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { TeamGamesSheet } from '../components/TeamGamesSheet';
import { Colors, Gradients } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { BRACKET_ROUND_LABEL, BRACKET_ROUND_ORDER, GAME_STATUS } from '../utils/constants';
import { propagateBracket, isPlaceholderTeam } from '../utils/bracketPropagation';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Knockout'>;

interface BracketRound {
  label: string;
  key: string;
  games: Game[];
}

// --- Screen ---
export const KnockoutScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);

  const [activeRound, setActiveRound] = React.useState(0);
  const [sheetTeam, setSheetTeam] = React.useState<Team | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // Derive bracket rounds from actual game data, with propagation
  const { rounds, allBracketGames } = React.useMemo(() => {
    if (!vertente) return { rounds: [] as BracketRound[], allBracketGames: [] as Game[] };

    const teamIds = new Set(vertente.teams.map(t => t.id));
    const rawBracketGames = mockGames.filter(
      g => (teamIds.has(g.team1.id) || teamIds.has(g.team2.id)) && g.phase !== 'groups',
    );

    const bracketGames = propagateBracket(rawBracketGames);

    const byPhase: Record<string, Game[]> = {};
    bracketGames.forEach(g => {
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
        games: byPhase[phase],
      }));

    return { rounds: built, allBracketGames: bracketGames };
  }, [vertente]);

  if (!tournament || !vertente) {
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
            backLabel={`${VERTENTE_CONFIG[vertente.type].labelShort} ${vertente.level}`}
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
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
              const hasLive = round.games.some(g => g.status === GAME_STATUS.LIVE);
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
                  accessibilityLabel={`${round.label}, ${round.games.length} jogos${hasLive ? ', ao vivo' : ''}`}
                >
                  {hasLive && <View className="absolute top-[6px] right-sm w-[6px] h-[6px] rounded-full bg-red" />}
                  <Text className={clsx('text-xs font-nunito', isActive ? 'text-blue' : 'text-muted')}>{round.label}</Text>
                  <Text className={clsx('text-xxs font-nunito-semibold mt-[1px]', isActive ? 'text-blue' : 'text-muted')}>
                    {round.games.length} {round.games.length === 1 ? 'jogo' : 'jogos'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FlatList
            data={currentRound?.games ?? []}
            keyExtractor={g => g.id}
            contentContainerClassName="p-md pb-2xl max-w-content w-full self-center"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} colors={[Colors.blue]} />
            }
            renderItem={({ item: game, index }) => {
              const advanceLabel = (() => {
                if (game.status !== GAME_STATUS.FINISHED || !game.winnerId) return undefined;
                const winnerName = game.winnerId === game.team1.id ? game.team1.name : game.team2.name;
                return activeRound + 1 < rounds.length
                  ? `${winnerName} \u2192 ${rounds[activeRound + 1].label}`
                  : undefined;
              })();

              return (
                <View>
                  {game.phase === '3rd' && (
                    <View className="flex-row items-center gap-sm my-xs mb-sm" accessibilityRole="header">
                      <View className="flex-1 h-[1px] bg-gl" />
                      <Text className="text-sm font-nunito text-orange">{'\u{1F949}'} 3º vs 4º Lugar</Text>
                      <View className="flex-1 h-[1px] bg-gl" />
                    </View>
                  )}
                  <GameCard
                    game={game}
                    showDoneBadge
                    onTeamPress={setSheetTeam}
                    advanceText={advanceLabel}
                    onEdit={() => navigation.navigate('EditGame', {
                      tournamentId: tournament.id, vertenteId: vertente.id, gameId: game.id,
                    })}
                    onEnterResult={
                      isPlaceholderTeam(game.team1) || isPlaceholderTeam(game.team2)
                        ? undefined
                        : () => navigation.navigate('EnterResult', {
                            tournamentId: tournament.id, vertenteId: vertente.id, gameId: game.id,
                          })
                    }
                  />
                </View>
              );
            }}
          />
        </>
      )}

      <TeamGamesSheet
        visible={sheetTeam !== null}
        team={sheetTeam}
        vertente={vertente}
        games={allBracketGames}
        onClose={() => setSheetTeam(null)}
      />
      <HomeFAB onPress={() => navigation.dispatch(StackActions.pop(2))} />
    </View>
  );
};
