import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp, StackActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList, Team } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { GameCard } from '../components/GameCard';
import { TeamGamesSheet } from '../components/TeamGamesSheet';
import { Colors, Gradients } from '../theme';
import { calcStats, PTS_PER_WIN } from '../utils/scoring';
import { GROUP_GRADIENT_POOL } from '../utils/groupColors';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { GAME_STATUS, GAME_STATUS_LABEL } from '../utils/constants';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupsTable'>;

type TabKey = 'table' | 'results' | 'games';

export const GroupsTableScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);

  const [activeTab, setActiveTab] = useState<TabKey>('table');
  const [sheetTeam, setSheetTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // Extract sorted group names
  const groups = useMemo(
    () => [...new Set((vertente?.teams ?? []).map(t => t.group).filter(Boolean) as string[])].sort(),
    [vertente?.teams],
  );
  const [activeGroup, setActiveGroup] = useState<string>(groups[0] ?? '');

  // Brief loading flash on tab or group change
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(t);
  }, [activeTab, activeGroup]);

  // Group teams by group
  const grouped = useMemo(() => {
    const result: Record<string, NonNullable<typeof vertente>['teams']> = {};
    (vertente?.teams ?? []).forEach(t => {
      const g = t.group ?? '';
      if (!result[g]) result[g] = [];
      result[g].push(t);
    });
    return result;
  }, [vertente?.teams]);

  const qualifiers = vertente?.qualifiersPerGroup ?? 2;
  const mockStats = (teamId: string) => calcStats(teamId, mockGames, vertente?.pointsPerWin ?? PTS_PER_WIN);

  // Set of team IDs that belong to this vertente (used to scope game filtering)
  const vertenteTeamIds = useMemo(
    () => new Set((vertente?.teams ?? []).map(t => t.id)),
    [vertente?.teams],
  );

  // Filter games by active group AND only include games whose teams belong to this vertente
  const filteredGames = useMemo(
    () => mockGames.filter(
      g =>
        vertenteTeamIds.has(g.team1.id) &&
        vertenteTeamIds.has(g.team2.id) &&
        (g.team1.group === activeGroup || g.team2.group === activeGroup),
    ),
    [activeGroup, vertenteTeamIds],
  );

  const showGroupSelector = activeTab !== 'table' && groups.length > 0;

  if (!tournament || !vertente) return null;

  return (
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${VERTENTE_CONFIG[vertente.type].labelShort} ${vertente.level}`}
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-sm">Fase de Grupos</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* Main tab bar */}
      <View className="flex-row bg-white border-b border-b-gl" accessibilityRole="tablist">
        {([
          { key: 'table' as TabKey, label: '📊 Tabela' },
          { key: 'games' as TabKey, label: '🎾 Jogos' },
          { key: 'results' as TabKey, label: '🏅 Resultados' },
        ]).map(t => (
          <TouchableOpacity
            key={t.key}
            className={clsx('flex-1 py-[12px] items-center', activeTab === t.key && 'border-b-2 border-b-blue')}
            onPress={() => setActiveTab(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === t.key }}
            accessibilityLabel={t.label}
          >
            <Text className={clsx('text-base font-nunito-bold', activeTab === t.key ? 'text-blue' : 'text-muted')}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Group sub-tabs (Resultados & Jogos only) */}
      {showGroupSelector && (
        <View className="flex-row gap-xs px-md py-sm bg-white border-b-[1.5px] border-b-gl">
          {groups.map(g => (
            <TouchableOpacity
              key={g}
              className={clsx(
                'flex-1 py-[7px] px-[3px] rounded-[9px] items-center border-2',
                activeGroup === g ? 'bg-navy border-transparent' : 'bg-gbg border-transparent',
              )}
              onPress={() => setActiveGroup(g)}
            >
              <Text className={clsx('text-xs font-nunito', activeGroup === g ? 'text-white' : 'text-muted')}>Grupo {g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View className="p-md">
          {[0, 1, 2].map(i => (
            <View key={i} className="bg-white rounded-lg p-md mb-sm">
              <View className="h-[10px] w-[120px] bg-gl rounded-[5px] mb-md" />
              <View className="flex-row items-center gap-sm">
                <View className="flex-1 h-[14px] bg-gl rounded-[5px]" />
                <View className="w-[60px] h-[28px] bg-gl rounded-sm" />
                <View className="flex-1 h-[14px] bg-gl rounded-[5px]" />
              </View>
              <View className="w-[80px] h-[10px] bg-gl rounded-[5px] mt-sm" />
            </View>
          ))}
        </View>
      ) : (
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-md"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} colors={[Colors.blue]} />
        }
      >
        <Container>

        {/* TAB: Tabela */}
        {activeTab === 'table' && (
          Object.keys(grouped).length === 0 ? (
            <View className="items-center mt-[48px] px-xl">
              <Text className="text-[40px] mb-[12px]">📊</Text>
              <Text className="text-[15px] font-nunito text-navy mb-[6px]">Grupos ainda não atribuídos</Text>
              <Text className="text-md font-nunito-semibold text-muted text-center leading-[18px]">Importa a grelha para ver a tabela de grupos</Text>
            </View>
          ) : (
            Object.keys(grouped).sort().map((group, groupIdx) => {
              const gradient = GROUP_GRADIENT_POOL[groupIdx % GROUP_GRADIENT_POOL.length];
              const teams = [...grouped[group]].sort((a, b) => mockStats(b.id).pts - mockStats(a.id).pts);
              return (
                <View key={group} className="bg-white rounded-md overflow-hidden mb-md shadow-card">
                  {/* Coloured group header */}
                  <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="flex-row justify-between items-center px-md py-sm">
                    <Text className="text-white text-base font-nunito-black">Grupo {group}</Text>
                    <Text className="text-white/65 text-xs font-nunito-bold">Passam {qualifiers}</Text>
                  </LinearGradient>

                  {/* Table column headers */}
                  <View className="flex-row items-center px-[9px] py-[6px] border-b-[1.5px] border-b-gl">
                    <Text className="w-[20px] text-xxs font-nunito-black text-muted text-center uppercase">#</Text>
                    <Text className="flex-[3] text-xxs font-nunito-black text-muted text-left uppercase">Dupla</Text>
                    <Text className="flex-1 text-xxs font-nunito-black text-muted text-center uppercase">J</Text>
                    <Text className="flex-1 text-xxs font-nunito-black text-muted text-center uppercase">V</Text>
                    <Text className="flex-1 text-xxs font-nunito-black text-muted text-center uppercase">D</Text>
                    <Text className="flex-[1.4] text-xxs font-nunito-black text-muted text-center uppercase">Sets</Text>
                    <Text className="flex-1 text-xxs font-nunito-black text-muted text-center uppercase">Pts</Text>
                  </View>

                  {/* Team rows */}
                  {teams.map((team, idx) => {
                    const stats = mockStats(team.id);
                    const isQ = idx < qualifiers;
                    const isLastRow = idx === teams.length - 1;
                    return (
                      <TouchableOpacity
                        key={team.id}
                        className={clsx(
                          'flex-row items-center px-[9px] py-[7px]',
                          isQ && 'bg-green-bg border-l-[3px] border-l-green',
                          !isLastRow && 'border-b border-b-gl',
                        )}
                        onPress={() => setSheetTeam(team)}
                        activeOpacity={0.7}
                      >
                        <Text className={clsx('w-[20px] text-xs font-nunito-black text-center', isQ ? 'text-green' : 'text-muted')}>{idx + 1}</Text>
                        <Text className="flex-[3] text-sm font-nunito-bold text-navy text-left" numberOfLines={1}>{team.name}</Text>
                        <Text className="flex-1 text-sm font-nunito-bold text-navy text-center">{stats.played}</Text>
                        <Text className="flex-1 text-sm font-nunito-bold text-green text-center">{stats.wins}</Text>
                        <Text className="flex-1 text-sm font-nunito-bold text-red text-center">{stats.losses}</Text>
                        <Text className="flex-[1.4] text-sm font-nunito-bold text-navy text-center">{stats.gamesWon}-{stats.gamesLost}</Text>
                        <Text className="flex-1 text-sm font-nunito-black text-blue text-center">{stats.pts}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })
          )
        )}

        {/* TAB: Resultados (filtered by group) */}
        {activeTab === 'results' && (
          filteredGames.length === 0 ? (
            <View className="items-center mt-[48px] px-xl">
              <Text className="text-md font-nunito-semibold text-muted text-center leading-[18px]">Sem resultados para o Grupo {activeGroup}</Text>
            </View>
          ) : (
            filteredGames.map(g => (
              <View key={g.id} className="bg-white rounded-md p-md mb-sm shadow-card">
                <View className="flex-row justify-between items-center mb-sm">
                  <Text className="text-sm font-nunito-bold text-muted">{g.time} · {g.court}</Text>
                  <View className={clsx(
                    'rounded-full px-[8px] py-[3px]',
                    g.status === GAME_STATUS.FINISHED ? 'bg-green-bg-light' :
                      g.status === GAME_STATUS.LIVE ? 'bg-red-bg' : 'bg-gbg',
                  )}>
                    <Text className="text-xs font-nunito text-navy">
                      {GAME_STATUS_LABEL[g.status] ?? g.status}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-sm">
                  <TouchableOpacity className="flex-1" onPress={() => setSheetTeam(g.team1)} activeOpacity={0.7}>
                    <Text className="flex-1 text-base font-nunito text-navy" numberOfLines={1}>{g.team1.name}</Text>
                  </TouchableOpacity>
                  {g.sets && g.sets.length > 0 ? (
                    <View className="flex-row gap-[6px] items-center">
                      {g.sets.map((set, i) => (
                        <View key={i} className="flex-row items-center gap-[2px] bg-gbg rounded-sm px-[6px] py-[3px]">
                          <Text className={clsx('text-base font-nunito-black', set.team1 > set.team2 ? 'text-navy' : 'text-muted')}>{set.team1}</Text>
                          <Text className="text-sm text-gray">–</Text>
                          <Text className={clsx('text-base font-nunito-black', set.team2 > set.team1 ? 'text-navy' : 'text-muted')}>{set.team2}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-sm font-nunito-bold text-muted">vs</Text>
                  )}
                  <TouchableOpacity className="flex-1" onPress={() => setSheetTeam(g.team2)} activeOpacity={0.7}>
                    <Text className="flex-1 text-base font-nunito text-navy text-right" numberOfLines={1}>{g.team2.name}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        )}

        {/* TAB: Jogos (GameCards filtered by group) */}
        {activeTab === 'games' && (
          filteredGames.length === 0 ? (
            <View className="items-center mt-[48px] px-xl">
              <Text className="text-md font-nunito-semibold text-muted text-center leading-[18px]">Sem jogos para o Grupo {activeGroup}</Text>
            </View>
          ) : (
            filteredGames.map(g => (
              <GameCard
                key={g.id}
                game={g}
                onTeamPress={setSheetTeam}
                onEdit={() => navigation.navigate('EditGame', { tournamentId: tournament.id, vertenteId: vertente.id, gameId: g.id })}
                onEnterResult={() => g.status === GAME_STATUS.PAUSED
                  ? navigation.navigate('GamePaused', { tournamentId: tournament.id, vertenteId: vertente.id, gameId: g.id })
                  : navigation.navigate('EnterResult', { tournamentId: tournament.id, vertenteId: vertente.id, gameId: g.id })
                }
              />
            ))
          )
        )}

        <View className="h-2xl" />
        </Container>
      </ScrollView>
      )}

      {/* Team games bottom sheet */}
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
