import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
import { Gradients } from '../theme';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ConfirmCloseGame'>;

export const ConfirmCloseGameScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);
  const game = mockGames.find(g => g.id === route.params.gameId);

  if (!tournament || !vertente || !game) {
    return (
      <View className="flex-1 bg-gbg">
        <LinearGradient colors={Gradients.green} className="px-lg pb-lg">
          <SafeAreaView edges={['top']}>
            <HeaderNav backLabel="Voltar" onBack={() => navigation.goBack()} />
            <Text className="text-white text-[26px] md:text-[32px] font-nunito-black mt-sm">Confirmar Resultado</Text>
          </SafeAreaView>
        </LinearGradient>
        <View className="flex-1 items-center justify-center p-lg">
          <Text className="text-lg font-nunito text-muted text-center">
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
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.green} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Resultado"
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text className="text-white text-[26px] md:text-[32px] font-nunito-black mt-sm">Confirmar Resultado</Text>
          <Text className="text-white/75 text-base font-nunito-semibold mt-[4px]">Verifica antes de guardar</Text>
        </SafeAreaView>
      </LinearGradient>

      <View className="flex-1 p-lg">
        <Container>
          {/* Match result summary */}
          <View className="bg-white rounded-xl p-lg mb-md shadow-card">
            <View className="flex-row items-start mb-md">
              <View className="flex-1" style={{ alignItems: 'flex-start' }}>
                <Text className="text-lg font-nunito-black text-navy mb-[4px]">{winner.name}</Text>
                <View className="bg-green-bg-light rounded-full px-sm py-[3px] self-start">
                  <Text className="text-xs font-nunito text-green">🏆 Vencedor</Text>
                </View>
              </View>
              <View className="items-center px-md">
                <Text className="text-[36px] font-nunito-black text-navy">{winnerSets}</Text>
                <Text className="text-[18px] font-nunito-bold text-gray">–</Text>
                <Text className="text-[36px] font-nunito-black text-navy">{loserSets}</Text>
              </View>
              <View className="flex-1" style={{ alignItems: 'flex-end' }}>
                <Text className="text-lg font-nunito-black text-navy mb-[4px] text-right">{loser.name}</Text>
                <Text className="text-xs font-nunito-semibold text-muted">Sets perdidos</Text>
              </View>
            </View>

            <View className="h-[1px] bg-gl mb-md" />

            <Text className="text-sm font-nunito text-muted uppercase mb-sm">Parciais</Text>
            {sets.map((set, i) => (
              <View key={i} className="flex-row justify-between items-center py-[6px] border-b border-gl">
                <Text className="text-base font-nunito-bold text-muted">Set {i + 1}</Text>
                <View className="flex-row items-center gap-[6px]">
                  <View className={clsx(
                    'w-[36px] h-[36px] rounded-full bg-gbg items-center justify-center',
                    set.team1 > set.team2 && 'bg-navy',
                  )}>
                    <Text className={clsx(
                      'text-[15px] font-nunito-black text-muted',
                      set.team1 > set.team2 && 'text-white',
                    )}>{set.team1}</Text>
                  </View>
                  <Text className="text-[14px] text-gray">–</Text>
                  <View className={clsx(
                    'w-[36px] h-[36px] rounded-full bg-gbg items-center justify-center',
                    set.team2 > set.team1 && 'bg-navy',
                  )}>
                    <Text className={clsx(
                      'text-[15px] font-nunito-black text-muted',
                      set.team2 > set.team1 && 'text-white',
                    )}>{set.team2}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View className="bg-blue-bg-light rounded-md p-md mb-lg">
            <Text className="text-md font-nunito-semibold text-navy leading-[18px]">ℹ️  Uma vez confirmado, o resultado fica registado e a classificação é atualizada automaticamente.</Text>
          </View>

          <TouchableOpacity
            className="rounded-lg overflow-hidden mb-sm"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.dispatch(popTo('GroupsTable'));
            }}
            accessibilityRole="button"
            accessibilityLabel="Confirmar e guardar resultado"
          >
            <LinearGradient colors={Gradients.green} className="p-[15px] items-center">
              <Text className="text-white text-[15px] font-nunito">✓ Confirmar e Guardar</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity className="items-center p-md" onPress={() => navigation.goBack()}>
            <Text className="text-blue text-lg font-nunito-bold">✏️ Corrigir resultado</Text>
          </TouchableOpacity>
        </Container>
      </View>
      <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
    </View>
  );
};
