import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { popTo } from '../utils/navigation';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors } from '../theme';
import { AVATAR_GRADIENTS, getInitials } from '../utils/avatarUtils';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'WithdrawConfirm'>;

type WithdrawOption = 'walkover' | 'remove';

export const WithdrawConfirmScreen = () => {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const [selected, setSelected] = useState<WithdrawOption>('walkover');

    const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
    if (!tournament) return null;
    const category = tournament.categories.find(v => v.id === route.params.categoryId);
    if (!category) return null;
    const teamIdx = category.teams.findIndex(t => t.id === route.params.teamId);
    const team = category.teams[teamIdx];

    if (!team) return null;

    const avatarColors = AVATAR_GRADIENTS[teamIdx % AVATAR_GRADIENTS.length];

    const handleConfirm = () => {
        // In a real app: mutate state based on selected option
        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-white">
            {/* ── Header (red gradient) ── */}
            <LinearGradient colors={[Colors.redDeep, Colors.red, Colors.redLight]} className="px-lg pb-lg">
                <SafeAreaView edges={['top']}>
                    <HeaderNav
                        backLabel="Duplas"
                        onBack={() => navigation.goBack()}
                    />
                    <SubBadge type={category.type} level={category.level} />
                    <Text className="text-white text-[20px] md:text-[24px] font-nunito-black mt-[4px]">Desistência 🚫</Text>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView className="flex-1" contentContainerClassName="p-[14px] pb-[28px]">
                <Container>
                    {/* ── Team card ── */}
                    <View className="bg-gbg rounded-md p-[13px] flex-row items-center gap-md mb-[20px]">
                        {team.photo ? (
                            <Image source={{ uri: team.photo }} style={{ width: 46, height: 46 }} className="rounded-full shrink-0" />
                        ) : (
                            <LinearGradient colors={avatarColors} className="w-[46px] h-[46px] rounded-full items-center justify-center shrink-0">
                                <Text className="text-white text-lg font-nunito-black">{getInitials(team.name)}</Text>
                            </LinearGradient>
                        )}
                        <View className="flex-1">
                            <Text className="text-lg font-nunito-black text-navy">{team.name}</Text>
                            <Text className="text-sm font-nunito-semibold text-muted mt-[2px]">
                                {team.players.map(p => p.name).join(' · ')}
                                {team.group ? ` · Grupo ${team.group}` : ''}
                            </Text>
                        </View>
                    </View>

                    {/* ── Question ── */}
                    <Text className="text-base md:text-lg font-nunito text-navy mb-md">Como tratar os jogos desta dupla?</Text>

                    {/* ── Option 1: Walkover ── */}
                    <TouchableOpacity
                        className={clsx(
                            'bg-white border-2 border-gl rounded-md p-[14px] mb-[10px] flex-row items-center gap-[10px]',
                            selected === 'walkover' && 'border-orange',
                        )}
                        onPress={() => setSelected('walkover')}
                        activeOpacity={0.85}
                    >
                        <Text className="text-[24px] shrink-0">🏳️</Text>
                        <View className="flex-1">
                            <Text className="text-base font-nunito text-navy">Walkover</Text>
                            <Text className="text-sm font-nunito-semibold text-muted mt-[2px] leading-[16px]">Adversários ganham por W.O. · grupos mantêm-se</Text>
                        </View>
                        <View className={clsx(
                            'w-[20px] h-[20px] rounded-full border-2 border-gl items-center justify-center shrink-0',
                            selected === 'walkover' && 'border-orange',
                        )}>
                            {selected === 'walkover' && <View className="w-[10px] h-[10px] rounded-full bg-orange" />}
                        </View>
                    </TouchableOpacity>

                    {/* ── Option 2: Remover ── */}
                    <TouchableOpacity
                        className={clsx(
                            'bg-white border-2 border-gl rounded-md p-[14px] mb-[10px] flex-row items-center gap-[10px]',
                            selected === 'remove' && 'border-blue',
                        )}
                        onPress={() => setSelected('remove')}
                        activeOpacity={0.85}
                    >
                        <Text className="text-[24px] shrink-0">🔄</Text>
                        <View className="flex-1">
                            <Text className="text-base font-nunito text-navy">Retirar e reorganizar</Text>
                            <Text className="text-sm font-nunito-semibold text-muted mt-[2px] leading-[16px]">Remove a dupla e regenera a grelha de grupos</Text>
                        </View>
                        <View className={clsx(
                            'w-[20px] h-[20px] rounded-full border-2 border-gl items-center justify-center shrink-0',
                            selected === 'remove' && 'border-blue',
                        )}>
                            {selected === 'remove' && <View className={clsx('w-[10px] h-[10px] rounded-full', selected === 'remove' ? 'bg-blue' : 'bg-orange')} />}
                        </View>
                    </TouchableOpacity>

                    {/* ── Warning ── */}
                    <View className="bg-yellow-bg-warm border-[1.5px] border-yellow rounded-[11px] p-[11px] px-[13px] mb-[20px] flex-row gap-[10px]">
                        <Text className="text-[16px] shrink-0">⚠️</Text>
                        <Text className="text-sm font-nunito-semibold text-navy leading-[18px] flex-1">
                            Esta ação não pode ser desfeita. Resultados já introduzidos com esta dupla serão afetados.
                        </Text>
                    </View>

                    {/* ── Buttons ── */}
                    <TouchableOpacity onPress={handleConfirm} activeOpacity={0.85}>
                        <LinearGradient colors={[Colors.redDeep, Colors.red]} className="rounded-[11px] p-md items-center mb-[8px]">
                            <Text className="text-white text-base font-nunito">Confirmar desistência</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-white border-2 border-gl rounded-[11px] p-md items-center" onPress={() => navigation.goBack()}>
                        <Text className="text-base font-nunito text-navy">Cancelar</Text>
                    </TouchableOpacity>
                </Container>
            </ScrollView>
            <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
        </View>
    );
};
