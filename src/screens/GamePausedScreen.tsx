import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GamePaused'>;

export const GamePausedScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];
  const game = mockGames.find(g => g.id === route.params.gameId) ?? mockGames[1];

  return (
    <View style={s.container}>
      <LinearGradient colors={['#4A2C00', '#C87800']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Jogos"
            onBack={() => navigation.navigate('GroupsTable', { tournamentId: tournament.id, vertenteId: vertente.id })}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>⏸ Jogo Pausado</Text>
          <Text style={s.subtitle}>{game.time} · {game.court}</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={s.body}>
        <View style={s.teamsCard}>
          <Text style={s.teamName}>{game.team1.name}</Text>
          <Text style={s.vs}>vs</Text>
          <Text style={s.teamName}>{game.team2.name}</Text>
        </View>

        <View style={s.pausedInfo}>
          <Text style={s.pausedIcon}>⏸</Text>
          <Text style={s.pausedTitle}>Jogo em pausa</Text>
          <Text style={s.pausedSub}>
            {game.sets?.length ?? 0} set{(game.sets?.length ?? 0) !== 1 ? 's' : ''} guardados.{'\n'}Podes retomar quando quiseres.
          </Text>
        </View>

        {game.sets && game.sets.length > 0 && (
          <View style={s.setsCard}>
            <Text style={s.setsLabel}>Resultados guardados</Text>
            {game.sets.map((set, i) => (
              <View key={i} style={s.setRow}>
                <Text style={s.setNum}>{i === 2 ? 'STB' : `Set ${i + 1}`}</Text>
                <Text style={s.setScore}>{set.team1} – {set.team2}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={s.resumeBtn}
          onPress={() => navigation.navigate('EnterResult', {
            tournamentId: route.params.tournamentId,
            vertenteId: route.params.vertenteId,
            gameId: route.params.gameId,
          })}
        >
          <LinearGradient colors={Gradients.primary} style={s.resumeGrad}>
            <Text style={s.resumeTxt}>▶ Retomar Jogo</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.navigate('GroupsGames', { tournamentId: route.params.tournamentId, vertenteId: route.params.vertenteId })}
        >
          <Text style={s.backBtnTxt}>← Voltar aos jogos</Text>
        </TouchableOpacity>
      </View>
      <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  back: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8, marginBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 8 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginTop: 4 },
  body: { flex: 1, padding: Spacing.lg },
  teamsCard: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.md, ...Shadows.card },
  teamName: { fontSize: 15, fontFamily: 'Nunito_900Black', color: Colors.navy },
  vs: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted, marginVertical: 4 },
  pausedInfo: { backgroundColor: '#FFF8E3', borderRadius: Radii.lg, padding: 24, alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1.5, borderColor: Colors.yellow },
  pausedIcon: { fontSize: 48, marginBottom: 12 },
  pausedTitle: { fontSize: 18, fontFamily: 'Nunito_900Black', color: Colors.navy, marginBottom: 8 },
  pausedSub: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, textAlign: 'center', lineHeight: 20 },
  setsCard: { backgroundColor: '#fff', borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.card },
  setsLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.gl },
  setNum: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  setScore: { fontSize: 14, fontFamily: 'Nunito_900Black', color: Colors.navy },
  resumeBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: Spacing.sm },
  resumeGrad: { padding: 15, alignItems: 'center' },
  resumeTxt: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  backBtn: { alignItems: 'center', padding: 12 },
  backBtnTxt: { color: Colors.blue, fontSize: 14, fontFamily: 'Nunito_700Bold' },
});
