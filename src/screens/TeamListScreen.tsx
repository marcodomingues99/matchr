import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp, StackActions } from '@react-navigation/native';
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
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // Build group rank map: teamId → position within its group (1-based)
  const { sortedGroups, groupRankMap } = useMemo(() => {
    const sg = [...new Set(vertente.teams.map(t => t.group).filter(Boolean) as string[])].sort();
    const map: Record<string, number> = {};
    sg.forEach(g => {
      const members = vertente.teams
        .filter(t => t.group === g)
        .sort((a, b) => calcStats(b.id, mockGames, vertente.pointsPerWin).pts - calcStats(a.id, mockGames, vertente.pointsPerWin).pts);
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
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Duplas Inscritas 👥</Text>
          <View style={s.chipsRow}>
            <View style={s.chip}><Text style={s.chipTxt}>{vertente.teams.length}/{vertente.maxTeams}</Text></View>
            <View style={s.chip}><Text style={s.chipTxt}>{statusLabel}</Text></View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        data={vertente.teams}
        keyExtractor={t => t.id}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} colors={[Colors.blue]} />
        }
        ListHeaderComponent={
          <>
            <View style={s.sectionRow} accessibilityRole="header">
              <Text style={s.sectionTitle}>Duplas — {vertente.level}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ManageTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}
                accessibilityRole="button"
                accessibilityLabel="Adicionar nova dupla"
              >
                <Text style={s.sectionAction}>+ Nova dupla</Text>
              </TouchableOpacity>
            </View>
            <View style={s.legend}>
              <Text style={s.legendTxt}>✏️ editar</Text>
              <Text style={s.legendSep}>|</Text>
              <Text style={s.legendTxt}>{isConfig ? '🗑️ remover' : '🚫 desistência'}</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={s.emptyCard} accessibilityLabel="Sem duplas inscritas">
            <Text style={s.emptyIcon}>👥</Text>
            <Text style={s.emptyTitle}>Sem duplas inscritas</Text>
            <Text style={s.emptySub}>Adiciona a primeira equipa</Text>
            <TouchableOpacity
              style={s.addFirstBtn}
              onPress={() => navigation.navigate('ManageTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}
              accessibilityRole="button"
              accessibilityLabel="Adicionar primeira dupla"
            >
              <Text style={s.addFirstTxt}>+ Adicionar dupla</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: team, index: idx }) => {
              const avatarColors = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
              const isWithdrawn = !!team.withdrawn;
              return (
                <TouchableOpacity
                  style={[
                    s.teamRow,
                    isWithdrawn && s.teamRowWithdrawn,
                    idx < vertente.teams.length - 1 && s.teamRowBorder,
                  ]}
                  onPress={() => setSheetTeam(team)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`${team.name}, ${team.players.map(p => p.name).join(' e ')}${team.group ? `, grupo ${team.group}` : ''}${isWithdrawn ? ', desistência' : ''}`}
                  accessibilityHint="Toca para ver jogos da dupla"
                >
                  <Text style={s.teamNum}>{idx + 1}</Text>
                  {team.photo ? (
                    <Image source={{ uri: team.photo }} style={s.avatar} accessibilityIgnoresInvertColors />
                  ) : (
                    <LinearGradient colors={avatarColors} style={s.avatar}>
                      <Text style={s.avatarTxt}>{getInitials(team.name)}</Text>
                    </LinearGradient>
                  )}
                  <View style={s.teamInfo}>
                    <View style={s.teamNameRow}>
                      <Text style={[s.teamName, isWithdrawn && s.teamNameMuted]} numberOfLines={1}>{team.name}</Text>
                      {isWithdrawn && <Text style={s.withdrawnLabel}> 🚫 Desistência</Text>}
                    </View>
                    <Text style={s.teamPlayers} numberOfLines={1}>{team.players.map(p => p.name).join(' · ')}</Text>
                  </View>
                  {team.group && (() => {
                    const chip = getChipStyle(team.group);
                    return (
                      <View style={[s.groupChip, { backgroundColor: chip.bg }]}>
                        <Text style={[s.groupChipTxt, { color: chip.text }]}>{team.group}{groupRankMap[team.id] ?? ''}</Text>
                      </View>
                    );
                  })()}
                  {isWithdrawn ? (
                    <Text style={s.woTxt}>W.O.</Text>
                  ) : (
                    <View style={s.actions}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('ManageTeam', { tournamentId: tournament.id, vertenteId: vertente.id, teamId: team.id })}
                        accessibilityRole="button"
                        accessibilityLabel={`Editar ${team.name}`}
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
                              {
                                text: 'Remover', style: 'destructive', onPress: () => {
                                  vertente.teams = vertente.teams.filter(t => t.id !== team.id);
                                  navigation.replace('TeamList', { tournamentId: tournament.id, vertenteId: vertente.id });
                                }
                              },
                            ],
                          )}
                          accessibilityRole="button"
                          accessibilityLabel={`Remover ${team.name}`}
                        >
                          <Text style={[s.actionIcon, s.actionIconMuted]}>🗑️</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => navigation.navigate('WithdrawConfirm', { tournamentId: tournament.id, vertenteId: vertente.id, teamId: team.id })}
                          accessibilityRole="button"
                          accessibilityLabel={`Registar desistência de ${team.name}`}
                        >
                          <Text style={[s.actionIcon, s.actionIconMuted]}>🚫</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
      />

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
