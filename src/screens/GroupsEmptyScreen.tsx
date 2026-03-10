import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import clsx from 'clsx';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients } from '../theme';
import { AVATAR_GRADIENTS, getInitials } from '../utils/teamUtils';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { getMinTeamsToStart } from '../utils/constants';
import { GROUP_CHIP_POOL } from '../utils/groupColors';
import { popTo } from '../utils/navigation';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GroupsEmpty'>;

export const GroupsEmptyScreen = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
    const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);

    // Map each sorted group letter to its index for chip color lookup
    const groupIndex = useMemo(() => {
        const sorted = [...new Set(vertente?.teams.map(t => t.group).filter(Boolean) as string[] ?? [])].sort();
        const map: Record<string, number> = {};
        sorted.forEach((g, i) => { map[g] = i; });
        return map;
    }, [vertente?.teams]);

    const [pickedFile, setPickedFile] = useState<string | null>(null);

    if (!tournament || !vertente) return null;

    const { label: typeLabel } = VERTENTE_CONFIG[vertente.type];
    const teamsConfirmed = vertente.teams.filter(t => !t.withdrawn).length;
    const minTeamsToStart = getMinTeamsToStart(vertente);
    const isFull = teamsConfirmed >= vertente.maxTeams;
    const isPartial = teamsConfirmed >= minTeamsToStart && !isFull;
    const canImport = isFull || isPartial;
    const remaining = vertente.maxTeams - teamsConfirmed;

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
        <View className="flex-1 bg-gbg">
            {/* ── HEADER ── */}
            <LinearGradient colors={Gradients.header as [string, string, string]} className="px-lg pb-xl overflow-hidden">
                <View className="absolute w-[150px] h-[150px] rounded-full bg-white/5 -bottom-[48px] -right-[28px]" />
                <SafeAreaView edges={['top']}>
                    <HeaderNav
                        backLabel={`${VERTENTE_CONFIG[vertente.type].labelShort} ${vertente.level}`}
                        onBack={() => navigation.goBack()}
                    />
                    <View className="mb-[10px]">
                        <SubBadge type={vertente.type} level={vertente.level} />
                    </View>
                    <Text className="text-white text-[26px] md:text-[32px] font-nunito-black">Fase de Grupos 📊</Text>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView className="flex-1" contentContainerClassName="p-lg pb-[40px]" showsVerticalScrollIndicator={false}>
                <Container>
                    {/* ── STEPPER ── */}
                    <Text className="text-xxs font-nunito-bold text-muted uppercase tracking-[1px] mb-md">PASSOS PARA COMEÇAR</Text>

                    {/* Step 1: Duplas inscritas */}
                    <View className={clsx(
                        'bg-white rounded-lg p-md flex-row items-center gap-md mb-[8px] shadow-card',
                        !canImport && 'border-2 border-blue',
                    )}>
                        {canImport ? (
                            <LinearGradient
                                colors={isFull ? Gradients.green : Gradients.paused}
                                className="w-[28px] h-[28px] rounded-full items-center justify-center"
                            >
                                <Text className="text-white text-lg font-nunito-black">✓</Text>
                            </LinearGradient>
                        ) : (
                            <LinearGradient colors={Gradients.primary} className="w-[28px] h-[28px] rounded-full items-center justify-center">
                                <Text className="text-white text-base font-nunito-black">1</Text>
                            </LinearGradient>
                        )}
                        <View className="flex-1">
                            <Text className={clsx('text-md font-nunito text-navy', !canImport && 'text-blue')}>Duplas inscritas</Text>
                            <Text className="text-xs font-nunito-semibold text-muted mt-[1px]">
                                {isFull
                                    ? `${teamsConfirmed}/${vertente.maxTeams} confirmadas`
                                    : isPartial
                                        ? `${teamsConfirmed}/${vertente.maxTeams} confirmadas — faltam ${remaining}`
                                        : `${teamsConfirmed}/${vertente.maxTeams} confirmadas — mínimo ${minTeamsToStart}`
                                }
                            </Text>
                        </View>
                        {!canImport && <View className="w-[8px] h-[8px] rounded-full bg-orange" />}
                    </View>

                    {/* Step 2: Importar grelha */}
                    <View className={clsx(
                        'bg-white rounded-lg p-md flex-row items-center gap-md mb-[8px] shadow-card',
                        canImport && !pickedFile && 'border-2 border-blue',
                        !canImport && 'bg-gbg opacity-60 shadow-none mb-[20px]',
                    )}>
                        {canImport ? (
                            pickedFile ? (
                                <LinearGradient colors={Gradients.green} className="w-[28px] h-[28px] rounded-full items-center justify-center">
                                    <Text className="text-white text-lg font-nunito-black">✓</Text>
                                </LinearGradient>
                            ) : (
                                <LinearGradient colors={Gradients.primary} className="w-[28px] h-[28px] rounded-full items-center justify-center">
                                    <Text className="text-white text-base font-nunito-black">2</Text>
                                </LinearGradient>
                            )
                        ) : (
                            <View className="w-[28px] h-[28px] rounded-full bg-gl items-center justify-center">
                                <Text className="text-gray text-base font-nunito-black">2</Text>
                            </View>
                        )}
                        <View className="flex-1">
                            <Text style={{ color: canImport ? (pickedFile ? Colors.navy : Colors.blue) : Colors.muted }} className="text-md font-nunito">Importar grelha</Text>
                            <Text className={clsx('text-xs font-nunito-semibold text-muted mt-[1px]', !canImport && 'text-gray')}>
                                {pickedFile ? 'Grelha importada' : 'Grupos, horários e courts'}
                            </Text>
                        </View>
                        {canImport && !pickedFile && <View className="w-[8px] h-[8px] rounded-full bg-orange" />}
                    </View>

                    {/* Step 3: Fase de grupos */}
                    <View className={clsx(
                        'bg-white rounded-lg p-md flex-row items-center gap-md mb-[8px] shadow-card',
                        pickedFile && canImport ? 'border-2 border-blue' : 'bg-gbg opacity-60 shadow-none mb-[20px]',
                    )}>
                        {pickedFile && canImport ? (
                            <LinearGradient colors={Gradients.primary} className="w-[28px] h-[28px] rounded-full items-center justify-center">
                                <Text className="text-white text-base font-nunito-black">3</Text>
                            </LinearGradient>
                        ) : (
                            <View className="w-[28px] h-[28px] rounded-full bg-gl items-center justify-center">
                                <Text className="text-gray text-base font-nunito-black">3</Text>
                            </View>
                        )}
                        <View className="flex-1">
                            <Text style={{ color: pickedFile && canImport ? Colors.blue : Colors.muted }} className="text-md font-nunito">Fase de grupos</Text>
                            <Text style={{ color: pickedFile && canImport ? Colors.muted : Colors.gray }} className="text-xs font-nunito-semibold mt-[1px]">Disponível após importação</Text>
                        </View>
                        {pickedFile && canImport ? <View className="w-[8px] h-[8px] rounded-full bg-orange" /> : <Text className="text-xl">🔒</Text>}
                    </View>

                    {/* ── IMPORT CTA ── */}
                    {pickedFile ? (
                        <View className="bg-white rounded-lg p-[14px] mb-[20px] border-2 border-green shadow-card">
                            <View className="flex-row items-center gap-md">
                                <View className="w-[42px] h-[42px] bg-gbg rounded-[10px] items-center justify-center">
                                    <Text className="text-[20px]">📄</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-md font-nunito text-navy" numberOfLines={1}>{pickedFile}</Text>
                                    <Text className="text-xs font-nunito-semibold text-green mt-[1px]">Ficheiro carregado</Text>
                                </View>
                                <TouchableOpacity onPress={() => setPickedFile(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Text className="text-xl text-gray font-nunito p-[4px]">✕</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={handlePickFile} className="mt-[10px] items-center">
                                <Text className="text-sm font-nunito-bold text-blue">Trocar ficheiro</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            className={clsx(
                                'border-2 border-dashed border-blue rounded-lg p-[20px] items-center bg-white mb-[20px]',
                                !canImport && 'opacity-40 border-gray',
                            )}
                            activeOpacity={0.8}
                            onPress={handlePickFile}
                            disabled={!canImport}
                        >
                            <Text className="text-[32px] mb-[6px]">📥</Text>
                            <Text className="text-base font-nunito text-navy">Importar grelha via Excel</Text>
                            <Text className="text-sm font-nunito-semibold text-muted mt-[4px] leading-[16px] text-center">
                                {canImport ? 'Traz grupos, horários e courts já definidos' : `Adiciona pelo menos ${minTeamsToStart} duplas primeiro`}
                            </Text>
                            <LinearGradient colors={canImport ? Gradients.primary : [Colors.gray, Colors.gray] as [string, string]} className="rounded-[9px] py-[11px] px-[20px] mt-[14px]">
                                <Text className="text-white text-base font-nunito">Escolher ficheiro →</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* ── TEAM LIST ── */}
                    <View className="flex-row items-center justify-between mb-[10px]">
                        <Text className="text-base md:text-lg font-nunito text-navy">Duplas inscritas</Text>
                        <Text className="text-sm font-nunito-bold text-muted">{teamsConfirmed}/{vertente.maxTeams}</Text>
                    </View>

                    <View className="bg-white rounded-lg p-md shadow-card mb-md">
                        {vertente.teams.map((team, idx) => {
                            const isWithdrawn = !!team.withdrawn;
                            const gradColors = isWithdrawn
                                ? [Colors.gray, Colors.gray] as [string, string]
                                : AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
                            return (
                                <View
                                    key={team.id}
                                    className={clsx(
                                        'flex-row items-center gap-sm py-[8px] border-b-[1.5px] border-gl',
                                        isWithdrawn && 'opacity-60 bg-red-bg-light -mx-md px-md rounded-none',
                                        idx === vertente.teams.length - 1 && 'border-b-0',
                                    )}
                                >
                                    <Text className="w-[16px] text-center text-sm font-nunito-black text-gray">{idx + 1}</Text>
                                    <LinearGradient colors={gradColors} className="w-[38px] h-[38px] rounded-full items-center justify-center">
                                        <Text className="text-white text-md font-nunito-black">{getInitials(team.name)}</Text>
                                    </LinearGradient>
                                    <View className="flex-1 min-w-0">
                                        <View className="flex-row items-center gap-[6px]">
                                            <Text className="text-md font-nunito text-navy shrink" numberOfLines={1}>{team.name}</Text>
                                            {isWithdrawn && (
                                                <Text className="text-xs font-nunito-bold text-red">🚫 Desistência</Text>
                                            )}
                                        </View>
                                        <Text className="text-xs font-nunito-semibold text-muted mt-[1px]" numberOfLines={1}>
                                            {team.players.map(p => p.name).join(' · ')}
                                        </Text>
                                    </View>
                                    {team.group && (() => {
                                        const chip = GROUP_CHIP_POOL[(groupIndex[team.group] ?? 0) % GROUP_CHIP_POOL.length];
                                        return (
                                            <View style={{ backgroundColor: chip.bg }} className="rounded-[20px] px-[9px] py-[3px] mr-[4px]">
                                                <Text style={{ color: chip.text }} className="text-xs font-nunito">{team.group}</Text>
                                            </View>
                                        );
                                    })()}
                                    {isWithdrawn && (
                                        <Text className="text-xs font-nunito text-red">W.O.</Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    {/* Add team */}
                    {!isFull && (
                        <TouchableOpacity
                            className="bg-white rounded-lg p-md items-center border-2 border-gl"
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('ManageTeam', { tournamentId: tournament.id, vertenteId: vertente.id })}
                        >
                            <Text className="text-base font-nunito text-blue">+ Adicionar dupla</Text>
                        </TouchableOpacity>
                    )}
                </Container>
            </ScrollView>
            <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
        </View>
    );
};
