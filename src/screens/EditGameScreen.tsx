import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'EditGame'>;

export const EditGameScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];
  const game = mockGames.find(g => g.id === route.params.gameId) ?? mockGames[0];

  const [court, setCourt] = useState(game.court);
  const [time, setTime] = useState(game.time);
  const [date, setDate] = useState(game.date);

  const courts = ['C1', 'C2', 'C3', 'C4'];

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Jogos</Text>
          </TouchableOpacity>
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Editar Jogo</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        {/* Teams display */}
        <View style={s.teamsCard}>
          <View style={s.teamRow}>
            <View style={s.teamAvatar}>
              <Text style={s.teamAvatarTxt}>{game.team1.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.teamName}>{game.team1.name}</Text>
              <Text style={s.teamPlayers}>{game.team1.players.map(p => p.name).join(' & ')}</Text>
            </View>
          </View>
          <View style={s.vsDivider}><Text style={s.vsText}>vs</Text></View>
          <View style={s.teamRow}>
            <View style={[s.teamAvatar, { backgroundColor: Colors.teal }]}>
              <Text style={s.teamAvatarTxt}>{game.team2.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.teamName}>{game.team2.name}</Text>
              <Text style={s.teamPlayers}>{game.team2.players.map(p => p.name).join(' & ')}</Text>
            </View>
          </View>
        </View>

        {/* Court */}
        <Text style={s.sectionLabel}>Court</Text>
        <View style={s.courtRow}>
          {courts.map(c => (
            <TouchableOpacity
              key={c}
              style={[s.courtBtn, court === c && s.courtBtnActive]}
              onPress={() => setCourt(c)}
            >
              <Text style={[s.courtTxt, court === c && s.courtTxtActive]}>🏟️ {c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date / Time */}
        <Text style={s.sectionLabel}>Data e Hora</Text>
        <View style={s.card}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Data</Text>
              <TextInput style={s.input} value={date} onChangeText={setDate} placeholder="14 Mar" placeholderTextColor={Colors.gray} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Hora</Text>
              <TextInput style={s.input} value={time} onChangeText={setTime} placeholder="10:00" placeholderTextColor={Colors.gray} keyboardType="numeric" />
            </View>
          </View>
        </View>

        {/* Status */}
        <Text style={s.sectionLabel}>Estado</Text>
        <View style={s.statusCard}>
          <View style={[s.statusDot, { backgroundColor: game.status === 'live' ? Colors.red : game.status === 'finished' ? Colors.green : Colors.yellow }]} />
          <Text style={s.statusTxt}>
            {game.status === 'live' ? '● Ao vivo' : game.status === 'finished' ? '✓ Concluído' : '⏰ Agendado'}
          </Text>
        </View>

        <View style={{ height: 24 }} />

        <TouchableOpacity style={s.saveBtn} onPress={() => navigation.goBack()}>
          <LinearGradient colors={Gradients.primary} style={s.saveGrad}>
            <Text style={s.saveTxt}>✓ Guardar alterações</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Walkover */}
        <TouchableOpacity style={s.walkoverBtn}>
          <Text style={s.walkoverTxt}>⚠️ Marcar como walkover</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  back: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8, marginBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 8 },
  scroll: { flex: 1 },
  teamsCard: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.card },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  teamAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center' },
  teamAvatarTxt: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_900Black' },
  teamName: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  teamPlayers: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.muted },
  vsDivider: { alignItems: 'center', paddingVertical: 4 },
  vsText: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  sectionLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  courtRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  courtBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radii.md, backgroundColor: '#fff', borderWidth: 1.5, borderColor: 'transparent', ...Shadows.card },
  courtBtnActive: { borderColor: Colors.blue, backgroundColor: '#EEF4FF' },
  courtTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  courtTxtActive: { color: Colors.blue },
  card: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.card },
  row: { flexDirection: 'row' },
  fieldLabel: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  input: { borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.sm, padding: Spacing.sm, fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.navy, backgroundColor: Colors.gbg },
  statusCard: { backgroundColor: '#fff', borderRadius: Radii.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.lg, ...Shadows.card },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusTxt: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  saveBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: Spacing.sm },
  saveGrad: { padding: 15, alignItems: 'center' },
  saveTxt: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  walkoverBtn: { alignItems: 'center', padding: 14 },
  walkoverTxt: { color: Colors.orange, fontSize: 13, fontFamily: 'Nunito_700Bold' },
});
