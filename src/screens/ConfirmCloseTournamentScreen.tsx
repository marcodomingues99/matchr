import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments, mockGames } from '../mock/data';
import { parseDatePt } from '../utils/constants';
import { popTo } from '../utils/navigation';
import { calcStats } from '../utils/scoring';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients } from '../theme';
import { Container } from '../components/Layout';

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
    const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
    const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);

    if (!tournament || !vertente) return null;

    // Games for this vertente's teams
    const vertenteTeamIds = new Set(vertente.teams.map(t => t.id));
    const games = mockGames.filter(
        g => vertenteTeamIds.has(g.team1.id) && vertenteTeamIds.has(g.team2.id),
    );
    const totalGames = games.length;
    const totalTeams = vertente.teams.length;

    // Days between startDate and endDate
    const startD = parseDatePt(tournament.startDate);
    const endD = parseDatePt(tournament.endDate);
    const days = startD && endD
        ? Math.max(1, Math.round((endD.getTime() - startD.getTime()) / 86_400_000) + 1)
        : 1;

    // Top 3 from final/3rd-place results, with stats fallback
    const finishedBracketGames = games.filter(g =>
        g.phase !== 'groups' &&
        (g.status === 'finished' || g.status === 'walkover') &&
        !!g.winnerId,
    );
    const finalGame = [...finishedBracketGames].reverse().find(g => g.phase === 'final');
    const thirdPlaceGame = [...finishedBracketGames].reverse().find(g => g.phase === '3rd');

    const winner = finalGame
        ? (finalGame.winnerId === finalGame.team1.id ? finalGame.team1 : finalGame.team2)
        : undefined;
    const runnerUp = finalGame
        ? (finalGame.winnerId === finalGame.team1.id ? finalGame.team2 : finalGame.team1)
        : undefined;
    const third = thirdPlaceGame
        ? (thirdPlaceGame.winnerId === thirdPlaceGame.team1.id ? thirdPlaceGame.team1 : thirdPlaceGame.team2)
        : undefined;

    const fallbackByStats = vertente.teams
        .filter(t => !t.withdrawn)
        .map(team => ({
            team,
            stats: calcStats(team.id, games, vertente.pointsPerWin),
        }))
        .sort((a, b) => {
            if (b.stats.pts !== a.stats.pts) return b.stats.pts - a.stats.pts;
            return (b.stats.gamesWon - b.stats.gamesLost) - (a.stats.gamesWon - a.stats.gamesLost);
        })
        .map(x => x.team);

    const top3 = [winner, runnerUp, third].filter(Boolean) as typeof vertente.teams;
    fallbackByStats.forEach(team => {
        if (top3.length < 3 && !top3.some(t => t.id === team.id)) {
            top3.push(team);
        }
    });

    // Final score summary
    const finalScore = finalGame?.sets
        ? finalGame.sets.map(s => `${s.team1}–${s.team2}`).join(' / ')
        : '—';

    return (
        <View className="flex-1 bg-gbg">
            <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
                <SafeAreaView edges={['top']}>
                    <HeaderNav
                        backLabel="Resultado Final"
                        onBack={() => navigation.goBack()}
                    />
                    <SubBadge type={vertente.type} level={vertente.level} />
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
                            { value: totalGames, label: 'jogos', color: Colors.blue },
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
                                vertenteId: route.params.vertenteId,
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
