import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Vertente } from '../types';
import { mockTournaments } from '../mock/data';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'TournamentDetail'>;

const VERT_CFG = {
  M: { emoji: '👨', label: 'Masculino', letter: 'M', colors: [Colors.navy, Colors.blue] as string[], progressColors: [Colors.blue, Colors.teal] as string[] },
  F: { emoji: '👩', label: 'Feminino', letter: 'F', colors: ['#7B00CC', '#9B30FF'] as string[], progressColors: ['#9B30FF', '#FF44AA'] as string[] },
  MX: { emoji: '👫', label: 'Misto', letter: 'MX', colors: ['#CC4400', Colors.orange] as string[], progressColors: [Colors.orange, Colors.yellow] as string[] },
};

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
  const s = parseInt(start), e = parseInt(end);
  return (!isNaN(s) && !isNaN(e) && e >= s) ? e - s + 1 : 1;
};

/* ── Parse "5 Abr 2026" → Date ── */
const MONTHS: Record<string, number> = {
  Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
  Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
};
const parseDatePt = (s: string): Date | null => {
  const parts = s.trim().split(/\s+/);
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const month = MONTHS[parts[1]];
  const year = parseInt(parts[2]);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  return new Date(year, month, day);
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

/* ── Pulsing live dot ── */
const LiveDot = () => {
  const opacity = React.useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);
  return <Animated.View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff', opacity }} />;
};

