import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Typography, TextStyles, Spacing, Radii, Shadows } from '../theme';
import { parseDatePt, GAME_STATUS_COLOR, GAME_STATUS_LABEL } from '../utils/constants';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'EditGame'>;

export const EditGameScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];
  const game = mockGames.find(g => g.id === route.params.gameId);

  // Fallback: build a placeholder scheduled game when ID is not in mockGames (e.g. bracket-generated IDs)
  const gameData = game ?? {
    id: route.params.gameId,
    team1: { id: 'tmp-t1', name: 'Equipa 1', players: [{ id: 'x1', name: '' }, { id: 'x2', name: '' }] },
    team2: { id: 'tmp-t2', name: 'Equipa 2', players: [{ id: 'x3', name: '' }, { id: 'x4', name: '' }] },
    court: 'C1', date: '', time: '', phase: 'groups' as const,
    status: 'scheduled' as const,
  };

  const [court, setCourt] = useState(gameData.court);
  const [time, setTime] = useState(gameData.time);
  const [date, setDate] = useState(gameData.date);

  // Generate all tournament days from startDate to endDate
  const tournamentDays = useMemo(() => {
    const start = parseDatePt(tournament.startDate);
    const end = parseDatePt(tournament.endDate);
    if (!start || !end) return [];
    const days: string[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      const d = cur.getDate();
      const m = cur.toLocaleString('pt-PT', { month: 'short' });
      const label = `${d} ${m.charAt(0).toUpperCase() + m.slice(1).replace('.', '')}`;
      days.push(label);
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [tournament.startDate, tournament.endDate]);

  // Derive courts from vertente config
  const courts = useMemo(
    () => Array.from({ length: vertente.courts }, (_, i) => `C${i + 1}`),
    [vertente.courts],
  );

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Jogos"
            onBack={() => navigation.navigate('GroupsTable', { tournamentId: tournament.id, vertenteId: vertente.id })}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Editar Jogo</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        {/* Teams display */}
        <View style={s.teamsCard}>
          <View style={s.teamRow}>
            <View style={s.teamAvatar}>
              <Text style={s.teamAvatarTxt}>{gameData.team1.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.teamName}>{gameData.team1.name}</Text>
              <Text style={s.teamPlayers}>{gameData.team1.players.map(p => p.name).join(' & ')}</Text>
            </View>
          </View>
          <View style={s.vsDivider}><Text style={s.vsText}>vs</Text></View>
          <View style={s.teamRow}>
            <View style={[s.teamAvatar, { backgroundColor: Colors.teal }]}>
              <Text style={s.teamAvatarTxt}>{gameData.team2.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.teamName}>{gameData.team2.name}</Text>
              <Text style={s.teamPlayers}>{gameData.team2.players.map(p => p.name).join(' & ')}</Text>
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
          <Text style={s.fieldLabel}>Data</Text>
          <View style={s.dayRow}>
            {tournamentDays.map((day, i) => (
              <TouchableOpacity
                key={day}
                style={[s.dayBtn, date === day && s.dayBtnActive]}
                onPress={() => setDate(day)}
              >
                <Text style={[s.dayBtnDate, date === day && s.dayBtnDateActive]}>{day}</Text>
                <Text style={[s.dayBtnLabel, date === day && s.dayBtnLabelActive]}>Dia {i + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: Spacing.md }} />
          <Text style={s.fieldLabel}>Hora</Text>
          <TextInput style={s.input} value={time} onChangeText={setTime} placeholder="10:00" placeholderTextColor={Colors.gray} keyboardType="numeric" />
        </View>

        {/* Status */}
        <Text style={s.sectionLabel}>Estado</Text>
        <View style={s.statusCard}>
          <View style={[s.statusDot, { backgroundColor: GAME_STATUS_COLOR[gameData.status] ?? Colors.yellow }]} />
          <Text style={s.statusTxt}>
            {GAME_STATUS_LABEL[gameData.status] ?? gameData.status}
          </Text>
        </View>

        <View style={{ height: Spacing.xl }} />

        <TouchableOpacity style={s.saveBtn} onPress={() => navigation.goBack()}>
          <LinearGradient colors={Gradients.primary} style={s.saveGrad}>
            <Text style={s.saveTxt}>✓ Guardar alterações</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Walkover */}
        <TouchableOpacity
          style={s.walkoverBtn}
          onPress={() => {
            // TODO: implement walkover logic (update game status + navigate back)
            navigation.goBack();
          }}
        >
          <Text style={s.walkoverTxt}>⚠️ Marcar como walkover</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
      <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 8 },
  scroll: { flex: 1 },
  teamsCard: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.card },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  teamAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center' },
  teamAvatarTxt: { color: Colors.white, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBlack },
  teamName: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
  teamPlayers: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted },
  vsDivider: { alignItems: 'center', paddingVertical: 4 },
  vsText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily, color: Colors.muted },
  sectionLabel: { ...TextStyles.sectionLabel, marginBottom: 10, marginTop: 4 },
  courtRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  courtBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radii.md, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: 'transparent', ...Shadows.card },
  courtBtnActive: { borderColor: Colors.blue, backgroundColor: Colors.blueBgLight },
  courtTxt: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.muted },
  courtTxtActive: { color: Colors.blue },
  dayRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  dayBtn: { flex: 1, minWidth: 72, paddingVertical: 10, paddingHorizontal: 8, borderRadius: Radii.sm, backgroundColor: Colors.gbg, borderWidth: 2, borderColor: Colors.gl, alignItems: 'center' },
  dayBtnActive: { backgroundColor: Colors.blueBg, borderColor: Colors.blue },
  dayBtnDate: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilyBlack, color: Colors.navy },
  dayBtnDateActive: { color: Colors.blue },
  dayBtnLabel: { fontSize: Typography.fontSize.xxs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 2 },
  dayBtnLabelActive: { color: Colors.blue },
  card: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.card },
  row: { flexDirection: 'row' },
  fieldLabel: { ...TextStyles.sectionLabel, marginBottom: 5 },
  input: { borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.sm, padding: Spacing.sm, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBold, color: Colors.navy, backgroundColor: Colors.gbg },
  statusCard: { backgroundColor: Colors.white, borderRadius: Radii.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.lg, ...Shadows.card },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusTxt: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily, color: Colors.navy },
  saveBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: Spacing.sm },
  saveGrad: { padding: 15, alignItems: 'center' },
  saveTxt: { color: Colors.white, fontSize: 15, fontFamily: Typography.fontFamily },
  walkoverBtn: { alignItems: 'center', padding: 14 },
  walkoverTxt: { color: Colors.orange, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBold },
});
