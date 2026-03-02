import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Tournament } from '../src/types';
import { getTournaments } from '../src/services';
import { colors, spacing, radius, shadow, typography } from '../src/theme';

const LOGO = require('../assets/icon.png');

function StatusChip({ status }: { status: Tournament['status'] }) {
  const cfg = {
    live:      { label: '🔴 Ao vivo',      bg: '#FFE3E8', color: colors.red },
    upcoming:  { label: '⏳ Em preparação', bg: '#FFF8E3', color: colors.orange },
    completed: { label: '✅ Concluído',     bg: '#DFFAEE', color: colors.green },
  }[status];
  return <View style={[chip.base, { backgroundColor: cfg.bg }]}><Text style={[chip.text, { color: cfg.color }]}>{cfg.label}</Text></View>;
}
const chip = StyleSheet.create({
  base: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  text: { fontSize: 10, fontWeight: '800' },
});

export default function HomeScreen() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTournaments().then(d => { setTournaments(d); setLoading(false); });
  }, []);

  const renderItem = ({ item: t }: { item: Tournament }) => (
    <TouchableOpacity style={s.card} onPress={() => router.push(`/tournament/${t.id}`)} activeOpacity={0.85}>
      <View style={[s.banner, { backgroundColor: t.status === 'live' ? colors.navy : colors.blue }]}>
        <Text style={s.bannerText}>{t.name.substring(0, 1)}</Text>
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardTitle} numberOfLines={1}>{t.name}</Text>
        <Text style={s.cardSub}>📍 {t.location} · {t.startDate}</Text>
        <View style={s.cardFooter}>
          <StatusChip status={t.status} />
          <Text style={s.vertenteCount}>{t.vertentes.length} vertentes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Image source={LOGO} style={s.logo} />
          <View>
            <Text style={s.appName}>Matchr</Text>
            <Text style={s.appSub}>Os teus torneios</Text>
          </View>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => router.push('/tournament/create')}>
          <Text style={s.addBtnText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={colors.blue} size="large" /></View>
      ) : tournaments.length === 0 ? (
        <View style={s.empty}>
          <Image source={LOGO} style={s.emptyLogo} />
          <Text style={s.emptyTitle}>Nenhum torneio ainda</Text>
          <Text style={s.emptySub}>Cria o teu primeiro torneio</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/tournament/create')}>
            <Text style={s.emptyBtnText}>Criar torneio →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tournaments}
          renderItem={renderItem}
          keyExtractor={t => t.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.light },
  header: { backgroundColor: colors.navy, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 36, height: 36, resizeMode: 'contain' },
  appName: { color: colors.white, fontSize: 20, fontWeight: '900' },
  appSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600' },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  addBtnText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  list: { padding: spacing.lg, gap: spacing.sm },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', ...shadow.sm },
  banner: { height: 70, alignItems: 'center', justifyContent: 'center' },
  bannerText: { color: colors.white, fontSize: 28, fontWeight: '900', opacity: 0.4 },
  cardBody: { padding: spacing.md, gap: spacing.xs },
  cardTitle: { ...typography.h3 },
  cardSub: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  vertenteCount: { fontSize: 11, color: colors.muted, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xxl },
  emptyLogo: { width: 80, height: 80, resizeMode: 'contain', opacity: 0.6 },
  emptyTitle: { ...typography.h2 },
  emptySub: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  emptyBtn: { backgroundColor: colors.blue, borderRadius: radius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, marginTop: spacing.sm },
  emptyBtnText: { color: colors.white, fontSize: 14, fontWeight: '800' },
});
