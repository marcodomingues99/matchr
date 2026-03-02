import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Vertente, MatchPhase } from '../../../../../src/types';
import { getVertente } from '../../../../../src/services';
import { colors, spacing, radius, shadow } from '../../../../../src/theme';
import MatchCard from '../../../../../src/components/MatchCard';
import VertenteBadge from '../../../../../src/components/VertenteBadge';

const PHASES: { key: MatchPhase; label: string; short: string }[] = [
  { key: 'r16', label: 'Oitavos', short: 'R16' },
  { key: 'qf',  label: 'Quartos', short: 'QF' },
  { key: 'sf',  label: 'Meias',   short: 'SF' },
  { key: 'final', label: 'Final', short: 'F' },
];

export default function BracketScreen() {
  const { id, vid } = useLocalSearchParams<{ id: string; vid: string }>();
  const router = useRouter();
  const [vertente, setVertente] = useState<Vertente | null>(null);
  const [activePhase, setActivePhase] = useState<MatchPhase>('r16');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVertente(id, vid).then(v => { setVertente(v); setLoading(false); });
  }, [id, vid]);

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.blue} /></View>;
  if (!vertente) return null;

  const phaseMatches = vertente.matches.filter(m => m.phase === activePhase);
  const liveCount = vertente.matches.filter(m => m.status === 'live').length;

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Hub M5</Text>
        </TouchableOpacity>
        <VertenteBadge category={vertente.category} tier={vertente.tier} />
        <View style={s.headerMeta}>
          <Text style={s.headerTitle}>Bracket 🏆</Text>
          {liveCount > 0 && <View style={s.liveRow}><View style={s.liveDot} /><Text style={s.liveText}>Ao vivo</Text></View>}
        </View>
      </View>

      {/* Phase tabs */}
      <View style={s.tabs}>
        {PHASES.map(p => {
          const count = vertente.matches.filter(m => m.phase === p.key).length;
          const hasLive = vertente.matches.some(m => m.phase === p.key && m.status === 'live');
          if (count === 0) return null;
          return (
            <TouchableOpacity key={p.key} style={[s.tab, activePhase === p.key && s.tabActive]} onPress={() => setActivePhase(p.key)}>
              <View>
                <Text style={[s.tabLabel, activePhase === p.key && s.tabLabelActive]}>{p.label}</Text>
                <Text style={[s.tabCount, activePhase === p.key && s.tabCountActive]}>{count} jogos</Text>
              </View>
              {hasLive && <View style={s.tabDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {phaseMatches.map(m => (
          <MatchCard
            key={m.id}
            match={m}
            teams={vertente.teams}
            onPress={() => router.push(`/tournament/${id}/vertente/${vid}/match/${m.id}`)}
            onEdit={() => router.push(`/tournament/${id}/vertente/${vid}/match/${m.id}/edit`)}
          />
        ))}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.light },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: colors.navy, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  backBtn: { paddingVertical: spacing.xs, marginBottom: spacing.sm },
  backText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '700' },
  headerMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: '900' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.red },
  liveText: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: colors.white, borderBottomWidth: 1.5, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent', position: 'relative' },
  tabActive: { borderBottomColor: colors.blue },
  tabLabel: { fontSize: 11, fontWeight: '800', color: colors.muted, textAlign: 'center' },
  tabLabelActive: { color: colors.blue },
  tabCount: { fontSize: 9, color: colors.muted, textAlign: 'center', marginTop: 2 },
  tabCountActive: { color: colors.blue },
  tabDot: { position: 'absolute', top: 6, right: 8, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.red },
  scroll: { flex: 1 },
  content: { padding: spacing.lg },
});
