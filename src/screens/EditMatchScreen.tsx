import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList, ResolvedMatch } from '../types';
import { mockTournaments, mockMatches, mockTeamMap } from '../mock/data';
import { resolveMatch } from '../utils/resolveMatch';
import { popTo } from '../utils/navigation';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients } from '../theme';
import { MATCH_STATUS_COLOR, MATCH_STATUS_LABEL } from '../utils/labels';
import { formatDateShortPt, formatTimePt, getDateRange, toLocalISO } from '../utils/dateUtils';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'EditMatch'>;

export const EditMatchScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const category = tournament?.categories.find(v => v.id === route.params.categoryId);
  const rawMatch = mockMatches.find(g => g.id === route.params.matchId);

  const matchData: ResolvedMatch = rawMatch
    ? resolveMatch(rawMatch, mockTeamMap)
    : {
        id: route.params.matchId, categoryId: route.params.categoryId,
        team1Id: 'tmp-t1', team2Id: 'tmp-t2',
        team1: { id: 'tmp-t1', name: 'Equipa 1', players: [{ id: 'x1', name: '' }, { id: 'x2', name: '' }] },
        team2: { id: 'tmp-t2', name: 'Equipa 2', players: [{ id: 'x3', name: '' }, { id: 'x4', name: '' }] },
        court: 'C1', scheduledAt: '', phase: 'groups' as const,
        status: 'scheduled' as const,
      };

  const [court, setCourt] = useState(matchData.court);
  const [time, setTime] = useState(
    matchData.scheduledAt ? formatTimePt(matchData.scheduledAt) : '',
  );
  const [date, setDate] = useState(
    matchData.scheduledAt ? matchData.scheduledAt.split('T')[0] + 'T00:00:00' : '',
  );

  const tournamentDays = useMemo(() => {
    if (!tournament?.startDate || !tournament?.endDate) return [];
    return getDateRange(tournament.startDate, tournament.endDate);
  }, [tournament?.startDate, tournament?.endDate]);

  const courts = useMemo(
    () => Array.from({ length: category?.courts ?? 0 }, (_, i) => `C${i + 1}`),
    [category?.courts],
  );

  if (!tournament || !category) return null;

  const persistScheduling = () => {
    if (!rawMatch) return;
    rawMatch.court = court;
    rawMatch.scheduledAt = date && time ? date.split('T')[0] + 'T' + time + ':00' : '';
  };

  const handleSave = () => {
    persistScheduling();
    navigation.goBack();
  };

  const markWalkover = (winnerId: string) => {
    if (!rawMatch) {
      navigation.goBack();
      return;
    }
    persistScheduling();
    rawMatch.status = 'walkover';
    rawMatch.winnerId = winnerId;
    rawMatch.sets = [];
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Jogos"
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={category.type} level={category.level} />
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-sm">Editar Jogo</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-lg">
        <Container>
          {/* Teams display */}
          <View className="bg-white rounded-lg p-md mb-lg shadow-card">
            <View className="flex-row items-center gap-md py-[6px]">
              <View className="w-[36px] h-[36px] rounded-full bg-blue items-center justify-center">
                <Text className="text-white text-lg font-nunito-black">{matchData.team1.name.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-nunito text-navy">{matchData.team1.name}</Text>
                <Text className="text-sm font-nunito-semibold text-muted">{matchData.team1.players.map(p => p.name).join(' & ')}</Text>
              </View>
            </View>
            <View className="items-center py-xs">
              <Text className="text-sm font-nunito text-muted">vs</Text>
            </View>
            <View className="flex-row items-center gap-md py-[6px]">
              <View className="w-[36px] h-[36px] rounded-full bg-teal items-center justify-center">
                <Text className="text-white text-lg font-nunito-black">{matchData.team2.name.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-nunito text-navy">{matchData.team2.name}</Text>
                <Text className="text-sm font-nunito-semibold text-muted">{matchData.team2.players.map(p => p.name).join(' & ')}</Text>
              </View>
            </View>
          </View>

          {/* Court */}
          <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-[10px] mt-xs">Court</Text>
          <View className="flex-row gap-[10px] mb-lg flex-wrap">
            {courts.map(c => (
              <TouchableOpacity
                key={c}
                className={clsx(
                  'px-lg py-[10px] rounded-md border-[1.5px] shadow-card',
                  court === c ? 'border-blue bg-blue-bg-light' : 'bg-white border-transparent',
                )}
                onPress={() => setCourt(c)}
              >
                <Text className={clsx('text-base font-nunito', court === c ? 'text-blue' : 'text-muted')}>{'\u{1F3DF}\uFE0F'} {c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date / Time */}
          <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-[10px]">Data e Hora</Text>
          <View className="bg-white rounded-lg p-md mb-lg shadow-card">
            <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-[5px]">Data</Text>
            <View className="flex-row gap-sm flex-wrap">
              {tournamentDays.map((day, i) => (
                <TouchableOpacity
                  key={day}
                  className={clsx(
                    'flex-1 min-w-[72px] py-[10px] px-sm rounded-sm border-2 items-center',
                    date === day ? 'bg-blue-bg border-blue' : 'bg-gbg border-gl',
                  )}
                  onPress={() => setDate(day)}
                >
                  <Text className={clsx('text-md font-nunito-black', date === day ? 'text-blue' : 'text-navy')}>{formatDateShortPt(day)}</Text>
                  <Text className={clsx('text-xxs font-nunito-semibold mt-[2px]', date === day ? 'text-blue' : 'text-muted')}>Dia {i + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="h-md" />
            <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-[5px]">Hora</Text>
            <TextInput
              className="border-[1.5px] border-gl rounded-sm p-sm text-lg font-nunito-bold text-navy bg-gbg"
              value={time}
              onChangeText={setTime}
              placeholder="10:00"
              placeholderTextColor={Colors.gray}
              keyboardType="numeric"
            />
          </View>

          {/* Status */}
          <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-[10px]">Estado</Text>
          <View className="bg-white rounded-md p-md flex-row items-center gap-[10px] mb-lg shadow-card">
            <View
              className="w-[10px] h-[10px] rounded-full"
              style={{ backgroundColor: MATCH_STATUS_COLOR[matchData.status] ?? Colors.yellow }}
            />
            <Text className="text-lg font-nunito text-navy">
              {MATCH_STATUS_LABEL[matchData.status] ?? matchData.status}
            </Text>
          </View>

          <View className="h-xl" />

          <TouchableOpacity className="rounded-lg overflow-hidden mb-sm" onPress={handleSave}>
            <LinearGradient colors={Gradients.primary} className="p-[15px] items-center">
              <Text className="text-white text-[15px] font-nunito">{'✓'} Guardar alterações</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Walkover */}
          <TouchableOpacity
            className="items-center p-[14px]"
            onPress={() => {
              Alert.alert(
                'Marcar walkover',
                'Escolhe a equipa vencedora por W.O.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: matchData.team1.name, onPress: () => markWalkover(matchData.team1.id) },
                  { text: matchData.team2.name, onPress: () => markWalkover(matchData.team2.id) },
                ],
              );
            }}
          >
            <Text className="text-base font-nunito-bold text-orange">{'\u26A0\uFE0F'} Marcar como walkover</Text>
          </TouchableOpacity>

          <View className="h-2xl" />
        </Container>
      </ScrollView>
      <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
    </View>
  );
};
