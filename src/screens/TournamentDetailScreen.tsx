import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'TournamentDetail'>;

export const TournamentDetailScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];

  const vertConfig = {
    M: { emoji: '👨', label: 'Masculino', colors: [Colors.navy, Colors.blue] as string[] },
    F: { emoji: '👩', label: 'Feminino', colors: ['#8B0050', '#D4006A'] as string[] },
    MX: { emoji: '👫', label: 'Misto', colors: ['#5C3A00', '#C87800'] as string[] },
  };

  const statusLabel = { config: 'A configurar', groups: 'Fase de grupos', bracket: 'Bracket', finished: 'Concluído' };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Gradients.header} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>← Início</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditTournament', { tournamentId: tournament.id })}>
              <Text style={styles.editBtnText}>✏️ Editar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>{tournament.name}</Text>
          <Text style={styles.subtitle}>📍 {tournament.location} · {tournament.startDate}–{tournament.endDate}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        <Text style={styles.sectionTitle}>Sub-torneios</Text>

        {tournament.vertentes.map((v) => {
          const cfg = vertConfig[v.type];
          const teamsCount = v.teams.length;
          const progress = teamsCount / v.maxTeams;
          return (
            <TouchableOpacity
              key={v.id}
              style={styles.card}
              onPress={() => navigation.navigate('VertenteHub', { tournamentId: tournament.id, vertenteId: v.id })}
              activeOpacity={0.85}
            >
              <LinearGradient colors={cfg.colors} style={styles.cardHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.cardEmoji}>{cfg.emoji}</Text>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{cfg.label}</Text>
                  <Text style={styles.cardLevel}>{v.level}</Text>
                </View>
                <View style={styles.cardStatusBadge}>
                  <Text style={styles.cardStatusText}>{statusLabel[v.status]}</Text>
                </View>
              </LinearGradient>
              <View style={styles.cardBody}>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Duplas: {teamsCount}/{v.maxTeams}</Text>
                  <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.stat}>🏟️ {v.courts} courts</Text>
                  <Text style={styles.stat}>→ Abrir Hub</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {tournament.regulamento && (
          <View style={styles.regCard}>
            <Text style={styles.regIcon}>📄</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.regName}>Regulamento</Text>
              <Text style={styles.regSub}>PDF · 2.3 MB</Text>
            </View>
            <TouchableOpacity style={styles.dlBtn}><Text style={styles.dlText}>↓ PDF</Text></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, marginBottom: 8 },
  back: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Nunito_700Bold' },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 5 },
  editBtnText: { color: '#fff', fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginTop: 4 },
  scroll: { flex: 1 },
  sectionTitle: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: Radii.lg, marginBottom: Spacing.md, overflow: 'hidden', ...Shadows.card },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.md },
  cardEmoji: { fontSize: 22 },
  cardHeaderText: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_900Black' },
  cardLevel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontFamily: 'Nunito_700Bold' },
  cardStatusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 4 },
  cardStatusText: { color: '#fff', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },
  cardBody: { padding: Spacing.md },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: Colors.navy },
  progressPct: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.blue },
  progressBar: { height: 6, backgroundColor: Colors.gl, borderRadius: 3, marginBottom: 10 },
  progressFill: { height: 6, backgroundColor: Colors.blue, borderRadius: 3 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  regCard: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadows.card },
  regIcon: { fontSize: 28 },
  regName: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  regSub: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted },
  dlBtn: { backgroundColor: Colors.gbg, borderRadius: Radii.sm, paddingHorizontal: 12, paddingVertical: 7 },
  dlText: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.blue },
});
