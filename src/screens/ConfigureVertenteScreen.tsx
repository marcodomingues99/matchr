import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList, VertenteType } from '../types';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ConfigureVertente'>;

const TYPE_CFG = {
  M: { label: 'Masculino', emoji: '👨', color: Colors.blue, bg: '#E3ECFF' },
  F: { label: 'Feminino', emoji: '👩', color: '#9B30FF', bg: '#F3E8FF' },
  MX: { label: 'Misto', emoji: '👫', color: Colors.orange, bg: '#FFF0E3' },
};

const calcStructure = (n: number) => {
  if (n <= 4) return { groups: '1 grupo de 4', advance: 'Passam top 2', bracket: 'Semis → Final' };
  if (n <= 8) return { groups: '2 grupos de 4', advance: 'Passam top 2', bracket: 'Quartos → Final' };
  if (n <= 12) return { groups: '3 grupos de 4', advance: 'Passam top 2', bracket: 'Semis → Final' };
  if (n <= 16) return { groups: '4 grupos de 4', advance: 'Passam top 2', bracket: 'Oitavos → Final' };
  if (n <= 24) return { groups: '6 grupos de 4', advance: 'Passam top 2', bracket: 'Oitavos → Final' };
  return { groups: '8 grupos de 4', advance: 'Passam top 2', bracket: 'R16 → Final' };
};

