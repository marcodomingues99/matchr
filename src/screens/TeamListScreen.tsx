import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp, StackActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList, Team } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { TeamGamesSheet } from '../components/TeamGamesSheet';
import { Colors, Gradients } from '../theme';
import { AVATAR_GRADIENTS, getInitials } from '../utils/teamUtils';
import { calcStats } from '../utils/scoring';
import { GROUP_CHIP_POOL } from '../utils/groupColors';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { STATUS_LABEL } from '../utils/constants';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'TeamList'>;

export const TeamListScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);

  const [sheetTeam, setSheetTeam] = React.useState<Team | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const { sortedGroups, groupRankMap } = useMemo(() => {
    const teams = vertente?.teams ?? [];
    const ppw = vertente?.pointsPerWin;
    const sg = [...new Set(teams.map(t => t.group).filter(Boolean) as string[])].sort();
    const map: Record<string, number> = {};
    sg.forEach(g => {
      const members = teams
        .filter(t => t.group === g)
        .sort((a, b) => calcStats(b.id, mockGames, ppw).pts - calcStats(a.id, mockGames, ppw).pts);
      members.forEach((t, i) => { map[t.id] = i + 1; });
    });
    return { sortedGroups: sg, groupRankMap: map };
  }, [vertente?.teams, vertente?.pointsPerWin, mockGames]);

  if (!tournament || !vertente) return null;

  const { label: typeLabel } = VERTENTE_CONFIG[vertente.type];
  const isConfig = vertente.status === 'config';
  const statusLabel = STATUS_LABEL[vertente.status] ?? 'Em preparação';

  const getChipStyle = (group: string) =>
    GROUP_CHIP_POOL[sortedGroups.indexOf(group) % GROUP_CHIP_POOL.length];

  return (
    <View className="flex-1 bg-gbg">
      {/* Header */}
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${typeLabel} ${vertente.level}`}
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-[6px]">Duplas Inscritas {'\u{1F465}'}</Text>
          <View className="flex-row gap-[6px] mt-[6px]">
            <View className="bg-white/20 rounded-full px-[10px] py-[3px]">
              <Text className="text-white text-xs font-nunito">{vertente.teams.length}/{vertente.maxTeams}</Text>
            </View>
            <View className="bg-white/20 rounded-full px-[10px] py-[3px]">
              <Text className="text-white text-xs font-nunito">{statusLabel}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        data={vertente.teams}
        keyExtractor={t => t.id}
        contentContainerClassName="p-md pb-[100px] max-w-content w-full self-center"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} colors={[Colors.blue]} />
        }
        ListHeaderComponent={
          <>
            <View className="flex-row justify-between items-center mb-[6px] mt-xs" accessibilityRole="header">
              <Text className="text-base font-nunito text-navy">Duplas — {vertente.level}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ManageTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}
                accessibilityRole="button"
                accessibilityLabel="Adicionar nova dupla"
              >
                <Text className="text-sm font-nunito-bold text-blue">+ Nova dupla</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center gap-sm mb-sm">
              <Text className="text-xs font-nunito-bold text-muted">{'\u270F\uFE0F'} editar</Text>
              <Text className="text-xs font-nunito-bold text-gl">|</Text>
              <Text className="text-xs font-nunito-bold text-muted">{isConfig ? '\u{1F5D1}\uFE0F remover' : '\u{1F6AB} desistência'}</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="bg-white rounded-lg p-2xl items-center shadow-card mt-[20px]" accessibilityLabel="Sem duplas inscritas">
            <Text className="text-[48px] mb-md">{'\u{1F465}'}</Text>
            <Text className="text-xl font-nunito-black text-navy mb-[6px]">Sem duplas inscritas</Text>
            <Text className="text-base font-nunito-semibold text-muted mb-[20px]">Adiciona a primeira equipa</Text>
            <TouchableOpacity
              className="bg-blue rounded-md px-xl py-md"
              onPress={() => navigation.navigate('ManageTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}
              accessibilityRole="button"
              accessibilityLabel="Adicionar primeira dupla"
            >
              <Text className="text-white text-lg font-nunito">+ Adicionar dupla</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: team, index: idx }) => {
              const avatarColors = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
              const isWithdrawn = !!team.withdrawn;
              return (
                <TouchableOpacity
                  className={clsx(
                    'flex-row items-center gap-sm py-sm',
                    isWithdrawn && 'opacity-60 bg-red-bg-light -mx-md px-md rounded-none',
                    idx < vertente.teams.length - 1 && 'border-b-[1.5px] border-b-gl',
                  )}
                  onPress={() => setSheetTeam(team)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`${team.name}, ${team.players.map(p => p.name).join(' e ')}${team.group ? `, grupo ${team.group}` : ''}${isWithdrawn ? ', desistência' : ''}`}
                  accessibilityHint="Toca para ver jogos da dupla"
                >
                  <Text className="w-[16px] text-center text-sm font-nunito-black text-muted">{idx + 1}</Text>
                  {team.photo ? (
                    <Image source={{ uri: team.photo }} style={{ width: 38, height: 38 }} className="rounded-[19px] shrink-0" accessibilityIgnoresInvertColors />
                  ) : (
                    <LinearGradient colors={avatarColors} className="w-[38px] h-[38px] rounded-[19px] items-center justify-center shrink-0">
                      <Text className="text-white text-md font-nunito-black">{getInitials(team.name)}</Text>
                    </LinearGradient>
                  )}
                  <View className="flex-1 min-w-0">
                    <View className="flex-row items-center flex-wrap">
                      <Text className={clsx('text-md font-nunito', isWithdrawn ? 'text-muted' : 'text-navy')} numberOfLines={1}>{team.name}</Text>
                      {isWithdrawn && <Text className="text-xs font-nunito-bold text-red"> {'\u{1F6AB}'} Desistência</Text>}
                    </View>
                    <Text className="text-xs font-nunito-semibold text-muted mt-[1px]" numberOfLines={1}>{team.players.map(p => p.name).join(' · ')}</Text>
                  </View>
                  {team.group && (() => {
                    const chip = getChipStyle(team.group);
                    return (
                      <View
                        className="rounded-full px-sm py-[3px] mr-[6px]"
                        style={{ backgroundColor: chip.bg }}
                      >
                        <Text className="text-xs font-nunito" style={{ color: chip.text }}>{team.group}{groupRankMap[team.id] ?? ''}</Text>
                      </View>
                    );
                  })()}
                  {isWithdrawn ? (
                    <Text className="text-xs font-nunito text-red">W.O.</Text>
                  ) : (
                    <View className="flex-row gap-sm">
                      <TouchableOpacity
                        onPress={() => navigation.navigate('ManageTeam', { tournamentId: tournament.id, vertenteId: vertente.id, teamId: team.id })}
                        accessibilityRole="button"
                        accessibilityLabel={`Editar ${team.name}`}
                      >
                        <Text className="text-[15px] p-xs min-w-[30px] min-h-[30px] text-center">{'\u270F\uFE0F'}</Text>
                      </TouchableOpacity>
                      {isConfig ? (
                        <TouchableOpacity
                          onPress={() => Alert.alert(
                            'Remover dupla',
                            `Remover "${team.name}" da lista?`,
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              {
                                text: 'Remover', style: 'destructive', onPress: () => {
                                  vertente.teams = vertente.teams.filter(t => t.id !== team.id);
                                  navigation.replace('TeamList', { tournamentId: tournament.id, vertenteId: vertente.id });
                                }
                              },
                            ],
                          )}
                          accessibilityRole="button"
                          accessibilityLabel={`Remover ${team.name}`}
                        >
                          <Text className="text-[15px] p-xs min-w-[30px] min-h-[30px] text-center opacity-55">{'\u{1F5D1}\uFE0F'}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => navigation.navigate('WithdrawConfirm', { tournamentId: tournament.id, vertenteId: vertente.id, teamId: team.id })}
                          accessibilityRole="button"
                          accessibilityLabel={`Registar desistência de ${team.name}`}
                        >
                          <Text className="text-[15px] p-xs min-w-[30px] min-h-[30px] text-center opacity-55">{'\u{1F6AB}'}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
      />

      <TeamGamesSheet
        visible={sheetTeam !== null}
        team={sheetTeam}
        vertente={vertente}
        games={mockGames}
        onClose={() => setSheetTeam(null)}
      />
      <HomeFAB onPress={() => navigation.dispatch(StackActions.pop(2))} />
    </View>
  );
};
