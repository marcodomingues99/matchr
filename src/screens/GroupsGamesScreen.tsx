import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { GameCard } from '../components/GameCard';
import { SubBadge } from '../components/SubBadge';
import { Colors, Gradients, Spacing, Radii } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupsGames'>;

export const GroupsGamesScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];
  const games = mockGames;

  const days = ['Dia 1 · 14 Mar', 'Dia 2 · 15 Mar'];
  const [activeDay, setActiveDay] = React.useState(0);

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.header} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <Text style={styles.back} onPress={() => navigation.goBack()}>← Open de Padel Lisboa</Text>
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={styles.title}>Grupos – Jogos 🎾</Text>
          <View style={styles.chipRow}>
            {days.map((d, i) => (
              <Text key={i} onPress={() => setActiveDay(i)}
                style={[styles.chip, i === activeDay && styles.chipActive]}>{d}</Text>
            ))}
            <View style={styles.liveChip}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Ao vivo</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: Spacing.md }}>
        {games.map((g) => (
          <GameCard
            key={g.id}
            game={g}
            onPress={() => {}}
            onEdit={() => navigation.navigate('EditGame', { tournamentId: tournament.id, vertenteId: vertente.id, gameId: g.id })}
            onEnterResult={() => navigation.navigate('EnterResult', { tournamentId: tournament.id, vertenteId: vertente.id, gameId: g.id })}
          />
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>

      <View style={styles.nav}>
        {[['👥','Duplas'], ['📊','Grupos'], ['🏆','Bracket'], ['📥','Exportar']].map(([icon, label], i) => (
          <TouchableNavItem key={label} icon={icon} label={label} active={i === 1}
            onPress={() => {
              if (i === 0) navigation.navigate('TeamList', { tournamentId: tournament.id, vertenteId: vertente.id });
              if (i === 1) navigation.navigate('GroupsTable', { tournamentId: tournament.id, vertenteId: vertente.id });
              if (i === 2) navigation.navigate('Bracket', { tournamentId: tournament.id, vertenteId: vertente.id });
              if (i === 3) navigation.navigate('Export', { tournamentId: tournament.id, vertenteId: vertente.id });
            }}
          />
        ))}
      </View>
    </View>
  );
};

const TouchableNavItem = ({ icon, label, active, onPress }: any) => (
  <View style={[styles.navItem, active && styles.navItemActive]}>
    <Text style={styles.navIcon}>{icon}</Text>
    <Text style={[styles.navLabel, active && styles.navLabelActive]} onPress={onPress}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  back: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8, marginBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 8 },
  chipRow: { flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'center' },
  chip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 5, color: 'rgba(255,255,255,0.75)', fontSize: 11, fontFamily: 'Nunito_700Bold' },
  chipActive: { backgroundColor: '#fff', color: Colors.navy },
  liveChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.red },
  liveText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'Nunito_700Bold' },
  scroll: { flex: 1 },
  nav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: Colors.gl, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: 'center', paddingTop: 10 },
  navItemActive: {},
  navIcon: { fontSize: 18, marginBottom: 2 },
  navLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  navLabelActive: { color: Colors.blue },
});

