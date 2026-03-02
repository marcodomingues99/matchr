import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Vertente, Match, SetScore } from '../../../../../../src/types';
import { getVertente, saveSet, submitResult, pauseMatch, resumeMatch } from '../../../../../../src/services';
import { colors, spacing, radius, shadow } from '../../../../../../src/theme';
import TeamAvatar from '../../../../../../src/components/TeamAvatar';

function NumPad({ onPress }: { onPress: (v: number) => void }) {
  return (
    <View style={np.grid}>
      {[0,1,2,3,4,5,6,7].map(n => (
        <TouchableOpacity key={n} style={np.btn} onPress={() => onPress(n)}>
          <Text style={np.txt}>{n}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const np = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  btn: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.light, alignItems: 'center', justifyContent: 'center', ...shadow.sm },
  txt: { fontSize: 22, fontWeight: '900', color: colors.navy },
});

export default function MatchResultScreen() {
  const { id, vid, mid } = useLocalSearchParams<{ id: string; vid: string; mid: string }>();
  const router = useRouter();
  const [vertente, setVertente] = useState<Vertente | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [activeSide, setActiveSide] = useState<'team1' | 'team2' | null>(null);
  const [activeSetIdx, setActiveSetIdx] = useState(0);
  const [sets, setSets] = useState<SetScore[]>([{ team1: null, team2: null, saved: false }]);

  useEffect(() => {
    getVertente(id, vid).then(v => {
      setVertente(v);
      const m = v?.matches.find(m => m.id === mid);
      if (m) {
        setMatch(m);
        setSets(m.sets.length ? m.sets : [{ team1: null, team2: null, saved: false }]);
      }
    });
  }, [id, vid, mid]);

  if (!vertente || !match) return <View style={s.center}><ActivityIndicator color={colors.blue} /></View>;

  const team1 = vertente.teams.find(t => t.id === match.team1Id);
  const team2 = vertente.teams.find(t => t.id === match.team2Id);

  const handleNumPress = (val: number) => {
    if (!activeSide) return;
    setSets(prev => prev.map((set, i) => i === activeSetIdx ? { ...set, [activeSide]: val } : set));
  };

  const handleSaveSet = async () => {
    const current = sets[activeSetIdx];
    if (current.team1 === null || current.team2 === null) return Alert.alert('Introduz os dois scores');
    await saveSet(id, vid, mid, activeSetIdx, current);
    setSets(prev => prev.map((s, i) => i === activeSetIdx ? { ...s, saved: true } : s));
    if (activeSetIdx === sets.length - 1) {
      setSets(prev => [...prev, { team1: null, team2: null, saved: false }]);
      setActiveSetIdx(prev => prev + 1);
    }
    setActiveSide(null);
  };

  const handlePause = async () => {
    await pauseMatch(id, vid, mid);
    router.back();
  };

  const handleConfirm = () => {
    const savedSets = sets.filter(s => s.saved);
    const t1Wins = savedSets.filter(s => (s.team1 ?? 0) > (s.team2 ?? 0)).length;
    const t2Wins = savedSets.filter(s => (s.team2 ?? 0) > (s.team1 ?? 0)).length;
    if (t1Wins === t2Wins) return Alert.alert('O resultado não tem vencedor definido');
    const winnerId = t1Wins > t2Wins ? match.team1Id! : match.team2Id!;
    Alert.alert('Confirmar resultado?', 'Após confirmar os resultados ficam bloqueados.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: async () => {
        await submitResult(id, vid, mid, winnerId);
        router.back();
      }},
    ]);
  };

  const setOrdinal = ['1º', '2º', '3º', '4º'];

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backText}>← Bracket</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Resultado 🎾</Text>
        <Text style={s.headerSub}>{match.scheduledTime} · Court {match.courtNumber}</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Teams */}
        <View style={s.teamsRow}>
          {[team1, team2].map((team, i) => (
            <View key={i} style={s.teamCol}>
              <TeamAvatar initials={team?.initials ?? '?'} color={team?.avatarColor} size={52} />
              <Text style={s.teamName} numberOfLines={1}>{team?.name}</Text>
              <Text style={s.teamPlayers} numberOfLines={1}>{team?.player1.name.split(' ')[0]} · {team?.player2.name.split(' ')[0]}</Text>
            </View>
          ))}
        </View>

        {/* Sets */}
        {sets.map((set, idx) => {
          const isActive = idx === activeSetIdx && !set.saved;
          return (
            <View key={idx} style={[s.setCard, set.saved && s.setCardSaved, isActive && s.setCardActive]}>
              <View style={s.setHeader}>
                <Text style={s.setTitle}>{setOrdinal[idx]} Set</Text>
                {set.saved && <View style={s.savedChip}><Text style={s.savedText}>✓ Guardado</Text></View>}
                {isActive && !set.saved && idx === 2 && <View style={s.tieChip}><Text style={s.tieText}>⚡ Super Tie-Break · até 10</Text></View>}
              </View>
              <View style={s.setRow}>
                <TouchableOpacity style={[s.scoreBtn, activeSide === 'team1' && activeSetIdx === idx && s.scoreBtnActive]} onPress={() => { setActiveSetIdx(idx); setActiveSide('team1'); }} disabled={set.saved}>
                  <Text style={s.scoreBtnText}>{set.team1 ?? '–'}</Text>
                  <Text style={s.scoreBtnLabel}>{team1?.name.split(' ')[0]}</Text>
                </TouchableOpacity>
                <Text style={s.scoreSep}>–</Text>
                <TouchableOpacity style={[s.scoreBtn, activeSide === 'team2' && activeSetIdx === idx && s.scoreBtnActive]} onPress={() => { setActiveSetIdx(idx); setActiveSide('team2'); }} disabled={set.saved}>
                  <Text style={s.scoreBtnText}>{set.team2 ?? '–'}</Text>
                  <Text style={s.scoreBtnLabel}>{team2?.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              </View>
              {isActive && (
                <>
                  <NumPad onPress={handleNumPress} />
                  <TouchableOpacity style={s.saveSetBtn} onPress={handleSaveSet}>
                    <Text style={s.saveSetText}>Guardar {setOrdinal[idx]} Set →</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        })}

        {/* Pause */}
        <TouchableOpacity style={s.pauseBtn} onPress={handlePause}>
          <Text style={s.pauseIcon}>⏸</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.pauseTitle}>Pausar jogo</Text>
            <Text style={s.pauseSub}>Sets guardados · podes retomar mais tarde</Text>
          </View>
        </TouchableOpacity>

        {sets.some(s => s.saved) && (
          <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm}>
            <Text style={s.confirmText}>Confirmar resultado final ✓</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: colors.navy, padding: spacing.lg, paddingBottom: spacing.xl },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', marginBottom: spacing.sm },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: '900' },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: spacing.lg },
  teamsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg },
  teamCol: { alignItems: 'center', gap: spacing.xs, flex: 1 },
  teamName: { fontSize: 13, fontWeight: '800', color: colors.navy, textAlign: 'center' },
  teamPlayers: { fontSize: 10, color: colors.muted, textAlign: 'center' },
  setCard: { backgroundColor: colors.light, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 2, borderColor: 'transparent' },
  setCardSaved: { borderColor: colors.green, backgroundColor: '#F0FFF7' },
  setCardActive: { borderColor: colors.yellow, backgroundColor: '#FFFBEF' },
  setHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  setTitle: { fontSize: 13, fontWeight: '900', color: colors.navy },
  savedChip: { backgroundColor: '#DFFAEE', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  savedText: { fontSize: 10, fontWeight: '800', color: colors.green },
  tieChip: { backgroundColor: '#FFF8E3', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  tieText: { fontSize: 10, fontWeight: '800', color: colors.orange },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  scoreBtn: { width: 80, height: 80, borderRadius: radius.lg, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow.sm },
  scoreBtnActive: { borderWidth: 2.5, borderColor: colors.blue, backgroundColor: '#EBF3FF' },
  scoreBtnText: { fontSize: 32, fontWeight: '900', color: colors.navy },
  scoreBtnLabel: { fontSize: 10, color: colors.muted, fontWeight: '700', marginTop: 2 },
  scoreSep: { fontSize: 24, fontWeight: '900', color: colors.gray },
  saveSetBtn: { backgroundColor: colors.blue, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
  saveSetText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  pauseBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 2, borderColor: colors.orange, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  pauseIcon: { fontSize: 28 },
  pauseTitle: { fontSize: 13, fontWeight: '800', color: colors.navy },
  pauseSub: { fontSize: 10, color: colors.muted, marginTop: 2 },
  confirmBtn: { backgroundColor: colors.blue, borderRadius: radius.lg, padding: spacing.md + 2, alignItems: 'center' },
  confirmText: { color: colors.white, fontSize: 14, fontWeight: '800' },
});
