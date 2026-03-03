import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Tournament, Vertente } from '../types';
import { mockTournaments } from '../mock/data';
import { Colors, Gradients, Typography, Spacing, Radii, Shadows } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { LiveDot } from '../components/LiveDot';
import { parseDatePt, STATUS_LABEL, PHASE_WEIGHT, PHASE_ORDER } from '../utils/constants';

type Nav = StackNavigationProp<RootStackParamList, 'Home'>;

/* ── Logo reference ──────────────────────────────────────── */
const logo = require('../../assets/logo.png');

/** Show level (M5, F4…) unless it's 'Sem', then just show type letter */
const chipLabel = (v: Vertente) =>
  v.level === 'Sem' ? v.type : v.level;

/* ═════════════════════════════════════════════════════════════
   HomeScreen
   ═════════════════════════════════════════════════════════════ */
export const HomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const tournaments = mockTournaments;
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const active   = React.useMemo(() => tournaments.filter(t => t.status === 'active'),   [tournaments]);
  const upcoming = React.useMemo(() => tournaments.filter(t => t.status === 'upcoming'), [tournaments]);
  const finished = React.useMemo(() => tournaments.filter(t => t.status === 'finished'), [tournaments]);

  /* ── Empty state ── */
  if (tournaments.length === 0) {
    return (
      <LinearGradient colors={Gradients.header} style={styles.flex1}>
        <SafeAreaView style={styles.emptySafe}>
          {/* Header row */}
          <View style={styles.emptyHeaderRow}>
            <View style={styles.headerLeft}>
              <Image source={logo} style={styles.logoSmall} />
              <View>
                <Text style={styles.appName}>Matchr</Text>
                <Text style={styles.headerSub}>Os teus torneios</Text>
              </View>
            </View>
          </View>

          {/* Center content */}
          <View style={styles.emptyCenter}>
            <View style={styles.emptyIconBox}>
              <Image source={logo} style={styles.emptyLogo} />
            </View>
            <Text style={styles.emptyTitle}>Ainda sem torneios</Text>
            <Text style={styles.emptySubtitle}>
              Cria o teu primeiro torneio e começa a gerir{'\n'}grupos, brackets
              e resultados.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CreateTournament')}
            >
              <Text style={styles.emptyBtnText}>+ Criar primeiro torneio</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.flex1}>
      {/* ── Header ── */}
      <LinearGradient colors={Gradients.header} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Image source={logo} style={styles.logoSmall} />
              <View>
                <Text style={styles.appName}>Matchr</Text>
                <Text style={styles.headerSub}>Os teus torneios</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.newBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('CreateTournament')}
              >
                <Text style={styles.newBtnText}>+ Novo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Content ── */}
      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} colors={[Colors.blue]} />
        }
      >
        {/* Em Curso */}
        {active.length > 0 && (
          <>
            <View style={styles.sectionRow} accessibilityRole="header">
              <Text style={styles.sectionLabel}>Em Curso</Text>
              <View style={styles.liveBadge} accessibilityLabel="Torneios ao vivo">
                <LiveDot size={8} color={Colors.red} />
                <Text style={styles.liveText}>Ao vivo</Text>
              </View>
            </View>
            {active.map((t, i) => (
              <ActiveCard key={t.id} t={t} nav={navigation} />
            ))}
          </>
        )}

        {/* Próximos */}
        {upcoming.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: Spacing.sm }]} accessibilityRole="header">Próximos</Text>
            {upcoming.map((t, i) => (
              <CompactCard key={t.id} t={t} nav={navigation} />
            ))}
          </>
        )}

        {/* Concluídos */}
        {finished.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: Spacing.sm }]} accessibilityRole="header">Concluídos</Text>
            {finished.map((t, i) => (
              <CompactCard key={t.id} t={t} nav={navigation} />
            ))}
          </>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
};

/* ═════════════════════════════════════════════════════════════
   Active card  (gradient, progress bar)
   ═════════════════════════════════════════════════════════════ */
