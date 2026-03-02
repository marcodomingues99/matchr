import React, { useState } from 'react';
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
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

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

  // Extract sorted group names
  const groups = [...new Set(
    vertente.teams.map(t => t.group).filter(Boolean) as string[]
  )].sort();
  const [activeGroup, setActiveGroup] = useState<string>(groups[0] ?? 'A');

  // Group teams by group
  const grouped: Record<string, typeof vertente.teams> = {};
  vertente.teams.forEach(t => {
    const g = t.group ?? 'A';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(t);
  });

  const mockStats = (teamId: string) => {
    const wins = mockGames.filter(g => g.winnerId === teamId && g.status === 'finished').length;
    const losses = mockGames.filter(g => g.status === 'finished' && (g.team1.id === teamId || g.team2.id === teamId) && g.winnerId !== teamId).length;
    const pts = wins * 3;
    return { wins, losses, played: wins + losses, pts };
  };

  // Filter games by active group (for results & games tabs)
  const filteredGames = mockGames.filter(g =>
    g.team1.group === activeGroup || g.team2.group === activeGroup
  );

  const showGroupSelector = activeTab !== 'table' && groups.length > 0;

  /* ── Group selector pills (shared by "Resultados" and "Jogos" tabs) ── */
  const GroupSelector = () => (
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
  );

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${vertente.type === 'M' ? 'Masc' : vertente.type === 'F' ? 'Fem' : 'Misto'} ${vertente.level}`}
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
          { key: 'results' as TabKey, label: '🏅 Resultados' },
          { key: 'games' as TabKey, label: '🎾 Jogos' },
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
      {showGroupSelector && <GroupSelector />}

      {/* ═══ Content ═══ */}
      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.md }}>

        {/* ── TAB: Tabela ── */}
        {activeTab === 'table' && (
          Object.keys(grouped).sort().map(group => {
            const teams = [...grouped[group]].sort((a, b) => mockStats(b.id).pts - mockStats(a.id).pts);
            return (
              <View key={group} style={s.groupSection}>
                <Text style={s.groupLabel}>Grupo {group}</Text>
                <View style={[s.tableRow, s.tableHeader]}>
                  <Text style={[s.tableCell, { flex: 3 }]}></Text>
                  <Text style={[s.tableHead, { flex: 1, textAlign: 'center' }]}>J</Text>
                  <Text style={[s.tableHead, { flex: 1, textAlign: 'center' }]}>V</Text>
                  <Text style={[s.tableHead, { flex: 1, textAlign: 'center' }]}>D</Text>
                  <Text style={[s.tableHead, { flex: 1, textAlign: 'center' }]}>Pts</Text>
                </View>
                {teams.map((team, idx) => {
                  const stats = mockStats(team.id);
                  const isQualified = idx < 2;
                  return (
                    <View key={team.id} style={[s.tableRow, isQualified && s.tableRowQualified]}>
                      <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[s.rankBadge, isQualified && s.rankBadgeQ]}>
                          <Text style={[s.rankTxt, isQualified && s.rankTxtQ]}>{idx + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.teamName} numberOfLines={1}>{team.name}</Text>
                          {isQualified && <Text style={s.qualLabel}>↑ Apura</Text>}
                        </View>
                      </View>
                      <Text style={[s.tableCell, { flex: 1, textAlign: 'center' }]}>{stats.played}</Text>
                      <Text style={[s.tableCell, s.cellGreen, { flex: 1, textAlign: 'center' }]}>{stats.wins}</Text>
                      <Text style={[s.tableCell, s.cellRed, { flex: 1, textAlign: 'center' }]}>{stats.losses}</Text>
                      <Text style={[s.tableCell, s.cellPts, { flex: 1, textAlign: 'center' }]}>{stats.pts}</Text>
                    </View>
                  );
                })}
              </View>
            );
          })
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
                  g.status === 'finished' ? s.statusDone :
                    g.status === 'live' ? s.statusLive : s.statusSched
                  ]}>
                    <Text style={s.resultStatusTxt}>
                      {g.status === 'finished' ? '✓ Concluído' : g.status === 'live' ? '● Ao vivo' : '⏰ Agendado'}
                    </Text>
                  </View>
                </View>
                <View style={s.resultRow}>
                  <Text style={s.resultTeam} numberOfLines={1}>{g.team1.name}</Text>
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
                  <Text style={[s.resultTeam, { textAlign: 'right' }]} numberOfLines={1}>{g.team2.name}</Text>
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
                onPress={() => { }}
                onTeamPress={setSheetTeam}
                onEdit={() => navigation.navigate('EditGame', { tournamentId: tournament.id, vertenteId: vertente.id, gameId: g.id })}
                onEnterResult={() => g.status === 'paused'
                  ? navigation.navigate('GamePaused', { tournamentId: tournament.id, vertenteId: vertente.id, gameId: g.id })
                  : navigation.navigate('EnterResult', { tournamentId: tournament.id, vertenteId: vertente.id, gameId: g.id })
                }
              />
            ))
          )
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

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

  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 8 },

  /* Main tab bar */
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.gl },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.blue },
  tabTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  tabTxtActive: { color: Colors.blue },

  /* Group sub-tabs */
  groupTabs: {
    flexDirection: 'row', gap: 5, paddingHorizontal: 12, paddingVertical: 9,
    backgroundColor: '#fff', borderBottomWidth: 1.5, borderBottomColor: Colors.gl,
  },
  groupTab: {
    flex: 1, paddingVertical: 7, paddingHorizontal: 3,
    borderRadius: 9, alignItems: 'center',
    backgroundColor: Colors.gbg, borderWidth: 2, borderColor: 'transparent',
  },
  groupTabActive: { backgroundColor: Colors.navy },
  groupTabTxt: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  groupTabTxtActive: { color: '#fff' },

  scroll: { flex: 1 },

  /* Empty state */
  empty: { alignItems: 'center', marginTop: 40 },
  emptyTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.muted },

  /* Table tab */
  groupSection: { marginBottom: Spacing.lg },
  groupLabel: { fontSize: 12, fontFamily: 'Nunito_900Black', color: Colors.navy, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingHorizontal: 4 },
  tableHeader: { borderBottomWidth: 1, borderBottomColor: Colors.gl, backgroundColor: Colors.gbg, borderTopLeftRadius: Radii.md, borderTopRightRadius: Radii.md },
  tableRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.gl },
  tableRowQualified: { borderLeftWidth: 3, borderLeftColor: Colors.green },
  tableHead: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  tableCell: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.navy },
  cellGreen: { color: Colors.green },
  cellRed: { color: Colors.red },
  cellPts: { color: Colors.blue, fontFamily: 'Nunito_900Black' },
  rankBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.gbg, alignItems: 'center', justifyContent: 'center' },
  rankBadgeQ: { backgroundColor: Colors.blue },
  rankTxt: { fontSize: 12, fontFamily: 'Nunito_900Black', color: Colors.muted },
  rankTxtQ: { color: '#fff' },
  teamName: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  qualLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: Colors.green },

  /* Results tab */
  resultCard: { backgroundColor: '#fff', borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.card },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  resultTime: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  resultStatus: { borderRadius: Radii.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusDone: { backgroundColor: '#DFFAEE' },
  statusLive: { backgroundColor: '#FFE3E8' },
  statusSched: { backgroundColor: Colors.gbg },
  resultStatusTxt: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resultTeam: { flex: 1, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  resultVs: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  resultSets: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  setScore: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.gbg, borderRadius: Radii.sm, paddingHorizontal: 6, paddingVertical: 3 },
  setNum: { fontSize: 13, fontFamily: 'Nunito_900Black', color: Colors.muted },
  setNumWin: { color: Colors.navy },
  setDash: { fontSize: 11, color: Colors.gray },
});
