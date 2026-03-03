import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Typography, TextStyles, Radii, Shadows, Spacing } from '../theme';
import { AVATAR_GRADIENTS, getInitials } from '../utils/teamUtils';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { getMinTeamsToStart } from '../utils/constants';
import { GROUP_CHIP_POOL } from '../utils/groupColors';
import { popTo } from '../utils/navigation';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupsEmpty'>;

export const GroupsEmptyScreen = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
    const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);
    if (!tournament || !vertente) return null;

    const { label: typeLabel } = VERTENTE_CONFIG[vertente.type];
    const teamsConfirmed = vertente.teams.filter(t => !t.withdrawn).length;
    const minTeamsToStart = getMinTeamsToStart(vertente);
    const isFull = teamsConfirmed >= vertente.maxTeams;
    const isPartial = teamsConfirmed >= minTeamsToStart && !isFull;
    const canImport = isFull || isPartial;
    const remaining = vertente.maxTeams - teamsConfirmed;

    // Map each sorted group letter to its index for chip color lookup
    const groupIndex = useMemo(() => {
        const sorted = [...new Set(vertente.teams.map(t => t.group).filter(Boolean) as string[])].sort();
        const map: Record<string, number> = {};
        sorted.forEach((g, i) => { map[g] = i; });
        return map;
    }, [vertente.teams]);

    const [pickedFile, setPickedFile] = useState<string | null>(null);

    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'application/vnd.ms-excel',
                    'text/csv',
                ],
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setPickedFile(file.name);
                Alert.alert(
                    'Ficheiro selecionado',
                    `"${file.name}" carregado com sucesso.\nProcessamento da grelha em desenvolvimento.`,
                );
            }
        } catch {
            Alert.alert('Erro', 'Não foi possível abrir o seletor de ficheiros.');
        }
    };

    return (
        <View style={s.root}>
            {/* ── HEADER ── */}
            <LinearGradient colors={Gradients.header as [string, string, string]} style={s.header}>
                <View style={s.headerDeco} />
                <SafeAreaView edges={['top']}>
                    <HeaderNav
                        backLabel={`${VERTENTE_CONFIG[vertente.type].labelShort} ${vertente.level}`}
                        onBack={() => navigation.goBack()}
                    />
                    <View style={{ marginBottom: 10 }}>
                        <SubBadge type={vertente.type} level={vertente.level} />
                    </View>
                    <Text style={s.title}>Fase de Grupos 📊</Text>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
                {/* ── STEPPER ── */}
                <Text style={s.stepperLabel}>PASSOS PARA COMEÇAR</Text>

                {/* Step 1: Duplas inscritas */}
                <View style={[s.step, !canImport && s.stepActive]}>
                    {canImport ? (
                        <LinearGradient
                            colors={isFull ? Gradients.green : Gradients.paused}
                            style={s.stepCircle}
                        >
                            <Text style={s.stepCircleTxt}>✓</Text>
                        </LinearGradient>
                    ) : (
                        <LinearGradient colors={Gradients.primary} style={s.stepCircle}>
                            <Text style={s.stepCircleNum}>1</Text>
                        </LinearGradient>
                    )}
                    <View style={s.stepContent}>
                        <Text style={[s.stepTitle, !canImport && { color: Colors.blue }]}>Duplas inscritas</Text>
                        <Text style={s.stepSub}>
                            {isFull
                                ? `${teamsConfirmed}/${vertente.maxTeams} confirmadas`
                                : isPartial
                                    ? `${teamsConfirmed}/${vertente.maxTeams} confirmadas — faltam ${remaining}`
                                    : `${teamsConfirmed}/${vertente.maxTeams} confirmadas — mínimo ${minTeamsToStart}`
                            }
                        </Text>
                    </View>
                    {!canImport && <View style={s.stepDot} />}
                </View>

                {/* Step 2: Importar grelha */}
                <View style={[s.step, canImport && !pickedFile ? s.stepActive : !canImport ? s.stepLocked : undefined]}>
                    {canImport ? (
                        pickedFile ? (
                            <LinearGradient colors={Gradients.green} style={s.stepCircle}>
                                <Text style={s.stepCircleTxt}>✓</Text>
                            </LinearGradient>
                        ) : (
                            <LinearGradient colors={Gradients.primary} style={s.stepCircle}>
                                <Text style={s.stepCircleNum}>2</Text>
                            </LinearGradient>
                        )
                    ) : (
                        <View style={s.stepCircleLocked}>
                            <Text style={s.stepCircleLockedNum}>2</Text>
                        </View>
                    )}
                    <View style={s.stepContent}>
                        <Text style={[s.stepTitle, { color: canImport ? (pickedFile ? Colors.navy : Colors.blue) : Colors.muted }]}>Importar grelha</Text>
                        <Text style={[s.stepSub, !canImport && { color: Colors.gray }]}>
                            {pickedFile ? 'Grelha importada' : 'Grupos, horários e courts'}
                        </Text>
                    </View>
                    {canImport && !pickedFile && <View style={s.stepDot} />}
                </View>

                {/* Step 3: Fase de grupos */}
                <View style={[s.step, pickedFile && canImport ? s.stepActive : s.stepLocked]}>
                    {pickedFile && canImport ? (
                        <LinearGradient colors={Gradients.primary} style={s.stepCircle}>
                            <Text style={s.stepCircleNum}>3</Text>
                        </LinearGradient>
                    ) : (
                        <View style={s.stepCircleLocked}>
                            <Text style={s.stepCircleLockedNum}>3</Text>
                        </View>
                    )}
                    <View style={s.stepContent}>
                        <Text style={[s.stepTitle, { color: pickedFile && canImport ? Colors.blue : Colors.muted }]}>Fase de grupos</Text>
                        <Text style={[s.stepSub, { color: pickedFile && canImport ? Colors.muted : Colors.gray }]}>Disponível após importação</Text>
                    </View>
                    {pickedFile && canImport ? <View style={s.stepDot} /> : <Text style={s.lockIcon}>🔒</Text>}
                </View>

                {/* ── IMPORT CTA ── */}
                {pickedFile ? (
                    <View style={s.importDone}>
                        <View style={s.importDoneRow}>
                            <View style={s.importDoneIcon}>
                                <Text style={{ fontSize: Typography.fontSize.xxl }}>📄</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={s.importDoneName} numberOfLines={1}>{pickedFile}</Text>
                                <Text style={s.importDoneSub}>Ficheiro carregado</Text>
                            </View>
                            <TouchableOpacity onPress={() => setPickedFile(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text style={s.importDoneRemove}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={handlePickFile} style={s.importDoneChange}>
                            <Text style={s.importDoneChangeTxt}>Trocar ficheiro</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[s.importBox, !canImport && s.importBoxDisabled]}
                        activeOpacity={0.8}
                        onPress={handlePickFile}
                        disabled={!canImport}
                    >
                        <Text style={s.importEmoji}>📥</Text>
                        <Text style={s.importTitle}>Importar grelha via Excel</Text>
                        <Text style={s.importDesc}>
                            {canImport ? 'Traz grupos, horários e courts já definidos' : `Adiciona pelo menos ${minTeamsToStart} duplas primeiro`}
                        </Text>
                        <LinearGradient colors={canImport ? Gradients.primary : [Colors.gray, Colors.gray] as [string, string]} style={s.importBtn}>
                            <Text style={s.importBtnTxt}>Escolher ficheiro →</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* ── TEAM LIST ── */}
                <View style={s.sectionRow}>
                    <Text style={s.sectionTitle}>Duplas inscritas</Text>
                    <Text style={s.sectionCount}>{teamsConfirmed}/{vertente.maxTeams}</Text>
                </View>

                <View style={s.teamsCard}>
                    {vertente.teams.map((team, idx) => {
                        const isWithdrawn = !!team.withdrawn;
                        const gradColors = isWithdrawn
                            ? [Colors.gray, Colors.gray] as [string, string]
                            : AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                        return (
                            <View
                                key={team.id}
                                style={[
                                    s.teamRow,
                                    isWithdrawn && s.teamWithdrawn,
                                    idx === vertente.teams.length - 1 && { borderBottomWidth: 0 },
                                ]}
                            >
                                <Text style={s.teamIdx}>{idx + 1}</Text>
                                <LinearGradient colors={gradColors} style={s.avatar}>
                                    <Text style={s.avatarTxt}>{getInitials(team.name)}</Text>
                                </LinearGradient>
                                <View style={s.teamInfo}>
                                    <View style={s.teamNameRow}>
                                        <Text style={s.teamName} numberOfLines={1}>{team.name}</Text>
                                        {isWithdrawn && (
                                            <Text style={s.woBadge}>🚫 Desistência</Text>
                                        )}
                                    </View>
                                    <Text style={s.teamPlayers} numberOfLines={1}>
                                        {team.players.map(p => p.name).join(' · ')}
                                    </Text>
                                </View>
                                {team.group && (() => {
                                    const chip = GROUP_CHIP_POOL[(groupIndex[team.group] ?? 0) % GROUP_CHIP_POOL.length];
                                    return (
                                        <View style={[s.groupChip, { backgroundColor: chip.bg }]}>
                                            <Text style={[s.groupChipTxt, { color: chip.text }]}>{team.group}</Text>
                                        </View>
                                    );
                                })()}
                                {isWithdrawn && (
                                    <Text style={s.woLabel}>W.O.</Text>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Add team */}
                {!isFull && (
                    <TouchableOpacity
                        style={s.addBtn}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('AddTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}
                    >
                        <Text style={s.addBtnTxt}>+ Adicionar dupla</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
            <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
        </View>
    );
};

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.gbg },

    /* Header */
    header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, overflow: 'hidden' },
    headerDeco: {
        position: 'absolute', width: 150, height: 150, borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.05)', bottom: -48, right: -28,
    },
    title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack },

    /* Scroll */
    scroll: { flex: 1 },
    scrollContent: { padding: Spacing.lg, paddingBottom: 40 },

    /* Stepper */
    stepperLabel: {
        ...TextStyles.sectionLabel,
        marginBottom: 12,
    },
    step: {
        backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md,
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        marginBottom: 8, ...Shadows.card,
    },
    stepActive: { borderWidth: 2, borderColor: Colors.blue },
    stepLocked: {
        backgroundColor: Colors.gbg, opacity: 0.6,
        shadowOpacity: 0, elevation: 0, marginBottom: 20,
    },
    stepCircle: {
        width: 28, height: 28, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    stepCircleTxt: { color: Colors.white, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBlack },
    stepCircleNum: { color: Colors.white, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBlack },
    stepCircleLocked: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.gl,
        alignItems: 'center', justifyContent: 'center',
    },
    stepCircleLockedNum: { color: Colors.gray, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBlack },
    stepContent: { flex: 1 },
    stepTitle: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.navy },
    stepSub: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 1 },
    stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.orange },
    lockIcon: { fontSize: Typography.fontSize.xl },

    /* Import CTA */
    importBox: {
        borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.blue,
        borderRadius: Radii.lg, padding: 20, alignItems: 'center',
        backgroundColor: Colors.white, marginBottom: 20,
    },
    importBoxDisabled: { opacity: 0.4, borderColor: Colors.gray },
    importEmoji: { fontSize: 32, marginBottom: 6 },
    importTitle: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
    importDesc: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 4, lineHeight: 16, textAlign: 'center' },
    importBtn: { borderRadius: 9, paddingVertical: 11, paddingHorizontal: 20, marginTop: 14 },
    importBtnTxt: { color: Colors.white, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily },

    /* Import done state */
    importDone: {
        backgroundColor: Colors.white, borderRadius: Radii.lg, padding: 14,
        marginBottom: 20, borderWidth: 2, borderColor: Colors.green, ...Shadows.card,
    },
    importDoneRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    importDoneIcon: {
        width: 42, height: 42, backgroundColor: Colors.gbg, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    importDoneName: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.navy },
    importDoneSub: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.green, marginTop: 1 },
    importDoneRemove: { fontSize: Typography.fontSize.xl, color: Colors.gray, fontFamily: Typography.fontFamily, padding: 4 },
    importDoneChange: { marginTop: 10, alignItems: 'center' },
    importDoneChangeTxt: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBold, color: Colors.blue },

    /* Section */
    sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    sectionTitle: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
    sectionCount: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBold, color: Colors.muted },

    /* Teams card */
    teamsCard: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md, ...Shadows.card, marginBottom: Spacing.md },
    teamRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: Colors.gl,
    },
    teamWithdrawn: { opacity: 0.6, backgroundColor: Colors.redBgLight, marginHorizontal: -Spacing.md, paddingHorizontal: Spacing.md, borderRadius: 0 },
    teamIdx: { width: 16, textAlign: 'center', fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBlack, color: Colors.gray },
    avatar: {
        width: 38, height: 38, borderRadius: 19,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarTxt: { color: Colors.white, fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilyBlack },
    teamInfo: { flex: 1, minWidth: 0 },
    teamNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    teamName: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.navy, flexShrink: 1 },
    teamPlayers: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 1 },
    woBadge: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilyBold, color: Colors.red },
    woLabel: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily, color: Colors.red },

    /* Group chips */
    groupChip: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, marginRight: 4 },
    groupChipTxt: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily },

    /* Add button */
    addBtn: {
        backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md,
        alignItems: 'center', borderWidth: 2, borderColor: Colors.gl,
    },
    addBtnTxt: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.blue },
});
