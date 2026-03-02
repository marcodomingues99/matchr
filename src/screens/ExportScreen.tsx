import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Export'>;

type ExportItem = {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  sub: string;
  btnLabel: string;
  btnColors: [string, string];
};

type Section = {
  title: string;
  items: ExportItem[];
};

const SECTIONS: Section[] = [
  {
    title: 'Exportar este sub-torneio',
    items: [
      { id: 'pdf_results', icon: '📊', iconBg: '#E8F5E9', title: 'Resultados em PDF', sub: 'Tabelas e resultados completos', btnLabel: '↓ PDF', btnColors: ['#22C97A', '#00AA66'] },
      { id: 'pdf_bracket', icon: '🏆', iconBg: '#E3ECFF', title: 'Bracket / Quadro', sub: 'Fases finais e eliminação', btnLabel: '↓ PDF', btnColors: ['#1A5AC8', '#00A5C8'] },
      { id: 'pdf_teams', icon: '👥', iconBg: '#EDE9FF', title: 'Lista de duplas', sub: 'Todas as equipas inscritas', btnLabel: '↓ PDF', btnColors: ['#9B30FF', '#6B10DF'] },
    ],
  },
  {
    title: 'Partilhar',
    items: [
      { id: 'share_link', icon: '🔗', iconBg: '#E3ECFF', title: 'Partilhar link', sub: 'Link para ver resultados ao vivo', btnLabel: '🔗 Link', btnColors: ['#1A5AC8', '#0D2C6B'] },
    ],
  },
  {
    title: 'Dados brutos',
    items: [
      { id: 'csv', icon: '📋', iconBg: '#FFF0E3', title: 'Exportar CSV', sub: 'Para Excel ou Google Sheets', btnLabel: '↓ CSV', btnColors: ['#FF7A1A', '#FFB300'] },
    ],
  },
];

export const ExportScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<string[]>([]);

  const simulateExport = (id: string) => {
    setExporting(id);
    setTimeout(() => {
      setExporting(null);
      setExported(prev => [...prev, id]);
    }, 1500);
  };

  const totalExported = exported.length;

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${vertente.type === 'M' ? 'Masc' : vertente.type === 'F' ? 'Fem' : 'Misto'} ${vertente.level}`}
            onBack={() => navigation.navigate('VertenteHub', { tournamentId: tournament.id, vertenteId: vertente.id })}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Exportar 📥</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>

        {SECTIONS.map((section) => (
          <View key={section.title}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            {section.items.map((opt) => {
              const isExporting = exporting === opt.id;
              const isDone = exported.includes(opt.id);
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={s.card}
                  onPress={() => !isExporting && !isDone && simulateExport(opt.id)}
                  activeOpacity={0.75}
                >
                  <View style={[s.iconBox, { backgroundColor: opt.iconBg }]}>
                    <Text style={s.iconEmoji}>{opt.icon}</Text>
                  </View>
                  <View style={s.cardBody}>
                    <Text style={s.cardTitle}>{opt.title}</Text>
                    <Text style={s.cardSub}>{opt.sub}</Text>
                  </View>
                  {isExporting ? (
                    <ActivityIndicator size="small" color={opt.btnColors[0]} style={s.spinner} />
                  ) : isDone ? (
                    <View style={[s.doneBadge, { backgroundColor: opt.btnColors[0] }]}>
                      <Text style={s.doneTxt}>✓</Text>
                    </View>
                  ) : (
                    <LinearGradient colors={opt.btnColors} style={s.actionBtn}>
                      <Text style={s.actionBtnTxt}>{opt.btnLabel}</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {totalExported > 0 && (
          <View style={s.successBox}>
            <Text style={s.successTxt}>
              ✅ {totalExported} ficheiro{totalExported !== 1 ? 's' : ''} exportado{totalExported !== 1 ? 's' : ''} com sucesso!
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },

  back: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8, marginBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 6 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

  // Section header (.st style from HTML)
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.navy,
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 2,
  },

  // Card (.card from HTML)
  card: {
    backgroundColor: '#fff',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 8,
    ...Shadows.card,
  },

  // 44×44 colored icon box
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 22 },

  cardBody: { flex: 1 },
  cardTitle: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  cardSub: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginTop: 2 },

  // Action button (.btn .bsm style)
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  actionBtnTxt: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },

  spinner: { width: 60, height: 28 },

  doneBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  doneTxt: { fontSize: 15, color: '#fff', fontFamily: 'Nunito_800ExtraBold' },

  // Success banner
  successBox: {
    backgroundColor: '#DFFAEE',
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  successTxt: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#1A7A4A', textAlign: 'center' },
});
