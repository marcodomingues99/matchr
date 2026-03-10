import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { popTo } from '../utils/navigation';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients } from '../theme';
import { resolveMatchFormat } from '../utils/scoring';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GamePaused'>;

export const GamePausedScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);
  const game = mockGames.find(g => g.id === route.params.gameId);

  // No hooks after this point — safe to guard
  if (!tournament || !vertente || !game) return null;

  const matchFormat = resolveMatchFormat(vertente);

  return (
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={[Colors.brownDeep, Colors.brownLight]} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Jogos"
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text className="text-white text-[26px] md:text-[32px] font-nunito-black mt-sm">⏸ Jogo Pausado</Text>
          <Text className="text-white/75 text-base font-nunito-semibold mt-[4px]">{game.time} · {game.court}</Text>
        </SafeAreaView>
      </LinearGradient>

      <View className="flex-1 p-lg">
        <Container>
          <View className="bg-white rounded-lg p-md items-center mb-md shadow-card">
            <Text className="text-[15px] font-nunito-black text-navy">{game.team1.name}</Text>
            <Text className="text-sm font-nunito-bold text-muted my-[4px]">vs</Text>
            <Text className="text-[15px] font-nunito-black text-navy">{game.team2.name}</Text>
          </View>

          <View className="bg-yellow-bg-warm rounded-lg p-xl items-center mb-md border-[1.5px] border-yellow">
            <Text className="text-[48px] mb-md">⏸</Text>
            <Text className="text-[18px] font-nunito-black text-navy mb-sm">Jogo em pausa</Text>
            <Text className="text-base font-nunito-semibold text-muted text-center leading-[20px]">
              {game.sets?.length ?? 0} set{(game.sets?.length ?? 0) !== 1 ? 's' : ''} guardados.{'\n'}Podes retomar quando quiseres.
            </Text>
          </View>

          {game.sets && game.sets.length > 0 && (
            <View className="bg-white rounded-md p-md mb-md shadow-card">
              <Text className="text-xxs font-nunito-bold text-muted uppercase tracking-[1px] mb-sm">Resultados guardados</Text>
              {game.sets.map((set, i) => (
                <View key={i} className="flex-row justify-between py-[6px] border-b border-gl">
                  <Text className="text-base font-nunito-bold text-muted">{i === matchFormat.SUPER_TIE_BREAK_INDEX ? 'STB' : `Set ${i + 1}`}</Text>
                  <Text className="text-lg font-nunito-black text-navy">{set.team1} – {set.team2}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            className="rounded-lg overflow-hidden mb-sm"
            onPress={() => navigation.navigate('EnterResult', {
              tournamentId: route.params.tournamentId,
              vertenteId: route.params.vertenteId,
              gameId: route.params.gameId,
            })}
          >
            <LinearGradient colors={Gradients.primary} className="p-[15px] items-center">
              <Text className="text-white text-[15px] font-nunito">▶ Retomar Jogo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center p-md"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-blue text-lg font-nunito-bold">← Voltar aos jogos</Text>
          </TouchableOpacity>
        </Container>
      </View>
      <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
    </View>
  );
};
