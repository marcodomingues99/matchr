import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Typography, Spacing, Radii, Shadows } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { GAME_STATUS, VERTENTE_STATUS, STATUS_COLOR, STATUS_LABEL, getMinTeamsToStart } from '../utils/constants';
import { LiveDot } from '../components/LiveDot';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'VertenteHub'>;

const ICON_BG: Record<string, string> = {
  '👥': Colors.blueBg,
  '📊': Colors.greenBgLight,
  '🏆': Colors.orangeBg,
  '🥇': Colors.purpleBg,
  '📥': Colors.gbg,
};

const PROGRESS_GRAD: Record<string, readonly [string, string]> = {
  '👥': [Colors.blue, Colors.teal],
  '📊': [Colors.green, Colors.greenDark],
  '🏆': [Colors.orange, Colors.yellow],
  '🥇': [Colors.purple, Colors.pink],
  '📥': [Colors.gray, Colors.gray],
};

export const VertenteHubScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);
  if (!tournament || !vertente) return null;

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const minTeamsToStart = getMinTeamsToStart(vertente);

  const { vertenteGames, finishedGames, liveGames, allGamesFinished, bracketPct } = useMemo(() => {
    const teamIds = new Set(vertente.teams.map(t => t.id));
    const all = mockGames.filter(g => teamIds.has(g.team1.id) && teamIds.has(g.team2.id));
    const finished = all.filter(g => g.status === GAME_STATUS.FINISHED || g.status === GAME_STATUS.WALKOVER);
    const live = all.filter(g => g.status === GAME_STATUS.LIVE);
    const bracket = all.filter(g => g.phase !== 'groups');
    const bracketDone = bracket.filter(g => g.status === GAME_STATUS.FINISHED || g.status === GAME_STATUS.WALKOVER);
    return {
      vertenteGames: all,
      finishedGames: finished,
      liveGames: live,
      allGamesFinished: all.length > 0 && all.every(g => g.status === GAME_STATUS.FINISHED || g.status === GAME_STATUS.WALKOVER),
      bracketPct: bracket.length > 0 ? Math.round(bracketDone.length / bracket.length * 100) : 0,
    };
  }, [vertente.teams]);

  const confirmedTeams = vertente.teams.filter(t => !t.withdrawn);
  const teamFillPct = Math.round(confirmedTeams.length / vertente.maxTeams * 100);
  const gamesPct = vertenteGames.length > 0 ? Math.round(finishedGames.length / vertenteGames.length * 100) : 0;

  const isLive = vertente.status === VERTENTE_STATUS.GROUPS || vertente.status === VERTENTE_STATUS.BRACKET;

  interface MenuItem {
    icon: string;
    title: string;
    sub: string;
    progress: number;
    live?: number;
    onPress: () => void;
    enabled: boolean;
  }

  const menuItems: MenuItem[] = [
    {
      icon: '👥', title: 'Duplas',
      sub: `${confirmedTeams.length}/${vertente.maxTeams} inscritas`,
      progress: teamFillPct,
      onPress: () => navigation.navigate('TeamList', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: true,
    },
    {
      icon: '📊', title: 'Fase de Grupos',
      sub: vertenteGames.length > 0
        ? `${finishedGames.length}/${vertenteGames.length} jogos concluídos`
        : 'Gerir fase de grupos',
      progress: gamesPct,
      live: liveGames.length,
      onPress: () => navigation.navigate(
        vertenteGames.length > 0 ? 'GroupsTable' : 'GroupsEmpty',
        { tournamentId: tournament.id, vertenteId: vertente.id },
      ),
      enabled: vertente.status !== VERTENTE_STATUS.CONFIG && vertente.teams.filter(t => !t.withdrawn).length >= minTeamsToStart,
    },
    {
      icon: '🏆', title: 'Bracket Eliminatória',
      sub: 'Fases finais e quadro eliminatório',
      progress: vertente.status === VERTENTE_STATUS.FINISHED ? 100 : vertente.status === VERTENTE_STATUS.BRACKET ? bracketPct : 0,
      onPress: () => navigation.navigate('Bracket', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: vertente.status === VERTENTE_STATUS.BRACKET || vertente.status === VERTENTE_STATUS.FINISHED,
    },
    {
      icon: '🥇', title: 'Pódio',
      sub: 'Classificação final do torneio',
      progress: vertente.status === VERTENTE_STATUS.FINISHED ? 100 : 0,
      onPress: () => navigation.navigate('Podium', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: vertente.status === VERTENTE_STATUS.FINISHED,
    },
    {
      icon: '📥', title: 'Exportar',
      sub: 'Jogos, duplas, classificações',
      progress: -1, // no progress bar
      onPress: () => navigation.navigate('Export', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: true,
    },
  ];


  return (
    <View style={s.container}>
      {/* ═══ HEADER ═══ */}
      <LinearGradient
        colors={VERTENTE_CONFIG[vertente.type].gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        {/* Decorative circle overlay */}
        <View style={s.headerCircle} />
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={tournament.name}
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>
            {VERTENTE_CONFIG[vertente.type].label} {vertente.level}
          </Text>
          <View style={s.statusRow}>
            <View style={s.statusChip}>
              <View style={[s.statusDot, { backgroundColor: STATUS_COLOR[vertente.status] }]} />
              <Text style={s.statusChipTxt}>{STATUS_LABEL[vertente.status]}</Text>
            </View>
            {isLive && liveGames.length > 0 && (
              <View style={s.liveChip}>
                <LiveDot />
                <Text style={s.liveTxt}>Ao vivo</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} colors={[Colors.blue]} />
        }
      >
        {/* ═══ CONFIGURAÇÃO ═══ */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Configuração</Text>
          {vertente.status === VERTENTE_STATUS.CONFIG && (
            <TouchableOpacity onPress={() => navigation.navigate('EditTournament', { tournamentId: tournament.id })}>
              <Text style={s.sectionAction}>✏️ Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: Colors.blue }]}>{confirmedTeams.length}</Text>
            <Text style={s.statLbl}>duplas</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: Colors.orange }]}>{vertente.courts}</Text>
            <Text style={s.statLbl}>courts</Text>
          </View>
        </View>

        {/* ═══ ESTADO ACTUAL ═══ */}
        <View style={[s.sectionHeader, { marginTop: 18 }]}>
          <Text style={s.sectionTitle}>Estado actual</Text>
        </View>

        {/* Add team CTA */}
        {vertente.status === VERTENTE_STATUS.CONFIG && (
          <TouchableOpacity
            style={s.addTeamBtn}
            onPress={() => navigation.navigate('AddTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}
            activeOpacity={0.85}
          >
            <LinearGradient colors={Gradients.primary} style={s.addTeamGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={s.addTeamIcon}>👥</Text>
              <Text style={s.addTeamTxt}>+ Adicionar Dupla</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Navigation cards */}
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={item.title}
            style={[s.navCard, !item.enabled && s.navCardDisabled]}
            onPress={item.onPress}
            disabled={!item.enabled}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${item.sub}${item.live ? `, ${item.live} ao vivo` : ''}`}
            accessibilityState={{ disabled: !item.enabled }}
            accessibilityHint={item.enabled ? `Abrir ${item.title}` : 'Bloqueado'}
          >
            {/* Icon box */}
            <View style={[s.iconBox, { backgroundColor: item.enabled ? ICON_BG[item.icon] : Colors.gl }]}>
              <Text style={s.iconEmoji}>{item.icon}</Text>
              {!item.enabled && <View style={s.iconLock}><Text style={s.iconLockTxt}>🔒</Text></View>}
            </View>
            {/* Content */}
            <View style={s.navCardContent}>
              <Text style={[s.navCardTitle, !item.enabled && s.navCardTitleDisabled]}>{item.title}</Text>
              {item.progress >= 0 && item.enabled && (
                <View style={s.miniProgress}>
                  <LinearGradient
                    colors={PROGRESS_GRAD[item.icon]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[s.miniProgressFill, { width: `${Math.max(item.progress, 2)}%` as `${number}%` }]}
                  />
                </View>
              )}
              <View style={s.navCardSubRow}>
                <Text style={s.navCardSub} numberOfLines={1}>{item.sub}</Text>
                {item.live != null && item.live > 0 && (
                  <View style={s.liveIndicator}>
                    <LiveDot />
                    <Text style={s.liveCountTxt}>{item.live} ao vivo</Text>
                  </View>
                )}
              </View>
            </View>
            {/* Chevron */}
            <Text style={[s.chevron, !item.enabled && s.chevronDisabled]}>›</Text>
          </TouchableOpacity>
        ))}

        {/* ═══ PHASE ACTIONS ═══ */}
        {vertente.status === VERTENTE_STATUS.CONFIG && confirmedTeams.length >= minTeamsToStart && (
          <TouchableOpacity
            style={s.phaseBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('GroupsEmpty', { tournamentId: tournament.id, vertenteId: vertente.id })}
          >
            <LinearGradient colors={Gradients.green} style={s.phaseGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={s.phaseIcon}>🚀</Text>
              <Text style={s.phaseTxt}>Iniciar Fase de Grupos</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {vertente.status === VERTENTE_STATUS.GROUPS && allGamesFinished && (
          <TouchableOpacity
            style={s.phaseBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ConfirmCloseTournament', { tournamentId: tournament.id, vertenteId: vertente.id })}
          >
            <LinearGradient colors={Gradients.green} style={s.phaseGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={s.phaseIcon}>🏁</Text>
              <Text style={s.phaseTxt}>Fechar Categoria</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 36 }} />
      </ScrollView>
      <HomeFAB onPress={() => navigation.goBack()} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },

  /* ── Header ── */
  header: { paddingHorizontal: Spacing.lg, paddingBottom: 22, position: 'relative', overflow: 'hidden' },
  headerCircle: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -48, right: -28,
  },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusChipTxt: { color: 'rgba(255,255,255,0.9)', fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily },
  liveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  liveTxt: { color: 'rgba(255,255,255,0.8)', fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBold },

  /* ── Scroll ── */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },

  /* ── Section headers ── */
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
  sectionAction: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBold, color: Colors.blue },

  /* ── Stat cards ── */
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md,
    alignItems: 'center', ...Shadows.card,
  },
  statNum: { fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack },
  statLbl: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilyBold, color: Colors.muted, marginTop: 2 },


  /* ── Add team CTA ── */
  addTeamBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: 10 },
  addTeamGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, gap: Spacing.xs },
  addTeamIcon: { fontSize: 16 },
  addTeamTxt: { color: Colors.white, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily },

  /* ── Navigation cards ── */
  navCard: {
    backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginBottom: 8, ...Shadows.card,
  },
  navCardDisabled: { opacity: 0.4 },
  iconBox: {
    width: 40, height: 40, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  iconEmoji: { fontSize: 18 },
  iconLock: {
    position: 'absolute', width: 40, height: 40, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center',
  },
  iconLockTxt: { fontSize: 12 },
  navCardContent: { flex: 1 },
  navCardTitle: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
  navCardTitleDisabled: { color: Colors.muted },
  miniProgress: { height: 4, backgroundColor: Colors.gl, borderRadius: 2, marginTop: 5 },
  miniProgressFill: { height: 4, borderRadius: 2 },
  navCardSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  navCardSub: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, flexShrink: 1 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveCountTxt: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily, color: Colors.red },
  chevron: { fontSize: Typography.fontSize.xxxl, color: Colors.gray, fontFamily: Typography.fontFamilyRegular },
  chevronDisabled: { color: Colors.gl },

  /* ── Phase buttons ── */
  phaseBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginTop: 10, marginBottom: 6 },
  phaseGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, gap: 8 },
  phaseIcon: { fontSize: 16 },
  phaseTxt: { color: Colors.white, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBlack },
});
