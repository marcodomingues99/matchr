import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import clsx from 'clsx';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { popTo } from '../utils/navigation';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Button } from '../components/Button';
import { Gradients } from '../theme';
import { resolveMatchFormat } from '../utils/scoring';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'EnterResult'>;

interface SetState { team1: string; team2: string; saved: boolean; }

export const EnterResultScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);
  const game = mockGames.find(g => g.id === route.params.gameId);
  if (!tournament || !vertente || !game) return null;

  const matchFormat = resolveMatchFormat(vertente);

  const isEditing = game.status === 'finished' && !!game.sets?.length;

  const buildInitialSets = (): SetState[] => {
    if (game.status === 'finished' && game.sets && game.sets.length > 0) {
      return game.sets.map(s => ({
        team1: String(s.team1),
        team2: String(s.team2),
        saved: true,
      }));
    }
    if ((game.status === 'live' || game.status === 'paused') && game.sets && game.sets.length > 0) {
      return [
        ...game.sets.map(s => ({ team1: String(s.team1), team2: String(s.team2), saved: true })),
        { team1: '', team2: '', saved: false },
      ];
    }
    return [{ team1: '', team2: '', saved: false }];
  };

  const [sets, setSets] = useState<SetState[]>(buildInitialSets);
  const currentSetIdx = sets.findIndex(s => !s.saved);

  const saveSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newSets = sets.map((s, i) =>
      i === currentSetIdx ? { ...s, saved: true } : s,
    );
    const allSaved = newSets.every(s => s.saved);
    if (allSaved && newSets.length < matchFormat.MAX_SETS) {
      let t1Wins = 0, t2Wins = 0;
      newSets.forEach(s => {
        const s1 = parseInt(s.team1) || 0;
        const s2 = parseInt(s.team2) || 0;
        if (s1 > s2) t1Wins++; else if (s2 > s1) t2Wins++;
      });
      if (t1Wins < matchFormat.SETS_TO_WIN && t2Wins < matchFormat.SETS_TO_WIN) {
        newSets.push({ team1: '', team2: '', saved: false });
      }
    }
    setSets(newSets);
  };

  const updateSet = (idx: number, field: 'team1' | 'team2', val: string) => {
    setSets(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  return (
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Jogos"
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-sm">{isEditing ? 'Editar Resultado' : 'Introduzir Resultado'}</Text>
          <Text className="text-white/75 text-base font-nunito-semibold mt-xs">{game.time} {'·'} {game.court}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-lg">
        <Container>
          <View className="bg-white rounded-lg p-lg flex-row items-center mb-md shadow-card">
            <Text className="flex-1 text-[15px] font-nunito-black text-navy text-center" numberOfLines={2}>{game.team1.name}</Text>
            <View className="w-[32px] h-[32px] rounded-full bg-gbg items-center justify-center mx-sm">
              <Text className="text-xs font-nunito-black text-muted">VS</Text>
            </View>
            <Text className="flex-1 text-[15px] font-nunito-black text-navy text-center" numberOfLines={2}>{game.team2.name}</Text>
          </View>

          {sets.map((set, idx) => {
            const isCurrent = !set.saved && idx === currentSetIdx;
            const setLabel = idx === matchFormat.SUPER_TIE_BREAK_INDEX ? 'Super Tie-Break' : `Set ${idx + 1}`;
            return (
              <View
                key={idx}
                className={clsx(
                  'bg-white rounded-lg p-md mb-sm border-2 shadow-card',
                  set.saved ? 'border-green' : isCurrent ? 'border-yellow' : 'border-transparent',
                )}
              >
                <View className="flex-row justify-between items-center mb-sm">
                  <Text className="text-base font-nunito text-navy">{setLabel}</Text>
                  {set.saved && (
                    <View className="bg-green-bg-light rounded-full px-[10px] py-[3px]">
                      <Text className="text-sm font-nunito-bold text-green">{'✓'} Guardado</Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center justify-center gap-md">
                  <View className="items-center flex-1">
                    <Text className="text-xs font-nunito-bold text-muted mb-xs text-center">{game.team1.name}</Text>
                    <TextInput
                      className={clsx(
                        'border-2 rounded-md p-sm text-[28px] font-nunito-black text-navy text-center w-[72px] h-[64px]',
                        !isCurrent ? 'border-gl bg-gbg text-muted' : 'border-gl',
                      )}
                      value={set.team1}
                      onChangeText={v => updateSet(idx, 'team1', v)}
                      keyboardType="number-pad"
                      maxLength={2}
                      editable={isCurrent}
                      placeholder="0"
                    />
                  </View>
                  <Text className="text-3xl font-nunito-black text-gray">{'\u2013'}</Text>
                  <View className="items-center flex-1">
                    <Text className="text-xs font-nunito-bold text-muted mb-xs text-center">{game.team2.name}</Text>
                    <TextInput
                      className={clsx(
                        'border-2 rounded-md p-sm text-[28px] font-nunito-black text-navy text-center w-[72px] h-[64px]',
                        !isCurrent ? 'border-gl bg-gbg text-muted' : 'border-gl',
                      )}
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
                  <TouchableOpacity
                    className="mt-md bg-blue rounded-md p-[11px] items-center"
                    onPress={saveSet}
                    accessibilityRole="button"
                    accessibilityLabel={`Guardar ${setLabel}`}
                  >
                    <Text className="text-white text-base font-nunito">Guardar Set {'\u2192'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {!isEditing && (
            <TouchableOpacity
              className="bg-yellow-bg-warm border-[1.5px] border-yellow rounded-lg p-md mb-md items-center"
              onPress={() => navigation.navigate('GamePaused', { tournamentId: route.params.tournamentId, vertenteId: route.params.vertenteId, gameId: game.id })}
            >
              <Text className="text-base font-nunito text-navy">{'\u23F8'} Pausar jogo</Text>
              <Text className="text-sm font-nunito-semibold text-muted mt-[3px]">{sets.filter(s => s.saved).length} sets guardados {'·'} podes retomar mais tarde</Text>
            </TouchableOpacity>
          )}

          {isEditing && (
            <TouchableOpacity
              className="bg-white border-[1.5px] border-gl rounded-lg p-md mb-md items-center"
              onPress={() => {
                const newSets = sets.map(s => ({ ...s, saved: false }));
                setSets(newSets);
              }}
            >
              <Text className="text-base font-nunito text-blue">{'\u270F\uFE0F'} Editar resultados</Text>
            </TouchableOpacity>
          )}

          {sets.every(s => s.saved) && sets.length >= matchFormat.SETS_TO_WIN && (
            <Button label={isEditing ? '✓ Guardar alterações' : '✓ Confirmar resultado final'} onPress={() => navigation.navigate('ConfirmCloseGame', { tournamentId: route.params.tournamentId, vertenteId: route.params.vertenteId, gameId: route.params.gameId })} variant="green" />
          )}

          <View className="h-2xl" />
        </Container>
      </ScrollView>
      <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
    </View>
  );
};
