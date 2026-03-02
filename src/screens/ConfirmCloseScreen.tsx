import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ConfirmClose'>;

export const ConfirmCloseScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];
  const game = mockGames[1]; // mock the current game

  const mockResult = { sets: [{ team1: 6, team2: 4 }, { team1: 6, team2: 3 }], winner: game.team1 };

  return (
    <View style={s.container}>
      <LinearGradient colors={['#00AA66', '#22C97A']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Resultado</Text>
          </TouchableOpacity>
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
              <Text style={s.teamName}>{game.team1.name}</Text>
              <View style={s.winnerBadge}><Text style={s.winnerTxt}>🏆 Vencedor</Text></View>
            </View>
            <View style={s.finalScore}>
              <Text style={s.finalNum}>2</Text>
              <Text style={s.finalDash}>–</Text>
              <Text style={s.finalNum}>0</Text>
            </View>
            <View style={[s.teamBlock, { alignItems: 'flex-end' }]}>
              <Text style={[s.teamName, { textAlign: 'right' }]}>{game.team2.name}</Text>
              <Text style={s.loserTxt}>Sets perdidos</Text>
            </View>
          </View>

          <View style={s.divider} />

          <Text style={s.setsLabel}>Parciais</Text>
          {mockResult.sets.map((set, i) => (
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
          <LinearGradient colors={['#22C97A', '#00AA66']} style={s.confirmGrad}>
            <Text style={s.confirmTxt}>✓ Confirmar e Guardar</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={s.editBtn} onPress={() => navigation.goBack()}>
          <Text style={s.editTxt}>✏️ Corrigir resultado</Text>
        </TouchableOpacity>
      </View>
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
  resultCard: { backgroundColor: '#fff', borderRadius: Radii.xl, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.card },
  teamsRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  teamBlock: { flex: 1 },
  teamName: { fontSize: 14, fontFamily: 'Nunito_900Black', color: Colors.navy, marginBottom: 4 },
  winnerBadge: { backgroundColor: '#DFFAEE', borderRadius: Radii.full, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  winnerTxt: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.green },
  loserTxt: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted },
  finalScore: { alignItems: 'center', paddingHorizontal: 12 },
  finalNum: { fontSize: 36, fontFamily: 'Nunito_900Black', color: Colors.navy },
  finalDash: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.gray },
  divider: { height: 1, backgroundColor: Colors.gl, marginBottom: Spacing.md },
  setsLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', marginBottom: 8 },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.gl },
  setNum: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  setBubbles: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  setBubble: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gbg, alignItems: 'center', justifyContent: 'center' },
  setBubbleWin: { backgroundColor: Colors.navy },
  setBubbleTxt: { fontSize: 15, fontFamily: 'Nunito_900Black', color: Colors.muted },
  setBubbleTxtWin: { color: '#fff' },
  setDash: { fontSize: 14, color: Colors.gray },
  infoBox: { backgroundColor: '#EEF4FF', borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.lg },
  infoTxt: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: Colors.navy, lineHeight: 18 },
  confirmBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: Spacing.sm },
  confirmGrad: { padding: 15, alignItems: 'center' },
  confirmTxt: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  editBtn: { alignItems: 'center', padding: 12 },
  editTxt: { color: Colors.blue, fontSize: 14, fontFamily: 'Nunito_700Bold' },
});
