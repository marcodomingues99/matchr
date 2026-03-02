import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, Tournament, Vertente } from '../types';
import { mockTournaments } from '../mock/data';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList, 'Home'>;

/* ── Logo reference ──────────────────────────────────────── */
const logo = require('../../assets/logo.png');

/* ── Chip helpers ────────────────────────────────────────── */
const chipBg = (type: string) => {
  if (type === 'M') return '#2563EB';
  if (type === 'F') return '#E8346E';
  return '#7C3AED'; // MX
};

/** Show level (M5, F4…) unless it's 'Sem', then just show type letter */
const chipLabel = (v: Vertente) =>
  v.level === 'Sem' ? v.type : v.level;

/** Pastel chip background for active card (white body) */
const chipBgPastel = (type: string) => {
  if (type === 'M') return '#E3ECFF';
  if (type === 'F') return '#F3E8FF';
  return '#FFF0E3'; // MX
};

/** Colored text for pastel chips */
const chipTextPastel = (type: string) => {
  if (type === 'M') return Colors.blue;
  if (type === 'F') return '#9B30FF';
  return Colors.orange; // MX
};

/* ═════════════════════════════════════════════════════════════
   HomeScreen
   ═════════════════════════════════════════════════════════════ */
export const HomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const tournaments = mockTournaments;

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

  /* ── Group by status ── */
  const active = tournaments.filter((t) => t.status === 'active');
  const upcoming = tournaments.filter((t) => t.status === 'upcoming');
  const finished = tournaments.filter((t) => t.status === 'finished');

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
      >
        {/* Em Curso */}
        {active.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>Em Curso</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Ao vivo</Text>
              </View>
            </View>
            {active.map((t) => (
              <ActiveCard key={t.id} t={t} nav={navigation} />
            ))}
          </>
        )}

        {/* Próximos */}
        {upcoming.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: Spacing.sm }]}>Próximos</Text>
            {upcoming.map((t) => (
              <CompactCard key={t.id} t={t} nav={navigation} />
            ))}
          </>
        )}

        {/* Concluídos */}
        {finished.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: Spacing.sm }]}>Concluídos</Text>
            {finished.map((t) => (
              <CompactCard key={t.id} t={t} nav={navigation} />
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

/* ═════════════════════════════════════════════════════════════
   Active card  (gradient, progress bar)
   ═════════════════════════════════════════════════════════════ */
const ActiveCard = ({ t, nav }: { t: Tournament; nav: Nav }) => {
  const progress = 0.55;
  const currentDay = 2;
  const totalDays = 3;
  const roundLabel = 'Quartos de final';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{ marginBottom: Spacing.lg }}
      onPress={() => nav.navigate('TournamentDetail', { tournamentId: t.id })}
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
              <View key={v.id} style={[styles.chip, { backgroundColor: chipBgPastel(v.type) }]}>
                <Text style={[styles.chipText, { color: chipTextPastel(v.type) }]}>
                  {chipLabel(v)}
                </Text>
              </View>
            ))}
            <View style={[styles.chip, { backgroundColor: '#DFFAEE' }]}>
              <Text style={[styles.chipText, { color: '#1A7A4A' }]}>
                Dia {currentDay}/{totalDays}
              </Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[Colors.blue, Colors.teal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress * 100}%` as any }]}
            />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {t.vertentes.length} sub torneios · {roundLabel}
            </Text>
            <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* ═════════════════════════════════════════════════════════════
   Compact card  (white, icon on left)
   ═════════════════════════════════════════════════════════════ */
const CompactCard = ({ t, nav }: { t: Tournament; nav: Nav }) => {
  const target = t.status === 'upcoming' ? 'UpcomingTournament' : t.status === 'finished' ? 'FinishedTournament' : 'TournamentDetail';
  const isFinished = t.status === 'finished';

  return (
    <TouchableOpacity
      style={[styles.compactCard, isFinished && styles.compactCardFinished]}
      activeOpacity={0.85}
      onPress={() => nav.navigate(target, { tournamentId: t.id })}
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
          colors={['#FF7A1A', '#FFD600']}
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
          {t.vertentes.map((v) => (
            <View
              key={v.id}
              style={[
                styles.chipSmall,
                { backgroundColor: isFinished ? Colors.gray : chipBg(v.type) },
              ]}
            >
              <Text
                style={[
                  styles.chipSmallText,
                  isFinished && { color: 'rgba(255,255,255,0.8)' },
                ]}
              >
                {chipLabel(v)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
  appName: { color: '#fff', fontSize: 24, fontFamily: 'Nunito_900Black', lineHeight: 28 },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    marginTop: 1,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newBtn: {
    backgroundColor: '#22C97A',
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  newBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },

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
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.red },
  liveText: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.blue },

  /* ── Active card ── */
  activeCardOuter: {
    backgroundColor: '#fff',
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
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Nunito_900Black',
    flex: 1,
    zIndex: 1,
  },
  activeBannerEmoji: {
    position: 'absolute',
    fontSize: 50,
    opacity: 0.15,
    right: 12,
    bottom: -6,
  },
  activeCardBody: {
    padding: Spacing.md,
    paddingHorizontal: 13,
  },
  activeSub: {
    color: Colors.muted,
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 6,
  },

  /* ── Chips ── */
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  chip: {
    borderRadius: Radii.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  chipText: { color: '#fff', fontSize: 11, fontFamily: 'Nunito_800ExtraBold' },

  chipsRowSmall: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  chipSmall: {
    borderRadius: Radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipSmallText: { color: '#fff', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },

  /* ── Progress ── */
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  progressLabel: {
    color: Colors.muted,
    fontSize: 10,
    fontFamily: 'Nunito_600SemiBold',
  },
  progressPct: { color: Colors.blue, fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },
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
    backgroundColor: '#fff',
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
  compactName: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  compactSub: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: '#64748B',
    marginTop: 2,
  },

  /* ── Compact card – finished (muted) ── */
  compactCardFinished: { opacity: 0.65 },
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
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Nunito_900Black',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  emptyBtn: {
    backgroundColor: '#1A3A6B',
    borderRadius: Radii.lg,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  emptyBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
});
