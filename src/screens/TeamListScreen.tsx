import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'TeamList'>;

export const TeamListScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];
  const [search, setSearch] = useState('');
  const [showGroups, setShowGroups] = useState(true);

  const teams = vertente.teams.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.players.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Group teams by group
  const grouped: Record<string, typeof teams> = {};
  teams.forEach(t => {
    const g = t.group ?? 'Sem grupo';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(t);
  });

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Voltar</Text>
          </TouchableOpacity>
          <SubBadge type={vertente.type} level={vertente.level} />
          <View style={s.titleRow}>
            <Text style={s.title}>Duplas</Text>
            <View style={s.countBadge}>
              <Text style={s.countTxt}>{vertente.teams.length}/{vertente.maxTeams}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Search */}
      <View style={s.searchBar}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Pesquisar equipa ou jogador..."
          placeholderTextColor={Colors.gray}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={s.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.md }}>
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
        ) : showGroups && Object.keys(grouped).length > 1 ? (
          Object.entries(grouped).sort().map(([group, gTeams]) => (
            <View key={group}>
              <Text style={s.groupLabel}>Grupo {group}</Text>
              {gTeams.map((team) => (
                <TeamRow key={team.id} team={team} onPress={() => navigation.navigate('EditTeam', { tournamentId: tournament.id, vertenteId: vertente.id, teamId: team.id })} />
              ))}
            </View>
          ))
        ) : (
          teams.map((team) => (
            <TeamRow key={team.id} team={team} onPress={() => navigation.navigate('EditTeam', { tournamentId: tournament.id, vertenteId: vertente.id, teamId: team.id })} />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('AddTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}
      >
        <LinearGradient colors={Gradients.primary} style={s.fabGrad}>
          <Text style={s.fabTxt}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const TeamRow = ({ team, onPress }: { team: any; onPress: () => void }) => (
  <TouchableOpacity style={s.teamCard} onPress={onPress} activeOpacity={0.8}>
    <View style={s.teamAvatar}>
      <Text style={s.teamAvatarTxt}>{team.name.charAt(0)}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.teamName}>{team.name}</Text>
      <Text style={s.teamPlayers}>{team.players.map((p: any) => p.name).join(' · ')}</Text>
    </View>
    {team.withdrawn && (
      <View style={s.withdrawnBadge}><Text style={s.withdrawnTxt}>Desistiu</Text></View>
    )}
    <Text style={s.teamArrow}>›</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  back: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8, marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black' },
  countBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 3 },
  countTxt: { color: '#fff', fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: Spacing.md, borderRadius: Radii.md, paddingHorizontal: Spacing.md, gap: 8, ...Shadows.card },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.navy },
  searchClear: { color: Colors.muted, fontSize: 14, padding: 4 },
  scroll: { flex: 1 },
  groupLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12, paddingHorizontal: 4 },
  teamCard: { backgroundColor: '#fff', borderRadius: Radii.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.sm, ...Shadows.card },
  teamAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center' },
  teamAvatarTxt: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_900Black' },
  teamName: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  teamPlayers: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginTop: 2 },
  teamArrow: { fontSize: 22, color: Colors.gray, fontFamily: 'Nunito_700Bold' },
  withdrawnBadge: { backgroundColor: '#FFE3E8', borderRadius: Radii.full, paddingHorizontal: 8, paddingVertical: 3 },
  withdrawnTxt: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.red },
  emptyCard: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: 32, alignItems: 'center', ...Shadows.card, marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontFamily: 'Nunito_900Black', color: Colors.navy, marginBottom: 6 },
  emptySub: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginBottom: 20 },
  addFirstBtn: { backgroundColor: Colors.blue, borderRadius: Radii.md, paddingHorizontal: 24, paddingVertical: 12 },
  addFirstTxt: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  fab: { position: 'absolute', right: Spacing.lg, bottom: 28, borderRadius: 30, overflow: 'hidden', ...Shadows.header },
  fabGrad: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  fabTxt: { color: '#fff', fontSize: 28, fontFamily: 'Nunito_800ExtraBold', lineHeight: 34 },
});
