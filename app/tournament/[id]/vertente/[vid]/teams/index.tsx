import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Vertente, Team } from '../../../../../../src/types';
import { getVertente, withdrawTeam } from '../../../../../../src/services';
import { colors, spacing, radius, shadow } from '../../../../../../src/theme';
import TeamAvatar from '../../../../../../src/components/TeamAvatar';

export default function TeamsScreen() {
  const { id, vid } = useLocalSearchParams<{ id: string; vid: string }>();
  const router = useRouter();
  const [vertente, setVertente] = useState<Vertente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVertente(id, vid).then(v => { setVertente(v); setLoading(false); });
  }, [id, vid]);

  const handleWithdraw = (team: Team) => {
    Alert.alert(
      `Desistência — ${team.name}`,
      'Como tratar os jogos desta dupla?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: '🏳️ Walkover', onPress: async () => {
          await withdrawTeam(id, vid, team.id, 'walkover');
          setVertente(v => v ? { ...v, teams: v.teams.map(t => t.id === team.id ? { ...t, withdrawn: true, withdrawalType: 'walkover' } : t) } : v);
        }},
        { text: '🔄 Reorganizar', onPress: async () => {
          await withdrawTeam(id, vid, team.id, 'reorganize');
          setVertente(v => v ? { ...v, teams: v.teams.map(t => t.id === team.id ? { ...t, withdrawn: true, withdrawalType: 'reorganize' } : t) } : v);
        }},
      ]
    );
  };

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.blue} /></View>;
  if (!vertente) return null;

  const renderTeam = ({ item: team, index }: { item: Team; index: number }) => (
    <View style={[s.row, team.withdrawn && s.rowWithdrawn]}>
      <Text style={s.num}>{index + 1}</Text>
      <TeamAvatar initials={team.initials} color={team.avatarColor} size={40} />
      <View style={s.info}>
        <View style={s.nameRow}>
          <Text style={[s.name, team.withdrawn && s.nameWithdrawn]}>{team.name}</Text>
          {team.withdrawn && <Text style={s.withdrawnBadge}>🚫 W.O.</Text>}
        </View>
        <Text style={s.players}>{team.player1.name} · {team.player2.name}</Text>
      </View>
      {team.groupId && <View style={s.groupChip}><Text style={s.groupChipText}>{team.groupId.toUpperCase()}</Text></View>}
      {!team.withdrawn && (
        <>
          <TouchableOpacity style={s.iconBtn} onPress={() => router.push(`/tournament/${id}/vertente/${vid}/teams/${team.id}/edit`)}>
            <Text style={s.iconBtnText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={() => handleWithdraw(team)}>
            <Text style={s.iconBtnText}>🚫</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backText}>← Hub</Text>
        </TouchableOpacity>
        <Text style={s.title}>Duplas Inscritas 👥</Text>
        <Text style={s.sub}>{vertente.teams.length}/{vertente.maxTeams} confirmadas</Text>
      </View>
      <View style={s.legend}>
        <Text style={s.legendText}>✏️ editar   🚫 desistência</Text>
      </View>
      <FlatList
        data={vertente.teams}
        renderItem={renderTeam}
        keyExtractor={t => t.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <TouchableOpacity style={s.addBtn} onPress={() => router.push(`/tournament/${id}/vertente/${vid}/teams/new`)}>
            <Text style={s.addBtnText}>+ Adicionar dupla</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.light },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: colors.navy, padding: spacing.lg, paddingBottom: spacing.xl },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', marginBottom: spacing.sm },
  title: { color: colors.white, fontSize: 20, fontWeight: '900' },
  sub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  legend: { backgroundColor: colors.white, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  legendText: { fontSize: 11, color: colors.muted, fontWeight: '700' },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, ...shadow.sm },
  rowWithdrawn: { opacity: 0.5, backgroundColor: '#FFF5F5' },
  num: { width: 20, textAlign: 'center', fontSize: 12, fontWeight: '800', color: colors.gray },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  name: { fontSize: 13, fontWeight: '800', color: colors.navy },
  nameWithdrawn: { textDecorationLine: 'line-through', color: colors.gray },
  players: { fontSize: 10, color: colors.muted, fontWeight: '600' },
  withdrawnBadge: { fontSize: 10, color: colors.red, fontWeight: '800' },
  groupChip: { backgroundColor: '#E3ECFF', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  groupChipText: { fontSize: 10, fontWeight: '800', color: colors.blue },
  iconBtn: { padding: spacing.xs },
  iconBtnText: { fontSize: 18 },
  addBtn: { backgroundColor: colors.blue, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  addBtnText: { color: colors.white, fontSize: 14, fontWeight: '800' },
});
