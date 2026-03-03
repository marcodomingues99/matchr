import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Vertente } from '../types';
import { mockTournaments } from '../mock/data';
import { Colors, Gradients, Typography, Spacing, Radii, Shadows } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { parseDatePt, VERTENTE_STATUS } from '../utils/constants';
import { LiveDot } from '../components/LiveDot';

type Nav = StackNavigationProp<RootStackParamList, 'TournamentDetail'>;
type Route = RouteProp<RootStackParamList, 'TournamentDetail'>;

type StatusKey = 'live' | 'wait' | 'done' | 'cfg';

const phaseInfo = (v: Vertente): { label: string; pct: number; statusKey: StatusKey } => {
  if (v.status === 'config') return { label: `${v.maxTeams} vagas`, pct: 0, statusKey: 'cfg' };
  if (v.status === 'groups') return {
    label: `${v.teams.length}/${v.maxTeams} duplas · Grupos`,
    pct: v.teams.length / v.maxTeams,
    statusKey: v.teams.length > 0 ? 'live' : 'wait',
  };
  if (v.status === 'bracket') return { label: `${v.teams.length} duplas · Bracket`, pct: 0.75, statusKey: 'live' };
  return { label: `${v.teams.length} duplas · Concluído`, pct: 1, statusKey: 'done' };
};


const getDays = (start: string, end: string) => {
  const startDate = parseDatePt(start);
  const endDate = parseDatePt(end);
  if (!startDate || !endDate) return 1;
  const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays + 1 : 1;
};
const getCountdown = (startDate: string) => {
  const target = parseDatePt(startDate);
  if (!target) return { days: 0, hours: 0, minutes: 0 };
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
};

