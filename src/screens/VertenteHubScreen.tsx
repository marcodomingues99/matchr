import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { GAME_STATUS, VERTENTE_STATUS, STATUS_COLOR, STATUS_LABEL, getMinTeamsToStart } from '../utils/constants';
import { LiveDot } from '../components/LiveDot';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'VertenteHub'>;

const ICON_BG: Record<string, string> = {
  '👥': Colors.blueBg,
  '📊': Colors.greenBgLight,
  '🏆': Colors.orangeBg,
  '🥇': Colors.purpleBg,
  '📥': Colors.gbg,
};

const PROGRESS_GRAD: Record<string, readonly [string, string]> = {
  '👥': [Colors.blue, Colors.teal],
  '📊': [Colors.green, Colors.greenDark],
  '🏆': [Colors.orange, Colors.yellow],
  '🥇': [Colors.purple, Colors.pink],
  '📥': [Colors.gray, Colors.gray],
};

export const VertenteHubScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const { vertenteGames, finishedGames, liveGames, allGamesFinished, bracketPct } = useMemo(() => {
    const teamIds = new Set(vertente?.teams.map(t => t.id) ?? []);
    const all = mockGames.filter(g => teamIds.has(g.team1.id) && teamIds.has(g.team2.id));
    const finished = all.filter(g => g.status === GAME_STATUS.FINISHED || g.status === GAME_STATUS.WALKOVER);
    const live = all.filter(g => g.status === GAME_STATUS.LIVE);
    const bracket = all.filter(g => g.phase !== 'groups');
    const bracketDone = bracket.filter(g => g.status === GAME_STATUS.FINISHED || g.status === GAME_STATUS.WALKOVER);
    return {
      vertenteGames: all,
      finishedGames: finished,
      liveGames: live,
      allGamesFinished: all.length > 0 && all.every(g => g.status === GAME_STATUS.FINISHED || g.status === GAME_STATUS.WALKOVER),
      bracketPct: bracket.length > 0 ? Math.round(bracketDone.length / bracket.length * 100) : 0,
    };
  }, [vertente?.teams]);

  if (!tournament || !vertente) return null;

  const minTeamsToStart = getMinTeamsToStart(vertente);

  const confirmedTeams = vertente.teams.filter(t => !t.withdrawn);
  const teamFillPct = Math.round(confirmedTeams.length / vertente.maxTeams * 100);
  const gamesPct = vertenteGames.length > 0 ? Math.round(finishedGames.length / vertenteGames.length * 100) : 0;

  const isLive = vertente.status === VERTENTE_STATUS.GROUPS || vertente.status === VERTENTE_STATUS.BRACKET;

  interface MenuItem {
    icon: string;
    title: string;
    sub: string;
    progress: number;
    live?: number;
    onPress: () => void;
    enabled: boolean;
  }

  const menuItems: MenuItem[] = [
    {
      icon: '👥', title: 'Duplas',
      sub: `${confirmedTeams.length}/${vertente.maxTeams} inscritas`,
      progress: teamFillPct,
      onPress: () => navigation.navigate('TeamList', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: true,
    },
    {
      icon: '📊', title: 'Fase de Grupos',
      sub: vertenteGames.length > 0
        ? `${finishedGames.length}/${vertenteGames.length} jogos concluidos`
        : 'Gerir fase de grupos',
      progress: gamesPct,
      live: liveGames.length,
      onPress: () => navigation.navigate(
        vertenteGames.length > 0 ? 'GroupsTable' : 'GroupsEmpty',
        { tournamentId: tournament.id, vertenteId: vertente.id },
      ),
      enabled: vertente.status !== VERTENTE_STATUS.CONFIG && vertente.teams.filter(t => !t.withdrawn).length >= minTeamsToStart,
    },
    {
      icon: '🏆', title: 'Eliminatórias',
      sub: 'Fases finais e quadro eliminatório',
      progress: vertente.status === VERTENTE_STATUS.FINISHED ? 100 : vertente.status === VERTENTE_STATUS.BRACKET ? bracketPct : 0,
      onPress: () => navigation.navigate('Knockout', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: vertente.status === VERTENTE_STATUS.BRACKET || vertente.status === VERTENTE_STATUS.FINISHED,
    },
    {
      icon: '🥇', title: 'Pódio',
      sub: 'Classificação final do torneio',
      progress: vertente.status === VERTENTE_STATUS.FINISHED ? 100 : 0,
      onPress: () => navigation.navigate('Podium', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: vertente.status === VERTENTE_STATUS.FINISHED,
    },
    {
      icon: '📥', title: 'Exportar',
      sub: 'Jogos, duplas, classificacoes',
      progress: -1, // no progress bar
      onPress: () => navigation.navigate('Export', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: true,
    },
  ];


  return (
    <View className="flex-1 bg-gbg">
      {/* HEADER */}
      <LinearGradient
        colors={VERTENTE_CONFIG[vertente.type].gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-lg pb-[22px] relative overflow-hidden"
      >
        {/* Decorative circle overlay */}
        <View className="absolute w-[150px] h-[150px] rounded-[75px] bg-white/5 -bottom-[48px] -right-[28px]" />
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={tournament.name}
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-[10px]">
            {VERTENTE_CONFIG[vertente.type].label} {vertente.level}
          </Text>
          <View className="flex-row items-center gap-sm mt-[10px]">
            <View className="flex-row items-center gap-[6px] bg-white/20 rounded-[20px] px-[10px] py-[4px]">
              <View className="w-[7px] h-[7px] rounded-[4px]" style={{ backgroundColor: STATUS_COLOR[vertente.status] }} />
              <Text className="text-white/90 text-sm font-nunito">{STATUS_LABEL[vertente.status]}</Text>
            </View>
            {isLive && liveGames.length > 0 && (
              <View className="flex-row items-center gap-[5px]">
                <LiveDot />
                <Text className="text-white/80 text-sm font-nunito-bold">Ao vivo</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-md pt-md pb-sm"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} colors={[Colors.blue]} />
        }
      >
        <Container>
          {/* CONFIGURAÇÃO */}
          <View className="flex-row justify-between items-center mb-[10px]">
            <Text className="text-base font-nunito text-navy">Configuração</Text>
            {vertente.status === VERTENTE_STATUS.CONFIG && (
              <TouchableOpacity onPress={() => navigation.navigate('EditTournament', { tournamentId: tournament.id })}>
                <Text className="text-sm font-nunito-bold text-blue">✏️ Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row gap-sm mb-[10px]">
            <View className="flex-1 bg-white rounded-lg p-md items-center shadow-card">
              <Text className="text-3xl font-nunito-black text-blue">{confirmedTeams.length}</Text>
              <Text className="text-xs font-nunito-bold text-muted mt-[2px]">duplas</Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-md items-center shadow-card">
              <Text className="text-3xl font-nunito-black text-orange">{vertente.courts}</Text>
              <Text className="text-xs font-nunito-bold text-muted mt-[2px]">courts</Text>
            </View>
          </View>

          {/* ESTADO ACTUAL */}
          <View className="flex-row justify-between items-center mb-[10px] mt-[18px]">
            <Text className="text-base font-nunito text-navy">Estado actual</Text>
          </View>

          {/* Add team CTA */}
          {vertente.status === VERTENTE_STATUS.CONFIG && (
            <TouchableOpacity
              className="rounded-lg overflow-hidden mb-[10px]"
              onPress={() => navigation.navigate('ManageTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}
              activeOpacity={0.85}
            >
              <LinearGradient colors={Gradients.primary} className="flex-row items-center justify-center p-md gap-xs" start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text className="text-[16px]">👥</Text>
                <Text className="text-white text-lg font-nunito">+ Adicionar Dupla</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Navigation cards */}
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              className={clsx(
                'bg-white rounded-lg p-md flex-row items-center gap-md mb-[8px] shadow-card',
                !item.enabled && 'opacity-40',
              )}
              onPress={item.onPress}
              disabled={!item.enabled}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${item.sub}${item.live ? `, ${item.live} ao vivo` : ''}`}
              accessibilityState={{ disabled: !item.enabled }}
              accessibilityHint={item.enabled ? `Abrir ${item.title}` : 'Bloqueado'}
            >
              {/* Icon box */}
              <View
                className="w-[40px] h-[40px] rounded-[11px] items-center justify-center shrink-0"
                style={{ backgroundColor: item.enabled ? ICON_BG[item.icon] : Colors.gl }}
              >
                <Text className="text-[18px]">{item.icon}</Text>
                {!item.enabled && (
                  <View className="absolute w-[40px] h-[40px] rounded-[11px] bg-white/55 items-center justify-center">
                    <Text className="text-[12px]">🔒</Text>
                  </View>
                )}
              </View>
              {/* Content */}
              <View className="flex-1">
                <Text className={clsx('text-base font-nunito', item.enabled ? 'text-navy' : 'text-muted')}>{item.title}</Text>
                {item.progress >= 0 && item.enabled && (
                  <View className="h-[4px] bg-gl rounded-[2px] mt-[5px]">
                    <LinearGradient
                      colors={PROGRESS_GRAD[item.icon]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="h-[4px] rounded-[2px]"
                      style={{ width: `${Math.max(item.progress, 2)}%` as `${number}%` }}
                    />
                  </View>
                )}
                <View className="flex-row items-center gap-[6px] mt-[3px]">
                  <Text className="text-xs font-nunito-semibold text-muted shrink" numberOfLines={1}>{item.sub}</Text>
                  {item.live != null && item.live > 0 && (
                    <View className="flex-row items-center gap-[4px]">
                      <LiveDot />
                      <Text className="text-xs font-nunito text-red">{item.live} ao vivo</Text>
                    </View>
                  )}
                </View>
              </View>
              {/* Chevron */}
              <Text className={clsx('text-3xl font-nunito-regular', item.enabled ? 'text-gray' : 'text-gl')}>›</Text>
            </TouchableOpacity>
          ))}

          {/* PHASE ACTIONS */}
          {vertente.status === VERTENTE_STATUS.CONFIG && confirmedTeams.length >= minTeamsToStart && (
            <TouchableOpacity
              className="rounded-lg overflow-hidden mt-[10px] mb-[6px]"
              activeOpacity={0.85}
              onPress={() => navigation.navigate('GroupsEmpty', { tournamentId: tournament.id, vertenteId: vertente.id })}
            >
              <LinearGradient colors={Gradients.green} className="flex-row items-center justify-center p-[15px] gap-sm" start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text className="text-[16px]">🚀</Text>
                <Text className="text-white text-lg font-nunito-black">Iniciar Fase de Grupos</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {vertente.status === VERTENTE_STATUS.GROUPS && allGamesFinished && (
            <TouchableOpacity
              className="rounded-lg overflow-hidden mt-[10px] mb-[6px]"
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ConfirmCloseTournament', { tournamentId: tournament.id, vertenteId: vertente.id })}
            >
              <LinearGradient colors={Gradients.green} className="flex-row items-center justify-center p-[15px] gap-sm" start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text className="text-[16px]">🏁</Text>
                <Text className="text-white text-lg font-nunito-black">Fechar Categoria</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <View className="h-[36px]" />
        </Container>
      </ScrollView>
      <HomeFAB onPress={() => navigation.goBack()} />
    </View>
  );
};
