import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList, Team } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { GameCard } from '../components/GameCard';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { TeamGamesSheet } from '../components/TeamGamesSheet';
import { Gradients } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { GAME_STATUS } from '../utils/constants';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupsGames'>;

export const GroupsGamesScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  if (!tournament) return null;
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId);
  if (!vertente) return null;

  // Extract groups from this vertente's teams
  const vertenteTeamIds = React.useMemo(() => new Set(vertente.teams.map(t => t.id)), [vertente.teams]);
  const groups = [...new Set(
    vertente.teams.map(t => t.group).filter(Boolean) as string[]
  )].sort();
  const [activeGroup, setActiveGroup] = React.useState<string>(groups[0] ?? '');
  const [sheetTeam, setSheetTeam] = React.useState<Team | null>(null);

  // Filter games: scope to this vertente AND active group
  const filteredGames = React.useMemo(
    () => mockGames.filter(g =>
      vertenteTeamIds.has(g.team1.id) &&
      vertenteTeamIds.has(g.team2.id) &&
      (g.team1.group === activeGroup || g.team2.group === activeGroup),
    ),
    [activeGroup, vertenteTeamIds],
  );

  return (
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${VERTENTE_CONFIG[vertente.type].labelShort} ${vertente.level}`}
            onBack={() => navigation.navigate('VertenteHub', { tournamentId: tournament.id, vertenteId: vertente.id })}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
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
          {filteredGames.length === 0 ? (
            <View className="items-center mt-[40px]">
              <Text className="text-base font-nunito-bold text-muted">Sem jogos para o Grupo {activeGroup}</Text>
            </View>
          ) : (
            filteredGames.map((g) => (
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
          )}
          <View className="h-2xl" />
        </Container>
      </ScrollView>

      <TeamGamesSheet
        visible={sheetTeam !== null}
        team={sheetTeam}
        vertente={vertente}
        games={mockGames}
        onClose={() => setSheetTeam(null)}
      />
      <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
    </View>
  );
};
