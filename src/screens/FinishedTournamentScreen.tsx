import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { Colors, Typography, Radii, Shadows } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';

type Nav = StackNavigationProp<RootStackParamList, 'FinishedTournament'>;
type Route = RouteProp<RootStackParamList, 'FinishedTournament'>;

export const FinishedTournamentScreen = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const t = mockTournaments.find(x => x.id === route.params.tournamentId);
    if (!t) return null;

    const totalTeams = t.vertentes.reduce((sum, v) => sum + v.teams.length, 0);
    const totalGames = React.useMemo(() => {
        const teamIds = new Set(t.vertentes.flatMap(v => v.teams.map(team => team.id)));
        return mockGames.filter(g => teamIds.has(g.team1.id) && teamIds.has(g.team2.id)).length;
    }, [t]);

    return (
        <View style={s.root}>
            {/* ═══ HEADER ═══ */}
            <LinearGradient
                colors={[Colors.navy, Colors.blue, Colors.green]}
                style={s.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={s.deco1} />
                <View style={s.deco2} />
                <SafeAreaView edges={['top']}>
                    <View style={s.topBar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={s.backTxt}>← Início</Text>
                        </TouchableOpacity>
                        <View style={s.donePill}>
                            <Text style={s.donePillTxt}>✅ Concluído</Text>
                        </View>
                    </View>

                    <View style={s.heroRow}>
                        <View style={s.trophyGlow}>
                            <Text style={s.trophyEmoji}>🏆</Text>
                        </View>
                    </View>
                    <Text style={s.heroTitle}>{t.name}</Text>
                    <Text style={s.heroSub}>📍 {t.location} · {t.startDate}–{t.endDate}</Text>

                    {/* Stats */}
                    <View style={s.statRow}>
                        <View style={s.statItem}>
                            <Text style={s.statNum}>{t.vertentes.length}</Text>
                            <Text style={s.statLbl}>Categorias</Text>
                        </View>
                        <View style={s.statSep} />
                        <View style={s.statItem}>
                            <Text style={s.statNum}>{totalTeams}</Text>
                            <Text style={s.statLbl}>Duplas</Text>
                        </View>
                        <View style={s.statSep} />
                        <View style={s.statItem}>
                            <Text style={s.statNum}>{totalGames}</Text>
                            <Text style={s.statLbl}>Jogos</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* ═══ BODY ═══ */}
            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                {t.vertentes.map((v) => {
                    const cfg = VERTENTE_CONFIG[v.type];
                    const winner = v.teams[0];
                    const runnerUp = v.teams[1];
                    const third = v.teams[2];

                    return (
                        <TouchableOpacity
                            key={v.id}
                            activeOpacity={0.85}
                            style={[s.card, { backgroundColor: cfg.barBg }]}
                            onPress={() => navigation.navigate('Podium', { tournamentId: t.id, vertenteId: v.id })}
                        >
                            {/* Colored top bar */}
                            <LinearGradient colors={cfg.gradient} style={s.cardAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

                            {/* Header */}
                            <View style={s.cardHeader}>
                                <LinearGradient colors={cfg.gradient} style={s.catBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={s.catBadgeTxt}>{cfg.emoji}</Text>
                                </LinearGradient>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.catTitle}>{cfg.label} {v.level}</Text>
                                    <Text style={s.catSub}>{v.teams.length} duplas · {v.courts} campos</Text>
                                </View>
                                <Text style={s.chevron}>›</Text>
                            </View>

                            {/* ── Podium bars ── */}
                            <View style={s.podWrap}>
                                {/* 2nd */}
                                {runnerUp && (
                                    <View style={[s.podCol, { marginTop: 16 }]}>
                                        <Text style={s.podMedal}>🥈</Text>
                                        <View style={[s.podBar, { height: 44, backgroundColor: cfg.chipBg }]}>
                                            <Text style={[s.podRank, { color: cfg.color }]}>2</Text>
                                        </View>
                                        <Text style={s.podName} numberOfLines={1}>{runnerUp.name}</Text>
                                        <Text style={s.podPlayers} numberOfLines={1}>
                                            {runnerUp.players.map(p => p.name.split(' ')[0]).join(' & ')}
                                        </Text>
                                    </View>
                                )}
                                {/* 1st */}
                                {winner && (
                                    <View style={s.podCol}>
                                        <Text style={s.podMedalGold}>🥇</Text>
                                        <LinearGradient
                                            colors={cfg.gradient}
                                            style={[s.podBar, { height: 60 }]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 0, y: 1 }}
                                        >
                                            <Text style={s.podRankGold}>1</Text>
                                        </LinearGradient>
                                        <Text style={[s.podName, { color: cfg.color, fontFamily: Typography.fontFamilyBlack }]} numberOfLines={1}>
                                            {winner.name}
                                        </Text>
                                        <Text style={s.podPlayers} numberOfLines={1}>
                                            {winner.players.map(p => p.name.split(' ')[0]).join(' & ')}
                                        </Text>
                                    </View>
                                )}
                                {/* 3rd */}
                                {third && (
                                    <View style={[s.podCol, { marginTop: 24 }]}>
                                        <Text style={s.podMedal}>🥉</Text>
                                        <View style={[s.podBar, { height: 34, backgroundColor: cfg.barBg }]}>
                                            <Text style={[s.podRank, { color: cfg.color }]}>3</Text>
                                        </View>
                                        <Text style={s.podName} numberOfLines={1}>{third.name}</Text>
                                        <Text style={s.podPlayers} numberOfLines={1}>
                                            {third.players.map(p => p.name.split(' ')[0]).join(' & ')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.gbg },

    /* ── Header ── */
    header: { paddingHorizontal: 18, paddingBottom: 20, overflow: 'hidden' },
    deco1: {
        position: 'absolute', width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.06)', bottom: -70, right: -50,
    },
    deco2: {
        position: 'absolute', width: 120, height: 120, borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)', top: 10, left: -40,
    },
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 6, paddingBottom: 4,
    },
    backTxt: { color: 'rgba(255,255,255,0.7)', fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBold },
    donePill: {
        backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 4,
    },
    donePillTxt: { color: Colors.white, fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily },

    heroRow: { alignItems: 'center', marginTop: 4, marginBottom: 6 },
    trophyGlow: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: 'rgba(255,214,0,0.15)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: 'rgba(255,214,0,0.2)',
    },
    trophyEmoji: { fontSize: 34 },
    heroTitle: { color: Colors.white, fontSize: Typography.fontSize.xxl, fontFamily: Typography.fontFamilyBlack, textAlign: 'center' },
    heroSub: { color: 'rgba(255,255,255,0.55)', fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilySemiBold, marginTop: 3, textAlign: 'center' },

    statRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radii.lg,
        marginTop: 14, paddingVertical: 10, paddingHorizontal: 6,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: Typography.fontSize.xxl, fontFamily: Typography.fontFamilyBlack, color: Colors.white },
    statLbl: { fontSize: Typography.fontSize.xxs, fontFamily: Typography.fontFamilyBold, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
    statSep: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.15)' },

    /* ── Scroll ── */
    scroll: { flex: 1 },
    scrollContent: { padding: 14, paddingBottom: 36 },

    /* ── Card ── */
    card: {
        borderRadius: Radii.xl, marginBottom: 14, overflow: 'hidden',
        ...Shadows.card,
    },
    cardAccent: { height: 4 },
    cardHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6,
    },
    catBadge: {
        width: 40, height: 40, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    catBadgeTxt: { fontSize: 18 },
    catTitle: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily, color: Colors.navy },
    catSub: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 1 },
    chevron: { fontSize: 24, color: Colors.gray },

    /* ── Podium ── */
    podWrap: {
        flexDirection: 'row', alignItems: 'flex-end',
        justifyContent: 'center', gap: 8, paddingHorizontal: 14,
        paddingTop: 6, paddingBottom: 16,
    },
    podCol: { flex: 1, alignItems: 'center' },
    podMedal: { fontSize: 18, marginBottom: 4 },
    podMedalGold: { fontSize: 24, marginBottom: 4 },
    podBar: {
        width: '100%', borderRadius: Radii.sm, alignItems: 'center',
        justifyContent: 'flex-end', paddingBottom: 4,
    },
    podRank: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilyBlack, opacity: 0.35 },
    podRankGold: { fontSize: Typography.fontSize.xl, fontFamily: Typography.fontFamilyBlack, color: Colors.white, opacity: 0.7 },
    podName: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily, color: Colors.navy, textAlign: 'center', marginTop: 5 },
    podPlayers: { fontSize: 8, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, textAlign: 'center', marginTop: 1 },
});