export const TournamentDetailScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const t = mockTournaments.find(x => x.id === route.params.tournamentId) ?? mockTournaments[0];
  const isUpcoming = t.status === 'upcoming';

  const totalTeams = t.vertentes.reduce((sum, v) => sum + v.teams.length, 0);
  const days = getDays(t.startDate, t.endDate);

  // Countdown for upcoming
  const [countdown, setCountdown] = useState(getCountdown(t.startDate));
  useEffect(() => {
    if (!isUpcoming) return;
    const timer = setInterval(() => setCountdown(getCountdown(t.startDate)), 60000);
    return () => clearInterval(timer);
  }, [isUpcoming, t.startDate]);

  // Chunk vertentes into pairs for the 2-column grid (active only)
  const pairs: Vertente[][] = [];
  for (let i = 0; i < t.vertentes.length; i += 2) {
    pairs.push(t.vertentes.slice(i, i + 2));
  }

  // Unique vertente types for chips
  const vertenteTypes = [...new Set(t.vertentes.map(v => v.type))];

  return (
    <View style={s.container}>
      {/* ═══ HEADER ═══ */}
      <LinearGradient colors={Gradients.header} style={s.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={s.headerCircle} />
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
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

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ═══ COUNTDOWN (upcoming only) ═══ */}
        {isUpcoming && (
          <View style={s.countdownWrap}>
            <LinearGradient colors={[Colors.navy, Colors.blue]} style={s.countdownCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
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
              <Text style={s.statLbl}>Sub-torneios</Text>
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
              <LinearGradient colors={[Colors.blue, Colors.teal]} style={s.dlBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={s.dlTxt}>↓ PDF</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ═══ SUB-TORNEIOS (same grid for both layouts) ═══ */}
        <Text style={s.sectionTitleSolo}>Seleciona um sub-torneio</Text>
        {pairs.map((row, ri) => (
          <View key={ri} style={s.tileRow}>
            {row.map(v => {
              const cfg = VERT_CFG[v.type];
              const info = phaseInfo(v);
              const pctStr = `${Math.round(info.pct * 100)}%` as any;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={s.tile}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('VertenteHub', { tournamentId: t.id, vertenteId: v.id })}
                >
                  <LinearGradient
                    colors={cfg.colors}
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

        {/* Add sub-torneio */}
        <TouchableOpacity style={s.addCard} onPress={() => navigation.navigate('CreateTournament')}>
          <Text style={{ fontSize: 22, color: Colors.muted }}>＋</Text>
          <Text style={s.addTxt}>Adicionar sub-torneio</Text>
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
              <TouchableOpacity style={s.quickCard} activeOpacity={0.7} onPress={() => navigation.navigate('Export', { tournamentId: t.id, vertenteId: t.vertentes[0]?.id ?? '' })}>
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
  header: { paddingHorizontal: 18, paddingBottom: 20, position: 'relative', overflow: 'hidden' },
  headerCircle: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -48, right: -28,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, marginBottom: 8 },
  back: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_700Bold' },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 5 },
  editBtnTxt: { color: '#fff', fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  title: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black', marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontFamily: 'Nunito_600SemiBold', marginTop: 3 },
  scroll: { flex: 1 },

  /* ── Chips (upcoming header) ── */
  chipRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  chipWhite: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  chipWhiteTxt: { color: '#fff', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },
  chipYellow: { backgroundColor: '#FFFBE6', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  chipYellowTxt: { color: '#997700', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },

  /* ── Countdown (upcoming) ── */
  countdownWrap: { marginHorizontal: 12, marginTop: 12 },
  countdownCard: { borderRadius: Radii.lg, padding: 16, alignItems: 'center', ...Shadows.card },
  countdownLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countdownUnit: { alignItems: 'center' },
  countdownNum: { fontSize: 30, fontFamily: 'Nunito_900Black', color: '#fff' },
  countdownSub: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: 'Nunito_600SemiBold' },
  countdownSep: { fontSize: 28, fontFamily: 'Nunito_900Black', color: 'rgba(255,255,255,0.3)', lineHeight: 40 },

  /* ── Stats strip (active) ── */
  statsRow: { flexDirection: 'row', gap: 8, padding: 12, paddingBottom: 4 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: Radii.lg, padding: 11, alignItems: 'center', ...Shadows.card },
  statNum: { fontSize: 20, fontFamily: 'Nunito_900Black' },
  statLbl: { fontSize: 10, color: Colors.muted, fontFamily: 'Nunito_600SemiBold', marginTop: 2, textAlign: 'center' },

  /* ── Regulamento ── */
  regCard: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    backgroundColor: '#fff', borderRadius: Radii.lg, padding: 12,
    marginHorizontal: 12, marginBottom: 4, ...Shadows.card,
  },
  regIconBox: {
    width: 38, height: 38, backgroundColor: '#FFF0E3',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  regName: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  regSub: { fontSize: 10, color: Colors.muted, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  dlBtn: { borderRadius: 8, paddingHorizontal: 11, paddingVertical: 6 },
  dlTxt: { color: '#fff', fontSize: 11, fontFamily: 'Nunito_800ExtraBold' },

  /* ── Section titles ── */
  sectionTitleSolo: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy, margin: 12, marginBottom: 8 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 12, marginTop: 14, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  sectionAction: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.blue },

  /* ── Quick actions (upcoming) ── */
  quickRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 20 },
  quickCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: Radii.lg, padding: 13,
    alignItems: 'center', ...Shadows.card,
  },
  quickEmoji: { fontSize: 22 },
  quickLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy, marginTop: 5 },

  /* ── Tile grid (active) ── */
  tileRow: { flexDirection: 'row', gap: 10, marginHorizontal: 12, marginBottom: 10 },
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
  badgeDone: { backgroundColor: 'rgba(255,255,255,0.25)' },
  badgeWait: { backgroundColor: 'rgba(255,255,255,0.15)' },
  statusTxt: { fontSize: 9, fontFamily: 'Nunito_800ExtraBold', color: 'rgba(255,255,255,0.7)' },
  statusTxtWhite: { color: '#fff' },

  /* Tile content */
  tileCat: { fontSize: 10, fontFamily: 'Nunito_900Black', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, marginTop: 8 },
  tileLevel: { fontSize: 18, fontFamily: 'Nunito_900Black', color: '#fff', marginTop: 2 },
  tileInfo: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  tileProgBg: { height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 8 },
  tileProgFill: { height: 3, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 2 },
  tileWatermark: { position: 'absolute', fontSize: 48, right: -4, bottom: -8, opacity: 0.12 },

  /* Add card */
  addCard: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.gray,
    borderRadius: Radii.lg, padding: 13, marginHorizontal: 12,
    alignItems: 'center', backgroundColor: '#fff',
  },
  addTxt: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, marginTop: 3 },
});
