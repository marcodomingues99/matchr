import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { popTo } from '../utils/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Typography, Spacing, Radii, Shadows } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';

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
    title: 'Exportar esta categoria',
    items: [
      { id: 'pdf_results', icon: '📊', iconBg: Colors.greenBgSoft, title: 'Resultados em PDF', sub: 'Tabelas e resultados completos', btnLabel: '↓ PDF', btnColors: [Colors.green, Colors.greenDark] },
      { id: 'pdf_bracket', icon: '🏆', iconBg: Colors.blueBg, title: 'Eliminatórias', sub: 'Fases finais e eliminação', btnLabel: '↓ PDF', btnColors: [Colors.blue, Colors.teal] },
      { id: 'pdf_teams', icon: '👥', iconBg: Colors.purpleBgSoft, title: 'Lista de duplas', sub: 'Todas as equipas inscritas', btnLabel: '↓ PDF', btnColors: [Colors.purple, Colors.purpleDeep] },
    ],
  },
  {
    title: 'Partilhar',
    items: [
      { id: 'share_link', icon: '🔗', iconBg: Colors.blueBg, title: 'Partilhar link', sub: 'Link para ver resultados ao vivo', btnLabel: '🔗 Link', btnColors: [Colors.blue, Colors.navy] },
    ],
  },
  {
    title: 'Dados brutos',
    items: [
      { id: 'csv', icon: '📋', iconBg: Colors.orangeBg, title: 'Exportar CSV', sub: 'Para Excel ou Google Sheets', btnLabel: '↓ CSV', btnColors: [Colors.orange, Colors.yellowAmber] },
    ],
  },
];

export const ExportScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  if (!tournament) return null;
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId);
  if (!vertente) return null;
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const simulateExport = (id: string) => {
    if (exporting !== null) return;
    setExporting(id);
    timerRef.current = setTimeout(() => {
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
            backLabel={`${VERTENTE_CONFIG[vertente.type].labelShort} ${vertente.level}`}
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>Exportar 📥</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>

        {SECTIONS.map((section, idx) => (
          <View key={section.title}>
            <Text style={[s.sectionTitle, idx === 0 && { marginTop: 0 }]}>{section.title}</Text>
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
      <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },

  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 6 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

  // Section header (.st style from HTML)
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily,
    color: Colors.navy,
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 2,
  },

  // Card (.card from HTML)
  card: {
    backgroundColor: Colors.white,
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
  iconEmoji: { fontSize: Typography.fontSize.xxxl },

  cardBody: { flex: 1 },
  cardTitle: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
  cardSub: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 2 },

  // Action button (.btn .bsm style)
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  actionBtnTxt: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily, color: Colors.white },

  spinner: { width: 60, height: 28 },

  doneBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  doneTxt: { fontSize: 15, color: Colors.white, fontFamily: Typography.fontFamily },

  // Success banner
  successBox: {
    backgroundColor: Colors.greenBgLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  successTxt: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBold, color: Colors.greenDeep, textAlign: 'center' },
});
