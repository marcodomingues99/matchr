import React from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Team, Vertente, Game } from '../types';
import { Colors, Gradients } from '../theme';
import { MONTHS, GAME_STATUS } from '../utils/constants';
import { getInitials } from '../utils/teamUtils';
import clsx from 'clsx';

interface Props {
    visible: boolean;
    onClose: () => void;
    team: Team | null;
    vertente: Vertente | null;
    games: Game[];
}

const phaseLabel: Record<string, string> = {
    groups: 'Grupos',
    r16: 'Oitavos',
    qf: 'Quartos',
    sf: 'Meias-finais',
    final: 'Final',
    '3rd': '3º Lugar',
};

function formatSets(sets: Game['sets'], isTeam1: boolean): string {
    if (!sets?.length) return '';
    return sets
        .map(s => (isTeam1 ? `${s.team1}–${s.team2}` : `${s.team2}–${s.team1}`))
        .join(' / ');
}

export const TeamGamesSheet: React.FC<Props> = React.memo(({
    visible,
    onClose,
    team,
    vertente,
    games,
}) => {
    const insets = useSafeAreaInsets();
    const { height: screenH } = useWindowDimensions();

    if (!team || !vertente) return null;

    const teamGames = games.filter(
        g => g.team1.id === team.id || g.team2.id === team.id,
    );

    const currentYear = new Date().getFullYear();
    const parseDateTime = (g: Game): number => {
        const [day, mon] = g.date.split(' ');
        const [h, m] = g.time.split(':').map(Number);
        return new Date(currentYear, MONTHS[mon] ?? 0, Number(day), h, m).getTime();
    };
    const sorted = [...teamGames].sort((a, b) => parseDateTime(a) - parseDateTime(b));

    const groupGames = teamGames.filter(g => g.phase === 'groups');
    const groupPlayed = groupGames.filter(
        g => g.status === GAME_STATUS.FINISHED || g.status === GAME_STATUS.WALKOVER,
    ).length;
    const groupTotal = groupGames.length;

    const categoryLabel =
        vertente.level !== 'Sem' ? vertente.level : vertente.type;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="absolute inset-0 bg-overlay-dark"
                activeOpacity={1}
                onPress={onClose}
            />

            <View
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[22px]"
                style={{
                    paddingBottom: insets.bottom + 8,
                    maxHeight: screenH * 0.82,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                    elevation: 20,
                }}
            >
                {/* Pull handle */}
                <View className="pt-[10px] items-center">
                    <View className="w-[40px] h-[4px] rounded-[2px] bg-handle-gray" />
                </View>

                {/* Team gradient banner */}
                <View className="px-[18px] pt-[14px]">
                    <LinearGradient
                        colors={Gradients.header}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="rounded-lg p-[14px] flex-row items-center gap-[13px]"
                    >
                        <View className="w-[50px] h-[50px] rounded-[14px] bg-[rgba(255,255,255,0.2)] items-center justify-center shrink-0 overflow-hidden">
                            {team.photo ? (
                                <Image
                                    source={{ uri: team.photo }}
                                    style={{ width: 50, height: 50 }}
                                    className="rounded-[14px]"
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text className="font-nunito-black text-white" style={{ fontSize: 17 }}>{getInitials(team.name)}</Text>
                            )}
                        </View>

                        <View className="flex-1 min-w-0">
                            <Text className="text-xl font-nunito-black text-white" numberOfLines={1}>
                                {team.name}
                            </Text>
                            <Text className="text-sm text-[rgba(255,255,255,0.7)] mt-[2px] font-nunito-semibold" numberOfLines={1}>
                                {team.players
                                    .map(p => p.name)
                                    .filter(Boolean)
                                    .join(' · ') || '—'}
                            </Text>
                            <View className="flex-row gap-[5px] mt-[6px]">
                                {team.group ? (
                                    <View className="bg-[rgba(255,255,255,0.2)] rounded-[6px] px-sm py-[2px]">
                                        <Text className="text-xs font-nunito text-white">Grupo {team.group}</Text>
                                    </View>
                                ) : null}
                                <View className="bg-[rgba(255,255,255,0.2)] rounded-[6px] px-sm py-[2px]">
                                    <Text className="text-xs font-nunito text-white">{categoryLabel}</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity className="self-start p-[4px]" onPress={onClose}>
                            <Text className="text-[rgba(255,255,255,0.5)]" style={{ fontSize: 18 }}>✕</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* Group progress bar */}
                {groupTotal > 0 && (
                    <View className="px-[18px] pt-md">
                        <View className="flex-row justify-between items-center mb-[5px]">
                            <Text className="text-xs font-nunito text-muted">
                                Fase de Grupos{team.group ? ` — Grupo ${team.group}` : ''}
                            </Text>
                            <Text className="text-xs font-nunito text-navy">
                                {groupPlayed}/{groupTotal} jogos
                            </Text>
                        </View>
                        <View className="h-[4px] bg-gl rounded-[2px] overflow-hidden">
                            <LinearGradient
                                colors={[Colors.green, Colors.teal]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="h-[4px] rounded-[2px]"
                                style={{
                                    width: `${groupTotal > 0
                                        ? Math.round((groupPlayed / groupTotal) * 100)
                                        : 0
                                        }%`,
                                }}
                            />
                        </View>
                    </View>
                )}

                {/* Games list */}
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerClassName="px-[18px] pt-md pb-xl gap-[10px]"
                >
                    {sorted.length === 0 ? (
                        <View className="items-center pt-[30px]">
                            <Text className="text-base font-nunito-bold text-muted">Sem jogos registados</Text>
                        </View>
                    ) : (
                        sorted.map(game => {
                            const isTeam1 = game.team1.id === team.id;
                            const opponent = isTeam1 ? game.team2 : game.team1;
                            const isFinished = game.status === GAME_STATUS.FINISHED;
                            const isLive = game.status === GAME_STATUS.LIVE;
                            const isPaused = game.status === GAME_STATUS.PAUSED;
                            const isScheduled = game.status === GAME_STATUS.SCHEDULED;

                            let headerColors: readonly [string, string, ...string[]];
                            let headerLabel: string;

                            if (isFinished) {
                                headerColors = Gradients.finished;
                                headerLabel = `✅ ${phaseLabel[game.phase] ?? game.phase}`;
                            } else if (isLive) {
                                headerColors = Gradients.live;
                                headerLabel = `● Ao vivo · ${phaseLabel[game.phase] ?? game.phase}`;
                            } else if (isPaused) {
                                headerColors = Gradients.paused;
                                headerLabel = `⏸ Pausado · ${phaseLabel[game.phase] ?? game.phase}`;
                            } else {
                                headerColors = Gradients.scheduled;
                                headerLabel = `🕒 ${phaseLabel[game.phase] ?? game.phase}`;
                            }

                            const resultStr =
                                isFinished || isLive || isPaused
                                    ? formatSets(game.sets, isTeam1)
                                    : '';

                            const weWon =
                                isFinished &&
                                game.winnerId ===
                                (isTeam1 ? game.team1.id : game.team2.id);

                            const resultLabel = isLive
                                ? '1º Set em curso'
                                : isFinished
                                    ? weWon
                                        ? '🏆 Vitória'
                                        : '❌ Derrota'
                                    : isPaused
                                        ? 'Pausado'
                                        : '';

                            return (
                                <View key={game.id} className="rounded-[14px] overflow-hidden shadow-card">
                                    <LinearGradient
                                        colors={headerColors}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className="py-sm px-[14px] flex-row items-center justify-between gap-[6px]"
                                    >
                                        {isLive && <View className="w-[7px] h-[7px] rounded-[4px] bg-white shrink-0" />}
                                        <Text className="text-xs font-nunito text-white flex-1">{headerLabel}</Text>
                                        <Text className="text-xs font-nunito-bold text-[rgba(255,255,255,0.8)]">
                                            {game.date} · {game.time} · {game.court}
                                        </Text>
                                    </LinearGradient>

                                    <View className="bg-white p-sm px-[14px] flex-row items-center justify-between">
                                        <View>
                                            <Text className="text-sm text-muted mb-[2px]">vs</Text>
                                            <Text className="text-base font-nunito-black text-navy">{opponent.name}</Text>
                                        </View>

                                        <View className="items-end">
                                            {isScheduled ? (
                                                <Text className="text-xs text-muted">A jogar</Text>
                                            ) : (
                                                <>
                                                    {resultLabel ? (
                                                        <Text className="text-xs text-muted mb-[2px]">{resultLabel}</Text>
                                                    ) : null}
                                                    <Text
                                                        className={clsx(
                                                            'text-xl font-nunito-black text-blue',
                                                            isLive && 'text-red',
                                                            isPaused && 'text-orange',
                                                        )}
                                                    >
                                                        {resultStr || '–'}
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
});
