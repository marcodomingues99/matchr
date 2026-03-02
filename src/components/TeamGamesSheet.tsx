import React from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Team, Vertente, Game } from '../types';
import { Colors, Gradients, Spacing, Radii } from '../theme';

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

function teamInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
}

function formatSets(sets: Game['sets'], isTeam1: boolean): string {
    if (!sets?.length) return '';
    return sets
        .map(s => (isTeam1 ? `${s.team1}–${s.team2}` : `${s.team2}–${s.team1}`))
        .join(' / ');
}

export const TeamGamesSheet: React.FC<Props> = ({
    visible,
    onClose,
    team,
    vertente,
    games,
}) => {
    const insets = useSafeAreaInsets();

    if (!team || !vertente) return null;

    // Filter games for this team (by id first; bracket may use name-based teams)
    const teamGames = games.filter(
        g => g.team1.id === team.id || g.team2.id === team.id,
    );

    // Sort by date + time chronologically
    const MONTHS: Record<string, number> = {
        Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
        Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
    };
    const parseDateTime = (g: Game): number => {
        const [day, mon] = g.date.split(' ');
        const [h, m] = g.time.split(':').map(Number);
        const d = new Date(2026, MONTHS[mon] ?? 0, Number(day), h, m);
        return d.getTime();
    };
    const sorted = [...teamGames].sort((a, b) => parseDateTime(a) - parseDateTime(b));

    // Group phase progress
    const groupGames = teamGames.filter(g => g.phase === 'groups');
    const groupPlayed = groupGames.filter(
        g => g.status === 'finished' || g.status === 'walkover',
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
            {/* Dark overlay – tappable to dismiss */}
            <TouchableOpacity
                style={s.overlay}
                activeOpacity={1}
                onPress={onClose}
            />

            {/* Bottom sheet */}
            <View style={[s.sheet, { paddingBottom: insets.bottom + 8 }]}>
                {/* Pull handle */}
                <View style={s.handleWrap}>
                    <View style={s.handle} />
                </View>

                {/* Team gradient banner */}
                <View style={s.headerPad}>
                    <LinearGradient
                        colors={Gradients.header as [string, string, ...string[]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={s.teamBanner}
                    >
                        {/* Avatar */}
                        <View style={s.avatar}>
                            {team.photo ? (
                                <Image
                                    source={{ uri: team.photo }}
                                    style={s.avatarImg}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text style={s.avatarTxt}>{teamInitials(team.name)}</Text>
                            )}
                        </View>

                        {/* Info */}
                        <View style={s.teamInfo}>
                            <Text style={s.teamName} numberOfLines={1}>
                                {team.name}
                            </Text>
                            <Text style={s.playersLine} numberOfLines={1}>
                                {team.players
                                    .map(p => p.name)
                                    .filter(Boolean)
                                    .join(' · ') || '—'}
                            </Text>
                            <View style={s.badges}>
                                {team.group ? (
                                    <View style={s.badge}>
                                        <Text style={s.badgeTxt}>Grupo {team.group}</Text>
                                    </View>
                                ) : null}
                                <View style={s.badge}>
                                    <Text style={s.badgeTxt}>{categoryLabel}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Close */}
                        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                            <Text style={s.closeTxt}>✕</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* Group progress bar */}
                {groupTotal > 0 && (
                    <View style={s.progressPad}>
                        <View style={s.progressRow}>
                            <Text style={s.progressLabel}>
                                Fase de Grupos{team.group ? ` — Grupo ${team.group}` : ''}
                            </Text>
                            <Text style={s.progressCount}>
                                {groupPlayed}/{groupTotal} jogos
                            </Text>
                        </View>
                        <View style={s.progressBg}>
                            <LinearGradient
                                colors={[Colors.green, Colors.teal]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    s.progressFill,
                                    {
                                        width: `${groupTotal > 0
                                            ? Math.round((groupPlayed / groupTotal) * 100)
                                            : 0
                                            }%`,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                )}

                {/* Games list */}
                <ScrollView
                    style={s.scroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={s.scrollContent}
                >
                    {sorted.length === 0 ? (
                        <View style={s.empty}>
                            <Text style={s.emptyTxt}>Sem jogos registados</Text>
                        </View>
                    ) : (
                        sorted.map(game => {
                            const isTeam1 = game.team1.id === team.id;
                            const opponent = isTeam1 ? game.team2 : game.team1;
                            const isFinished = game.status === 'finished';
                            const isLive = game.status === 'live';
                            const isPaused = game.status === 'paused';
                            const isScheduled = game.status === 'scheduled';

                            let headerColors: string[];
                            let headerLabel: string;

                            if (isFinished) {
                                headerColors = ['#1A7A4A', Colors.green];
                                headerLabel = `✅ ${phaseLabel[game.phase] ?? game.phase}`;
                            } else if (isLive) {
                                headerColors = ['#9B0000', Colors.red];
                                headerLabel = `● Ao vivo · ${phaseLabel[game.phase] ?? game.phase}`;
                            } else if (isPaused) {
                                headerColors = ['#7A4A00', Colors.orange];
                                headerLabel = `⏸ Pausado · ${phaseLabel[game.phase] ?? game.phase}`;
                            } else {
                                headerColors = ['#3A4060', '#5566AA'];
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
                                <View key={game.id} style={s.gameCard}>
                                    {/* Coloured header */}
                                    <LinearGradient
                                        colors={headerColors as [string, string]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={s.gameHeader}
                                    >
                                        {isLive && <View style={s.liveDot} />}
                                        <Text style={s.gameHeaderLabel}>{headerLabel}</Text>
                                        <Text style={s.gameHeaderMeta}>
                                            {game.date} · {game.time} · {game.court}
                                        </Text>
                                    </LinearGradient>

                                    {/* White body */}
                                    <View style={s.gameBody}>
                                        <View>
                                            <Text style={s.vsLabel}>vs</Text>
                                            <Text style={s.opponentName}>{opponent.name}</Text>
                                        </View>

                                        <View style={s.resultBlock}>
                                            {isScheduled ? (
                                                <Text style={s.resultMuted}>A jogar</Text>
                                            ) : (
                                                <>
                                                    {resultLabel ? (
                                                        <Text style={s.resultLabel}>{resultLabel}</Text>
                                                    ) : null}
                                                    <Text
                                                        style={[
                                                            s.resultScore,
                                                            isLive && s.resultScoreLive,
                                                            isPaused && s.resultScorePaused,
                                                        ]}
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
};

const { height: SCREEN_H } = Dimensions.get('window');

const s = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(10,15,35,0.65)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        maxHeight: SCREEN_H * 0.82,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },

    /* Handle */
    handleWrap: { paddingTop: 10, alignItems: 'center' },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDE1ED' },

    /* Team banner */
    headerPad: { paddingHorizontal: 18, paddingTop: 14 },
    teamBanner: {
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
    },
    avatarImg: {
        width: 50,
        height: 50,
        borderRadius: 14,
    },
    avatarTxt: {
        fontSize: 17,
        fontFamily: 'Nunito_900Black',
        color: '#fff',
    },
    teamInfo: { flex: 1, minWidth: 0 },
    teamName: { fontSize: 16, fontFamily: 'Nunito_900Black', color: '#fff' },
    playersLine: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
        fontFamily: 'Nunito_600SemiBold',
    },
    badges: { flexDirection: 'row', gap: 5, marginTop: 6 },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeTxt: {
        fontSize: 10,
        fontFamily: 'Nunito_800ExtraBold',
        color: '#fff',
    },
    closeBtn: { alignSelf: 'flex-start', padding: 4 },
    closeTxt: { fontSize: 18, color: 'rgba(255,255,255,0.5)' },

    /* Progress */
    progressPad: { paddingHorizontal: 18, paddingTop: 12 },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    progressLabel: {
        fontSize: 10,
        fontFamily: 'Nunito_800ExtraBold',
        color: Colors.muted,
    },
    progressCount: {
        fontSize: 10,
        fontFamily: 'Nunito_800ExtraBold',
        color: Colors.navy,
    },
    progressBg: {
        height: 4,
        backgroundColor: Colors.gl,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: { height: 4, borderRadius: 2 },

    /* Games list */
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 24,
        gap: 10,
    },
    empty: { alignItems: 'center', paddingTop: 30 },
    emptyTxt: {
        fontSize: 13,
        fontFamily: 'Nunito_700Bold',
        color: Colors.muted,
    },

    /* Game card */
    gameCard: {
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 2,
    },
    gameHeader: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
    },
    liveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#fff',
        flexShrink: 0,
    },
    gameHeaderLabel: {
        fontSize: 10,
        fontFamily: 'Nunito_800ExtraBold',
        color: '#fff',
        flex: 1,
    },
    gameHeaderMeta: {
        fontSize: 10,
        fontFamily: 'Nunito_700Bold',
        color: 'rgba(255,255,255,0.8)',
    },
    gameBody: {
        backgroundColor: '#fff',
        padding: 11,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    vsLabel: { fontSize: 11, color: Colors.muted, marginBottom: 2 },
    opponentName: {
        fontSize: 13,
        fontFamily: 'Nunito_900Black',
        color: Colors.navy,
    },
    resultBlock: { alignItems: 'flex-end' },
    resultLabel: { fontSize: 10, color: Colors.muted, marginBottom: 2 },
    resultScore: {
        fontSize: 16,
        fontFamily: 'Nunito_900Black',
        color: Colors.blue,
    },
    resultScoreLive: { color: Colors.red },
    resultScorePaused: { color: Colors.orange },
    resultMuted: { fontSize: 10, color: Colors.muted },
});
