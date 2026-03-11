import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList, Team, ResolvedMatch } from '../types';
import { api } from '../api/client';
import { tournamentKeys, matchKeys } from '../api/queryKeys';
import { MatchCard } from '../components/MatchCard';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { TeamMatchesSheet } from '../components/TeamMatchesSheet';
import { Gradients } from '../theme';
import { CATEGORY_CONFIG } from '../utils/categoryConfig';
import { MATCH_STATUS } from '../utils/constants';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupsGames'>;

export const GroupsGamesScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { tournamentId, categoryId } = route.params;
  const { data: tournament } = useQuery({
    queryKey: tournamentKeys.detail(tournamentId),
    queryFn: () => api.getTournament(tournamentId),
  });
  const category = tournament?.categories.find(v => v.id === categoryId);
  const { data: categoryMatches = [] } = useQuery({
    queryKey: matchKeys.byCategory(categoryId),
    queryFn: () => api.getMatchesByCategory(categoryId),
    enabled: !!category,
  });
  const groups = [...new Set(
    (category?.teams.map(t => t.group).filter(Boolean) as string[] | undefined) ?? []
  )].sort();
  const [activeGroup, setActiveGroup] = React.useState<string>(groups[0] ?? '');
  const [sheetTeam, setSheetTeam] = React.useState<Team | null>(null);

  // Filter matches by active group
  const filteredMatches = React.useMemo<ResolvedMatch[]>(
    () => categoryMatches.filter(g => g.team1.group === activeGroup || g.team2.group === activeGroup),
    [activeGroup, categoryMatches],
  );

  if (!tournament || !category) return null;

  return (
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${CATEGORY_CONFIG[category.type].labelShort} ${category.level}`}
            onBack={() => navigation.navigate('CategoryHub', { tournamentId: tournament.id, categoryId: category.id })}
          />
          <SubBadge type={category.type} level={category.level} />
          <Text className="text-white text-[26px] md:text-[32px] font-nunito-black mt-sm">Grupos – Jogos 🎾</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* Group selector tabs */}
      {groups.length > 0 && (
        <View className="flex-row gap-xs px-md py-sm bg-white border-b-[1.5px] border-gl">
          {groups.map(g => (
            <TouchableOpacity
              key={g}
              className={clsx(
                'flex-1 py-[7px] px-[3px] rounded-[9px] items-center bg-gbg border-2 border-transparent',
                activeGroup === g && 'bg-navy',
              )}
              onPress={() => setActiveGroup(g)}
            >
              <Text className={clsx(
                'text-xs font-nunito text-muted',
                activeGroup === g && 'text-white',
              )}>Grupo {g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView className="flex-1" contentContainerClassName="p-md">
        <Container>
          {filteredMatches.length === 0 ? (
            <View className="items-center mt-[40px]">
              <Text className="text-base font-nunito-bold text-muted">Sem jogos para o Grupo {activeGroup}</Text>
            </View>
          ) : (
            filteredMatches.map((g) => (
              <MatchCard
                key={g.id}
                match={g}
                onTeamPress={setSheetTeam}
                onEdit={() => navigation.navigate('EditMatch', { tournamentId: tournament.id, categoryId: category.id, matchId: g.id })}
                onEnterResult={() => g.status === MATCH_STATUS.PAUSED
                  ? navigation.navigate('MatchPaused', { tournamentId: tournament.id, categoryId: category.id, matchId: g.id })
                  : navigation.navigate('EnterResult', { tournamentId: tournament.id, categoryId: category.id, matchId: g.id })
                }
              />
            ))
          )}
          <View className="h-2xl" />
        </Container>
      </ScrollView>

      <TeamMatchesSheet
        visible={sheetTeam !== null}
        team={sheetTeam}
        category={category}
        matches={categoryMatches}
        onClose={() => setSheetTeam(null)}
      />
      <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
    </View>
  );
};
