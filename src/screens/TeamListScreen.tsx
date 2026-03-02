import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Team } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { TeamGamesSheet } from '../components/TeamGamesSheet';
import { Colors, Gradients, Spacing, Radii } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'TeamList'>;

const AVATAR_GRADIENTS = [
  ['#1A5AC8', '#00A5C8'],
  ['#8B00CC', '#BB44FF'],
  ['#22C97A', '#00AA66'],
  ['#FF7A1A', '#FFD600'],
  ['#FF3B5C', '#FF9A8B'],
  ['#9B30FF', '#FF44AA'],
];

const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const TeamListScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];

  const typeLabel = vertente.type === 'M' ? 'Masculino' : vertente.type === 'F' ? 'Feminino' : 'Misto';
  const statusLabel =
    vertente.status === 'groups' ? 'Grupos gerados' :
      vertente.status === 'bracket' ? 'Bracket ativo' :
        vertente.status === 'finished' ? 'Concluído' :
          'Em preparação';

  const [sheetTeam, setSheetTeam] = React.useState<Team | null>(null);

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
          <Text style={s.legendTxt}>🚫 desistência</Text>
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
                    <LinearGradient colors={avatarColors as any} style={s.avatar}>
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
                  {team.group && (
                    <View style={s.groupChip}>
                      <Text style={s.groupChipTxt}>{team.group}</Text>
                    </View>
                  )}

                  {/* Actions */}
                  {isWithdrawn ? (
                    <Text style={s.woTxt}>W.O.</Text>
                  ) : (
                    <View style={s.actions}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('EditTeam', { tournamentId: tournament.id, vertenteId: vertente.id, teamId: team.id })}
                      >
                        <Text style={s.actionIcon}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('WithdrawConfirm', { tournamentId: tournament.id, vertenteId: vertente.id, teamId: team.id })}
                      >
                        <Text style={[s.actionIcon, s.actionIconMuted]}>🚫</Text>
                      </TouchableOpacity>
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
  title: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black', marginTop: 6 },
  chipsRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  chip: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 3 },
  chipTxt: { color: '#fff', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },

  // Scroll
  scroll: { flex: 1 },

  // Section
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginTop: 4 },
  sectionTitle: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  sectionAction: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.blue },

  // Legend
  legend: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  legendTxt: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  legendSep: { fontSize: 10, color: Colors.gl, fontFamily: 'Nunito_700Bold' },

  // Teams card — single white card holds all rows
  teamsCard: {
    backgroundColor: '#fff',
    borderRadius: Radii.md,
    paddingHorizontal: 13,
    shadowColor: '#0D2C6B',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 8,
  },
  teamRowBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.gl,
  },
  teamRowWithdrawn: {
    opacity: 0.5,
    backgroundColor: '#FFF5F5',
    marginHorizontal: -13,
    paddingHorizontal: 13,
    borderRadius: 0,
  },

  // Number
  teamNum: { width: 16, textAlign: 'center', fontSize: 11, fontFamily: 'Nunito_900Black', color: Colors.muted },

  // Avatar
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { color: '#fff', fontSize: 12, fontFamily: 'Nunito_900Black' },

  // Info
  teamInfo: { flex: 1, minWidth: 0 },
  teamNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  teamName: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  teamNameMuted: { color: Colors.muted },
  withdrawnLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: '#FF3B5C' },
  teamPlayers: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginTop: 1 },

  // Group chip
  groupChip: {
    backgroundColor: '#E3ECFF',
    borderRadius: Radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
  },
  groupChipTxt: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.blue },

  // Actions
  woTxt: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: '#FF3B5C' },
  actions: { flexDirection: 'row', gap: 6 },
  actionIcon: { fontSize: 15 },
  actionIconMuted: { opacity: 0.55 },

  // Empty
  emptyCard: {
    backgroundColor: '#fff', borderRadius: Radii.lg, padding: 32, alignItems: 'center',
    shadowColor: '#0D2C6B', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 3, marginTop: 20,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontFamily: 'Nunito_900Black', color: Colors.navy, marginBottom: 6 },
  emptySub: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginBottom: 20 },
  addFirstBtn: { backgroundColor: Colors.blue, borderRadius: Radii.md, paddingHorizontal: 24, paddingVertical: 12 },
  addFirstTxt: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },

});
