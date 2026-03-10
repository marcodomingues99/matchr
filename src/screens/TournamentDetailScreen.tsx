import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList, Vertente } from '../types';
import { mockTournaments } from '../mock/data';
import { Colors, Gradients } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { parseDatePt, VERTENTE_STATUS } from '../utils/constants';
import { LiveDot } from '../components/LiveDot';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList, 'TournamentDetail'>;
type Route = RouteProp<RootStackParamList, 'TournamentDetail'>;

type StatusKey = 'live' | 'wait' | 'done' | 'cfg';

const phaseInfo = (v: Vertente): { label: string; pct: number; statusKey: StatusKey } => {
  if (v.status === 'config') return { label: `${v.maxTeams} vagas`, pct: 0, statusKey: 'cfg' };
  if (v.status === 'groups') return {
    label: `${v.teams.length}/${v.maxTeams} duplas · Grupos`,
    pct: v.teams.length / v.maxTeams,
    statusKey: v.teams.length > 0 ? 'live' : 'wait',
  };
  if (v.status === 'bracket') return { label: `${v.teams.length} duplas · Eliminatórias`, pct: 0.75, statusKey: 'live' };
  return { label: `${v.teams.length} duplas · Concluído`, pct: 1, statusKey: 'done' };
};


const getDays = (start: string, end: string) => {
  const startDate = parseDatePt(start);
  const endDate = parseDatePt(end);
  if (!startDate || !endDate) return 1;
  const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays + 1 : 1;
};
const getCountdown = (startDate: string) => {
  const target = parseDatePt(startDate);
  if (!target) return { days: 0, hours: 0, minutes: 0 };
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
};

