import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'VertenteHub'>;

/* ── Pulsing live dot ── */
const LiveDot = () => {
  const opacity = React.useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);
  return <Animated.View style={[s.liveDot, { opacity }]} />;
};

export const VertenteHubScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];

  const statusLabel: Record<string, string> = { config: 'A configurar', groups: 'Fase de grupos', bracket: 'Bracket', finished: 'Concluído' };
  const statusColor: Record<string, string> = { config: Colors.orange, groups: Colors.blue, bracket: Colors.teal, finished: Colors.green };

  const vertenteTeamIds = new Set(vertente.teams.map(t => t.id));
  const vertenteGames = mockGames.filter(
    g => vertenteTeamIds.has(g.team1.id) || vertenteTeamIds.has(g.team2.id),
  );
  const finishedGames = vertenteGames.filter(g => g.status === 'finished' || g.status === 'walkover');
  const liveGames = vertenteGames.filter(g => g.status === 'live');
  const allGamesFinished =
    vertenteGames.length > 0 &&
    vertenteGames.every(g => g.status === 'finished' || g.status === 'walkover');
  const teamFillPct = Math.round(vertente.teams.length / vertente.maxTeams * 100);
  const gamesPct = vertenteGames.length > 0 ? Math.round(finishedGames.length / vertenteGames.length * 100) : 0;

  const isLive = vertente.status === 'groups' || vertente.status === 'bracket';

  /* ── Card definitions ── */
  const iconBg: Record<string, string> = { '👥': '#E3ECFF', '📊': '#DFFAEE', '🏆': '#FFF0E3', '🥇': '#F5EAFF', '📥': Colors.gbg };
  const progressGrad: Record<string, string[]> = {
    '👥': [Colors.blue, Colors.teal],
    '📊': [Colors.green, '#00AA66'],
    '🏆': [Colors.orange, Colors.yellow],
    '🥇': ['#9B30FF', '#D4006A'],
    '📥': [],
  };

  const menuItems = [
    {
      icon: '👥', title: 'Duplas',
      sub: `${vertente.teams.length}/${vertente.maxTeams} inscritas`,
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
      enabled: vertente.status !== 'config',
    },
    {
      icon: '🏆', title: 'Bracket Eliminatória',
      sub: 'Fases finais e quadro eliminatório',
      progress: vertente.status === 'finished' ? 100 : vertente.status === 'bracket' ? 35 : 0,
      onPress: () => navigation.navigate('Bracket', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: vertente.status === 'bracket' || vertente.status === 'finished',
    },
    {
      icon: '🥇', title: 'Pódio',
      sub: 'Classificação final do torneio',
      progress: vertente.status === 'finished' ? 100 : 0,
      onPress: () => navigation.navigate('Podium', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: vertente.status === 'finished',
    },
    {
      icon: '📥', title: 'Exportar',
      sub: 'Jogos, duplas, classificações',
      progress: -1, // no progress bar
      onPress: () => navigation.navigate('Export', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: true,
    },
  ];

  const vertGradients: Record<string, string[]> = {
    M: [Colors.navy, Colors.blue, Colors.teal],
    F: ['#8B0050', '#D4006A', '#FF6B9D'],
    MX: ['#5C3A00', '#C87800', '#FFB347'],
  };

  return (
    <View style={s.container}>
      {/* ═══ HEADER ═══ */}
      <LinearGradient
        colors={vertGradients[vertente.type] as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        {/* Decorative circle overlay */}
        <View style={s.headerCircle} />
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={tournament.name}
            onBack={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>
            {vertente.type === 'M' ? 'Masculino' : vertente.type === 'F' ? 'Feminino' : 'Misto'} {vertente.level}
          </Text>
          <View style={s.statusRow}>
            <View style={s.statusChip}>
              <View style={[s.statusDot, { backgroundColor: statusColor[vertente.status] }]} />
              <Text style={s.statusChipTxt}>{statusLabel[vertente.status]}</Text>
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

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {/* ═══ CONFIGURAÇÃO ═══ */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Configuração</Text>
          {vertente.status === 'config' && (
            <TouchableOpacity>
              <Text style={s.sectionAction}>✏️ Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: Colors.blue }]}>{vertente.teams.length}</Text>
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
        {vertente.status === 'config' && (
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
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={[s.navCard, !item.enabled && s.navCardDisabled]}
            onPress={item.onPress}
            disabled={!item.enabled}
            activeOpacity={0.7}
          >
            {/* Icon box */}
            <View style={[s.iconBox, { backgroundColor: item.enabled ? iconBg[item.icon] : Colors.gl }]}>
              <Text style={s.iconEmoji}>{item.icon}</Text>
              {!item.enabled && <View style={s.iconLock}><Text style={s.iconLockTxt}>🔒</Text></View>}
            </View>
            {/* Content */}
            <View style={s.navCardContent}>
              <Text style={[s.navCardTitle, !item.enabled && s.navCardTitleDisabled]}>{item.title}</Text>
              {item.progress >= 0 && item.enabled && (
                <View style={s.miniProgress}>
                  <LinearGradient
                    colors={progressGrad[item.icon].length > 0 ? progressGrad[item.icon] : [Colors.gray, Colors.gray]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[s.miniProgressFill, { width: `${Math.max(item.progress, 2)}%` as any }]}
                  />
                </View>
              )}
              <View style={s.navCardSubRow}>
                <Text style={s.navCardSub} numberOfLines={1}>{item.sub}</Text>
                {'live' in item && (item as any).live > 0 && (
                  <View style={s.liveIndicator}>
                    <LiveDot />
                    <Text style={s.liveCountTxt}>{(item as any).live} ao vivo</Text>
                  </View>
                )}
              </View>
            </View>
            {/* Chevron */}
            <Text style={[s.chevron, !item.enabled && s.chevronDisabled]}>›</Text>
          </TouchableOpacity>
        ))}

        {/* ═══ PHASE ACTIONS ═══ */}
        {vertente.status === 'config' && vertente.teams.length >= 4 && (
          <TouchableOpacity style={s.phaseBtn} activeOpacity={0.85}>
            <LinearGradient colors={[Colors.green, '#00AA66']} style={s.phaseGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={s.phaseIcon}>🚀</Text>
              <Text style={s.phaseTxt}>Iniciar Fase de Grupos</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {vertente.status === 'groups' && !allGamesFinished && (
          <TouchableOpacity style={s.phaseBtn} activeOpacity={0.85}>
            <LinearGradient colors={Gradients.primary} style={s.phaseGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={s.phaseIcon}>🏆</Text>
              <Text style={s.phaseTxt}>Avançar para Bracket</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {vertente.status === 'groups' && allGamesFinished && (
          <TouchableOpacity
            style={s.phaseBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ConfirmCloseTournament', { tournamentId: tournament.id, vertenteId: vertente.id })}
          >
            <LinearGradient colors={[Colors.green, '#00AA66']} style={s.phaseGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={s.phaseIcon}>🏁</Text>
              <Text style={s.phaseTxt}>Fechar Sub-torneio</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 36 }} />
      </ScrollView>
      <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },

  /* ── Header ── */
  header: { paddingHorizontal: 18, paddingBottom: 22, position: 'relative', overflow: 'hidden' },
  headerCircle: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -48, right: -28,
  },
  backBtn: { marginBottom: 10 },
  back: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8 },
  title: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black', marginTop: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusChipTxt: { color: '#fff', fontSize: 11, fontFamily: 'Nunito_800ExtraBold' },
  liveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.red },
  liveTxt: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'Nunito_700Bold' },

  /* ── Scroll ── */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 14, paddingBottom: 8 },

  /* ── Section headers ── */
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  sectionAction: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.blue },

  /* ── Stat cards ── */
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md,
    alignItems: 'center', ...Shadows.card,
  },
  statNum: { fontSize: 22, fontFamily: 'Nunito_900Black' },
  statLbl: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: Colors.muted, marginTop: 2 },


  /* ── Add team CTA ── */
  addTeamBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: 10 },
  addTeamGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, gap: 6 },
  addTeamIcon: { fontSize: 16 },
  addTeamTxt: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },

  /* ── Navigation cards ── */
  navCard: {
    backgroundColor: '#fff', borderRadius: Radii.lg, padding: 13,
    flexDirection: 'row', alignItems: 'center', gap: 12,
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
  navCardTitle: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  navCardTitleDisabled: { color: Colors.muted },
  miniProgress: { height: 4, backgroundColor: Colors.gl, borderRadius: 2, marginTop: 5 },
  miniProgressFill: { height: 4, borderRadius: 2 },
  navCardSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  navCardSub: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, flexShrink: 1 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveCountTxt: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.red },
  chevron: { fontSize: 22, color: Colors.gray, fontFamily: 'Nunito_400Regular' },
  chevronDisabled: { color: Colors.gl },

  /* ── Phase buttons ── */
  phaseBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginTop: 10, marginBottom: 6 },
  phaseGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, gap: 8 },
  phaseIcon: { fontSize: 16 },
  phaseTxt: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_900Black' },
});
