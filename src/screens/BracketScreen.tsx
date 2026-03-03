import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Game, Team } from '../types';
import { mockTournaments } from '../mock/data';
import { GameCard } from '../components/GameCard';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { TeamGamesSheet } from '../components/TeamGamesSheet';
import { Colors, Gradients, Typography, Spacing, Radii, Shadows } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Bracket'>;

// ─── Local bracket data ───────────────────────────────────────────────────────
interface BracketMatch {
  id: string;
  team1: string;
  team2: string;
  sets?: { team1: number; team2: number }[];
  winnerId?: string; // matches team id convention: 'b{id}-t1' or 'b{id}-t2'
  status: Game['status'];
  is3rd?: boolean;
}

const mkGame = (m: BracketMatch): Game => {
  // Use team names as stable IDs so TeamGamesSheet can match across rounds
  const resolvedWinner = m.winnerId
    ? (m.winnerId === `${m.id}-t1` ? m.team1 : m.team2)
    : undefined;
  return {
    id: m.id,
    team1: { id: m.team1, name: m.team1, players: [{ id: 'p1', name: '' }, { id: 'p2', name: '' }] },
    team2: { id: m.team2, name: m.team2, players: [{ id: 'p3', name: '' }, { id: 'p4', name: '' }] },
    court: 'C1',
    date: '14 Mar',
    time: '10:00',
    phase: 'qf',
    sets: m.sets,
    status: m.status,
    winnerId: resolvedWinner,
  };
};

interface BracketRound {
  label: string;
  key: string;
  matches: BracketMatch[];
}

const ROUNDS: BracketRound[] = [
  {
    label: 'Oitavos', key: 'r16',
    matches: [
      { id: 'r1', team1: 'Os Invencíveis', team2: 'Blue Aces', sets: [{ team1: 6, team2: 2 }, { team1: 6, team2: 1 }], winnerId: 'r1-t1', status: 'finished' },
      { id: 'r2', team1: 'Thunderstruck', team2: 'Storm Kings', sets: [{ team1: 6, team2: 4 }, { team1: 6, team2: 4 }], winnerId: 'r2-t1', status: 'finished' },
      { id: 'r3', team1: 'Power Smash', team2: 'Hard Hitters', sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 2 }], winnerId: 'r3-t1', status: 'finished' },
      { id: 'r4', team1: 'Slam Kings', team2: 'Net Ninjas', sets: [{ team1: 7, team2: 5 }, { team1: 6, team2: 4 }], winnerId: 'r4-t1', status: 'finished' },
      { id: 'r5', team1: 'Net Hunters', team2: 'Wild Smash', sets: [{ team1: 6, team2: 4 }, { team1: 7, team2: 5 }], winnerId: 'r5-t1', status: 'finished' },
      { id: 'r6', team1: 'Purple Rain', team2: 'Shadow Play', sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }], winnerId: 'r6-t1', status: 'finished' },
      { id: 'r7', team1: 'Ace Force', team2: 'Court Masters', sets: [{ team1: 6, team2: 2 }, { team1: 6, team2: 3 }], winnerId: 'r7-t1', status: 'finished' },
      { id: 'r8', team1: 'Iron Wall', team2: 'Power Drive', sets: [{ team1: 6, team2: 4 }, { team1: 6, team2: 3 }], winnerId: 'r8-t1', status: 'finished' },
    ],
  },
  {
    label: 'Quartos', key: 'qf',
    matches: [
      { id: 'q1', team1: 'Os Invencíveis', team2: 'Thunderstruck', sets: [{ team1: 6, team2: 4 }, { team1: 6, team2: 3 }], winnerId: 'q1-t1', status: 'finished' },
      { id: 'q2', team1: 'Power Smash', team2: 'Slam Kings', sets: [{ team1: 4, team2: 6 }, { team1: 6, team2: 4 }, { team1: 10, team2: 8 }], winnerId: 'q2-t1', status: 'finished' },
      { id: 'q3', team1: 'Net Hunters', team2: 'Purple Rain', sets: [{ team1: 6, team2: 4 }], status: 'live' },
      { id: 'q4', team1: 'Ace Force', team2: 'Iron Wall', status: 'scheduled' },
    ],
  },
  {
    label: 'Meias', key: 'sf',
    matches: [
      { id: 's1', team1: 'Os Invencíveis', team2: 'Power Smash', status: 'scheduled' },
      { id: 's2', team1: '?', team2: '?', status: 'scheduled' },
    ],
  },
  {
    label: 'Final', key: 'final',
    matches: [
      { id: 'f1', team1: '?', team2: '?', status: 'scheduled' },
      { id: 'f2', team1: '?', team2: '?', status: 'scheduled', is3rd: true },
    ],
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export const BracketScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];

  const [activeRound, setActiveRound] = React.useState(0);
  const currentRound = ROUNDS[activeRound];
  const [sheetTeam, setSheetTeam] = React.useState<Team | null>(null);

  // All bracket games for the sheet — computed once since ROUNDS is a module-level constant
  const allBracketGames = React.useMemo(
    () => ROUNDS.flatMap(r => r.matches.map(m => mkGame(m))),
    [],
  );

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

      {/* Round selector tabs */}
      <View style={s.tabs}>
        {ROUNDS.map((round, i) => {
          const hasLive = round.matches.some(m => m.status === 'live');
          const isActive = i === activeRound;
          return (
            <TouchableOpacity key={round.key} style={[s.tab, isActive && s.tabActive]} onPress={() => setActiveRound(i)}>
              {hasLive && <View style={s.tabDot} />}
              <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{round.label}</Text>
              <Text style={[s.tabCount, isActive && s.tabCountActive]}>
                {round.matches.length} {round.matches.length === 1 ? 'jogo' : 'jogos'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.md }}>
        {currentRound.matches.map((match) => (
          <React.Fragment key={match.id}>
            {match.is3rd && (
              <View style={s.separator}>
                <View style={s.sepLine} />
                <Text style={s.sepTxt}>🥉 3º vs 4º Lugar</Text>
                <View style={s.sepLine} />
              </View>
            )}
            <GameCard
              game={mkGame(match)}
              showDoneBadge
              onTeamPress={setSheetTeam}
              advanceText={
                match.status === 'finished' && match.winnerId
                  ? `${match.winnerId === `${match.id}-t1` ? match.team1 : match.team2} → ${activeRound + 1 < ROUNDS.length ? ROUNDS[activeRound + 1].label : 'Próxima ronda'}`
                  : undefined
              }
              onEdit={() => navigation.navigate('EditGame', {
                tournamentId: tournament.id, vertenteId: vertente.id, gameId: match.id,
              })}
              onEnterResult={() => navigation.navigate('EnterResult', {
                tournamentId: tournament.id, vertenteId: vertente.id, gameId: match.id,
              })}
            />
          </React.Fragment>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>

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
