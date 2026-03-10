import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { popTo } from '../utils/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { Container } from '../components/Layout';

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
      { id: 'pdf_results', icon: '\u{1F4CA}', iconBg: Colors.greenBgSoft, title: 'Resultados em PDF', sub: 'Tabelas e resultados completos', btnLabel: '↓ PDF', btnColors: [Colors.green, Colors.greenDark] },
      { id: 'pdf_bracket', icon: '\u{1F3C6}', iconBg: Colors.blueBg, title: 'Eliminatórias', sub: 'Fases finais e eliminação', btnLabel: '↓ PDF', btnColors: [Colors.blue, Colors.teal] },
      { id: 'pdf_teams', icon: '\u{1F465}', iconBg: Colors.purpleBgSoft, title: 'Lista de duplas', sub: 'Todas as equipas inscritas', btnLabel: '↓ PDF', btnColors: [Colors.purple, Colors.purpleDeep] },
    ],
  },
  {
    title: 'Partilhar',
    items: [
      { id: 'share_link', icon: '\u{1F517}', iconBg: Colors.blueBg, title: 'Partilhar link', sub: 'Link para ver resultados ao vivo', btnLabel: '\u{1F517} Link', btnColors: [Colors.blue, Colors.navy] },
    ],
  },
  {
    title: 'Dados brutos',
    items: [
      { id: 'csv', icon: '\u{1F4CB}', iconBg: Colors.orangeBg, title: 'Exportar CSV', sub: 'Para Excel ou Google Sheets', btnLabel: '↓ CSV', btnColors: [Colors.orange, Colors.yellowAmber] },
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
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.header} className="px-lg pb-xl">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={`${VERTENTE_CONFIG[vertente.type].labelShort} ${vertente.level}`}
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-[6px]">Exportar {'\u{1F4E5}'}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="px-md pt-md">
        <Container>
          {SECTIONS.map((section, idx) => (
            <View key={section.title}>
              <Text className={clsx(
                'text-base font-nunito text-navy mx-[2px] mb-sm',
                idx === 0 ? 'mt-0' : 'mt-lg',
              )}>{section.title}</Text>
              {section.items.map((opt) => {
                const isExporting = exporting === opt.id;
                const isDone = exported.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    className="bg-white rounded-lg p-md flex-row items-center gap-[11px] mb-sm shadow-card"
                    onPress={() => !isExporting && !isDone && simulateExport(opt.id)}
                    activeOpacity={0.75}
                  >
                    <View
                      className="w-[44px] h-[44px] rounded-[11px] items-center justify-center shrink-0"
                      style={{ backgroundColor: opt.iconBg }}
                    >
                      <Text className="text-3xl">{opt.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-nunito text-navy">{opt.title}</Text>
                      <Text className="text-xs font-nunito-semibold text-muted mt-[2px]">{opt.sub}</Text>
                    </View>
                    {isExporting ? (
                      <ActivityIndicator size="small" color={opt.btnColors[0]} style={{ width: 60, height: 28 }} />
                    ) : isDone ? (
                      <View
                        className="w-[32px] h-[32px] rounded-full items-center justify-center"
                        style={{ backgroundColor: opt.btnColors[0] }}
                      >
                        <Text className="text-[15px] text-white font-nunito">{'✓'}</Text>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={opt.btnColors}
                        className="py-[6px] px-[13px] rounded-[9px] items-center justify-center min-w-[60px]"
                      >
                        <Text className="text-sm font-nunito text-white">{opt.btnLabel}</Text>
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {totalExported > 0 && (
            <View className="bg-green-bg-light rounded-md p-md mt-sm">
              <Text className="text-base font-nunito-bold text-green-deep text-center">
                {'\u2705'} {totalExported} ficheiro{totalExported !== 1 ? 's' : ''} exportado{totalExported !== 1 ? 's' : ''} com sucesso!
              </Text>
            </View>
          )}

          <View className="h-[40px]" />
        </Container>
      </ScrollView>
      <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
    </View>
  );
};
