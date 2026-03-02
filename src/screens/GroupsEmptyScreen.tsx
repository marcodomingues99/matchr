import React, { useState } from 'react';
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
import { Colors, Gradients, Radii, Shadows, Spacing } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupsEmpty'>;

const AVATAR_GRADIENTS: [string, string][] = [
    [Colors.blue, Colors.teal],
    ['#8B00CC', '#BB44FF'],
    [Colors.green, '#00AA66'],
    [Colors.orange, Colors.yellow],
    [Colors.red, '#FF9A8B'],
    ['#9B30FF', '#FF44AA'],
];

const getInitials = (name: string) =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const GroupsEmptyScreen = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
    const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];

    const typeLabel = vertente.type === 'M' ? 'Masculino' : vertente.type === 'F' ? 'Feminino' : 'Misto';
    const teamsConfirmed = vertente.teams.filter(t => !t.withdrawn).length;

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
                        backLabel={`${vertente.type === 'M' ? 'Masc' : vertente.type === 'F' ? 'Fem' : 'Misto'} ${vertente.level}`}
                        onBack={() => navigation.navigate('VertenteHub', { tournamentId: tournament.id, vertenteId: vertente.id })}
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

                {/* Step 1: Done */}
                <View style={s.step}>
                    <LinearGradient colors={[Colors.green, '#00AA66']} style={s.stepCircle}>
                        <Text style={s.stepCircleTxt}>✓</Text>
                    </LinearGradient>
                    <View style={s.stepContent}>
                        <Text style={s.stepTitle}>Duplas inscritas</Text>
                        <Text style={s.stepSub}>{teamsConfirmed}/{vertente.maxTeams} confirmadas</Text>
                    </View>
                </View>

                {/* Step 2: Active */}
                <View style={[s.step, s.stepActive]}>
                    <LinearGradient colors={[Colors.blue, Colors.teal]} style={s.stepCircle}>
                        <Text style={s.stepCircleNum}>2</Text>
                    </LinearGradient>
                    <View style={s.stepContent}>
                        <Text style={[s.stepTitle, { color: Colors.blue }]}>Importar grelha</Text>
                        <Text style={s.stepSub}>Grupos, horários e courts</Text>
                    </View>
                    <View style={s.stepDot} />
                </View>

                {/* Step 3: Locked */}
                <View style={[s.step, s.stepLocked]}>
                    <View style={s.stepCircleLocked}>
                        <Text style={s.stepCircleLockedNum}>3</Text>
                    </View>
                    <View style={s.stepContent}>
                        <Text style={[s.stepTitle, { color: Colors.muted }]}>Fase de grupos</Text>
                        <Text style={[s.stepSub, { color: Colors.gray }]}>Disponível após importação</Text>
                    </View>
                    <Text style={s.lockIcon}>🔒</Text>
                </View>

                {/* ── IMPORT CTA ── */}
                {pickedFile ? (
                    <View style={s.importDone}>
                        <View style={s.importDoneRow}>
                            <View style={s.importDoneIcon}>
                                <Text style={{ fontSize: 20 }}>📄</Text>
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
                        style={s.importBox}
                        activeOpacity={0.8}
                        onPress={handlePickFile}
                    >
                        <Text style={s.importEmoji}>📥</Text>
                        <Text style={s.importTitle}>Importar grelha via Excel</Text>
                        <Text style={s.importDesc}>Traz grupos, horários e courts já definidos</Text>
                        <LinearGradient colors={[Colors.blue, Colors.teal]} style={s.importBtn}>
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
                                {team.group && (
                                    <View style={[
                                        s.groupChip,
                                        team.group.startsWith('A') && s.groupChipBlue,
                                        team.group.startsWith('B') && s.groupChipGreen,
                                        team.group.startsWith('C') && s.groupChipOrange,
                                        team.group.startsWith('D') && s.groupChipPurple,
                                    ]}>
                                        <Text style={[
                                            s.groupChipTxt,
                                            team.group.startsWith('A') && { color: Colors.blue },
                                            team.group.startsWith('B') && { color: '#1A7A4A' },
                                            team.group.startsWith('C') && { color: Colors.orange },
                                            team.group.startsWith('D') && { color: '#9B30FF' },
                                        ]}>{team.group}</Text>
                                    </View>
                                )}
                                {isWithdrawn && (
                                    <Text style={s.woLabel}>W.O.</Text>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Add team */}
                <TouchableOpacity
                    style={s.addBtn}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('AddTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}
                >
                    <Text style={s.addBtnTxt}>+ Adicionar dupla</Text>
                </TouchableOpacity>
            </ScrollView>
            <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
        </View>
    );
};

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.gbg },

    /* Header */
    header: { paddingHorizontal: 18, paddingBottom: 24, overflow: 'hidden' },
    headerDeco: {
        position: 'absolute', width: 150, height: 150, borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.05)', bottom: -48, right: -28,
    },
    back: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_700Bold', marginBottom: 8, paddingTop: 8 },
    title: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black' },

    /* Scroll */
    scroll: { flex: 1 },
    scrollContent: { padding: 14, paddingBottom: 40 },

    /* Stepper */
    stepperLabel: {
        fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted,
        letterSpacing: 0.5, marginBottom: 12,
    },
    step: {
        backgroundColor: '#fff', borderRadius: Radii.lg, padding: 13,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        marginBottom: 8, ...Shadows.card,
    },
    stepActive: { borderWidth: 2, borderColor: Colors.blue },
    stepLocked: {
        backgroundColor: Colors.gbg, opacity: 0.5,
        shadowOpacity: 0, elevation: 0, marginBottom: 20,
    },
    stepCircle: {
        width: 28, height: 28, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center',
    },
    stepCircleTxt: { color: '#fff', fontSize: 14, fontFamily: 'Nunito_900Black' },
    stepCircleNum: { color: '#fff', fontSize: 13, fontFamily: 'Nunito_900Black' },
    stepCircleLocked: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.gl,
        alignItems: 'center', justifyContent: 'center',
    },
    stepCircleLockedNum: { color: Colors.gray, fontSize: 13, fontFamily: 'Nunito_900Black' },
    stepContent: { flex: 1 },
    stepTitle: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
    stepSub: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginTop: 1 },
    stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.orange },
    lockIcon: { fontSize: 16 },

    /* Import CTA */
    importBox: {
        borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.blue,
        borderRadius: Radii.lg, padding: 20, alignItems: 'center',
        backgroundColor: '#fff', marginBottom: 20,
    },
    importEmoji: { fontSize: 32, marginBottom: 6 },
    importTitle: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
    importDesc: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginTop: 4, lineHeight: 16, textAlign: 'center' },
    importBtn: { borderRadius: 9, paddingVertical: 11, paddingHorizontal: 20, marginTop: 14 },
    importBtnTxt: { color: '#fff', fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },

    /* Import done state */
    importDone: {
        backgroundColor: '#fff', borderRadius: Radii.lg, padding: 14,
        marginBottom: 20, borderWidth: 2, borderColor: Colors.green, ...Shadows.card,
    },
    importDoneRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
    importDoneIcon: {
        width: 42, height: 42, backgroundColor: Colors.gbg, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    importDoneName: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
    importDoneSub: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.green, marginTop: 1 },
    importDoneRemove: { fontSize: 16, color: Colors.gray, fontFamily: 'Nunito_800ExtraBold', padding: 4 },
    importDoneChange: { marginTop: 10, alignItems: 'center' },
    importDoneChangeTxt: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.blue },

    /* Section */
    sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    sectionTitle: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
    sectionCount: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.muted },

    /* Teams card */
    teamsCard: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: 13, ...Shadows.card, marginBottom: 12 },
    teamRow: {
        flexDirection: 'row', alignItems: 'center', gap: 9,
        paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: Colors.gl,
    },
    teamWithdrawn: { opacity: 0.5, backgroundColor: '#FFF5F5', marginHorizontal: -13, paddingHorizontal: 13, borderRadius: 0 },
    teamIdx: { width: 16, textAlign: 'center', fontSize: 11, fontFamily: 'Nunito_900Black', color: Colors.gray },
    avatar: {
        width: 38, height: 38, borderRadius: 19,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarTxt: { color: '#fff', fontSize: 12, fontFamily: 'Nunito_900Black' },
    teamInfo: { flex: 1, minWidth: 0 },
    teamNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    teamName: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy, flexShrink: 1 },
    teamPlayers: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginTop: 1 },
    woBadge: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: Colors.red },
    woLabel: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.red },

    /* Group chips */
    groupChip: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, marginRight: 4 },
    groupChipBlue: { backgroundColor: '#E3ECFF' },
    groupChipGreen: { backgroundColor: '#DFFAEE' },
    groupChipOrange: { backgroundColor: '#FFF0DB' },
    groupChipPurple: { backgroundColor: '#F3E4FF' },
    groupChipTxt: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },

    /* Add button */
    addBtn: {
        backgroundColor: '#fff', borderRadius: Radii.lg, padding: 13,
        alignItems: 'center', borderWidth: 2, borderColor: Colors.gl,
    },
    addBtnTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.blue },
});
