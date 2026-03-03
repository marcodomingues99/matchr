import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp, StackActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Game, Team } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { GameCard } from '../components/GameCard';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { TeamGamesSheet } from '../components/TeamGamesSheet';
import { Colors, Gradients, Typography, Spacing } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { BRACKET_ROUND_LABEL, BRACKET_ROUND_ORDER, GAME_STATUS } from '../utils/constants';
import { propagateBracket, isPlaceholderTeam } from '../utils/bracketPropagation';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Bracket'>;

interface BracketRound {
  label: string;
  key: string;
  games: Game[];
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export const BracketScreen = () => {
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

    // Propagate winners/losers to subsequent rounds
    const bracketGames = propagateBracket(rawBracketGames);

    const byPhase: Record<string, Game[]> = {};
    bracketGames.forEach(g => {
      if (!byPhase[g.phase]) byPhase[g.phase] = [];
      byPhase[g.phase].push(g);
    });

    // Merge '3rd' place games into 'final' round
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
      <View style={s.container}>
        <LinearGradient colors={Gradients.header} style={s.header}>
          <SafeAreaView edges={['top']}>
            <HeaderNav backLabel="Voltar" onBack={() => navigation.goBack()} />
            <Text style={s.title}>Bracket / Eliminação 🏆</Text>
          </SafeAreaView>
        </LinearGradient>
        <View style={s.emptyWrap}>
          <Text style={s.emptyTxt}>Torneio ou categoria não encontrado.</Text>
        </View>
      </View>
    );
  }

  const currentRound = rounds[activeRound];

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${VERTENTE_CONFIG[vertente.type].labelShort} ${vertente.level}`}
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Bracket / Eliminação 🏆</Text>
        </SafeAreaView>
      </LinearGradient>

      {rounds.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={{ fontSize: 40, marginBottom: Spacing.md }}>🏆</Text>
          <Text style={s.emptyTitle}>Bracket ainda não disponível</Text>
          <Text style={s.emptyBody}>
            Os jogos de eliminação aparecerão aqui quando a fase de grupos terminar.
          </Text>
        </View>
      ) : (
        <>
          {/* Round selector tabs */}
          <View style={s.tabs} accessibilityRole="tablist">
            {rounds.map((round, i) => {
              const hasLive = round.games.some(g => g.status === GAME_STATUS.LIVE);
              const isActive = i === activeRound;
              return (
                <TouchableOpacity
                  key={round.key}
                  style={[s.tab, isActive && s.tabActive]}
                  onPress={() => setActiveRound(i)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`${round.label}, ${round.games.length} jogos${hasLive ? ', ao vivo' : ''}`}
                >
                  {hasLive && <View style={s.tabDot} />}
                  <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{round.label}</Text>
                  <Text style={[s.tabCount, isActive && s.tabCountActive]}>
                    {round.games.length} {round.games.length === 1 ? 'jogo' : 'jogos'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <FlatList
            data={currentRound?.games ?? []}
            keyExtractor={g => g.id}
            contentContainerStyle={{ padding: Spacing.md, paddingBottom: 32 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} colors={[Colors.blue]} />
            }
            renderItem={({ item: game, index }) => {
              const advanceLabel = (() => {
                if (game.status !== GAME_STATUS.FINISHED || !game.winnerId) return undefined;
                const winnerName = game.winnerId === game.team1.id ? game.team1.name : game.team2.name;
                return activeRound + 1 < rounds.length
                  ? `${winnerName} → ${rounds[activeRound + 1].label}`
                  : undefined;
              })();

              return (
                <View>
                  {game.phase === '3rd' && (
                    <View style={s.separator} accessibilityRole="header">
                      <View style={s.sepLine} />
                      <Text style={s.sepTxt}>🥉 3º vs 4º Lugar</Text>
                      <View style={s.sepLine} />
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 8 },

  /* Empty state */
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  emptyTxt: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily, color: Colors.muted, textAlign: 'center' },
  emptyTitle: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily, color: Colors.navy, textAlign: 'center', marginBottom: Spacing.xs },
  emptyBody: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, textAlign: 'center' },

  /* Tabs */
  tabs: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1.5, borderBottomColor: Colors.gl },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 3, borderBottomColor: 'transparent', position: 'relative',
  },
  tabActive: { borderBottomColor: Colors.blue },
  tabDot: { position: 'absolute', top: 6, right: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.red },
  tabLabel: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily, color: Colors.muted },
  tabLabelActive: { color: Colors.blue },
  tabCount: { fontSize: Typography.fontSize.xxs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 1 },
  tabCountActive: { color: Colors.blue },

  /* 3rd place separator */
  separator: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4, marginBottom: 8 },
  sepLine: { flex: 1, height: 1, backgroundColor: Colors.gl },
  sepTxt: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily, color: Colors.orange },
});
