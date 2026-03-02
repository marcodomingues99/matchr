import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Export'>;

export const ExportScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<string[]>([]);

  const simulateExport = (type: string) => {
    setExporting(type);
    setTimeout(() => {
      setExporting(null);
      setExported(prev => [...prev, type]);
    }, 1500);
  };

  const exportOptions = [
    { id: 'pdf_results', icon: '📊', title: 'Resultados em PDF', sub: 'Tabelas e resultados completos' },
    { id: 'pdf_bracket', icon: '🏆', title: 'Bracket / Quadro', sub: 'Fases finais e eliminação' },
    { id: 'pdf_teams', icon: '👥', title: 'Lista de duplas', sub: 'Todas as equipas inscritas' },
    { id: 'share_link', icon: '🔗', title: 'Partilhar link', sub: 'Link para ver resultados ao vivo' },
    { id: 'csv', icon: '📋', title: 'Exportar CSV', sub: 'Para Excel ou Google Sheets' },
  ];

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Voltar</Text>
          </TouchableOpacity>
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Exportar / Partilhar</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        {/* Tournament info */}
        <View style={s.infoCard}>
          <Text style={s.infoName}>{tournament.name}</Text>
          <Text style={s.infoSub}>📍 {tournament.location} · {tournament.startDate}–{tournament.endDate}</Text>
          <View style={s.infoStats}>
            <View style={s.infoStat}>
              <Text style={s.infoStatNum}>{vertente.teams.length}</Text>
              <Text style={s.infoStatLbl}>Duplas</Text>
            </View>
            <View style={s.infoStat}>
              <Text style={s.infoStatNum}>{tournament.vertentes.length}</Text>
              <Text style={s.infoStatLbl}>Sub-torneios</Text>
            </View>
          </View>
        </View>

        <Text style={s.sectionLabel}>Opções de Exportação</Text>

        {exportOptions.map((opt) => {
          const isExporting = exporting === opt.id;
          const isDone = exported.includes(opt.id);
          return (
            <TouchableOpacity
              key={opt.id}
              style={[s.exportCard, isDone && s.exportCardDone]}
              onPress={() => !isDone && simulateExport(opt.id)}
              activeOpacity={0.8}
            >
              <Text style={s.exportIcon}>{opt.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.exportTitle}>{opt.title}</Text>
                <Text style={s.exportSub}>{opt.sub}</Text>
              </View>
              {isExporting ? (
                <ActivityIndicator size="small" color={Colors.blue} />
              ) : isDone ? (
                <View style={s.doneBadge}><Text style={s.doneTxt}>✓</Text></View>
              ) : (
                <Text style={s.exportArrow}>→</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {exported.length > 0 && (
          <View style={s.successBox}>
            <Text style={s.successTxt}>✅ {exported.length} ficheiro{exported.length !== 1 ? 's' : ''} exportado{exported.length !== 1 ? 's' : ''} com sucesso!</Text>
          </View>
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
  scroll: { flex: 1 },
  infoCard: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.card },
  infoName: { fontSize: 16, fontFamily: 'Nunito_900Black', color: Colors.navy, marginBottom: 4 },
  infoSub: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginBottom: Spacing.md },
  infoStats: { flexDirection: 'row', gap: 20 },
  infoStat: { alignItems: 'center' },
  infoStatNum: { fontSize: 22, fontFamily: 'Nunito_900Black', color: Colors.blue },
  infoStatLbl: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted },
  sectionLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  exportCard: { backgroundColor: '#fff', borderRadius: Radii.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.sm, ...Shadows.card, borderWidth: 1.5, borderColor: 'transparent' },
  exportCardDone: { borderColor: Colors.green },
  exportIcon: { fontSize: 24, width: 36, textAlign: 'center' },
  exportTitle: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  exportSub: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginTop: 2 },
  exportArrow: { fontSize: 18, color: Colors.blue, fontFamily: 'Nunito_800ExtraBold' },
  doneBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.green, alignItems: 'center', justifyContent: 'center' },
  doneTxt: { fontSize: 14, color: '#fff', fontFamily: 'Nunito_800ExtraBold' },
  successBox: { backgroundColor: '#DFFAEE', borderRadius: Radii.md, padding: Spacing.md, marginTop: Spacing.sm },
  successTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.green, textAlign: 'center' },
});
