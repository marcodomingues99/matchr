import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import clsx from 'clsx';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { PT_MONTHS } from '../utils/constants';
import { popTo } from '../utils/navigation';
import { Container } from '../components/Layout';

const formatDate = (d: Date) => `${d.getDate()} ${PT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'EditTournament'>;

export const EditTournamentScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);

  const [name, setName] = useState(tournament?.name ?? '');
  const [location, setLocation] = useState(tournament?.location ?? '');
  const [vertentes, setVertentes] = useState(tournament?.vertentes ?? []);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [photo, setPhoto] = useState(tournament?.photo ?? '');
  const [regulamento, setRegulamento] = useState<{ uri: string; name: string; size?: number } | null>(
    tournament?.regulamento ? { uri: tournament.regulamento, name: tournament.regulamento.split('/').pop() ?? 'regulamento.pdf' } : null
  );

  if (!tournament) return null;

  const handleRemoveVertente = (vertenteId: string) => {
    Alert.alert(
      'Remover categoria',
      'Tens a certeza que queres remover esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => setVertentes(prev => prev.filter(v => v.id !== vertenteId)),
        },
      ],
    );
  };

  const handleDeleteTournament = () => {
    Alert.alert(
      'Eliminar torneio',
      'Esta acao e irreversivel. Tens a certeza que queres eliminar este torneio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => navigation.navigate('Home'),
        },
      ],
    );
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9] as [number, number],
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const pickRegulamento = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled) {
      const asset = result.assets[0];
      setRegulamento({ uri: asset.uri, name: asset.name, size: asset.size ?? undefined });
    }
  };

  return (
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Torneio"
            onBack={() => navigation.goBack()}
          />
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-[4px]">Editar Torneio</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-lg">
        <Container>
          <Text className="text-muted text-md font-nunito uppercase tracking-[0.5px] mb-[10px]">Informação Geral</Text>
          <View className="bg-white rounded-lg p-md mb-lg shadow-card">
            <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[6px] mt-[8px]">Nome do torneio</Text>
            <TextInput
              className="border-[1.5px] border-gl rounded-sm p-sm text-lg font-nunito-bold text-navy bg-gbg"
              value={name}
              onChangeText={setName}
              placeholderTextColor={Colors.gray}
            />

            <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[6px] mt-[8px]">Foto / Banner</Text>
            <TouchableOpacity className="h-[80px] rounded-md overflow-hidden bg-navy mb-[4px]" onPress={pickPhoto} activeOpacity={0.8}>
              {photo ? (
                <Image source={{ uri: photo }} className="absolute" style={{ width: '100%', height: '100%' }} />
              ) : null}
              <View className="flex-1 bg-black/30 flex-row items-center justify-center gap-sm">
                <Text className="text-[18px]">📷</Text>
                <Text className="text-base font-nunito text-white">{photo ? 'Alterar foto' : 'Adicionar foto'}</Text>
              </View>
            </TouchableOpacity>

            <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[6px] mt-[8px]">Localizacao</Text>
            <TextInput
              className="border-[1.5px] border-gl rounded-sm p-sm text-lg font-nunito-bold text-navy bg-gbg"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={Colors.gray}
            />
            <View className="flex-row mt-[4px]">
              <View className="flex-1">
                <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[6px] mt-[8px]">Data inicio</Text>
                <TouchableOpacity className="border-[1.5px] border-gl rounded-sm px-sm py-[10px] bg-gbg flex-row items-center justify-between" onPress={() => setShowStartPicker(true)} activeOpacity={0.7}>
                  <Text className={clsx('text-lg font-nunito-bold', startDate ? 'text-navy' : 'text-gray')}>
                    {startDate ? formatDate(startDate) : tournament.startDate}
                  </Text>
                  <Text className="text-[14px]">📅</Text>
                </TouchableOpacity>
                {showStartPicker && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    onChange={(_, date) => {
                      setShowStartPicker(Platform.OS === 'ios');
                      if (date) setStartDate(date);
                    }}
                  />
                )}
              </View>
              <View className="w-[12px]" />
              <View className="flex-1">
                <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[6px] mt-[8px]">Data fim</Text>
                <TouchableOpacity className="border-[1.5px] border-gl rounded-sm px-sm py-[10px] bg-gbg flex-row items-center justify-between" onPress={() => setShowEndPicker(true)} activeOpacity={0.7}>
                  <Text className={clsx('text-lg font-nunito-bold', endDate ? 'text-navy' : 'text-gray')}>
                    {endDate ? formatDate(endDate) : tournament.endDate}
                  </Text>
                  <Text className="text-[14px]">📅</Text>
                </TouchableOpacity>
                {showEndPicker && (
                  <DateTimePicker
                    value={endDate || startDate || new Date()}
                    mode="date"
                    minimumDate={startDate || undefined}
                    onChange={(_, date) => {
                      setShowEndPicker(Platform.OS === 'ios');
                      if (date) setEndDate(date);
                    }}
                  />
                )}
              </View>
            </View>

            <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[6px] mt-[8px]">Regulamento</Text>
            {regulamento ? (
              <View className="flex-row items-center gap-[11px] bg-gbg rounded-sm p-[12px]">
                <View className="w-[38px] h-[38px] bg-white rounded-[9px] items-center justify-center shadow-card shrink-0">
                  <Text className="text-[18px]">📄</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-md font-nunito text-navy" numberOfLines={1}>{regulamento.name}</Text>
                  <Text className="text-xs font-nunito-semibold text-muted mt-[2px]">Regulamento carregado</Text>
                </View>
                <TouchableOpacity onPress={() => setRegulamento(null)}>
                  <Text className="text-lg font-nunito text-red px-[4px]">✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity className="flex-row items-center gap-sm border-[1.5px] border-gl rounded-sm border-dashed p-[12px] bg-gbg" onPress={pickRegulamento}>
                <Text className="text-[16px]">📎</Text>
                <Text className="text-base font-nunito-bold text-muted">Anexar regulamento (PDF)</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text className="text-muted text-md font-nunito uppercase tracking-[0.5px] mb-[10px]">Categorias</Text>
          {vertentes.map((v, i) => (
            <View key={v.id} className="bg-white rounded-md p-md flex-row items-center gap-[10px] mb-sm shadow-card overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center flex-1 gap-[10px]"
                onPress={() => navigation.navigate('ConfigureVertente', { tournamentId: tournament.id, vertenteIndex: 0, isLast: true, pendingVertentes: JSON.stringify([{ type: v.type, level: v.level }]) })}
              >
                <View className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: VERTENTE_CONFIG[v.type].color }} />
                <View className="flex-1">
                  <Text className="text-base font-nunito text-navy">{VERTENTE_CONFIG[v.type].label} · {v.level}</Text>
                  <Text className="text-sm font-nunito-semibold text-muted">{v.teams.length}/{v.maxTeams} duplas · {v.courts} courts</Text>
                </View>
                <Text className="text-[14px]">✏️</Text>
              </TouchableOpacity>
              {v.status === 'config' && (
                <TouchableOpacity onPress={() => handleRemoveVertente(v.id)} className="px-[10px] py-[4px] border-l border-l-red-border ml-sm">
                  <Text className="text-[16px]">🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View className="h-xl" />

          <TouchableOpacity className="rounded-lg overflow-hidden mb-xl" onPress={() => navigation.goBack()}>
            <LinearGradient colors={Gradients.primary} className="p-[15px] items-center">
              <Text className="text-white text-[15px] font-nunito">✓ Guardar alterações</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Danger zone */}
          <View className="bg-red-bg-soft rounded-lg p-md border border-red-border">
            <Text className="text-md font-nunito text-red mb-[10px]">⚠️ Zona de risco</Text>
            <TouchableOpacity className="bg-red-bg rounded-md p-[12px] items-center" onPress={handleDeleteTournament}>
              <Text className="text-base font-nunito text-red">🗑️ Eliminar torneio</Text>
            </TouchableOpacity>
          </View>
          <View className="h-2xl" />
        </Container>
      </ScrollView>
      <HomeFAB onPress={() => navigation.dispatch(popTo('Home'))} />
    </View>
  );
};
