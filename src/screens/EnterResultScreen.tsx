import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Button } from '../components/Button';
import { Colors, Gradients, Typography, TextStyles, Spacing, Radii, Shadows } from '../theme';
import { MATCH_FORMAT } from '../utils/scoring';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'EnterResult'>;

interface SetState { team1: string; team2: string; saved: boolean; }

export const EnterResultScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];
  const game = mockGames.find(g => g.id === route.params.gameId) ?? mockGames[0];

  const isEditing = game.status === 'finished' && !!game.sets?.length;

  const buildInitialSets = (): SetState[] => {
    // Finished games: pre-fill all sets as saved (for editing)
    if (game.status === 'finished' && game.sets && game.sets.length > 0) {
      return game.sets.map(s => ({
        team1: String(s.team1),
        team2: String(s.team2),
        saved: true,
      }));
    }
    // Live/paused games: pre-fill existing sets as saved, then add empty unsaved set to continue
    if ((game.status === 'live' || game.status === 'paused') && game.sets && game.sets.length > 0) {
      return [
        ...game.sets.map(s => ({ team1: String(s.team1), team2: String(s.team2), saved: true })),
        { team1: '', team2: '', saved: false },
      ];
    }
    // New game: single empty unsaved set
    return [{ team1: '', team2: '', saved: false }];
  };

  const [sets, setSets] = useState<SetState[]>(buildInitialSets);
  const currentSetIdx = sets.findIndex(s => !s.saved);

  const saveSet = () => {
    const newSets = sets.map((s, i) =>
      i === currentSetIdx ? { ...s, saved: true } : s,
    );
    const allSaved = newSets.every(s => s.saved);
    if (allSaved && newSets.length < MATCH_FORMAT.MAX_SETS) {
      // Count sets won by each team
      let t1Wins = 0, t2Wins = 0;
      newSets.forEach(s => {
        const s1 = parseInt(s.team1) || 0;
        const s2 = parseInt(s.team2) || 0;
        if (s1 > s2) t1Wins++; else if (s2 > s1) t2Wins++;
      });
      // Only add next set if no team has won enough sets yet (i.e. 1-1 for super tie-break)
      if (t1Wins < MATCH_FORMAT.SETS_TO_WIN && t2Wins < MATCH_FORMAT.SETS_TO_WIN) {
        newSets.push({ team1: '', team2: '', saved: false });
      }
    }
    setSets(newSets);
  };

  const updateSet = (idx: number, field: 'team1' | 'team2', val: string) => {
    setSets(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.header} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Jogos"
            onBack={() => navigation.navigate('GroupsTable', { tournamentId: tournament.id, vertenteId: vertente.id })}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={styles.title}>{isEditing ? 'Editar Resultado' : 'Introduzir Resultado'}</Text>
          <Text style={styles.subtitle}>{game.time} · {game.court}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        <View style={styles.teamsCard}>
          <Text style={styles.teamName} numberOfLines={2}>{game.team1.name}</Text>
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <Text style={styles.teamName} numberOfLines={2}>{game.team2.name}</Text>
        </View>

        {sets.map((set, idx) => {
          const isCurrent = !set.saved && idx === currentSetIdx;
          const setLabel = idx === MATCH_FORMAT.SUPER_TIE_BREAK_INDEX ? 'Super Tie-Break' : `Set ${idx + 1}`;
          return (
            <View key={idx} style={[styles.setCard, set.saved && styles.setCardSaved, isCurrent && styles.setCardActive]}>
              <View style={styles.setHeader}>
                <Text style={styles.setLabel}>{setLabel}</Text>
                {set.saved && <View style={styles.savedChip}><Text style={styles.savedText}>✓ Guardado</Text></View>}
              </View>
              <View style={styles.setInputRow}>
                <View style={styles.setInputGroup}>
                  <Text style={styles.inputLabel}>{game.team1.name}</Text>
                  <TextInput
                    style={[styles.setInput, !isCurrent && styles.setInputDisabled]}
                    value={set.team1}
                    onChangeText={v => updateSet(idx, 'team1', v)}
                    keyboardType="number-pad"
                    maxLength={2}
                    editable={isCurrent}
                    placeholder="0"
                  />
                </View>
                <Text style={styles.setSep}>–</Text>
                <View style={styles.setInputGroup}>
                  <Text style={styles.inputLabel}>{game.team2.name}</Text>
                  <TextInput
                    style={[styles.setInput, !isCurrent && styles.setInputDisabled]}
                    value={set.team2}
                    onChangeText={v => updateSet(idx, 'team2', v)}
                    keyboardType="number-pad"
                    maxLength={2}
                    editable={isCurrent}
                    placeholder="0"
                  />
                </View>
              </View>
              {isCurrent && (
                <TouchableOpacity style={styles.saveSetBtn} onPress={saveSet}>
                  <Text style={styles.saveSetText}>Guardar Set →</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {!isEditing && (
          <TouchableOpacity style={styles.pauseBtn} onPress={() => navigation.navigate('GamePaused', { tournamentId: route.params.tournamentId, vertenteId: route.params.vertenteId, gameId: game.id })}>
            <Text style={styles.pauseText}>⏸ Pausar jogo</Text>
            <Text style={styles.pauseSub}>{sets.filter(s => s.saved).length} sets guardados · podes retomar mais tarde</Text>
          </TouchableOpacity>
        )}

        {isEditing && (
          <TouchableOpacity style={styles.editAgainBtn} onPress={() => {
            const newSets = sets.map(s => ({ ...s, saved: false }));
            setSets(newSets);
          }}>
            <Text style={styles.editAgainText}>✏️ Editar resultados</Text>
          </TouchableOpacity>
        )}

        {sets.every(s => s.saved) && sets.length >= MATCH_FORMAT.SETS_TO_WIN && (
          <Button label={isEditing ? '✓ Guardar alterações' : '✓ Confirmar resultado final'} onPress={() => navigation.navigate('ConfirmClose', { tournamentId: route.params.tournamentId, vertenteId: route.params.vertenteId, gameId: route.params.gameId })} variant="green" />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
      <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 8 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilySemiBold, marginTop: 4 },
  scroll: { flex: 1 },
  teamsCard: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, ...Shadows.card },
  teamName: { flex: 1, fontSize: 15, fontFamily: Typography.fontFamilyBlack, color: Colors.navy, textAlign: 'center' },
  vsBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.gbg, alignItems: 'center', justifyContent: 'center', marginHorizontal: Spacing.sm },
  vsText: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilyBlack, color: Colors.muted },
  setCard: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 2, borderColor: 'transparent', ...Shadows.card },
  setCardSaved: { borderColor: Colors.green },
  setCardActive: { borderColor: Colors.yellow },
  setHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  setLabel: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
  savedChip: { backgroundColor: Colors.greenBgLight, borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 3 },
  savedText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBold, color: Colors.green },
  setInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  setInputGroup: { alignItems: 'center', flex: 1 },
  inputLabel: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilyBold, color: Colors.muted, marginBottom: 4, textAlign: 'center' },
  setInput: { borderWidth: 2, borderColor: Colors.gl, borderRadius: Radii.md, padding: Spacing.sm, fontSize: 28, fontFamily: Typography.fontFamilyBlack, color: Colors.navy, textAlign: 'center', width: 72, height: 64 },
  setInputDisabled: { borderColor: Colors.gl, backgroundColor: Colors.gbg, color: Colors.muted },
  setSep: { fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, color: Colors.gray },
  saveSetBtn: { marginTop: Spacing.md, backgroundColor: Colors.blue, borderRadius: Radii.md, padding: 11, alignItems: 'center' },
  saveSetText: { color: Colors.white, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily },
  pauseBtn: { backgroundColor: Colors.yellowBgWarm, borderWidth: 1.5, borderColor: Colors.yellow, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  pauseText: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
  pauseSub: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 3 },
  editAgainBtn: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  editAgainText: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.blue },
});
