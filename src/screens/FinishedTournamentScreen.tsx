import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '../types';
import { api } from '../api/client';
import { tournamentKeys, matchKeys } from '../api/queryKeys';
import { Colors } from '../theme';
import { CATEGORY_CONFIG } from '../utils/categoryConfig';
import { formatDatePt } from '../utils/dateUtils';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList, 'FinishedTournament'>;
type Route = RouteProp<RootStackParamList, 'FinishedTournament'>;

export const FinishedTournamentScreen = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const { tournamentId } = route.params;
    const { data: t } = useQuery({
        queryKey: tournamentKeys.detail(tournamentId),
        queryFn: () => api.getTournament(tournamentId),
    });
    const { data: allMatches = [] } = useQuery({
        queryKey: matchKeys.byTournament(tournamentId),
        queryFn: () => api.getMatchesByTournament(tournamentId),
        enabled: !!t,
    });

    const totalTeams = t?.categories.reduce((sum, v) => sum + v.teams.length, 0) ?? 0;
    const totalMatches = allMatches.length;

    if (!t) return null;

    return (
        <View className="flex-1 bg-gbg">
            {/* ═══ HEADER ═══ */}
            <LinearGradient
                colors={[Colors.navy, Colors.blue, Colors.green]}
                className="px-[18px] pb-[20px] overflow-hidden"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View className="absolute w-[200px] h-[200px] rounded-full bg-white/[0.06] -bottom-[70px] -right-[50px]" />
                <View className="absolute w-[120px] h-[120px] rounded-full bg-white/5 top-[10px] -left-[40px]" />
                <SafeAreaView edges={['top']}>
                    <View className="flex-row items-center justify-between pt-[6px] pb-[4px]">
                        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text className="text-white/70 text-base font-nunito-bold">← Início</Text>
                        </TouchableOpacity>
                        <View className="bg-white/[0.18] rounded-full px-[10px] py-[4px]">
                            <Text className="text-white text-xs font-nunito">✅ Concluído</Text>
                        </View>
                    </View>

                    <View className="items-center mt-[4px] mb-[6px]">
                        <View className="w-[72px] h-[72px] rounded-full items-center justify-center border-2" style={{ backgroundColor: 'rgba(255,214,0,0.15)', borderColor: 'rgba(255,214,0,0.2)' }}>
                            <Text className="text-[34px]">🏆</Text>
                        </View>
                    </View>
                    <Text className="text-white text-[20px] md:text-[26px] font-nunito-black text-center">{t.name}</Text>
                    <Text className="text-white/[0.55] text-md font-nunito-semibold mt-[3px] text-center">📍 {t.location} · {formatDatePt(t.startDate)}–{formatDatePt(t.endDate)}</Text>

                    {/* Stats */}
                    <View className="flex-row items-center bg-white/[0.12] rounded-lg mt-[14px] py-[10px] px-[6px]">
                        <View className="flex-1 items-center">
                            <Text className="text-[20px] md:text-[24px] font-nunito-black text-white">{t.categories.length}</Text>
                            <Text className="text-xxs font-nunito-bold text-white/[0.55] mt-[1px]">Categorias</Text>
                        </View>
                        <View className="w-[1px] h-[24px] bg-white/[0.15]" />
                        <View className="flex-1 items-center">
                            <Text className="text-[20px] md:text-[24px] font-nunito-black text-white">{totalTeams}</Text>
                            <Text className="text-xxs font-nunito-bold text-white/[0.55] mt-[1px]">Duplas</Text>
                        </View>
                        <View className="w-[1px] h-[24px] bg-white/[0.15]" />
                        <View className="flex-1 items-center">
                            <Text className="text-[20px] md:text-[24px] font-nunito-black text-white">{totalMatches}</Text>
                            <Text className="text-xxs font-nunito-bold text-white/[0.55] mt-[1px]">Jogos</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* ═══ BODY ═══ */}
            <ScrollView className="flex-1" contentContainerClassName="p-[14px] pb-[36px]" showsVerticalScrollIndicator={false}>
                <Container>
                    {t.categories.map((v) => {
                        const cfg = CATEGORY_CONFIG[v.type];
                        const winner = v.teams[0];
                        const runnerUp = v.teams[1];
                        const third = v.teams[2];

                        return (
                            <TouchableOpacity
                                key={v.id}
                                activeOpacity={0.85}
                                className="rounded-xl mb-[14px] overflow-hidden shadow-card"
                                style={{ backgroundColor: cfg.barBg }}
                                onPress={() => navigation.navigate('Podium', { tournamentId: t.id, categoryId: v.id })}
                            >
                                {/* Colored top bar */}
                                <LinearGradient colors={cfg.gradient} className="h-[4px]" start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

                                {/* Header */}
                                <View className="flex-row items-center gap-[10px] px-[14px] pt-[14px] pb-[6px]">
                                    <LinearGradient colors={cfg.gradient} className="w-[40px] h-[40px] rounded-md items-center justify-center" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                        <Text className="text-[18px]">{cfg.emoji}</Text>
                                    </LinearGradient>
                                    <View className="flex-1">
                                        <Text className="text-lg font-nunito text-navy">{cfg.label} {v.level}</Text>
                                        <Text className="text-xs font-nunito-semibold text-muted mt-[1px]">{v.teams.length} duplas · {v.courts} campos</Text>
                                    </View>
                                    <Text className="text-[24px] text-gray">›</Text>
                                </View>

                                {/* ── Podium bars ── */}
                                <View className="flex-row items-end justify-center gap-sm px-[14px] pt-[6px] pb-lg">
                                    {/* 2nd */}
                                    {runnerUp && (
                                        <View className="flex-1 items-center mt-lg">
                                            <Text className="text-[18px] mb-[4px]">🥈</Text>
                                            <View className="w-full rounded-sm items-center justify-end pb-[4px]" style={{ height: 44, backgroundColor: cfg.chipBg }}>
                                                <Text className="text-md font-nunito-black opacity-[0.35]" style={{ color: cfg.color }}>2</Text>
                                            </View>
                                            <Text className="text-xs font-nunito text-navy text-center mt-[5px]" numberOfLines={1}>{runnerUp.name}</Text>
                                            <Text className="text-[8px] font-nunito-semibold text-muted text-center mt-[1px]" numberOfLines={1}>
                                                {runnerUp.players.map(p => p.name.split(' ')[0]).join(' & ')}
                                            </Text>
                                        </View>
                                    )}
                                    {/* 1st */}
                                    {winner && (
                                        <View className="flex-1 items-center">
                                            <Text className="text-[24px] mb-[4px]">🥇</Text>
                                            <LinearGradient
                                                colors={cfg.gradient}
                                                className="w-full rounded-sm items-center justify-end pb-[4px]"
                                                style={{ height: 60 }}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 0, y: 1 }}
                                            >
                                                <Text className="text-xl font-nunito-black text-white opacity-70">1</Text>
                                            </LinearGradient>
                                            <Text className="text-xs font-nunito-black text-center mt-[5px]" style={{ color: cfg.color }} numberOfLines={1}>
                                                {winner.name}
                                            </Text>
                                            <Text className="text-[8px] font-nunito-semibold text-muted text-center mt-[1px]" numberOfLines={1}>
                                                {winner.players.map(p => p.name.split(' ')[0]).join(' & ')}
                                            </Text>
                                        </View>
                                    )}
                                    {/* 3rd */}
                                    {third && (
                                        <View className="flex-1 items-center mt-xl">
                                            <Text className="text-[18px] mb-[4px]">🥉</Text>
                                            <View className="w-full rounded-sm items-center justify-end pb-[4px]" style={{ height: 34, backgroundColor: cfg.barBg }}>
                                                <Text className="text-md font-nunito-black opacity-[0.35]" style={{ color: cfg.color }}>3</Text>
                                            </View>
                                            <Text className="text-xs font-nunito text-navy text-center mt-[5px]" numberOfLines={1}>{third.name}</Text>
                                            <Text className="text-[8px] font-nunito-semibold text-muted text-center mt-[1px]" numberOfLines={1}>
                                                {third.players.map(p => p.name.split(' ')[0]).join(' & ')}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </Container>
            </ScrollView>
        </View>
    );
};
