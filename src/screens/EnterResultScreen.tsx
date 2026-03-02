import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { Button } from '../components/Button';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'EnterResult'>;

interface SetState { team1: string; team2: string; saved: boolean; }

export const EnterResultScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments[0];
  const vertente = tournament.vertentes[0];
  const game = mockGames.find(g => g.id === route.params.gameId) ?? mockGames[1];

  const [sets, setSets] = useState<SetState[]>([{ team1: '', team2: '', saved: false }]);
  const currentSetIdx = sets.findIndex(s => !s.saved);

  const saveSet = () => {
    const newSets = [...sets];
    newSets[currentSetIdx].saved = true;
    if (newSets.filter(s => s.saved).length < 3) {
      newSets.push({ team1: '', team2: '', saved: false });
    }
    setSets(newSets);
  };

  const updateSet = (idx: number, field: 'team1' | 'team2', val: string) => {
    const newSets = [...sets];
    newSets[idx][field] = val;
    setSets(newSets);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.header} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <Text style={styles.back} onPress={() => navigation.goBack()}>← Jogos</Text>
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={styles.title}>Introduzir Resultado</Text>
          <Text style={styles.subtitle}>{game.time} · {game.court}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        <View style={styles.teamsCard}>
          <Text style={styles.teamName}>{game.team1.name}</Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.teamName}>{game.team2.name}</Text>
        </View>

        {sets.map((set, idx) => {
          const isCurrent = !set.saved && idx === currentSetIdx;
          const setLabel = idx === 2 ? 'Super Tie-Break' : `Set ${idx + 1}`;
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

        <TouchableOpacity style={styles.pauseBtn} onPress={() => navigation.navigate('GamePaused', { tournamentId: route.params.tournamentId, vertenteId: route.params.vertenteId, gameId: game.id })}>
          <Text style={styles.pauseText}>⏸ Pausar jogo</Text>
          <Text style={styles.pauseSub}>{sets.filter(s => s.saved).length} sets guardados · podes retomar mais tarde</Text>
        </TouchableOpacity>

        {sets.every(s => s.saved) && sets.length >= 2 && (
          <Button label="✓ Confirmar resultado final" onPress={() => navigation.navigate('ConfirmClose', { tournamentId: route.params.tournamentId, vertenteId: route.params.vertenteId })} variant="green" />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  back: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8, marginBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 8 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginTop: 4 },
  scroll: { flex: 1 },
  teamsCard: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.md, ...Shadows.card },
  teamName: { fontSize: 15, fontFamily: 'Nunito_900Black', color: Colors.navy, textAlign: 'center' },
  vs: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted, marginVertical: 4 },
  setCard: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 2, borderColor: 'transparent', ...Shadows.card },
  setCardSaved: { borderColor: Colors.green },
  setCardActive: { borderColor: Colors.yellow },
  setHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  setLabel: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  savedChip: { backgroundColor: '#DFFAEE', borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 3 },
  savedText: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.green },
  setInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  setInputGroup: { alignItems: 'center', flex: 1 },
  inputLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: Colors.muted, marginBottom: 4, textAlign: 'center' },
  setInput: { borderWidth: 2, borderColor: Colors.gl, borderRadius: Radii.md, padding: Spacing.sm, fontSize: 28, fontFamily: 'Nunito_900Black', color: Colors.navy, textAlign: 'center', width: 72, height: 64 },
  setInputDisabled: { borderColor: Colors.gl, backgroundColor: Colors.gbg, color: Colors.muted },
  setSep: { fontSize: 22, fontFamily: 'Nunito_900Black', color: Colors.gray },
  saveSetBtn: { marginTop: Spacing.md, backgroundColor: Colors.blue, borderRadius: Radii.md, padding: 11, alignItems: 'center' },
  saveSetText: { color: '#fff', fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  pauseBtn: { backgroundColor: '#FFF8E3', borderWidth: 1.5, borderColor: Colors.yellow, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  pauseText: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  pauseSub: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginTop: 3 },
});