export const TournamentDetailScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const t = mockTournaments.find(x => x.id === route.params.tournamentId);
  const isUpcoming = t?.status === 'upcoming';

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const totalTeams = t?.vertentes.reduce((sum, v) => sum + v.teams.length, 0) ?? 0;
  const days = getDays(t?.startDate ?? '', t?.endDate ?? '');

  // Countdown for upcoming
  const [countdown, setCountdown] = useState(getCountdown(t?.startDate ?? ''));
  useEffect(() => {
    if (!isUpcoming || !t) return;
    const timer = setInterval(() => setCountdown(getCountdown(t.startDate)), 60000);
    return () => clearInterval(timer);
  }, [isUpcoming, t?.startDate]);

  // Unique vertente types for chips
  const vertenteTypes = useMemo(
    () => [...new Set((t?.vertentes ?? []).map(v => v.type))],
    [t?.vertentes],
  );

  const quickExportVertenteId = useMemo(() => {
    const liveVertente = t?.vertentes.find(v => v.status === VERTENTE_STATUS.GROUPS || v.status === VERTENTE_STATUS.BRACKET);
    if (liveVertente) return liveVertente.id;

    const configuredVertente = t?.vertentes.find(v => v.status !== VERTENTE_STATUS.CONFIG);
    if (configuredVertente) return configuredVertente.id;

    return t?.vertentes[0]?.id;
  }, [t?.vertentes]);

  if (!t) return null;

  return (
    <View className="flex-1 bg-gbg">
      {/* HEADER */}
      <LinearGradient colors={Gradients.header} className="px-lg pb-[20px] relative overflow-hidden" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View className="absolute w-[150px] h-[150px] rounded-[75px] bg-white/5 -bottom-[48px] -right-[28px]" />
        <SafeAreaView edges={['top']}>
          <View className="flex-row justify-between items-center pt-sm mb-sm">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-white/75 text-base font-nunito-bold">← Inicio</Text>
            </TouchableOpacity>
            {!isUpcoming && (
              <TouchableOpacity
                className="bg-white/[0.18] rounded-[9px] px-[11px] py-[5px]"
                onPress={() => navigation.navigate('EditTournament', { tournamentId: t.id })}
              >
                <Text className="text-white text-md font-nunito">✏️ Editar</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-[4px]">{t.name}{isUpcoming ? ' 🌸' : ''}</Text>
          <Text className="text-white/65 text-md font-nunito-semibold mt-[3px]">📍 {t.location} · {t.startDate}{t.startDate !== t.endDate ? `–${t.endDate}` : ''}</Text>

          {/* Chips row for upcoming */}
          {isUpcoming && (
            <View className="flex-row gap-[6px] mt-[10px] flex-wrap">
              {vertenteTypes.map(vt => (
                <View key={vt} className="bg-white/20 rounded-[20px] px-[9px] py-[3px]">
                  <Text className="text-white text-xs font-nunito">{vt}</Text>
                </View>
              ))}
              <View className="bg-yellow-bg rounded-[20px] px-[9px] py-[3px]">
                <Text className="text-yellow-dark text-xs font-nunito">Em preparação</Text>
              </View>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-2xl"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} colors={[Colors.blue]} />
        }
      >
        <Container>

        {/* COUNTDOWN (upcoming only) */}
        {isUpcoming && (
          <View className="mx-[12px] mt-[12px]">
            <LinearGradient colors={Gradients.masc} className="rounded-lg p-lg items-center shadow-card" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text className="text-sm font-nunito text-white/65 uppercase tracking-[0.5px] mb-sm">Começa em</Text>
              <View className="flex-row items-center gap-[12px]">
                <View className="items-center">
                  <Text className="text-[30px] font-nunito-black text-white">{countdown.days}</Text>
                  <Text className="text-xs text-white/60 font-nunito-semibold">dias</Text>
                </View>
                <Text className="text-[28px] font-nunito-black text-white/30 leading-[40px]">:</Text>
                <View className="items-center">
                  <Text className="text-[30px] font-nunito-black text-white">{countdown.hours}</Text>
                  <Text className="text-xs text-white/60 font-nunito-semibold">horas</Text>
                </View>
                <Text className="text-[28px] font-nunito-black text-white/30 leading-[40px]">:</Text>
                <View className="items-center">
                  <Text className="text-[30px] font-nunito-black text-white">{countdown.minutes}</Text>
                  <Text className="text-xs text-white/60 font-nunito-semibold">min</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* STATS STRIP (active only) */}
        {!isUpcoming && (
          <View className="flex-row gap-sm p-md pb-xs">
            <View className="flex-1 bg-white rounded-lg p-md items-center shadow-card">
              <Text className="text-2xl font-nunito-black text-blue">{t.vertentes.length}</Text>
              <Text className="text-xs text-muted font-nunito-semibold mt-[2px] text-center">Categorias</Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-md items-center shadow-card">
              <Text className="text-2xl font-nunito-black text-orange">{totalTeams}</Text>
              <Text className="text-xs text-muted font-nunito-semibold mt-[2px] text-center">Duplas total</Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-md items-center shadow-card">
              <Text className="text-2xl font-nunito-black text-green">{days}</Text>
              <Text className="text-xs text-muted font-nunito-semibold mt-[2px] text-center">Dias</Text>
            </View>
          </View>
        )}

        {/* REGULAMENTO (active only) */}
        {!isUpcoming && t.regulamento && (
          <View className="flex-row items-center gap-md bg-white rounded-lg p-[12px] mx-[12px] mb-[4px] shadow-card">
            <View className="w-[38px] h-[38px] bg-orange-bg rounded-[10px] items-center justify-center">
              <Text className="text-[18px]">📄</Text>
            </View>
            <View className="flex-1">
              <Text className="text-md font-nunito text-navy">Regulamento do torneio</Text>
              <Text className="text-xs text-muted font-nunito-semibold mt-[2px]">{t.regulamento}</Text>
            </View>
            <TouchableOpacity>
              <LinearGradient colors={Gradients.primary} className="rounded-sm px-[11px] py-[6px]" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text className="text-white text-sm font-nunito">↓ PDF</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* CATEGORIAS */}
        <Text className="text-base font-nunito text-navy m-[12px] mb-sm">Seleciona uma categoria</Text>
        <View className="flex-row flex-wrap gap-sm px-md">
          {t.vertentes.map(v => {
            const cfg = VERTENTE_CONFIG[v.type];
            const info = phaseInfo(v);
            const pctStr = `${Math.round(info.pct * 100)}%` as `${number}%`;
            return (
              <View key={v.id} className="w-[48%] lg:w-[31.5%]">
                <TouchableOpacity
                  className="min-h-[110px] rounded-lg overflow-hidden"
                  style={{ elevation: 3 }}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('VertenteHub', { tournamentId: t.id, vertenteId: v.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`${cfg.label} ${v.level}, ${info.label}`}
                  accessibilityHint="Abrir categoria"
                >
                  <LinearGradient
                    colors={cfg.gradient}
                    className="flex-1 p-[12px] pb-[10px]"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {/* Status badge */}
                    <View className={clsx(
                      'flex-row items-center gap-[4px] absolute top-[8px] right-[8px] px-[7px] py-[2px] rounded-[10px]',
                      info.statusKey === 'live' ? 'bg-red' :
                        info.statusKey === 'done' ? 'bg-white/35' : 'bg-white/25',
                    )}>
                      {info.statusKey === 'live' && <LiveDot />}
                      <Text className={clsx('text-xxs font-nunito', info.statusKey === 'live' ? 'text-white' : 'text-white/85')}>
                        {info.statusKey === 'live' ? 'Ao vivo' :
                          info.statusKey === 'done' ? 'Concluído' :
                            info.statusKey === 'cfg' ? 'A configurar' : 'Aguarda'}
                      </Text>
                    </View>

                    {/* Content */}
                    <Text className="text-xs font-nunito-black text-white/70 tracking-[0.5px] mt-sm">{cfg.label.toUpperCase()}</Text>
                    <Text className="text-[18px] font-nunito-black text-white mt-[2px]">{v.level}</Text>
                    <Text className="text-xs font-nunito-bold text-white/65 mt-[2px]">{info.label}</Text>

                    {/* Progress bar */}
                    <View className="h-[3px] bg-white/20 rounded-[2px] mt-sm">
                      <View className="h-[3px] bg-white/80 rounded-[2px]" style={{ width: pctStr }} />
                    </View>

                    {/* Emoji watermark */}
                    <Text className="absolute text-[48px] -right-[4px] -bottom-[8px] opacity-[0.12]">{cfg.emoji}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Add categoria */}
        <TouchableOpacity
          className="border-2 border-dashed border-gray rounded-lg p-md mx-md items-center bg-white"
          onPress={() => navigation.navigate('ConfigureVertente', { tournamentId: t.id, vertenteIndex: 0, isLast: true, pendingVertentes: JSON.stringify([]) })}
        >
          <Text className="text-3xl text-muted">＋</Text>
          <Text className="text-md font-nunito text-muted mt-[3px]">Adicionar categoria</Text>
        </TouchableOpacity>

        {/* Quick actions (upcoming only) */}
        {isUpcoming && (
          <>
            <View className="flex-row justify-between items-center mx-[12px] mt-[14px] mb-sm">
              <Text className="text-base font-nunito text-navy">Acoes rapidas</Text>
            </View>
            <View className="flex-row gap-sm px-[12px] pb-[20px]">
              <TouchableOpacity className="flex-1 bg-white rounded-lg p-md items-center shadow-card" activeOpacity={0.7} onPress={() => navigation.navigate('EditTournament', { tournamentId: t.id })}>
                <Text className="text-3xl">⚙️</Text>
                <Text className="text-sm font-nunito text-navy mt-[5px]">Configurar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-white rounded-lg p-md items-center shadow-card"
                activeOpacity={0.7}
                onPress={() => quickExportVertenteId && navigation.navigate('Export', { tournamentId: t.id, vertenteId: quickExportVertenteId })}
              >
                <Text className="text-3xl">📥</Text>
                <Text className="text-sm font-nunito text-navy mt-[5px]">Exportar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        </Container>
      </ScrollView>
    </View>
  );
};
