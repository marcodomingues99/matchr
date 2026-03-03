import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { popTo } from '../utils/navigation';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Typography, Spacing, Radii } from '../theme';
import { AVATAR_GRADIENTS, getInitials } from '../utils/teamUtils';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'WithdrawConfirm'>;

type WithdrawOption = 'walkover' | 'remove';

export const WithdrawConfirmScreen = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const [selected, setSelected] = useState<WithdrawOption>('walkover');

    const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
    if (!tournament) return null;
    const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId);
    if (!vertente) return null;
    const teamIdx = vertente.teams.findIndex(t => t.id === route.params.teamId);
    const team = vertente.teams[teamIdx];

    if (!team) return null;

    const avatarColors = AVATAR_GRADIENTS[teamIdx % AVATAR_GRADIENTS.length];

    const handleConfirm = () => {
        // In a real app: mutate state based on selected option
        navigation.goBack();
    };

    return (
        <View style={s.container}>
            {/* ── Header (red gradient) ── */}
            <LinearGradient colors={[Colors.redDeep, Colors.red, Colors.redLight]} style={s.header}>
                <SafeAreaView edges={['top']}>
                    <HeaderNav
                        backLabel="Duplas"
                        onBack={() => navigation.goBack()}
                    />
                    <SubBadge type={vertente.type} level={vertente.level} />
                    <Text style={s.title}>Desistência 🚫</Text>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>

                {/* ── Team card ── */}
                <View style={s.teamCard}>
                    {team.photo ? (
                        <Image source={{ uri: team.photo }} style={s.teamAvatar} />
                    ) : (
                        <LinearGradient colors={avatarColors} style={s.teamAvatar}>
                            <Text style={s.teamAvatarTxt}>{getInitials(team.name)}</Text>
                        </LinearGradient>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={s.teamName}>{team.name}</Text>
                        <Text style={s.teamPlayers}>
                            {team.players.map(p => p.name).join(' · ')}
                            {team.group ? ` · Grupo ${team.group}` : ''}
                        </Text>
                    </View>
                </View>

                {/* ── Question ── */}
                <Text style={s.question}>Como tratar os jogos desta dupla?</Text>

                {/* ── Option 1: Walkover ── */}
                <TouchableOpacity
                    style={[s.option, selected === 'walkover' && s.optionSelected]}
                    onPress={() => setSelected('walkover')}
                    activeOpacity={0.85}
                >
                    <Text style={s.optionEmoji}>🏳️</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={s.optionTitle}>Walkover</Text>
                        <Text style={s.optionDesc}>Adversários ganham por W.O. · grupos mantêm-se</Text>
                    </View>
                    <View style={[s.radio, selected === 'walkover' && s.radioSelected]}>
                        {selected === 'walkover' && <View style={s.radioDot} />}
                    </View>
                </TouchableOpacity>

                {/* ── Option 2: Remover ── */}
                <TouchableOpacity
                    style={[s.option, selected === 'remove' && s.optionSelectedBlue]}
                    onPress={() => setSelected('remove')}
                    activeOpacity={0.85}
                >
                    <Text style={s.optionEmoji}>🔄</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={s.optionTitle}>Retirar e reorganizar</Text>
                        <Text style={s.optionDesc}>Remove a dupla e regenera a grelha de grupos</Text>
                    </View>
                    <View style={[s.radio, selected === 'remove' && s.radioSelectedBlue]}>
                        {selected === 'remove' && <View style={[s.radioDot, s.radioDotBlue]} />}
                    </View>
                </TouchableOpacity>

                {/* ── Warning ── */}
                <View style={s.warning}>
                    <Text style={s.warningIcon}>⚠️</Text>
                    <Text style={s.warningText}>
                        Esta ação não pode ser desfeita. Resultados já introduzidos com esta dupla serão afetados.
                    </Text>
                </View>

                {/* ── Buttons ── */}
                <TouchableOpacity onPress={handleConfirm} activeOpacity={0.85}>
                    <LinearGradient colors={[Colors.redDeep, Colors.red]} style={s.btnConfirm}>
                        <Text style={s.btnConfirmTxt}>Confirmar desistência</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={s.btnCancel} onPress={() => navigation.goBack()}>
                    <Text style={s.btnCancelTxt}>Cancelar</Text>
                </TouchableOpacity>

            </ScrollView>
            <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
        </View>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },

    // Header
    header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
    title: { color: Colors.white, fontSize: Typography.fontSize.xxl, fontFamily: Typography.fontFamilyBlack, marginTop: 4 },

    scroll: { flex: 1 },
    scrollContent: { padding: 14, paddingBottom: 28 },

    // Team card
    teamCard: {
        backgroundColor: Colors.gbg,
        borderRadius: Radii.md,
        padding: 13,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    teamAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    teamAvatarTxt: { color: Colors.white, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBlack },
    teamName: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBlack, color: Colors.navy },
    teamPlayers: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 2 },

    // Question
    question: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy, marginBottom: 12 },

    // Option
    option: {
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.gl,
        borderRadius: Radii.md,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    optionSelected: { borderColor: Colors.orange },
    optionSelectedBlue: { borderColor: Colors.blue },
    optionEmoji: { fontSize: 24, flexShrink: 0 },
    optionTitle: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
    optionDesc: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 2, lineHeight: 16 },

    // Radio
    radio: {
        width: 20, height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.gl,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    radioSelected: { borderColor: Colors.orange },
    radioSelectedBlue: { borderColor: Colors.blue },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.orange },
    radioDotBlue: { backgroundColor: Colors.blue },

    // Warning
    warning: {
        backgroundColor: Colors.yellowBgWarm,
        borderWidth: 1.5,
        borderColor: Colors.yellow,
        borderRadius: 11,
        padding: 11,
        paddingHorizontal: 13,
        marginBottom: 20,
        flexDirection: 'row',
        gap: 10,
    },
    warningIcon: { fontSize: 16, flexShrink: 0 },
    warningText: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilySemiBold, color: Colors.navy, lineHeight: 18, flex: 1 },

    // Buttons
    btnConfirm: { borderRadius: 11, padding: 12, alignItems: 'center', marginBottom: 8 },
    btnConfirmTxt: { color: Colors.white, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily },
    btnCancel: {
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.gl,
        borderRadius: 11,
        padding: 12,
        alignItems: 'center',
    },
    btnCancelTxt: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },

});