const ActiveCard = React.memo(({ t, nav }: { t: Tournament; nav: Nav }) => {
  // Compute tournament day info
  const start = parseDatePt(t.startDate);
  const end = parseDatePt(t.endDate);
  const now = new Date();
  const totalDays = start && end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1) : 1;
  const currentDay = start ? Math.min(totalDays, Math.max(1, Math.round((now.getTime() - start.getTime()) / 86400000) + 1)) : 1;

  // Compute progress from vertente statuses
  const progress = t.vertentes.length > 0
    ? t.vertentes.reduce((sum, v) => sum + (PHASE_WEIGHT[v.status] ?? 0), 0) / t.vertentes.length
    : 0;

  // Most advanced phase label
  const maxPhase = t.vertentes.reduce<string>((best, v) => {
    const idx = PHASE_ORDER.indexOf(v.status);
    return idx > PHASE_ORDER.indexOf(best as typeof v.status) ? v.status : best;
  }, PHASE_ORDER[0]);
  const roundLabel = STATUS_LABEL[maxPhase] ?? 'Em preparação';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{ marginBottom: Spacing.lg }}
      onPress={() => nav.navigate('TournamentDetail', { tournamentId: t.id })}
      accessibilityRole="button"
      accessibilityLabel={`Torneio ${t.name}, ${t.location}, ${roundLabel}, ${Math.round(progress * 100)}% concluído`}
      accessibilityHint="Toca para ver detalhes do torneio"
    >
      <View style={styles.activeCardOuter}>
        {/* Banner: photo or gradient */}
        <ImageBackground
          source={t.photo ? { uri: t.photo } : undefined}
          style={styles.activeBanner}
          imageStyle={{ resizeMode: 'cover' }}
        >
          <LinearGradient
            colors={t.photo
              ? ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.25)']
              : [Colors.navy, Colors.blue, Colors.teal]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.activeBannerTitle}>{t.name}</Text>
          <Text style={styles.activeBannerEmoji}>🏆</Text>
        </ImageBackground>

        {/* White body */}
        <View style={styles.activeCardBody}>
          <Text style={styles.activeSub}>
            📍 {t.location} · {t.startDate}–{t.endDate}
          </Text>

          {/* Chips */}
          <View style={styles.chipsRow}>
            {t.vertentes.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.chip, { backgroundColor: VERTENTE_CONFIG[v.type].chipBg }]}
                activeOpacity={0.7}
                onPress={() => nav.navigate('VertenteHub', { tournamentId: t.id, vertenteId: v.id })}
              >
                <Text style={[styles.chipText, { color: VERTENTE_CONFIG[v.type].chipText }]}>
                  {chipLabel(v)}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={[styles.chip, { backgroundColor: Colors.greenBgLight }]}>
              <Text style={[styles.chipText, { color: Colors.greenDeep }]}>
                Dia {currentDay}/{totalDays}
              </Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={Gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%` }]}
            />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {t.vertentes.length} categorias · {roundLabel}
            </Text>
            <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

/* ═════════════════════════════════════════════════════════════
   Compact card  (white, icon on left)
   ═════════════════════════════════════════════════════════════ */
const CompactCard = React.memo(({ t, nav }: { t: Tournament; nav: Nav }) => {
  const target = t.status === 'upcoming' ? 'UpcomingTournament' : t.status === 'finished' ? 'FinishedTournament' : 'TournamentDetail';
  const isFinished = t.status === 'finished';

  return (
    <TouchableOpacity
      style={[styles.compactCard, isFinished && styles.compactCardFinished]}
      activeOpacity={0.85}
      onPress={() => nav.navigate(target, { tournamentId: t.id })}
      accessibilityRole="button"
      accessibilityLabel={`Torneio ${t.name}, ${t.location}${isFinished ? ', concluído' : ''}`}
      accessibilityHint="Toca para ver detalhes do torneio"
    >
      {/* Round icon */}
      {t.photo ? (
        <View style={[styles.compactIcon, { overflow: 'hidden' }]}>
          <Image source={{ uri: t.photo }} style={{ width: 46, height: 46, resizeMode: 'cover' }} />
        </View>
      ) : isFinished ? (
        <View style={[styles.compactIcon, styles.compactIconFinished]}>
          <Image source={logo} style={[styles.compactLogo, { opacity: 0.4 }]} />
        </View>
      ) : (
        <LinearGradient
          colors={[Colors.orange, Colors.yellow]}
          style={styles.compactIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Image source={logo} style={styles.compactLogo} />
        </LinearGradient>
      )}

      {/* Info */}
      <View style={styles.compactInfo}>
        <Text style={[styles.compactName, isFinished && styles.compactNameFinished]}>
          {t.name}
        </Text>
        <Text style={[styles.compactSub, isFinished && styles.compactSubFinished]}>
          📍 {t.location} · {t.startDate}
          {t.endDate !== t.startDate ? `–${t.endDate}` : ''}
        </Text>
        <View style={styles.chipsRowSmall}>
          {t.vertentes.map((v) => isFinished ? (
            <View
              key={v.id}
              style={[styles.chipSmall, { backgroundColor: Colors.gray }]}
            >
              <Text style={[styles.chipSmallText, { color: 'rgba(255,255,255,0.8)' }]}>
                {chipLabel(v)}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              key={v.id}
              style={[styles.chipSmall, { backgroundColor: VERTENTE_CONFIG[v.type].color }]}
              activeOpacity={0.7}
              onPress={() => nav.navigate('VertenteHub', { tournamentId: t.id, vertenteId: v.id })}
            >
              <Text style={styles.chipSmallText}>
                {chipLabel(v)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chevron */}
      <Text style={[styles.compactChevron, isFinished && styles.compactChevronFinished]}>›</Text>
    </TouchableOpacity>
  );
});

/* ═════════════════════════════════════════════════════════════
   Styles
   ═════════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  flex1: { flex: 1, backgroundColor: Colors.gbg },

  /* ── Header ── */
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoSmall: { width: 34, height: 34, resizeMode: 'contain' },
  appName: { color: Colors.white, fontSize: 24, fontFamily: Typography.fontFamilyBlack, lineHeight: 28 },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamilySemiBold,
    marginTop: 1,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newBtn: {
    backgroundColor: Colors.green,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  newBtnText: { color: Colors.white, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily },

  /* ── Scroll ── */
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  /* ── Section labels ── */
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily,
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  liveText: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.blue },

  /* ── Active card ── */
  activeCardOuter: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    ...Shadows.card,
  },
  activeBanner: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  activeBannerTitle: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamilyBlack,
    flex: 1,
    zIndex: 1,
  },
  activeBannerEmoji: {
    position: 'absolute',
    fontSize: 50,
    opacity: 0.08,
    right: 12,
    bottom: 4,
  },
  activeCardBody: {
    padding: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  activeSub: {
    color: Colors.muted,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilySemiBold,
    marginBottom: 6,
  },

  /* ── Chips ── */
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  chip: {
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  chipText: { color: Colors.white, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily },

  chipsRowSmall: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  chipSmall: {
    borderRadius: Radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipSmallText: { color: Colors.white, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily },

  /* ── Progress ── */
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  progressLabel: {
    color: Colors.muted,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamilySemiBold,
  },
  progressPct: { color: Colors.blue, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gl,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: { height: '100%', borderRadius: 2 },

  /* ── Compact card ── */
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  compactIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  compactLogo: { width: 26, height: 26, resizeMode: 'contain' },
  compactInfo: { flex: 1 },
  compactName: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily, color: Colors.navy },
  compactSub: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamilySemiBold,
    color: Colors.graySlate,
    marginTop: 2,
  },

  compactChevron: { fontSize: Typography.fontSize.xxxl, color: Colors.gray, fontFamily: Typography.fontFamilyRegular, marginLeft: 4 },
  compactChevronFinished: { color: Colors.gl },

  /* ── Compact card – finished (muted) ── */
  compactCardFinished: { opacity: 0.7 },
  compactIconFinished: { backgroundColor: Colors.gl },
  compactNameFinished: { color: Colors.muted },
  compactSubFinished: { color: Colors.gray },

  /* ── Empty state ── */
  emptySafe: { flex: 1 },
  emptyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconBox: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radii.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyLogo: { width: 56, height: 56, resizeMode: 'contain' },
  emptyTitle: {
    color: Colors.white,
    fontSize: Typography.fontSize.xxxl,
    fontFamily: Typography.fontFamilyBlack,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamilySemiBold,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  emptyBtn: {
    backgroundColor: Colors.navyDark,
    borderRadius: Radii.lg,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  emptyBtnText: { color: Colors.white, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily },
});
