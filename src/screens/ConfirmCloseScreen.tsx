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
import { Colors, Gradients, Typography, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ConfirmClose'>;

export const ConfirmCloseScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);
  const game = mockGames.find(g => g.id === route.params.gameId);

  if (!tournament || !vertente || !game) {
    return (
      <View style={s.container}>
        <LinearGradient colors={Gradients.green} style={s.header}>
          <SafeAreaView edges={['top']}>
            <HeaderNav backLabel="Voltar" onBack={() => navigation.goBack()} />
            <Text style={s.title}>Confirmar Resultado</Text>
          </SafeAreaView>
        </LinearGradient>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg }}>
          <Text style={{ fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily, color: Colors.muted, textAlign: 'center' }}>
            Jogo não encontrado.
          </Text>
        </View>
      </View>
    );
  }

  const winnerIsTeam1 = game.winnerId === game.team1.id;
  const winner = winnerIsTeam1 ? game.team1 : game.team2;
  const loser = winnerIsTeam1 ? game.team2 : game.team1;
  const sets = game.sets ?? [];
  const winnerSets = sets.filter(s => winnerIsTeam1 ? s.team1 > s.team2 : s.team2 > s.team1).length;
  const loserSets = sets.length - winnerSets;

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.green} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Resultado"
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Confirmar Resultado</Text>
          <Text style={s.subtitle}>Verifica antes de guardar</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={s.body}>
        {/* Match result summary */}
        <View style={s.resultCard}>
          <View style={s.teamsRow}>
            <View style={[s.teamBlock, { alignItems: 'flex-start' }]}>
              <Text style={s.teamName}>{winner.name}</Text>
              <View style={s.winnerBadge}><Text style={s.winnerTxt}>🏆 Vencedor</Text></View>
            </View>
            <View style={s.finalScore}>
              <Text style={s.finalNum}>{winnerSets}</Text>
              <Text style={s.finalDash}>–</Text>
              <Text style={s.finalNum}>{loserSets}</Text>
            </View>
            <View style={[s.teamBlock, { alignItems: 'flex-end' }]}>
              <Text style={[s.teamName, { textAlign: 'right' }]}>{loser.name}</Text>
              <Text style={s.loserTxt}>Sets perdidos</Text>
            </View>
          </View>

          <View style={s.divider} />

          <Text style={s.setsLabel}>Parciais</Text>
          {sets.map((set, i) => (
            <View key={i} style={s.setRow}>
              <Text style={s.setNum}>Set {i + 1}</Text>
              <View style={s.setBubbles}>
                <View style={[s.setBubble, set.team1 > set.team2 && s.setBubbleWin]}>
                  <Text style={[s.setBubbleTxt, set.team1 > set.team2 && s.setBubbleTxtWin]}>{set.team1}</Text>
                </View>
                <Text style={s.setDash}>–</Text>
                <View style={[s.setBubble, set.team2 > set.team1 && s.setBubbleWin]}>
                  <Text style={[s.setBubbleTxt, set.team2 > set.team1 && s.setBubbleTxtWin]}>{set.team2}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoTxt}>ℹ️  Uma vez confirmado, o resultado fica registado e a classificação é atualizada automaticamente.</Text>
        </View>

        <TouchableOpacity
          style={s.confirmBtn}
          onPress={() => navigation.navigate('GroupsGames', { tournamentId: route.params.tournamentId, vertenteId: route.params.vertenteId })}
        >
          <LinearGradient colors={Gradients.green} style={s.confirmGrad}>
            <Text style={s.confirmTxt}>✓ Confirmar e Guardar</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={s.editBtn} onPress={() => navigation.goBack()}>
          <Text style={s.editTxt}>✏️ Corrigir resultado</Text>
        </TouchableOpacity>
      </View>
      <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 8 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilySemiBold, marginTop: 4 },
  body: { flex: 1, padding: Spacing.lg },
  resultCard: { backgroundColor: Colors.white, borderRadius: Radii.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.card },
  teamsRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  teamBlock: { flex: 1 },
  teamName: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBlack, color: Colors.navy, marginBottom: 4 },
  winnerBadge: { backgroundColor: Colors.greenBgLight, borderRadius: Radii.full, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  winnerTxt: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily, color: Colors.green },
  loserTxt: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted },
  finalScore: { alignItems: 'center', paddingHorizontal: 12 },
  finalNum: { fontSize: 36, fontFamily: Typography.fontFamilyBlack, color: Colors.navy },
  finalDash: { fontSize: 18, fontFamily: Typography.fontFamilyBold, color: Colors.gray },
  divider: { height: 1, backgroundColor: Colors.gl, marginBottom: Spacing.md },
  setsLabel: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily, color: Colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.gl },
  setNum: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBold, color: Colors.muted },
  setBubbles: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  setBubble: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gbg, alignItems: 'center', justifyContent: 'center' },
  setBubbleWin: { backgroundColor: Colors.navy },
  setBubbleTxt: { fontSize: 15, fontFamily: Typography.fontFamilyBlack, color: Colors.muted },
  setBubbleTxtWin: { color: Colors.white },
  setDash: { fontSize: 14, color: Colors.gray },
  infoBox: { backgroundColor: Colors.blueBgLight, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.lg },
  infoTxt: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilySemiBold, color: Colors.navy, lineHeight: 18 },
  confirmBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: Spacing.sm },
  confirmGrad: { padding: 15, alignItems: 'center' },
  confirmTxt: { color: Colors.white, fontSize: 15, fontFamily: Typography.fontFamily },
  editBtn: { alignItems: 'center', padding: 12 },
  editTxt: { color: Colors.blue, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBold },
});
