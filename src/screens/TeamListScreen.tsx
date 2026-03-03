import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Team } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { TeamGamesSheet } from '../components/TeamGamesSheet';
import { Colors, Gradients, Typography, TextStyles, Spacing, Radii, Shadows } from '../theme';
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
  if (!tournament || !vertente) return null;

  const { label: typeLabel } = VERTENTE_CONFIG[vertente.type];
  const isConfig = vertente.status === 'config';
  const statusLabel = STATUS_LABEL[vertente.status] ?? 'Em preparação';

  const [sheetTeam, setSheetTeam] = React.useState<Team | null>(null);

  // Build group rank map: teamId → position within its group (1-based)
  const { sortedGroups, groupRankMap } = useMemo(() => {
    const sg = [...new Set(vertente.teams.map(t => t.group).filter(Boolean) as string[])].sort();
    const map: Record<string, number> = {};
    sg.forEach(g => {
      const members = vertente.teams
        .filter(t => t.group === g)
        .sort((a, b) => calcStats(b.id, mockGames).pts - calcStats(a.id, mockGames).pts);
      members.forEach((t, i) => { map[t.id] = i + 1; });
    });
    return { sortedGroups: sg, groupRankMap: map };
  }, [vertente.teams, mockGames]);

  const getChipStyle = (group: string) =>
    GROUP_CHIP_POOL[sortedGroups.indexOf(group) % GROUP_CHIP_POOL.length];

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${typeLabel} ${vertente.level}`}
            onBack={() => navigation.navigate('VertenteHub', { tournamentId: tournament.id, vertenteId: vertente.id })}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Duplas Inscritas 👥</Text>
          <View style={s.chipsRow}>
            <View style={s.chip}><Text style={s.chipTxt}>{vertente.teams.length}/{vertente.maxTeams}</Text></View>
            <View style={s.chip}><Text style={s.chipTxt}>{statusLabel}</Text></View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}>

        {/* ── Section title ── */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Duplas — {vertente.level}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}>
            <Text style={s.sectionAction}>+ Nova dupla</Text>
          </TouchableOpacity>
        </View>

        {/* ── Legend ── */}
        <View style={s.legend}>
          <Text style={s.legendTxt}>✏️ editar</Text>
          <Text style={s.legendSep}>|</Text>
          <Text style={s.legendTxt}>{isConfig ? '🗑️ remover' : '🚫 desistência'}</Text>
        </View>

        {/* ── Teams ── */}
        {vertente.teams.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>👥</Text>
            <Text style={s.emptyTitle}>Sem duplas inscritas</Text>
            <Text style={s.emptySub}>Adiciona a primeira equipa</Text>
            <TouchableOpacity
              style={s.addFirstBtn}
              onPress={() => navigation.navigate('AddTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}
            >
              <Text style={s.addFirstTxt}>+ Adicionar dupla</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.teamsCard}>
            {vertente.teams.map((team, idx) => {
              const avatarColors = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
              const isWithdrawn = !!team.withdrawn;
              return (
                <TouchableOpacity
                  key={team.id}
                  style={[
                    s.teamRow,
                    isWithdrawn && s.teamRowWithdrawn,
                    idx < vertente.teams.length - 1 && s.teamRowBorder,
                  ]}
                  onPress={() => setSheetTeam(team)}
                  activeOpacity={0.75}
                >
                  {/* Number */}
                  <Text style={s.teamNum}>{idx + 1}</Text>

                  {/* Avatar */}
                  {team.photo ? (
                    <Image source={{ uri: team.photo }} style={s.avatar} />
                  ) : (
                    <LinearGradient colors={avatarColors} style={s.avatar}>
                      <Text style={s.avatarTxt}>{getInitials(team.name)}</Text>
                    </LinearGradient>
                  )}

                  {/* Info */}
                  <View style={s.teamInfo}>
                    <View style={s.teamNameRow}>
                      <Text style={[s.teamName, isWithdrawn && s.teamNameMuted]} numberOfLines={1}>
                        {team.name}
                      </Text>
                      {isWithdrawn && <Text style={s.withdrawnLabel}> 🚫 Desistência</Text>}
                    </View>
                    <Text style={s.teamPlayers} numberOfLines={1}>
                      {team.players.map((p: any) => p.name).join(' · ')}
                    </Text>
                  </View>

                  {/* Group chip */}
                  {team.group && (() => {
                    const chip = getChipStyle(team.group);
                    return (
                      <View style={[s.groupChip, { backgroundColor: chip.bg }]}>
                        <Text style={[s.groupChipTxt, { color: chip.text }]}>
                          {team.group}{groupRankMap[team.id] ?? ''}
                        </Text>
                      </View>
                    );
                  })()}

                  {/* Actions */}
                  {isWithdrawn ? (
                    <Text style={s.woTxt}>W.O.</Text>
                  ) : (
                    <View style={s.actions}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('AddTeam', { tournamentId: tournament.id, vertenteId: vertente.id, teamId: team.id })}
                      >
                        <Text style={s.actionIcon}>✏️</Text>
                      </TouchableOpacity>
                      {isConfig ? (
                        <TouchableOpacity
                          onPress={() => Alert.alert(
                            'Remover dupla',
                            `Remover "${team.name}" da lista?`,
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { text: 'Remover', style: 'destructive', onPress: () => {
                                const i = vertente.teams.findIndex(t => t.id === team.id);
                                if (i !== -1) vertente.teams.splice(i, 1);
                                navigation.replace('TeamList', { tournamentId: tournament.id, vertenteId: vertente.id });
                              }},
                            ],
                          )}
                        >
                          <Text style={[s.actionIcon, s.actionIconMuted]}>🗑️</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => navigation.navigate('WithdrawConfirm', { tournamentId: tournament.id, vertenteId: vertente.id, teamId: team.id })}
                        >
                          <Text style={[s.actionIcon, s.actionIconMuted]}>🚫</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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

  // Header
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 6 },
  chipsRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  chip: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 3 },
  chipTxt: { color: Colors.white, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily },

  // Scroll
  scroll: { flex: 1 },

  // Section
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginTop: 4 },
  sectionTitle: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
  sectionAction: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBold, color: Colors.blue },

  // Legend
  legend: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  legendTxt: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilyBold, color: Colors.muted },
  legendSep: { fontSize: Typography.fontSize.xs, color: Colors.gl, fontFamily: Typography.fontFamilyBold },

  // Teams card — single white card holds all rows
  teamsCard: {
    backgroundColor: Colors.white,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    ...Shadows.card,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
  },
  teamRowBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.gl,
  },
  teamRowWithdrawn: {
    opacity: 0.6,
    backgroundColor: Colors.redBgLight,
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 0,
  },

  // Number
  teamNum: { width: 16, textAlign: 'center', fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBlack, color: Colors.muted },

  // Avatar
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { color: Colors.white, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilyBlack },

  // Info
  teamInfo: { flex: 1, minWidth: 0 },
  teamNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  teamName: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.navy },
  teamNameMuted: { color: Colors.muted },
  withdrawnLabel: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilyBold, color: Colors.red },
  teamPlayers: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 1 },

  // Group chip
  groupChip: {
    backgroundColor: Colors.blueBg,
    borderRadius: Radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
  },
  groupChipTxt: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily },

  // Actions
  woTxt: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily, color: Colors.red },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionIcon: { fontSize: 15, padding: Spacing.xs, minWidth: 30, minHeight: 30, textAlign: 'center' },
  actionIconMuted: { opacity: 0.55 },

  // Empty
  emptyCard: {
    backgroundColor: Colors.white, borderRadius: Radii.lg, padding: 32, alignItems: 'center',
    ...Shadows.card, marginTop: 20,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamilyBlack, color: Colors.navy, marginBottom: 6 },
  emptySub: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginBottom: 20 },
  addFirstBtn: { backgroundColor: Colors.blue, borderRadius: Radii.md, paddingHorizontal: 24, paddingVertical: 12 },
  addFirstTxt: { color: Colors.white, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily },

});
