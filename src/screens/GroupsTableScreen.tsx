import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Team } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { GameCard } from '../components/GameCard';
import { TeamGamesSheet } from '../components/TeamGamesSheet';
import { Colors, Gradients, Typography, Spacing, Radii, Shadows } from '../theme';
import { calcStats } from '../utils/scoring';
import { GROUP_GRADIENT_POOL } from '../utils/groupColors';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { GAME_STATUS } from '../utils/constants';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupsTable'>;

type TabKey = 'table' | 'results' | 'games';

export const GroupsTableScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];

  const [activeTab, setActiveTab] = useState<TabKey>('table');
  const [sheetTeam, setSheetTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Extract sorted group names
  const groups = useMemo(
    () => [...new Set(vertente.teams.map(t => t.group).filter(Boolean) as string[])].sort(),
    [vertente.teams],
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
    const result: Record<string, typeof vertente.teams> = {};
    vertente.teams.forEach(t => {
      const g = t.group ?? '';
      if (!result[g]) result[g] = [];
      result[g].push(t);
    });
    return result;
  }, [vertente.teams]);

  const qualifiers = vertente.qualifiersPerGroup ?? 2;
  const mockStats = (teamId: string) => calcStats(teamId, mockGames);

  // Set of team IDs that belong to this vertente (used to scope game filtering)
  const vertenteTeamIds = useMemo(
    () => new Set(vertente.teams.map(t => t.id)),
    [vertente.teams],
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

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${VERTENTE_CONFIG[vertente.type].labelShort} ${vertente.level}`}
            onBack={() => navigation.navigate('VertenteHub', { tournamentId: tournament.id, vertenteId: vertente.id })}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Fase de Grupos</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* ═══ Main tab bar ═══ */}
      <View style={s.tabBar}>
        {([
          { key: 'table' as TabKey, label: '📊 Tabela' },
          { key: 'games' as TabKey, label: '🎾 Jogos' },
          { key: 'results' as TabKey, label: '🏅 Resultados' },
        ]).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[s.tab, activeTab === t.key && s.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[s.tabTxt, activeTab === t.key && s.tabTxtActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ═══ Group sub-tabs (Resultados & Jogos only) ═══ */}
      {showGroupSelector && (
        <View style={s.groupTabs}>
          {groups.map(g => (
            <TouchableOpacity
              key={g}
              style={[s.groupTab, activeGroup === g && s.groupTabActive]}
              onPress={() => setActiveGroup(g)}
            >
              <Text style={[s.groupTabTxt, activeGroup === g && s.groupTabTxtActive]}>Grupo {g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ═══ Content ═══ */}
      {isLoading ? (
        <View style={{ padding: Spacing.md }}>
          {[0, 1, 2].map(i => (
            <View key={i} style={s.skeletonCard}>
              <View style={s.skeletonHeader} />
              <View style={s.skeletonRow}>
                <View style={[s.skeletonLine, { flex: 1, height: Typography.fontSize.lg }]} />
                <View style={s.skeletonScore} />
                <View style={[s.skeletonLine, { flex: 1, height: Typography.fontSize.lg }]} />
              </View>
              <View style={[s.skeletonLine, { width: 80, height: Typography.fontSize.xs, marginTop: Spacing.sm }]} />
            </View>
          ))}
        </View>
      ) : (
      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.md }}>

        {/* ── TAB: Tabela ── */}
        {activeTab === 'table' && (
          Object.keys(grouped).length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📊</Text>
              <Text style={s.emptyTitle}>Grupos ainda não atribuídos</Text>
              <Text style={s.emptyTxt}>Importa a grelha para ver a tabela de grupos</Text>
            </View>
          ) : (
            Object.keys(grouped).sort().map((group, groupIdx) => {
              const gradient = GROUP_GRADIENT_POOL[groupIdx % GROUP_GRADIENT_POOL.length];
              const teams = [...grouped[group]].sort((a, b) => mockStats(b.id).pts - mockStats(a.id).pts);
              return (
                <View key={group} style={s.groupCard}>
                  {/* Coloured group header */}
                  <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.groupCardHdr}>
                    <Text style={s.groupCardName}>Grupo {group}</Text>
                    <Text style={s.groupCardSub}>Passam {qualifiers}</Text>
                  </LinearGradient>

                  {/* Table column headers */}
                  <View style={s.tableHdrRow}>
                    <Text style={[s.th, { width: 20 }]}>#</Text>
                    <Text style={[s.th, { flex: 3, textAlign: 'left' }]}>Dupla</Text>
                    <Text style={[s.th, { flex: 1 }]}>J</Text>
                    <Text style={[s.th, { flex: 1 }]}>V</Text>
                    <Text style={[s.th, { flex: 1 }]}>D</Text>
                    <Text style={[s.th, { flex: 1.4 }]}>Sets</Text>
                    <Text style={[s.th, { flex: 1 }]}>Pts</Text>
                  </View>

                  {/* Team rows */}
                  {teams.map((team, idx) => {
                    const stats = mockStats(team.id);
                    const isQ = idx < qualifiers;
                    const isLast = idx === teams.length - 1;
                    return (
                      <TouchableOpacity
                        key={team.id}
                        style={[s.tr, isQ && s.trQ, !isLast && s.trBorder]}
                        onPress={() => setSheetTeam(team)}
                        activeOpacity={0.7}
                      >
                        <Text style={[s.tdPos, isQ && s.tdPosQ]}>{idx + 1}</Text>
                        <Text style={[s.td, { flex: 3, textAlign: 'left' }]} numberOfLines={1}>{team.name}</Text>
                        <Text style={[s.td, { flex: 1 }]}>{stats.played}</Text>
                        <Text style={[s.td, s.tdGreen, { flex: 1 }]}>{stats.wins}</Text>
                        <Text style={[s.td, s.tdRed, { flex: 1 }]}>{stats.losses}</Text>
                        <Text style={[s.td, { flex: 1.4 }]}>{stats.gamesWon}-{stats.gamesLost}</Text>
                        <Text style={[s.td, s.tdPts, { flex: 1 }]}>{stats.pts}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })
          )
        )}

        {/* ── TAB: Resultados (filtered by group) ── */}
        {activeTab === 'results' && (
          filteredGames.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyTxt}>Sem resultados para o Grupo {activeGroup}</Text>
            </View>
          ) : (
            filteredGames.map(g => (
              <View key={g.id} style={s.resultCard}>
                <View style={s.resultHeader}>
                  <Text style={s.resultTime}>{g.time} · {g.court}</Text>
                  <View style={[s.resultStatus,
                  g.status === GAME_STATUS.FINISHED ? s.statusDone :
                    g.status === GAME_STATUS.LIVE ? s.statusLive : s.statusSched
                  ]}>
                    <Text style={s.resultStatusTxt}>
                      {g.status === GAME_STATUS.FINISHED ? '✓ Concluído' : g.status === GAME_STATUS.LIVE ? '● Ao vivo' : '⏰ Agendado'}
                    </Text>
                  </View>
                </View>
                <View style={s.resultRow}>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => setSheetTeam(g.team1)} activeOpacity={0.7}>
                    <Text style={s.resultTeam} numberOfLines={1}>{g.team1.name}</Text>
                  </TouchableOpacity>
                  {g.sets && g.sets.length > 0 ? (
                    <View style={s.resultSets}>
                      {g.sets.map((set, i) => (
                        <View key={i} style={s.setScore}>
                          <Text style={[s.setNum, set.team1 > set.team2 && s.setNumWin]}>{set.team1}</Text>
                          <Text style={s.setDash}>–</Text>
                          <Text style={[s.setNum, set.team2 > set.team1 && s.setNumWin]}>{set.team2}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={s.resultVs}>vs</Text>
                  )}
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => setSheetTeam(g.team2)} activeOpacity={0.7}>
                    <Text style={[s.resultTeam, { textAlign: 'right' }]} numberOfLines={1}>{g.team2.name}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        )}

        {/* ── TAB: Jogos (GameCards filtered by group) ── */}
        {activeTab === 'games' && (
          filteredGames.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyTxt}>Sem jogos para o Grupo {activeGroup}</Text>
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

        <View style={{ height: 32 }} />
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
      <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },

  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 8 },

  /* Main tab bar */
  tabBar: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gl },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.blue },
  tabTxt: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBold, color: Colors.muted },
  tabTxtActive: { color: Colors.blue },

  /* Group sub-tabs */
  groupTabs: {
    flexDirection: 'row', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.white, borderBottomWidth: 1.5, borderBottomColor: Colors.gl,
  },
  groupTab: {
    flex: 1, paddingVertical: 7, paddingHorizontal: 3,
    borderRadius: 9, alignItems: 'center',
    backgroundColor: Colors.gbg, borderWidth: 2, borderColor: 'transparent',
  },
  groupTabActive: { backgroundColor: Colors.navy },
  groupTabTxt: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily, color: Colors.muted },
  groupTabTxtActive: { color: Colors.white },

  scroll: { flex: 1 },

  /* Skeleton */
  skeletonCard: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm },
  skeletonHeader: { height: 10, width: 120, backgroundColor: Colors.gl, borderRadius: 5, marginBottom: Spacing.md },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  skeletonLine: { backgroundColor: Colors.gl, borderRadius: 5 },
  skeletonScore: { width: 60, height: 28, backgroundColor: Colors.gl, borderRadius: Spacing.sm },

  /* Empty state */
  empty: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontFamily: Typography.fontFamily, color: Colors.navy, marginBottom: 6 },
  emptyTxt: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, textAlign: 'center', lineHeight: 18 },

  /* Table tab — group cards */
  groupCard: {
    backgroundColor: Colors.white, borderRadius: Radii.md, overflow: 'hidden',
    marginBottom: Spacing.md, ...Shadows.card,
  },
  groupCardHdr: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  groupCardName: { color: Colors.white, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBlack },
  groupCardSub: { color: 'rgba(255,255,255,0.65)', fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilyBold },

  tableHdrRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 9, paddingVertical: 6,
    borderBottomWidth: 1.5, borderBottomColor: Colors.gl,
  },
  th: {
    fontSize: Typography.fontSize.xxs, fontFamily: Typography.fontFamilyBlack, color: Colors.muted,
    textAlign: 'center', textTransform: 'uppercase',
  },
  tr: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, paddingVertical: 7 },
  trQ: { backgroundColor: Colors.greenBg, borderLeftWidth: 3, borderLeftColor: Colors.green },
  trBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gl },
  tdPos: { width: 20, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilyBlack, color: Colors.muted, textAlign: 'center' },
  tdPosQ: { color: Colors.green },
  td: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBold, color: Colors.navy, textAlign: 'center' },
  tdGreen: { color: Colors.green },
  tdRed: { color: Colors.red },
  tdPts: { color: Colors.blue, fontFamily: Typography.fontFamilyBlack },
  teamName: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },

  /* Results tab */
  resultCard: { backgroundColor: Colors.white, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.card },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  resultTime: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBold, color: Colors.muted },
  resultStatus: { borderRadius: Radii.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusDone: { backgroundColor: Colors.greenBgLight },
  statusLive: { backgroundColor: Colors.redBg },
  statusSched: { backgroundColor: Colors.gbg },
  resultStatusTxt: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily, color: Colors.navy },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultTeam: { flex: 1, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
  resultVs: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBold, color: Colors.muted },
  resultSets: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  setScore: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.gbg, borderRadius: Radii.sm, paddingHorizontal: 6, paddingVertical: 3 },
  setNum: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBlack, color: Colors.muted },
  setNumWin: { color: Colors.navy },
  setDash: { fontSize: Typography.fontSize.sm, color: Colors.gray },
});
