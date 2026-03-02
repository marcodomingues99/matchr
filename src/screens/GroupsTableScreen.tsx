import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupsTable'>;

export const GroupsTableScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];

  const [activeTab, setActiveTab] = useState<'table' | 'games'>('table');

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

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <Text style={s.back} onPress={() => navigation.goBack()}>← {tournament.name}</Text>
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Classificação de Grupos</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* Tab bar */}
      <View style={s.tabBar}>
        <TouchableOpacity style={[s.tab, activeTab === 'table' && s.tabActive]} onPress={() => setActiveTab('table')}>
          <Text style={[s.tabTxt, activeTab === 'table' && s.tabTxtActive]}>📊 Tabela</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, activeTab === 'games' && s.tabActive]} onPress={() => setActiveTab('games')}>
          <Text style={[s.tabTxt, activeTab === 'games' && s.tabTxtActive]}>🎾 Resultados</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.md }}>
        {activeTab === 'table' ? (
          Object.keys(grouped).sort().map(group => {
            const teams = [...grouped[group]].sort((a, b) => mockStats(b.id).pts - mockStats(a.id).pts);
            return (
              <View key={group} style={s.groupSection}>
                <Text style={s.groupLabel}>Grupo {group}</Text>
                {/* Header */}
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
        ) : (
          mockGames.map(g => (
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
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.nav}>
        {[['👥','Duplas'], ['📊','Grupos'], ['🎾','Jogos'], ['🏆','Bracket']].map(([icon, label], i) => (
          <TouchableOpacity key={label} style={[s.navItem, i === 1 && s.navItemActive]}
            onPress={() => {
              if (i === 0) navigation.navigate('TeamList', { tournamentId: tournament.id, vertenteId: vertente.id });
              if (i === 2) navigation.navigate('GroupsGames', { tournamentId: tournament.id, vertenteId: vertente.id });
              if (i === 3) navigation.navigate('Bracket', { tournamentId: tournament.id, vertenteId: vertente.id });
            }}
          >
            <Text style={s.navIcon}>{icon}</Text>
            <Text style={[s.navLabel, i === 1 && s.navLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  back: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8, marginBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 8 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.gl },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.blue },
  tabTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  tabTxtActive: { color: Colors.blue },
  scroll: { flex: 1 },
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
  nav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Colors.gl, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: 'center', paddingTop: 10 },
  navItemActive: {},
  navIcon: { fontSize: 18, marginBottom: 2 },
  navLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  navLabelActive: { color: Colors.blue },
});