export const TournamentDetailScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const t = mockTournaments.find(x => x.id === route.params.tournamentId);
  if (!t) return null;
  const isUpcoming = t.status === 'upcoming';

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const totalTeams = t.vertentes.reduce((sum, v) => sum + v.teams.length, 0);
  const days = getDays(t.startDate, t.endDate);

  // Countdown for upcoming
  const [countdown, setCountdown] = useState(getCountdown(t.startDate));
  useEffect(() => {
    if (!isUpcoming) return;
    const timer = setInterval(() => setCountdown(getCountdown(t.startDate)), 60000);
    return () => clearInterval(timer);
  }, [isUpcoming, t.startDate]);

  // Chunk vertentes into pairs for the 2-column grid
  const pairs = useMemo(() => {
    const result: Vertente[][] = [];
    for (let i = 0; i < t.vertentes.length; i += 2) {
      result.push(t.vertentes.slice(i, i + 2));
    }
    return result;
  }, [t.vertentes]);

  // Unique vertente types for chips
  const vertenteTypes = useMemo(
    () => [...new Set(t.vertentes.map(v => v.type))],
    [t.vertentes],
  );

  const quickExportVertenteId = useMemo(() => {
    const liveVertente = t.vertentes.find(v => v.status === VERTENTE_STATUS.GROUPS || v.status === VERTENTE_STATUS.BRACKET);
    if (liveVertente) return liveVertente.id;

    const configuredVertente = t.vertentes.find(v => v.status !== VERTENTE_STATUS.CONFIG);
    if (configuredVertente) return configuredVertente.id;

    return t.vertentes[0]?.id;
  }, [t.vertentes]);

  return (
    <View style={s.container}>
      {/* ═══ HEADER ═══ */}
      <LinearGradient colors={Gradients.header} style={s.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={s.headerCircle} />
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={s.back}>← Início</Text>
            </TouchableOpacity>
            {!isUpcoming && (
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => navigation.navigate('EditTournament', { tournamentId: t.id })}
              >
                <Text style={s.editBtnTxt}>✏️ Editar</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={s.title}>{t.name}{isUpcoming ? ' 🌸' : ''}</Text>
          <Text style={s.subtitle}>📍 {t.location} · {t.startDate}{t.startDate !== t.endDate ? `–${t.endDate}` : ''}</Text>

          {/* Chips row for upcoming */}
          {isUpcoming && (
            <View style={s.chipRow}>
              {vertenteTypes.map(vt => (
                <View key={vt} style={s.chipWhite}>
                  <Text style={s.chipWhiteTxt}>{vt}</Text>
                </View>
              ))}
              <View style={s.chipYellow}>
                <Text style={s.chipYellowTxt}>Em preparação</Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} colors={[Colors.blue]} />
        }
      >

        {/* ═══ COUNTDOWN (upcoming only) ═══ */}
        {isUpcoming && (
          <View style={s.countdownWrap}>
            <LinearGradient colors={Gradients.masc} style={s.countdownCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={s.countdownLabel}>Começa em</Text>
              <View style={s.countdownRow}>
                <View style={s.countdownUnit}>
                  <Text style={s.countdownNum}>{countdown.days}</Text>
                  <Text style={s.countdownSub}>dias</Text>
                </View>
                <Text style={s.countdownSep}>:</Text>
                <View style={s.countdownUnit}>
                  <Text style={s.countdownNum}>{countdown.hours}</Text>
                  <Text style={s.countdownSub}>horas</Text>
                </View>
                <Text style={s.countdownSep}>:</Text>
                <View style={s.countdownUnit}>
                  <Text style={s.countdownNum}>{countdown.minutes}</Text>
                  <Text style={s.countdownSub}>min</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ═══ STATS STRIP (active only) ═══ */}
        {!isUpcoming && (
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={[s.statNum, { color: Colors.blue }]}>{t.vertentes.length}</Text>
              <Text style={s.statLbl}>Categorias</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statNum, { color: Colors.orange }]}>{totalTeams}</Text>
              <Text style={s.statLbl}>Duplas total</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statNum, { color: Colors.green }]}>{days}</Text>
              <Text style={s.statLbl}>Dias</Text>
            </View>
          </View>
        )}

        {/* ═══ REGULAMENTO (active only) ═══ */}
        {!isUpcoming && t.regulamento && (
          <View style={s.regCard}>
            <View style={s.regIconBox}><Text style={{ fontSize: 18 }}>📄</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.regName}>Regulamento do torneio</Text>
              <Text style={s.regSub}>{t.regulamento}</Text>
            </View>
            <TouchableOpacity>
              <LinearGradient colors={Gradients.primary} style={s.dlBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={s.dlTxt}>↓ PDF</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ═══ CATEGORIAS (same grid for both layouts) ═══ */}
        <Text style={s.sectionTitleSolo}>Seleciona uma categoria</Text>
        {pairs.map((row, ri) => (
          <View key={ri} style={s.tileRow}>
            {row.map(v => {
              const cfg = VERTENTE_CONFIG[v.type];
              const info = phaseInfo(v);
              const pctStr = `${Math.round(info.pct * 100)}%` as `${number}%`;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={s.tile}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('VertenteHub', { tournamentId: t.id, vertenteId: v.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`${cfg.label} ${v.level}, ${info.label}`}
                  accessibilityHint="Abrir categoria"
                >
                  <LinearGradient
                    colors={cfg.gradient}
                    style={s.tileGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {/* Status badge */}
                    <View style={[
                      s.statusBadge,
                      info.statusKey === 'live' ? s.badgeLive :
                        info.statusKey === 'done' ? s.badgeDone : s.badgeWait,
                    ]}>
                      {info.statusKey === 'live' && <LiveDot />}
                      <Text style={[s.statusTxt, info.statusKey === 'live' && s.statusTxtWhite]}>
                        {info.statusKey === 'live' ? 'Ao vivo' :
                          info.statusKey === 'done' ? 'Concluído' :
                            info.statusKey === 'cfg' ? 'A configurar' : 'Aguarda'}
                      </Text>
                    </View>

                    {/* Content */}
                    <Text style={s.tileCat}>{cfg.label.toUpperCase()}</Text>
                    <Text style={s.tileLevel}>{v.level}</Text>
                    <Text style={s.tileInfo}>{info.label}</Text>

                    {/* Progress bar */}
                    <View style={s.tileProgBg}>
                      <View style={[s.tileProgFill, { width: pctStr }]} />
                    </View>

                    {/* Emoji watermark */}
                    <Text style={s.tileWatermark}>{cfg.emoji}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
            {row.length === 1 && <View style={s.tileEmpty} />}
          </View>
        ))}

        {/* Add categoria */}
        <TouchableOpacity style={s.addCard} onPress={() => navigation.navigate('ConfigureVertente', { tournamentId: t.id, vertenteIndex: 0, isLast: true, pendingVertentes: JSON.stringify([]) })}>
          <Text style={{ fontSize: Typography.fontSize.xxxl, color: Colors.muted }}>＋</Text>
          <Text style={s.addTxt}>Adicionar categoria</Text>
        </TouchableOpacity>

        {/* Quick actions (upcoming only) */}
        {isUpcoming && (
          <>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Ações rápidas</Text>
            </View>
            <View style={s.quickRow}>
              <TouchableOpacity style={s.quickCard} activeOpacity={0.7} onPress={() => navigation.navigate('EditTournament', { tournamentId: t.id })}>
                <Text style={s.quickEmoji}>⚙️</Text>
                <Text style={s.quickLabel}>Configurar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.quickCard}
                activeOpacity={0.7}
                onPress={() => quickExportVertenteId && navigation.navigate('Export', { tournamentId: t.id, vertenteId: quickExportVertenteId })}
              >
                <Text style={s.quickEmoji}>📥</Text>
                <Text style={s.quickLabel}>Exportar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },

  /* ── Header ── */
  header: { paddingHorizontal: Spacing.lg, paddingBottom: 20, position: 'relative', overflow: 'hidden' },
  headerCircle: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -48, right: -28,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, marginBottom: 8 },
  back: { color: 'rgba(255,255,255,0.75)', fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBold },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 5 },
  editBtnTxt: { color: Colors.white, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,0.65)', fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilySemiBold, marginTop: 3 },
  scroll: { flex: 1 },

  /* ── Chips (upcoming header) ── */
  chipRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  chipWhite: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  chipWhiteTxt: { color: Colors.white, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily },
  chipYellow: { backgroundColor: Colors.yellowBg, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  chipYellowTxt: { color: Colors.yellowDark, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily },

  /* ── Countdown (upcoming) ── */
  countdownWrap: { marginHorizontal: 12, marginTop: 12 },
  countdownCard: { borderRadius: Radii.lg, padding: 16, alignItems: 'center', ...Shadows.card },
  countdownLabel: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countdownUnit: { alignItems: 'center' },
  countdownNum: { fontSize: 30, fontFamily: Typography.fontFamilyBlack, color: Colors.white },
  countdownSub: { fontSize: Typography.fontSize.xs, color: 'rgba(255,255,255,0.6)', fontFamily: Typography.fontFamilySemiBold },
  countdownSep: { fontSize: 28, fontFamily: Typography.fontFamilyBlack, color: 'rgba(255,255,255,0.3)', lineHeight: 40 },

  /* ── Stats strip (active) ── */
  statsRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, paddingBottom: Spacing.xs },
  statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md, alignItems: 'center', ...Shadows.card },
  statNum: { fontSize: Typography.fontSize.xxl, fontFamily: Typography.fontFamilyBlack },
  statLbl: { fontSize: Typography.fontSize.xs, color: Colors.muted, fontFamily: Typography.fontFamilySemiBold, marginTop: 2, textAlign: 'center' },

  /* ── Regulamento ── */
  regCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.white, borderRadius: Radii.lg, padding: 12,
    marginHorizontal: 12, marginBottom: 4, ...Shadows.card,
  },
  regIconBox: {
    width: 38, height: 38, backgroundColor: Colors.orangeBg,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  regName: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.navy },
  regSub: { fontSize: Typography.fontSize.xs, color: Colors.muted, fontFamily: Typography.fontFamilySemiBold, marginTop: 2 },
  dlBtn: { borderRadius: 8, paddingHorizontal: 11, paddingVertical: 6 },
  dlTxt: { color: Colors.white, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily },

  /* ── Section titles ── */
  sectionTitleSolo: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy, margin: 12, marginBottom: 8 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 12, marginTop: 14, marginBottom: 8 },
  sectionTitle: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
  sectionAction: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBold, color: Colors.blue },

  /* ── Quick actions (upcoming) ── */
  quickRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 20 },
  quickCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md,
    alignItems: 'center', ...Shadows.card,
  },
  quickEmoji: { fontSize: Typography.fontSize.xxxl },
  quickLabel: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily, color: Colors.navy, marginTop: 5 },

  /* ── Tile grid (active) ── */
  tileRow: { flexDirection: 'row', gap: Spacing.sm, marginHorizontal: Spacing.md, marginBottom: Spacing.sm },
  tile: { flex: 1, minHeight: 110, borderRadius: Radii.lg, overflow: 'hidden', elevation: 3 },
  tileEmpty: { flex: 1 },
  tileGrad: { flex: 1, padding: 12, paddingBottom: 10 },

  /* Status badge */
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    position: 'absolute', top: 8, right: 8,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  badgeLive: { backgroundColor: Colors.red },
  badgeDone: { backgroundColor: 'rgba(255,255,255,0.35)' },
  badgeWait: { backgroundColor: 'rgba(255,255,255,0.25)' },
  statusTxt: { fontSize: Typography.fontSize.xxs, fontFamily: Typography.fontFamily, color: 'rgba(255,255,255,0.85)' },
  statusTxtWhite: { color: Colors.white },

  /* Tile content */
  tileCat: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilyBlack, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, marginTop: 8 },
  tileLevel: { fontSize: 18, fontFamily: Typography.fontFamilyBlack, color: Colors.white, marginTop: 2 },
  tileInfo: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilyBold, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  tileProgBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 8 },
  tileProgFill: { height: 3, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 2 },
  tileWatermark: { position: 'absolute', fontSize: 48, right: -4, bottom: -8, opacity: 0.12 },

  /* Add card */
  addCard: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.gray,
    borderRadius: Radii.lg, padding: Spacing.md, marginHorizontal: Spacing.md,
    alignItems: 'center', backgroundColor: Colors.white,
  },
  addTxt: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.muted, marginTop: 3 },
});
