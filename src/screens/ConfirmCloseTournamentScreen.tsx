import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { parseDatePt } from '../utils/constants';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Typography, TextStyles, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ConfirmCloseTournament'>;

const MEDAL = ['🥇', '🥈', '🥉'];
const AVATAR_COLORS: [string, string][] = [
    [Colors.goldDark, Colors.yellow],
    [Colors.green, Colors.greenDark],
    [Colors.purpleDark, Colors.purpleLight],
];

const initials = (name: string) =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');

export const ConfirmCloseTournamentScreen = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const tournament =
        mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
    const vertente =
        tournament.vertentes.find(v => v.id === route.params.vertenteId) ??
        tournament.vertentes[0];

    // Games for this vertente's teams
    const vertenteTeamIds = new Set(vertente.teams.map(t => t.id));
    const games = mockGames.filter(
        g => vertenteTeamIds.has(g.team1.id) || vertenteTeamIds.has(g.team2.id),
    );
    const totalGames = games.length;
    const totalTeams = vertente.teams.length;

    // Days between startDate and endDate
    const startD = parseDatePt(tournament.startDate);
    const endD = parseDatePt(tournament.endDate);
    const days = startD && endD
        ? Math.max(1, Math.round((endD.getTime() - startD.getTime()) / 86_400_000) + 1)
        : 1;

    // Top 3 teams: take first 3 from vertente (mock ranking order)
    const top3 = vertente.teams.slice(0, 3);

    // Last finished game for score summary
    const lastFinished = [...games].reverse().find(g => g.status === 'finished');
    const finalScore = lastFinished?.sets
        ? lastFinished.sets.map(s => `${s.team1}–${s.team2}`).join(' / ')
        : '—';

    return (
        <View style={s.container}>
            <LinearGradient colors={Gradients.header} style={s.header}>
                <SafeAreaView edges={['top']}>
                    <HeaderNav
                        backLabel="Resultado Final"
                        onBack={() => navigation.goBack()}
                    />
                    <SubBadge type={vertente.type} level={vertente.level} />
                    <Text style={s.title}>Confirmar Fecho 🏁</Text>
                    <Text style={s.subtitle}>Verifica antes de fechar o sub-torneio</Text>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg, backgroundColor: Colors.white }}>
                {/* Resultado da Final */}
                <Text style={s.sectionLabel}>Resultado da Final</Text>
                <View style={s.card}>
                    {top3.map((team, i) => (
                        <View
                            key={team.id}
                            style={[s.teamRow, i < top3.length - 1 && s.teamRowBorder]}
                        >
                            <LinearGradient colors={AVATAR_COLORS[i]} style={s.avatar}>
                                <Text style={s.avatarTxt}>{initials(team.name)}</Text>
                            </LinearGradient>
                            <Text style={s.teamName}>{team.name}</Text>
                            <Text style={s.medal}>{MEDAL[i]}</Text>
                        </View>
                    ))}
                    {finalScore !== '—' && (
                        <Text style={s.finalScore}>Final: {finalScore}</Text>
                    )}
                </View>

                {/* Stats */}
                <View style={s.statsRow}>
                    {[
                        { value: totalGames, label: 'jogos', color: Colors.blue },
                        { value: totalTeams, label: 'duplas', color: Colors.green },
                        { value: days, label: days === 1 ? 'dia' : 'dias', color: Colors.orange },
                    ].map(({ value, label, color }) => (
                        <View key={label} style={s.statBox}>
                            <Text style={[s.statNum, { color }]}>{value}</Text>
                            <Text style={s.statLbl}>{label}</Text>
                        </View>
                    ))}
                </View>

                {/* Warning */}
                <View style={s.warning}>
                    <Text style={s.warningIcon}>⚠️</Text>
                    <Text style={s.warningTxt}>
                        Após confirmar, os resultados ficam bloqueados. Ainda podes editar antes de fechar.
                    </Text>
                </View>

                {/* CTA */}
                <TouchableOpacity
                    style={s.confirmBtn}
                    onPress={() =>
                        navigation.navigate('Podium', {
                            tournamentId: route.params.tournamentId,
                            vertenteId: route.params.vertenteId,
                        })
                    }
                >
                    <LinearGradient colors={Gradients.primary} style={s.confirmGrad}>
                        <Text style={s.confirmTxt}>Confirmar e ver pódio 🏆</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={s.backBtnTxt}>← Rever resultados</Text>
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>
            <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
        </View>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.gbg },
    header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
    title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 8 },
    subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilySemiBold, marginTop: 4 },
    scroll: { flex: 1, backgroundColor: Colors.white },
    sectionLabel: { ...TextStyles.sectionLabel, marginBottom: 10 },
    card: { backgroundColor: Colors.gbg, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.card },
    teamRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
    teamRowBorder: { borderBottomWidth: 1.5, borderBottomColor: Colors.gl },
    avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    avatarTxt: { color: Colors.white, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilyBlack },
    teamName: { flex: 1, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBlack, color: Colors.navy },
    medal: { fontSize: 20 },
    finalScore: { textAlign: 'center', marginTop: 10, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.muted },
    statsRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
    statBox: { flex: 1, backgroundColor: Colors.white, borderRadius: Radii.lg, padding: 11, ...Shadows.card, alignItems: 'center' },
    statNum: { fontSize: Typography.fontSize.xxl, fontFamily: Typography.fontFamilyBlack },
    statLbl: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted },
    warning: { backgroundColor: Colors.yellowBgWarm, borderWidth: 1.5, borderColor: Colors.yellow, borderRadius: Radii.md, padding: 11, marginBottom: Spacing.lg, flexDirection: 'row', gap: 10 },
    warningIcon: { fontSize: 16 },
    warningTxt: { flex: 1, fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilySemiBold, color: Colors.navy, lineHeight: 18 },
    confirmBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: Spacing.sm },
    confirmGrad: { padding: 15, alignItems: 'center' },
    confirmTxt: { color: Colors.white, fontSize: 15, fontFamily: Typography.fontFamily },
    backBtn: { alignItems: 'center', padding: 12, backgroundColor: Colors.white, borderRadius: Radii.lg, borderWidth: 2, borderColor: Colors.gl },
    backBtnTxt: { color: Colors.navy, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily },
});
