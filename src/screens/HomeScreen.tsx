import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const tournaments = mockTournaments;

  if (tournaments.length === 0) {
    return (
      <LinearGradient colors={Gradients.header} style={styles.emptyContainer}>
        <SafeAreaView style={styles.emptySafe}>
          <View style={styles.emptyIconBox}>
            <Text style={styles.emptyIcon}>🏆</Text>
          </View>
          <Text style={styles.emptyTitle}>Bem-vindo ao Matchr</Text>
          <Text style={styles.emptySubtitle}>Cria o teu primeiro torneio{'\n'}e começa a gerir.</Text>
          <TouchableOpacity style={styles.createBtnEmpty} onPress={() => navigation.navigate('CreateTournament')}>
            <Text style={styles.createBtnText}>+ Criar torneio</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={Gradients.header} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.appName}>Matchr</Text>
              <Text style={styles.headerSub}>Os teus torneios</Text>
            </View>
            <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateTournament')}>
              <Text style={styles.createBtnText}>+ Criar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        {tournaments.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={styles.card}
            onPress={() => navigation.navigate(t.status === 'upcoming' ? 'UpcomingTournament' : 'TournamentDetail', { tournamentId: t.id })}
            activeOpacity={0.85}
          >
            <LinearGradient colors={Gradients.header} style={styles.cardBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.cardTitle}>{t.name}</Text>
              <Text style={styles.cardSub}>📍 {t.location} · {t.startDate}–{t.endDate}</Text>
            </LinearGradient>
            <View style={styles.cardBody}>
              <View style={styles.vertenteRow}>
                {t.vertentes.map((v) => (
                  <View key={v.id} style={styles.vertChip}>
                    <Text style={styles.vertEmoji}>{v.type === 'M' ? '👨' : v.type === 'F' ? '👩' : '👫'}</Text>
                    <Text style={styles.vertLabel}>{v.level}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.statusBadge, t.status === 'active' && styles.statusActive]}>
                <View style={styles.liveDot} />
                <Text style={styles.statusText}>{t.status === 'active' ? 'Ao vivo' : t.status === 'upcoming' ? 'Em preparação' : 'Concluído'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 8 },
  headerLeft: {},
  appName: { color: '#fff', fontSize: 26, fontFamily: 'Nunito_900Black' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  createBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  createBtnText: { color: '#fff', fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  scroll: { flex: 1 },
  card: { backgroundColor: '#fff', borderRadius: Radii.xl, marginBottom: Spacing.lg, overflow: 'hidden', ...Shadows.card },
  cardBanner: { height: 80, justifyContent: 'flex-end', padding: Spacing.md },
  cardTitle: { color: '#fff', fontSize: 16, fontFamily: 'Nunito_900Black' },
  cardSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  cardBody: { padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vertenteRow: { flexDirection: 'row', gap: 6 },
  vertChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.gbg, borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 4 },
  vertEmoji: { fontSize: 12 },
  vertLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.gbg, borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusActive: { backgroundColor: '#FFE3E8' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.red },
  statusText: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.red },
  emptyContainer: { flex: 1 },
  emptySafe: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyIconBox: { width: 96, height: 96, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radii.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  emptyIcon: { fontSize: 46 },
  emptyTitle: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginBottom: 8 },
  emptySubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontFamily: 'Nunito_600SemiBold', textAlign: 'center', marginBottom: Spacing.xl },
  createBtnEmpty: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radii.lg, paddingHorizontal: 28, paddingVertical: 14 },
});