export const ConfigureVertenteScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { vertenteIndex: idx, isLast, pendingVertentes } = route.params;

  const pendingVerts: Array<{ type: VertenteType; level: string }> = pendingVertentes
    ? JSON.parse(pendingVertentes)
    : [];

  const currentVert = pendingVerts[idx] ?? { type: 'M' as VertenteType, level: 'M5' };
  const cfg = TYPE_CFG[currentVert.type];
  const totalSteps = pendingVerts.length;
  const stepsLabel = pendingVerts.map(v => v.level).join(' · ');

  const [maxTeams, setMaxTeams] = useState(16);
  const [courts, setCourts] = useState(2);
  const structure = calcStructure(maxTeams);

  const handleNext = () => {
    if (isLast) {
      navigation.navigate('Home');
    } else {
      navigation.navigate('ConfigureVertente', {
        tournamentId: 'new',
        vertenteIndex: idx + 1,
        isLast: idx + 2 >= totalSteps,
        pendingVertentes,
      });
    }
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Criar Torneio"
            onBack={() => navigation.goBack()}
          />
          <Text style={s.stepHint}>Passo {idx + 1} de {totalSteps}  ·  {stepsLabel}</Text>
          <View style={[s.badge, { backgroundColor: cfg.bg }]}>
            <Text style={{ fontSize: 16 }}>{cfg.emoji}</Text>
            <Text style={[s.badgeName, { color: cfg.color }]}>
              {cfg.label} {currentVert.level}
            </Text>
          </View>
          <Text style={s.title}>Configurar Vertente</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* Progress dots */}
      <View style={s.dotsRow}>
        {pendingVerts.map((_, i) => (
          <View key={i} style={[s.dot, i === idx && s.dotActive]} />
        ))}
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg }}>

        {/* Max teams */}
        <Text style={s.sectionLabel}>Nº máximo de duplas</Text>
        <View style={s.incrementorBox}>
          <TouchableOpacity
            style={s.incMinus}
            onPress={() => setMaxTeams(Math.max(4, maxTeams - 2))}
          >
            <Text style={s.incMinusTxt}>−</Text>
          </TouchableOpacity>
          <View style={s.incCenter}>
            <Text style={s.incValue}>{maxTeams}</Text>
            <Text style={s.incHint}>{structure.groups}  ·  Passam 2</Text>
          </View>
          <TouchableOpacity
            style={s.incPlus}
            onPress={() => setMaxTeams(Math.min(32, maxTeams + 2))}
          >
            <LinearGradient
              colors={[Colors.blue, Colors.teal]}
              style={s.incPlusGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={s.incPlusTxt}>+</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Auto-generated structure */}
        <View style={s.structureBox}>
          <Text style={s.structureTitle}>Estrutura gerada automaticamente</Text>
          <View style={s.structureChips}>
            {[structure.groups, structure.advance, structure.bracket].map(chip => (
              <View key={chip} style={s.structureChip}>
                <Text style={s.structureChipTxt}>{chip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Courts */}
        <Text style={s.sectionLabel}>Nº de courts disponíveis</Text>
        <View style={s.courtsRow}>
          {([1, 2, 3, '4+'] as const).map(n => {
            const val = n === '4+' ? 4 : n;
            const isOn = courts === val;
            return (
              <TouchableOpacity
                key={n}
                style={[s.courtCard, isOn && s.courtCardActive]}
                onPress={() => setCourts(val)}
              >
                <Text style={[s.courtNum, isOn && s.courtNumActive]}>{n}</Text>
                <Text style={[s.courtLbl, isOn && s.courtLblActive]}>
                  {val === 1 ? 'court' : 'courts'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 24 }} />

        <TouchableOpacity style={s.nextBtn} onPress={handleNext}>
          <LinearGradient colors={Gradients.primary} style={s.nextGrad}>
            <Text style={s.nextTxt}>
              {isLast
                ? '✓ Concluir Configuração'
                : `Próxima vertente → ${pendingVerts[idx + 1]?.level}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        {isLast && (
          <Text style={s.lastNote}>Vais direto para o teu torneio</Text>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
      <HomeFAB onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  back: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8, marginBottom: 4 },
  stepHint: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginBottom: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5, marginBottom: 8,
  },
  badgeName: { fontSize: 13, fontFamily: 'Nunito_900Black' },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 2 },

  /* Progress dots */
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.gl },
  dot: { width: 24, height: 6, borderRadius: 3, backgroundColor: Colors.gl },
  dotActive: { backgroundColor: Colors.blue },

  scroll: { flex: 1 },
  sectionLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },

  /* Incrementor */
  incrementorBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.gbg, borderRadius: Radii.md,
    padding: Spacing.sm, gap: 14, marginBottom: Spacing.lg,
  },
  incMinus: {
    width: 38, height: 38, backgroundColor: '#fff', borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', ...Shadows.card,
  },
  incMinusTxt: { fontSize: 22, fontFamily: 'Nunito_900Black', color: Colors.navy, lineHeight: 26 },
  incPlus: { width: 38, height: 38, borderRadius: 9, overflow: 'hidden' },
  incPlusGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  incPlusTxt: { fontSize: 22, fontFamily: 'Nunito_900Black', color: '#fff', lineHeight: 26 },
  incCenter: { flex: 1, alignItems: 'center' },
  incValue: { fontSize: 32, fontFamily: 'Nunito_900Black', color: Colors.navy },
  incHint: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted },

  /* Structure */
  structureBox: { backgroundColor: '#E3ECFF', borderRadius: Radii.md, padding: 11, marginBottom: Spacing.lg },
  structureTitle: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.blue, marginBottom: 6 },
  structureChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  structureChip: { backgroundColor: '#fff', borderRadius: Radii.full, paddingHorizontal: 10, paddingVertical: 4 },
  structureChipTxt: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.blue },

  /* Courts */
  courtsRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg },
  courtCard: {
    flex: 1, padding: 11, backgroundColor: Colors.gbg,
    borderRadius: Radii.md, alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  courtCardActive: { borderColor: Colors.blue, backgroundColor: '#E3ECFF' },
  courtNum: { fontSize: 18, fontFamily: 'Nunito_900Black', color: Colors.navy },
  courtNumActive: { color: Colors.blue },
  courtLbl: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginTop: 2 },
  courtLblActive: { color: Colors.blue },

  /* Next button */
  nextBtn: { borderRadius: Radii.lg, overflow: 'hidden' },
  nextGrad: { padding: 15, alignItems: 'center' },
  nextTxt: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  lastNote: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, textAlign: 'center', marginTop: 7 },
});
