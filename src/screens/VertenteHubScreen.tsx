import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'VertenteHub'>;

export const VertenteHubScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];

  const statusLabel = { config: 'A configurar', groups: 'Fase de grupos', bracket: 'Bracket', finished: 'Concluído' };
  const statusColor = { config: Colors.orange, groups: Colors.blue, bracket: Colors.teal, finished: Colors.green };

  const menuItems = [
    {
      icon: '👥', title: 'Duplas', sub: `${vertente.teams.length} / ${vertente.maxTeams} equipas inscritas`,
      onPress: () => navigation.navigate('TeamList', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: true,
    },
    {
      icon: '📊', title: 'Grupos & Jogos', sub: 'Gerir fase de grupos e introduzir resultados',
      onPress: () => navigation.navigate('GroupsGames', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: vertente.status !== 'config',
    },
    {
      icon: '🏆', title: 'Bracket / Eliminação', sub: 'Fases finais e quadro de eliminação',
      onPress: () => navigation.navigate('Bracket', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: vertente.status === 'bracket' || vertente.status === 'finished',
    },
    {
      icon: '🥇', title: 'Pódio', sub: 'Classificação final do torneio',
      onPress: () => navigation.navigate('Podium', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: vertente.status === 'finished',
    },
    {
      icon: '📥', title: 'Exportar', sub: 'Gerar PDF ou partilhar resultados',
      onPress: () => navigation.navigate('Export', { tournamentId: tournament.id, vertenteId: vertente.id }),
      enabled: true,
    },
  ];

  const vertGradients: Record<string, string[]> = {
    M: [Colors.navy, Colors.blue],
    F: ['#8B0050', '#D4006A'],
    MX: ['#5C3A00', '#C87800'],
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={vertGradients[vertente.type] as string[]} style={s.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← {tournament.name}</Text>
          </TouchableOpacity>
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>{vertente.type === 'M' ? 'Masculino' : vertente.type === 'F' ? 'Feminino' : 'Misto'} {vertente.level}</Text>
          <View style={s.statusRow}>
            <View style={[s.statusDot, { backgroundColor: statusColor[vertente.status] }]} />
            <Text style={s.statusTxt}>{statusLabel[vertente.status]}</Text>
            <Text style={s.statusSep}>·</Text>
            <Text style={s.statusTxt}>{vertente.courts} courts</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        {/* Quick stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNum}>{vertente.teams.length}</Text>
            <Text style={s.statLbl}>Duplas</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>{vertente.maxTeams - vertente.teams.length}</Text>
            <Text style={s.statLbl}>Vagas</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>{vertente.courts}</Text>
            <Text style={s.statLbl}>Courts</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>{Math.round(vertente.teams.length / vertente.maxTeams * 100)}%</Text>
            <Text style={s.statLbl}>Preench.</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${vertente.teams.length / vertente.maxTeams * 100}%` as any, backgroundColor: statusColor[vertente.status] }]} />
        </View>

        <Text style={s.sectionLabel}>Acções</Text>

        {/* Add team CTA */}
        {vertente.status === 'config' && (
          <TouchableOpacity
            style={s.addTeamBtn}
            onPress={() => navigation.navigate('AddTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}
          >
            <LinearGradient colors={Gradients.primary} style={s.addTeamGrad}>
              <Text style={s.addTeamTxt}>👥 + Adicionar Dupla</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Menu items */}
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={[s.menuCard, !item.enabled && s.menuCardDisabled]}
            onPress={item.onPress}
            disabled={!item.enabled}
            activeOpacity={0.8}
          >
            <Text style={s.menuIcon}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.menuTitle, !item.enabled && s.menuTitleDisabled]}>{item.title}</Text>
              <Text style={s.menuSub}>{item.sub}</Text>
            </View>
            {item.enabled ? (
              <Text style={s.menuArrow}>→</Text>
            ) : (
              <View style={s.menuLocked}><Text style={s.menuLockedTxt}>🔒</Text></View>
            )}
          </TouchableOpacity>
        ))}

        {/* Phase actions */}
        {vertente.status === 'config' && vertente.teams.length >= 4 && (
          <TouchableOpacity style={s.phaseBtn}>
            <LinearGradient colors={[Colors.green, '#00AA66']} style={s.phaseGrad}>
              <Text style={s.phaseTxt}>🚀 Iniciar Fase de Grupos</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {vertente.status === 'groups' && (
          <TouchableOpacity style={s.phaseBtn}>
            <LinearGradient colors={Gradients.primary} style={s.phaseGrad}>
              <Text style={s.phaseTxt}>🏆 Avançar para Bracket</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  back: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8, marginBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusTxt: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: 'Nunito_700Bold' },
  statusSep: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  scroll: { flex: 1 },
  sectionLabel: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.sm },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: Radii.md, padding: Spacing.sm, alignItems: 'center', ...Shadows.card },
  statNum: { fontSize: 22, fontFamily: 'Nunito_900Black', color: Colors.navy },
  statLbl: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: Colors.muted, textAlign: 'center' },
  progressBar: { height: 5, backgroundColor: Colors.gl, borderRadius: 3, marginBottom: Spacing.lg },
  progressFill: { height: 5, borderRadius: 3 },
  addTeamBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: Spacing.md },
  addTeamGrad: { padding: 14, alignItems: 'center' },
  addTeamTxt: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  menuCard: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.sm, ...Shadows.card },
  menuCardDisabled: { opacity: 0.45 },
  menuIcon: { fontSize: 24, width: 36, textAlign: 'center' },
  menuTitle: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  menuTitleDisabled: { color: Colors.muted },
  menuSub: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginTop: 2 },
  menuArrow: { fontSize: 18, color: Colors.blue, fontFamily: 'Nunito_800ExtraBold' },
  menuLocked: { padding: 4 },
  menuLockedTxt: { fontSize: 14 },
  phaseBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginTop: Spacing.md, marginBottom: Spacing.md },
  phaseGrad: { padding: 14, alignItems: 'center' },
  phaseTxt: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_900Black' },
});
