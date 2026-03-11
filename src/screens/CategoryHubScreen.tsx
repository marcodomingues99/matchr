import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '../types';
import { api } from '../api/client';
import { tournamentKeys, matchKeys } from '../api/queryKeys';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients } from '../theme';
import { CATEGORY_CONFIG } from '../utils/categoryConfig';
import { MATCH_STATUS, CATEGORY_STATUS } from '../utils/constants';
import { STATUS_COLOR, STATUS_LABEL } from '../utils/labels';
import { getMinTeamsToStart } from '../utils/categoryConfig';
import { LiveDot } from '../components/LiveDot';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'CategoryHub'>;

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

export const CategoryHubScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { tournamentId, categoryId } = route.params;
  const { data: tournament, refetch: refetchTournament } = useQuery({
    queryKey: tournamentKeys.detail(tournamentId),
    queryFn: () => api.getTournament(tournamentId),
  });
  const category = tournament?.categories.find(v => v.id === categoryId);
  const { data: categoryMatches = [], refetch: refetchMatches } = useQuery({
    queryKey: matchKeys.byCategory(categoryId),
    queryFn: () => api.getMatchesByCategory(categoryId),
    enabled: !!category,
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTournament(), refetchMatches()]);
    setRefreshing(false);
  }, [refetchTournament, refetchMatches]);

  const { finishedMatches, liveMatches, allMatchesFinished, bracketPct } = useMemo(() => {
    const finished = categoryMatches.filter(g => g.status === MATCH_STATUS.FINISHED || g.status === MATCH_STATUS.WALKOVER);
    const live = categoryMatches.filter(g => g.status === MATCH_STATUS.LIVE);
    const bracket = categoryMatches.filter(g => g.phase !== 'groups');
    const bracketDone = bracket.filter(g => g.status === MATCH_STATUS.FINISHED || g.status === MATCH_STATUS.WALKOVER);
    return {
      finishedMatches: finished,
      liveMatches: live,
      allMatchesFinished: categoryMatches.length > 0 && categoryMatches.every(g => g.status === MATCH_STATUS.FINISHED || g.status === MATCH_STATUS.WALKOVER),
      bracketPct: bracket.length > 0 ? Math.round(bracketDone.length / bracket.length * 100) : 0,
    };
  }, [categoryMatches]);

  if (!tournament || !category) return null;

  const minTeamsToStart = getMinTeamsToStart(category);

  const confirmedTeams = category.teams.filter(t => !t.withdrawn);
  const teamFillPct = Math.round(confirmedTeams.length / category.maxTeams * 100);
  const matchesPct = categoryMatches.length > 0 ? Math.round(finishedMatches.length / categoryMatches.length * 100) : 0;

  const isLive = category.status === CATEGORY_STATUS.GROUPS || category.status === CATEGORY_STATUS.BRACKET;

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
      sub: `${confirmedTeams.length}/${category.maxTeams} inscritas`,
      progress: teamFillPct,
      onPress: () => navigation.navigate('TeamList', { tournamentId: tournament.id, categoryId: category.id }),
      enabled: true,
    },
    {
      icon: '📊', title: 'Fase de Grupos',
      sub: categoryMatches.length > 0
        ? `${finishedMatches.length}/${categoryMatches.length} jogos concluidos`
        : 'Gerir fase de grupos',
      progress: matchesPct,
      live: liveMatches.length,
      onPress: () => navigation.navigate(
        categoryMatches.length > 0 ? 'GroupsTable' : 'GroupsEmpty',
        { tournamentId: tournament.id, categoryId: category.id },
      ),
      enabled: category.status !== CATEGORY_STATUS.CONFIG && category.teams.filter(t => !t.withdrawn).length >= minTeamsToStart,
    },
    {
      icon: '🏆', title: 'Eliminatórias',
      sub: 'Fases finais e quadro eliminatório',
      progress: category.status === CATEGORY_STATUS.FINISHED ? 100 : category.status === CATEGORY_STATUS.BRACKET ? bracketPct : 0,
      onPress: () => navigation.navigate('Knockout', { tournamentId: tournament.id, categoryId: category.id }),
      enabled: category.status === CATEGORY_STATUS.BRACKET || category.status === CATEGORY_STATUS.FINISHED,
    },
    {
      icon: '🥇', title: 'Pódio',
      sub: 'Classificação final do torneio',
      progress: category.status === CATEGORY_STATUS.FINISHED ? 100 : 0,
      onPress: () => navigation.navigate('Podium', { tournamentId: tournament.id, categoryId: category.id }),
      enabled: category.status === CATEGORY_STATUS.FINISHED,
    },
    {
      icon: '📥', title: 'Exportar',
      sub: 'Jogos, duplas, classificacoes',
      progress: -1, // no progress bar
      onPress: () => navigation.navigate('Export', { tournamentId: tournament.id, categoryId: category.id }),
      enabled: true,
    },
  ];


  return (
    <View className="flex-1 bg-gbg">
      {/* HEADER */}
      <LinearGradient
        colors={CATEGORY_CONFIG[category.type].gradient}
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
          <SubBadge type={category.type} level={category.level} />
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-[10px]">
            {CATEGORY_CONFIG[category.type].label} {category.level}
          </Text>
          <View className="flex-row items-center gap-sm mt-[10px]">
            <View className="flex-row items-center gap-[6px] bg-white/20 rounded-[20px] px-[10px] py-[4px]">
              <View className="w-[7px] h-[7px] rounded-[4px]" style={{ backgroundColor: STATUS_COLOR[category.status] }} />
              <Text className="text-white/90 text-sm font-nunito">{STATUS_LABEL[category.status]}</Text>
            </View>
            {isLive && liveMatches.length > 0 && (
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
            {category.status === CATEGORY_STATUS.CONFIG && (
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
              <Text className="text-3xl font-nunito-black text-orange">{category.courts}</Text>
              <Text className="text-xs font-nunito-bold text-muted mt-[2px]">courts</Text>
            </View>
          </View>

          {/* ESTADO ACTUAL */}
          <View className="flex-row justify-between items-center mb-[10px] mt-[18px]">
            <Text className="text-base font-nunito text-navy">Estado actual</Text>
          </View>

          {/* Add team CTA */}
          {category.status === CATEGORY_STATUS.CONFIG && (
            <TouchableOpacity
              className="rounded-lg overflow-hidden mb-[10px]"
              onPress={() => navigation.navigate('ManageTeam', { tournamentId: tournament.id, categoryId: category.id })}
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
          {category.status === CATEGORY_STATUS.CONFIG && confirmedTeams.length >= minTeamsToStart && (
            <TouchableOpacity
              className="rounded-lg overflow-hidden mt-[10px] mb-[6px]"
              activeOpacity={0.85}
              onPress={() => navigation.navigate('GroupsEmpty', { tournamentId: tournament.id, categoryId: category.id })}
            >
              <LinearGradient colors={Gradients.green} className="flex-row items-center justify-center p-[15px] gap-sm" start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text className="text-[16px]">🚀</Text>
                <Text className="text-white text-lg font-nunito-black">Iniciar Fase de Grupos</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {category.status === CATEGORY_STATUS.GROUPS && allMatchesFinished && (
            <TouchableOpacity
              className="rounded-lg overflow-hidden mt-[10px] mb-[6px]"
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ConfirmCloseCategory', { tournamentId: tournament.id, categoryId: category.id })}
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
