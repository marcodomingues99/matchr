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
type Route = RouteProp<RootStackParamList, 'Bracket'>;

interface BracketMatch { team1: string; team2: string; score?: string; winner?: 1 | 2; status: 'scheduled' | 'live' | 'finished'; }

const MOCK_BRACKET: { round: string; matches: BracketMatch[] }[] = [
  {
    round: 'Quartos de Final',
    matches: [
      { team1: 'Os Invencíveis', team2: 'Thunderstruck', score: '6-4 6-3', winner: 1, status: 'finished' },
      { team1: 'Power Smash', team2: 'Slam Kings', score: '4-6 6-4 10-8', winner: 1, status: 'finished' },
      { team1: 'Net Hunters', team2: 'Purple Rain', status: 'live' },
      { team1: 'Ace Force', team2: 'Iron Wall', status: 'scheduled' },
    ],
  },
  {
    round: 'Meias Finais',
    matches: [
      { team1: 'Os Invencíveis', team2: 'Power Smash', status: 'scheduled' },
      { team1: '?', team2: '?', status: 'scheduled' },
    ],
  },
  {
    round: 'Final',
    matches: [
      { team1: '?', team2: '?', status: 'scheduled' },
    ],
  },
];

const MatchBox = ({ match, onPress }: { match: BracketMatch; onPress?: () => void }) => {
  const borderColor = match.status === 'live' ? Colors.red : match.status === 'finished' ? Colors.green : Colors.gl;
  return (
    <TouchableOpacity style={[s.matchBox, { borderColor }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[s.matchTeamRow, match.winner === 1 && s.matchWinner]}>
        <Text style={[s.matchTeamTxt, match.winner === 1 && s.matchWinnerTxt]} numberOfLines={1}>{match.team1}</Text>
        {match.score && <Text style={s.matchScore}>{match.score.split(' ')[0]}</Text>}
      </View>
      <View style={s.matchDivider} />
      <View style={[s.matchTeamRow, match.winner === 2 && s.matchWinner]}>
        <Text style={[s.matchTeamTxt, match.winner === 2 && s.matchWinnerTxt]} numberOfLines={1}>{match.team2}</Text>
        {match.score && <Text style={s.matchScore}>{match.score.split(' ')[1] ?? ''}</Text>}
      </View>
      {match.status === 'live' && (
        <View style={s.livePill}><View style={s.liveDot} /><Text style={s.liveTxt}>LIVE</Text></View>
      )}
    </TouchableOpacity>
  );
};

export const BracketScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <Text style={s.back} onPress={() => navigation.goBack()}>← Voltar</Text>
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Bracket / Eliminação 🏆</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} horizontal contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.xl }}>
        {MOCK_BRACKET.map((round) => (
          <View key={round.round} style={s.roundCol}>
            <Text style={s.roundLabel}>{round.round}</Text>
            <View style={s.roundMatches}>
              {round.matches.map((match, idx) => (
                <MatchBox
                  key={idx}
                  match={match}
                  onPress={() => match.status !== 'scheduled' ? navigation.navigate('EnterResult', {
                    tournamentId: tournament.id,
                    vertenteId: vertente.id,
                    gameId: 'g1',
                  }) : undefined}
                />
              ))}
            </View>
          </View>
        ))}
        <View style={{ width: 16 }} />
      </ScrollView>

      <View style={s.nav}>
        {[['👥','Duplas'], ['📊','Grupos'], ['🎾','Jogos'], ['🏆','Bracket']].map(([icon, label], i) => (
          <TouchableOpacity key={label} style={[s.navItem, i === 3 && s.navItemActive]}
            onPress={() => {
              if (i === 0) navigation.navigate('TeamList', { tournamentId: tournament.id, vertenteId: vertente.id });
              if (i === 1) navigation.navigate('GroupsTable', { tournamentId: tournament.id, vertenteId: vertente.id });
              if (i === 2) navigation.navigate('GroupsGames', { tournamentId: tournament.id, vertenteId: vertente.id });
            }}
          >
            <Text style={s.navIcon}>{icon}</Text>
            <Text style={[s.navLabel, i === 3 && s.navLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  back: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8, marginBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 8 },
  scroll: { flex: 1 },
  roundCol: { width: 180 },
  roundLabel: { fontSize: 11, fontFamily: 'Nunito_900Black', color: Colors.navy, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, textAlign: 'center' },
  roundMatches: { gap: 12 },
  matchBox: { backgroundColor: '#fff', borderRadius: Radii.md, borderWidth: 2, overflow: 'hidden', ...Shadows.card },
  matchTeamRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 9, gap: 4 },
  matchWinner: { backgroundColor: '#DFFAEE' },
  matchTeamTxt: { flex: 1, fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  matchWinnerTxt: { color: Colors.green },
  matchScore: { fontSize: 12, fontFamily: 'Nunito_900Black', color: Colors.navy },
  matchDivider: { height: 1, backgroundColor: Colors.gl, marginHorizontal: 0 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFE3E8', paddingHorizontal: 8, paddingVertical: 3 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.red },
  liveTxt: { fontSize: 9, fontFamily: 'Nunito_900Black', color: Colors.red, letterSpacing: 0.5 },
  nav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Colors.gl, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: 'center', paddingTop: 10 },
  navItemActive: {},
  navIcon: { fontSize: 18, marginBottom: 2 },
  navLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  navLabelActive: { color: Colors.blue },
});
