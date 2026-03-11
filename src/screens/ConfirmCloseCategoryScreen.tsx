import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockMatches, mockTeamMap } from '../mock/data';
import { resolveMatches } from '../utils/resolveMatch';
import { daysBetween } from '../utils/dateUtils';
import { popTo } from '../utils/navigation';
import { calcStats } from '../utils/scoring';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients } from '../theme';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ConfirmCloseCategory'>;

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

export const ConfirmCloseCategoryScreen = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
    const category = tournament?.categories.find(v => v.id === route.params.categoryId);

    if (!tournament || !category) return null;

    // Games for this category's teams
    const categoryTeamIds = new Set(category.teams.map(t => t.id));
    const rawMatches = mockMatches.filter(
        g => categoryTeamIds.has(g.team1Id) && categoryTeamIds.has(g.team2Id),
    );
    const matches = resolveMatches(rawMatches, mockTeamMap);
    const totalMatches = matches.length;
    const totalTeams = category.teams.length;

    // Days between startDate and endDate
    const days = daysBetween(tournament.startDate, tournament.endDate);

    // Top 3 from final/3rd-place results, with stats fallback
    const finishedBracketMatches = matches.filter(g =>
        g.phase !== 'groups' &&
        (g.status === 'finished' || g.status === 'walkover') &&
        !!g.winnerId,
    );
    const finalMatch = [...finishedBracketMatches].reverse().find(g => g.phase === 'final');
    const thirdPlaceMatch = [...finishedBracketMatches].reverse().find(g => g.phase === '3rd');

    const winner = finalMatch
        ? (finalMatch.winnerId === finalMatch.team1Id ? finalMatch.team1 : finalMatch.team2)
        : undefined;
    const runnerUp = finalMatch
        ? (finalMatch.winnerId === finalMatch.team1Id ? finalMatch.team2 : finalMatch.team1)
        : undefined;
    const third = thirdPlaceMatch
        ? (thirdPlaceMatch.winnerId === thirdPlaceMatch.team1Id ? thirdPlaceMatch.team1 : thirdPlaceMatch.team2)
        : undefined;

    const fallbackByStats = category.teams
        .filter(t => !t.withdrawn)
        .map(team => ({
            team,
            stats: calcStats(team.id, matches, category.pointsPerWin),
        }))
        .sort((a, b) => {
            if (b.stats.pts !== a.stats.pts) return b.stats.pts - a.stats.pts;
            return (b.stats.setsWon - b.stats.setsLost) - (a.stats.setsWon - a.stats.setsLost);
        })
        .map(x => x.team);

    const top3 = [winner, runnerUp, third].filter(Boolean) as typeof category.teams;
    fallbackByStats.forEach(team => {
        if (top3.length < 3 && !top3.some(t => t.id === team.id)) {
            top3.push(team);
        }
    });

    // Final score summary
    const finalScore = finalMatch?.sets
        ? finalMatch.sets.map(s => `${s.team1}–${s.team2}`).join(' / ')
        : '—';

    return (
        <View className="flex-1 bg-gbg">
            <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
                <SafeAreaView edges={['top']}>
                    <HeaderNav
                        backLabel="Resultado Final"
                        onBack={() => navigation.goBack()}
                    />
                    <SubBadge type={category.type} level={category.level} />
                    <Text className="text-white text-[26px] md:text-[32px] font-nunito-black mt-sm">Confirmar Fecho 🏁</Text>
                    <Text className="text-white/75 text-base font-nunito-semibold mt-[4px]">Verifica antes de fechar a categoria</Text>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView className="flex-1 bg-white" contentContainerClassName="p-lg bg-white">
                <Container>
                    {/* Resultado da Final */}
                    <Text className="text-xxs font-nunito-bold text-muted uppercase tracking-[1px] mb-[10px]">Resultado da Final</Text>
                    <View className="bg-gbg rounded-lg p-md mb-md shadow-card">
                        {top3.map((team, i) => (
                            <View
                                key={team.id}
                                className={`flex-row items-center gap-[10px] py-[10px] ${i < top3.length - 1 ? 'border-b-[1.5px] border-gl' : ''}`}
                            >
                                <LinearGradient colors={AVATAR_COLORS[i]} className="w-[38px] h-[38px] rounded-full items-center justify-center">
                                    <Text className="text-white text-md font-nunito-black">{initials(team.name)}</Text>
                                </LinearGradient>
                                <Text className="flex-1 text-base font-nunito-black text-navy">{team.name}</Text>
                                <Text className="text-[20px]">{MEDAL[i]}</Text>
                            </View>
                        ))}
                        {finalScore !== '—' && (
                            <Text className="text-center mt-[10px] text-md font-nunito text-muted">Final: {finalScore}</Text>
                        )}
                    </View>

                    {/* Stats */}
                    <View className="flex-row gap-sm mb-md">
                        {[
                            { value: totalMatches, label: 'jogos', color: Colors.blue },
                            { value: totalTeams, label: 'duplas', color: Colors.green },
                            { value: days, label: days === 1 ? 'dia' : 'dias', color: Colors.orange },
                        ].map(({ value, label, color }) => (
                            <View key={label} className="flex-1 bg-white rounded-lg p-[11px] shadow-card items-center">
                                <Text className="text-[20px] font-nunito-black" style={{ color }}>{value}</Text>
                                <Text className="text-xs font-nunito-semibold text-muted">{label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Warning */}
                    <View className="bg-yellow-bg-warm border-[1.5px] border-yellow rounded-md p-[11px] mb-lg flex-row gap-[10px]">
                        <Text className="text-[16px]">⚠️</Text>
                        <Text className="flex-1 text-sm font-nunito-semibold text-navy leading-[18px]">
                            Após confirmar, os resultados ficam bloqueados. Ainda podes editar antes de fechar.
                        </Text>
                    </View>

                    {/* CTA */}
                    <TouchableOpacity
                        className="rounded-lg overflow-hidden mb-sm"
                        onPress={() =>
                            navigation.navigate('Podium', {
                                tournamentId: route.params.tournamentId,
                                categoryId: route.params.categoryId,
                            })
                        }
                    >
                        <LinearGradient colors={Gradients.primary} className="p-[15px] items-center">
                            <Text className="text-white text-[15px] font-nunito">Confirmar e ver pódio 🏆</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center p-md bg-white rounded-lg border-2 border-gl" onPress={() => navigation.goBack()}>
                        <Text className="text-navy text-lg font-nunito">← Rever resultados</Text>
                    </TouchableOpacity>

                    <View className="h-2xl" />
                </Container>
            </ScrollView>
            <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
        </View>
    );
};
