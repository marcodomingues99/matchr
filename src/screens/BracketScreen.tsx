import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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

  // Derive bracket rounds from actual game data
  const { rounds, allBracketGames } = React.useMemo(() => {
    if (!vertente) return { rounds: [] as BracketRound[], allBracketGames: [] as Game[] };

    const teamIds = new Set(vertente.teams.map(t => t.id));
    const bracketGames = mockGames.filter(
      g => (teamIds.has(g.team1.id) || teamIds.has(g.team2.id)) && g.phase !== 'groups',
    );

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
          <Text style={s.emptyTxt}>Torneio ou sub-torneio não encontrado.</Text>
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
            onBack={() => navigation.navigate('VertenteHub', { tournamentId: tournament.id, vertenteId: vertente.id })}
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
          <View style={s.tabs}>
            {rounds.map((round, i) => {
              const hasLive = round.games.some(g => g.status === GAME_STATUS.LIVE);
              const isActive = i === activeRound;
              return (
                <TouchableOpacity key={round.key} style={[s.tab, isActive && s.tabActive]} onPress={() => setActiveRound(i)}>
                  {hasLive && <View style={s.tabDot} />}
                  <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{round.label}</Text>
                  <Text style={[s.tabCount, isActive && s.tabCountActive]}>
                    {round.games.length} {round.games.length === 1 ? 'jogo' : 'jogos'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.md }}>
            {currentRound?.games.map(game => (
              <React.Fragment key={game.id}>
                {game.phase === '3rd' && (
                  <View style={s.separator}>
                    <View style={s.sepLine} />
                    <Text style={s.sepTxt}>🥉 3º vs 4º Lugar</Text>
                    <View style={s.sepLine} />
                  </View>
                )}
                <GameCard
                  game={game}
                  showDoneBadge
                  onTeamPress={setSheetTeam}
                  advanceText={
                    game.status === GAME_STATUS.FINISHED && game.winnerId
                      ? `${game.winnerId === game.team1.id ? game.team1.name : game.team2.name} → ${activeRound + 1 < rounds.length ? rounds[activeRound + 1].label : 'Próxima ronda'}`
                      : undefined
                  }
                  onEdit={() => navigation.navigate('EditGame', {
                    tournamentId: tournament.id, vertenteId: vertente.id, gameId: game.id,
                  })}
                  onEnterResult={() => navigation.navigate('EnterResult', {
                    tournamentId: tournament.id, vertenteId: vertente.id, gameId: game.id,
                  })}
                />
              </React.Fragment>
            ))}
            <View style={{ height: 32 }} />
          </ScrollView>
        </>
      )}

      <TeamGamesSheet
        visible={sheetTeam !== null}
        team={sheetTeam}
        vertente={vertente}
        games={allBracketGames}
        onClose={() => setSheetTeam(null)}
      />
      <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 8 },
  scroll: { flex: 1 },

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
