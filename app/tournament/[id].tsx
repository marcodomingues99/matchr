import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Tournament, Vertente } from '../../src/types';
import { getTournament } from '../../src/services';
import { colors, spacing, radius, shadow, typography } from '../../src/theme';

const CAT_COLOR: Record<string, string> = { M: colors.blue, F: colors.purple, MX: colors.orange };
const CAT_EMOJI: Record<string, string> = { M: '👨', F: '👩', MX: '👫' };
const CAT_LABEL: Record<string, string> = { M: 'Masculino', F: 'Feminino', MX: 'Misto' };

function VertenteCard({ v, onPress }: { v: Vertente; onPress: () => void }) {
  const color = CAT_COLOR[v.category];
  const progress = v.teams.length / v.maxTeams;
  const statusLabel = v.status === 'live' ? '🔴 Ao vivo' : v.status === 'completed' ? '✅ Concluído' : '⏳ Em preparação';

  return (
    <TouchableOpacity style={s.vCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[s.vIcon, { backgroundColor: color }]}>
        <Text style={s.vIconText}>{CAT_EMOJI[v.category]}</Text>
      </View>
      <View style={s.vBody}>
        <View style={s.vRow}>
          <Text style={s.vName}>{CAT_LABEL[v.category]}{v.tier !== 'Sem' ? ` ${v.tier}` : ''}</Text>
          <Text style={s.vStatus}>{statusLabel}</Text>
        </View>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${progress * 100}%` as any, backgroundColor: color }]} />
        </View>
        <Text style={s.vSub}>{v.teams.length}/{v.maxTeams} duplas · {v.courts} courts</Text>
      </View>
      <Text style={s.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function TournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTournament(id).then(t => { setTournament(t); setLoading(false); });
  }, [id]);

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.blue} /></View>;
  if (!tournament) return <View style={s.center}><Text>Torneio não encontrado</Text></View>;

  const liveMatches = tournament.vertentes.reduce((acc, v) => acc + v.matches.filter(m => m.status === 'live').length, 0);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Início</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push(`/tournament/${id}/edit`)} style={s.editBtn}>
          <Text style={s.editText}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>
      <View style={s.headerBody}>
        <Text style={s.headerTitle}>{tournament.name}</Text>
        <Text style={s.headerSub}>📍 {tournament.location} · {tournament.startDate} – {tournament.endDate}</Text>
        <View style={s.chips}>
          {tournament.vertentes.map(v => (
            <View key={v.id} style={[s.chip, { borderColor: CAT_COLOR[v.category] }]}>
              <Text style={[s.chipText, { color: CAT_COLOR[v.category] }]}>{v.category}</Text>
            </View>
          ))}
          {liveMatches > 0 && <View style={[s.chip, { borderColor: colors.red, backgroundColor: '#FFE3E8' }]}>
            <Text style={[s.chipText, { color: colors.red }]}>🔴 {liveMatches} ao vivo</Text>
          </View>}
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Regulamento */}
        {tournament.regulamentUrl ? (
          <View style={s.regCard}>
            <View style={s.regIcon}><Text style={{ fontSize: 18 }}>📄</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.regTitle}>Regulamento</Text>
              <Text style={s.regSub} numberOfLines={1}>regulamento.pdf</Text>
            </View>
            <TouchableOpacity style={s.regBtn}><Text style={s.regBtnText}>↓ PDF</Text></TouchableOpacity>
          </View>
        ) : null}

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { label: 'Vertentes', value: tournament.vertentes.length },
            { label: 'Duplas', value: tournament.vertentes.reduce((a, v) => a + v.teams.length, 0) },
            { label: 'Jogos', value: tournament.vertentes.reduce((a, v) => a + v.matches.length, 0) },
          ].map(({ label, value }) => (
            <View key={label} style={s.statCard}>
              <Text style={s.statValue}>{value}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Vertentes */}
        <Text style={s.sectionTitle}>Sub-torneios</Text>
        {tournament.vertentes.map(v => (
          <VertenteCard key={v.id} v={v} onPress={() => router.push(`/tournament/${id}/vertente/${v.id}`)} />
        ))}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.light },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: colors.navy, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  backBtn: { paddingVertical: spacing.xs },
  backText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '700' },
  editBtn: { paddingVertical: spacing.xs, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: spacing.md, borderRadius: radius.full },
  editText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  headerBody: { backgroundColor: colors.navy, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: '900', marginBottom: spacing.xs },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: '600', marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { borderWidth: 1.5, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  chipText: { fontSize: 11, fontWeight: '800' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg },
  regCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md, ...shadow.sm },
  regIcon: { width: 44, height: 44, backgroundColor: '#FFF0E3', borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  regTitle: { fontSize: 13, fontWeight: '800', color: colors.navy },
  regSub: { fontSize: 10, color: colors.muted, fontWeight: '600' },
  regBtn: { backgroundColor: colors.blue, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  regBtnText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', ...shadow.sm },
  statValue: { fontSize: 24, fontWeight: '900', color: colors.blue },
  statLabel: { fontSize: 10, color: colors.muted, fontWeight: '700', marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  vCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm, ...shadow.sm },
  vIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  vIconText: { fontSize: 22 },
  vBody: { flex: 1, gap: 4 },
  vRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vName: { fontSize: 13, fontWeight: '800', color: colors.navy },
  vStatus: { fontSize: 10, fontWeight: '700', color: colors.muted },
  progressBg: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  vSub: { fontSize: 10, color: colors.muted, fontWeight: '600' },
  chevron: { fontSize: 22, color: colors.gray, fontWeight: '700' },
});
