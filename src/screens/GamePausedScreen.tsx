import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { popTo } from '../utils/navigation';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Typography, TextStyles, Spacing, Radii, Shadows } from '../theme';
import { resolveMatchFormat } from '../utils/scoring';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GamePaused'>;

export const GamePausedScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);
  const game = mockGames.find(g => g.id === route.params.gameId);
  if (!tournament || !vertente || !game) return null;

  const matchFormat = resolveMatchFormat(vertente);

  return (
    <View style={s.container}>
      <LinearGradient colors={[Colors.brownDeep, Colors.brownLight]} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Jogos"
            onBack={() => navigation.goBack()}
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
                <Text style={s.setNum}>{i === matchFormat.SUPER_TIE_BREAK_INDEX ? 'STB' : `Set ${i + 1}`}</Text>
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
          onPress={() => navigation.goBack()}
        >
          <Text style={s.backBtnTxt}>← Voltar aos jogos</Text>
        </TouchableOpacity>
      </View>
      <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 8 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilySemiBold, marginTop: 4 },
  body: { flex: 1, padding: Spacing.lg },
  teamsCard: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.md, ...Shadows.card },
  teamName: { fontSize: 15, fontFamily: Typography.fontFamilyBlack, color: Colors.navy },
  vs: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBold, color: Colors.muted, marginVertical: 4 },
  pausedInfo: { backgroundColor: Colors.yellowBgWarm, borderRadius: Radii.lg, padding: 24, alignItems: 'center', marginBottom: Spacing.md, borderWidth: 1.5, borderColor: Colors.yellow },
  pausedIcon: { fontSize: 48, marginBottom: 12 },
  pausedTitle: { fontSize: 18, fontFamily: Typography.fontFamilyBlack, color: Colors.navy, marginBottom: 8 },
  pausedSub: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, textAlign: 'center', lineHeight: 20 },
  setsCard: { backgroundColor: Colors.white, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.card },
  setsLabel: { ...TextStyles.sectionLabel, marginBottom: 8 },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.gl },
  setNum: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBold, color: Colors.muted },
  setScore: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBlack, color: Colors.navy },
  resumeBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: Spacing.sm },
  resumeGrad: { padding: 15, alignItems: 'center' },
  resumeTxt: { color: Colors.white, fontSize: 15, fontFamily: Typography.fontFamily },
  backBtn: { alignItems: 'center', padding: 12 },
  backBtnTxt: { color: Colors.blue, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBold },
});
