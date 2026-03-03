import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Team } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { GameCard } from '../components/GameCard';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { TeamGamesSheet } from '../components/TeamGamesSheet';
import { Colors, Gradients, Typography, Spacing, Radii } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupsGames'>;

export const GroupsGamesScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];

  // Extract groups from this vertente's teams
  const groups = [...new Set(
    vertente.teams.map(t => t.group).filter(Boolean) as string[]
  )].sort();
  const [activeGroup, setActiveGroup] = React.useState<string>(groups[0] ?? 'A');
  const [sheetTeam, setSheetTeam] = React.useState<Team | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(t);
  }, [activeGroup]);

  // Filter games: show games where either team belongs to the active group
  const filteredGames = mockGames.filter(g =>
    g.team1.group === activeGroup || g.team2.group === activeGroup
  );

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${VERTENTE_CONFIG[vertente.type].labelShort} ${vertente.level}`}
            onBack={() => navigation.navigate('VertenteHub', { tournamentId: tournament.id, vertenteId: vertente.id })}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Grupos – Jogos 🎾</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* Group selector tabs */}
      {groups.length > 0 && (
        <View style={s.tabs}>
          {groups.map(g => (
            <TouchableOpacity
              key={g}
              style={[s.tab, activeGroup === g && s.tabActive]}
              onPress={() => setActiveGroup(g)}
            >
              <Text style={[s.tabTxt, activeGroup === g && s.tabTxtActive]}>Grupo {g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.md }}>
        {isLoading ? (
          [0, 1, 2].map(i => (
            <View key={i} style={s.skeletonCard}>
              <View style={s.skeletonHeader} />
              <View style={s.skeletonRow}>
                <View style={[s.skeletonLine, { flex: 1, height: Typography.fontSize.lg }]} />
                <View style={s.skeletonScore} />
                <View style={[s.skeletonLine, { flex: 1, height: Typography.fontSize.lg }]} />
              </View>
              <View style={[s.skeletonLine, { width: 80, height: Typography.fontSize.xs, marginTop: 8 }]} />
            </View>
          ))
        ) : filteredGames.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTxt}>Sem jogos para o Grupo {activeGroup}</Text>
          </View>
        ) : (
          filteredGames.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              onTeamPress={setSheetTeam}
              onEdit={() => navigation.navigate('EditGame', { tournamentId: tournament.id, vertenteId: vertente.id, gameId: g.id })}
              onEnterResult={() => g.status === 'paused'
                ? navigation.navigate('GamePaused', { tournamentId: tournament.id, vertenteId: vertente.id, gameId: g.id })
                : navigation.navigate('EnterResult', { tournamentId: tournament.id, vertenteId: vertente.id, gameId: g.id })
              }
            />
          ))
        )}
        <View style={{ height: 32 }} />
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 8 },

  /* Group tabs */
  tabs: {
    flexDirection: 'row', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.white, borderBottomWidth: 1.5, borderBottomColor: Colors.gl,
  },
  tab: {
    flex: 1, paddingVertical: 7, paddingHorizontal: 3,
    borderRadius: 9, alignItems: 'center',
    backgroundColor: Colors.gbg, borderWidth: 2, borderColor: 'transparent',
  },
  tabActive: { backgroundColor: Colors.navy },
  tabTxt: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily, color: Colors.muted },
  tabTxtActive: { color: Colors.white },

  scroll: { flex: 1 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyTxt: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBold, color: Colors.muted },

  /* Skeleton */
  skeletonCard: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm },
  skeletonHeader: { height: 10, width: 120, backgroundColor: Colors.gl, borderRadius: 5, marginBottom: Spacing.md },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  skeletonLine: { backgroundColor: Colors.gl, borderRadius: 5 },
  skeletonScore: { width: 60, height: 28, backgroundColor: Colors.gl, borderRadius: 8 },

});
