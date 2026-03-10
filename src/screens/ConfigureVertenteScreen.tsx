import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList, VertenteType } from '../types';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { NEW_TOURNAMENT_ID } from '../utils/constants';
import { popTo } from '../utils/navigation';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ConfigureVertente'>;

const LEVELS: Record<VertenteType, string[]> = {
  M: ['M6', 'M5', 'M4', 'M3', 'M2', 'M1', 'Sem'],
  F: ['F6', 'F5', 'F4', 'F3', 'F2', 'F1', 'Sem'],
  MX: ['MX6', 'MX5', 'MX4', 'MX3', 'MX2', 'MX1', 'Sem'],
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
  const { tournamentId, vertenteIndex: idx, isLast, pendingVertentes } = route.params;
  const isAddingToExisting = tournamentId !== NEW_TOURNAMENT_ID;

  let pendingVerts: Array<{ type: VertenteType; level: string }> = [];
  if (pendingVertentes) {
    try {
      pendingVerts = JSON.parse(pendingVertentes);
    } catch {
      // malformed JSON — fallback to empty array
    }
  }

  // Selection phase: when no vertentes were pre-selected, let the user pick type + level
  const [pickedType, setPickedType] = useState<VertenteType>('M');
  const [pickedLevel, setPickedLevel] = useState<string | null>(null);
  const needsSelection = pendingVerts.length === 0 && pickedLevel === null;

  const currentVert = pickedLevel
    ? { type: pickedType, level: pickedLevel }
    : pendingVerts[idx] ?? { type: 'M' as VertenteType, level: 'M5' };
  const cfg = VERTENTE_CONFIG[currentVert.type];
  const totalSteps = pendingVerts.length;
  const stepsLabel = pendingVerts.map(v => v.level).join(' · ');

  const [maxTeams, setMaxTeams] = useState(16);
  const [courts, setCourts] = useState(2);
  const structure = calcStructure(maxTeams);

  const handleNext = () => {
    if (isLast || isAddingToExisting) {
      if (isAddingToExisting) {
        navigation.dispatch(popTo('TournamentDetail'));
      } else {
        navigation.dispatch(popTo('Home'));
      }
    } else {
      navigation.navigate('ConfigureVertente', {
        tournamentId: NEW_TOURNAMENT_ID,
        vertenteIndex: idx + 1,
        isLast: idx + 2 >= totalSteps,
        pendingVertentes,
      });
    }
  };

  const handleSelectLevel = (level: string) => {
    setPickedLevel(level);
  };

  // ── Selection phase UI ──
  if (needsSelection) {
    return (
      <View className="flex-1 bg-gbg">
        <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
          <SafeAreaView edges={['top']}>
            <HeaderNav
              backLabel="Torneio"
              onBack={() => navigation.goBack()}
            />
            <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-[2px]">Adicionar Categoria</Text>
            <Text className="text-white/75 text-base font-nunito-semibold mt-[4px]">Escolhe a categoria e nivel</Text>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView className="flex-1" contentContainerClassName="p-lg">
          <Container>
            {/* Type selector */}
            <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[10px] mt-[4px]">Categoria</Text>
            <View className="flex-row gap-sm mb-lg">
              {(['M', 'F', 'MX'] as VertenteType[]).map(type => {
                const typeCfg = VERTENTE_CONFIG[type];
                const isOn = pickedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    className="flex-1 p-[14px] rounded-md items-center gap-[6px] border-2 shadow-card"
                    style={isOn
                      ? { borderColor: typeCfg.color, backgroundColor: typeCfg.chipBg }
                      : { borderColor: 'transparent', backgroundColor: Colors.white }
                    }
                    onPress={() => setPickedType(type)}
                  >
                    <Text className="text-2xl">{typeCfg.emoji}</Text>
                    <Text className={clsx('text-sm font-nunito-bold', isOn ? '' : 'text-navy')} style={isOn ? { color: typeCfg.color } : undefined}>{typeCfg.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Level selector */}
            <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[10px] mt-[4px]">Nivel</Text>
            <View className="flex-row flex-wrap gap-sm">
              {LEVELS[pickedType].map(level => {
                const typeCfg = VERTENTE_CONFIG[pickedType];
                return (
                  <TouchableOpacity
                    key={level}
                    className="px-lg py-[12px] rounded-md bg-white border-2 border-gl shadow-card"
                    onPress={() => handleSelectLevel(level)}
                  >
                    <Text className="text-base font-nunito-bold text-navy">{typeCfg.emoji} {level === 'Sem' ? 'Sem Nivel' : level}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="h-2xl" />
          </Container>
        </ScrollView>
        <HomeFAB onPress={() => navigation.dispatch(popTo('Home'))} />
      </View>
    );
  }

  // ── Configuration phase UI ──
  return (
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel={isAddingToExisting ? 'Torneio' : 'Criar Torneio'}
            onBack={() => navigation.goBack()}
          />
          {!isAddingToExisting && (
            <Text className="text-white/60 text-sm font-nunito-semibold mb-sm">Passo {idx + 1} de {totalSteps}  ·  {stepsLabel}</Text>
          )}
          <View
            className="flex-row items-center gap-[6px] self-start rounded-[20px] px-[10px] py-[5px] mb-sm"
            style={{ backgroundColor: cfg.chipBg }}
          >
            <Text className="text-[16px]">{cfg.emoji}</Text>
            <Text className="text-base font-nunito-black" style={{ color: cfg.color }}>
              {cfg.label} {currentVert.level === 'Sem' ? 'Sem Nivel' : currentVert.level}
            </Text>
          </View>
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-[2px]">Configurar Categoria</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* Progress dots */}
      {!isAddingToExisting && (
        <View className="flex-row justify-center gap-[6px] py-[14px] bg-white border-b border-b-gl">
          {pendingVerts.map((_, i) => (
            <View key={i} className={clsx('w-[24px] h-[6px] rounded-[3px]', i === idx ? 'bg-blue' : 'bg-gl')} />
          ))}
        </View>
      )}

      <ScrollView className="flex-1" contentContainerClassName="p-lg">
        <Container>
          {/* Max teams */}
          <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[10px] mt-[4px]">Nr maximo de duplas</Text>
          <View className="flex-row items-center bg-gbg rounded-md p-sm gap-[14px] mb-lg">
            <TouchableOpacity
              className="w-[38px] h-[38px] bg-white rounded-[9px] items-center justify-center shadow-card"
              onPress={() => setMaxTeams(Math.max(4, maxTeams - 2))}
            >
              <Text className="text-3xl font-nunito-black text-navy leading-[26px]">−</Text>
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-[32px] font-nunito-black text-navy">{maxTeams}</Text>
              <Text className="text-xs font-nunito-semibold text-muted">{structure.groups}  ·  Passam 2</Text>
            </View>
            <TouchableOpacity
              className="w-[38px] h-[38px] rounded-[9px] overflow-hidden"
              onPress={() => setMaxTeams(Math.min(32, maxTeams + 2))}
            >
              <LinearGradient
                colors={[Colors.blue, Colors.teal]}
                className="flex-1 items-center justify-center"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text className="text-3xl font-nunito-black text-white leading-[26px]">+</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Auto-generated structure */}
          <View className="bg-blue-bg rounded-md p-[11px] mb-lg">
            <Text className="text-sm font-nunito text-blue mb-[6px]">Estrutura gerada automaticamente</Text>
            <View className="flex-row flex-wrap gap-[6px]">
              {[structure.groups, structure.advance, structure.bracket].map(chip => (
                <View key={chip} className="bg-white rounded-full px-[10px] py-[4px]">
                  <Text className="text-sm font-nunito-bold text-blue">{chip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Courts */}
          <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[10px] mt-[4px]">Nr de courts disponiveis</Text>
          <View className="flex-row gap-sm mb-lg">
            {([1, 2, 3, '4+'] as const).map(n => {
              const val = n === '4+' ? 4 : n;
              const isOn = courts === val;
              return (
                <TouchableOpacity
                  key={n}
                  className={clsx(
                    'flex-1 p-[11px] rounded-md items-center border-2',
                    isOn ? 'border-blue bg-blue-bg' : 'border-transparent bg-gbg',
                  )}
                  onPress={() => setCourts(val)}
                >
                  <Text className={clsx('text-[18px] font-nunito-black', isOn ? 'text-blue' : 'text-navy')}>{n}</Text>
                  <Text className={clsx('text-xs font-nunito-semibold mt-[2px]', isOn ? 'text-blue' : 'text-muted')}>
                    {val === 1 ? 'court' : 'courts'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="h-xl" />

          <TouchableOpacity className="rounded-lg overflow-hidden" onPress={handleNext}>
            <LinearGradient colors={Gradients.primary} className="p-[15px] items-center">
              <Text className="text-white text-[15px] font-nunito">
                {isLast || isAddingToExisting
                  ? '✓ Concluir Configuração'
                  : `Próxima categoria → ${pendingVerts[idx + 1]?.level}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {(isLast || isAddingToExisting) && (
            <Text className="text-xs font-nunito-semibold text-muted text-center mt-[7px]">
              {isAddingToExisting ? 'Voltas para o teu torneio' : 'Vais direto para o teu torneio'}
            </Text>
          )}
          <View className="h-2xl" />
        </Container>
      </ScrollView>
      <HomeFAB onPress={() => navigation.navigate('Home')} />
    </View>
  );
};
