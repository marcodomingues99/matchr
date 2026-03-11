import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import clsx from 'clsx';
import { RootStackParamList, CategoryType } from '../types';
import { HeaderNav } from '../components/Breadcrumb';
import { Colors, Gradients } from '../theme';
import { CATEGORY_CONFIG } from '../utils/categoryConfig';
import { formatDateInputPt } from '../utils/dateUtils';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type SelectedCat = { type: CategoryType; level: string };

const LEVELS: Record<CategoryType, string[]> = {
  M: ['M6', 'M5', 'M4', 'M3', 'M2', 'M1'],
  F: ['F6', 'F5', 'F4', 'F3', 'F2', 'F1'],
  MX: ['MX6', 'MX5', 'MX4', 'MX3', 'MX2', 'MX1'],
};

const formatDate = formatDateInputPt;

export const CreateTournamentScreen = () => {
  const navigation = useNavigation<Nav>();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [rulesUrl, setRulesUrl] = useState<{ uri: string; name: string; size?: number } | null>(null);
  const [selectedCats, setSelectedCats] = useState<SelectedCat[]>([]);
  const [expanded, setExpanded] = useState<Record<CategoryType, boolean>>({ M: true, F: true, MX: false });

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
      setRulesUrl({ uri: asset.uri, name: asset.name, size: asset.size ?? undefined });
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    return ` · ${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const toggleCategory = (type: CategoryType, level: string) => {
    if (level === 'Sem') {
      const hasSem = selectedCats.some(v => v.type === type && v.level === 'Sem');
      const withoutType = selectedCats.filter(v => v.type !== type);
      setSelectedCats(hasSem ? withoutType : [...withoutType, { type, level: 'Sem' }]);
    } else {
      const withoutSem = selectedCats.filter(v => !(v.type === type && v.level === 'Sem'));
      const exists = withoutSem.findIndex(v => v.type === type && v.level === level);
      setSelectedCats(exists >= 0 ? withoutSem.filter((_, i) => i !== exists) : [...withoutSem, { type, level }]);
    }
  };

  const handleCreate = () => {
    if (!name || selectedCats.length === 0) return;
    navigation.navigate('ConfigureCategory', {
      tournamentId: 'new',
      categoryIndex: 0,
      isLast: selectedCats.length === 1,
      pendingCategories: selectedCats,
    });
  };

  return (
    <View className="flex-1 bg-gbg">
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Inicio"
            onBack={() => navigation.goBack()}
          />
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-[4px]">Criar Torneio</Text>
          <Text className="text-white/75 text-base font-nunito-semibold mt-[4px]">Preenche os dados do teu evento</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-lg">
        <Container>
          {/* Basic Info */}
          <Text className="text-muted text-md font-nunito uppercase tracking-[0.5px] mb-[10px]">Informação Geral</Text>
          <View className="bg-white rounded-lg p-md mb-lg shadow-card">
            <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[6px] mt-[8px]">Nome do torneio *</Text>
            <TextInput
              className="border-[1.5px] border-gl rounded-sm p-sm text-lg font-nunito-bold text-navy bg-gbg"
              value={name}
              onChangeText={setName}
              placeholder="Ex: Open de Padel Lisboa 2026"
              placeholderTextColor={Colors.gray}
            />
            <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[6px] mt-[8px]">Localizacao</Text>
            <TextInput
              className="border-[1.5px] border-gl rounded-sm p-sm text-lg font-nunito-bold text-navy bg-gbg"
              value={location}
              onChangeText={setLocation}
              placeholder="Ex: Clube Restelo"
              placeholderTextColor={Colors.gray}
            />
            <View className="flex-row mt-[4px]">
              <View className="flex-1">
                <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[6px] mt-[8px]">Data inicio</Text>
                <TouchableOpacity className="border-[1.5px] border-gl rounded-sm px-sm py-[10px] bg-gbg flex-row items-center justify-between" onPress={() => setShowStartPicker(true)} activeOpacity={0.7}>
                  <Text className={clsx('text-lg font-nunito-bold', startDate ? 'text-navy' : 'text-gray')}>
                    {startDate ? formatDate(startDate) : 'Selecionar data'}
                  </Text>
                  <Text className="text-lg">📅</Text>
                </TouchableOpacity>
                {showStartPicker && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    onChange={(_, date) => {
                      setShowStartPicker(Platform.OS === 'ios');
                      if (date) {
                        setStartDate(date);
                        if (endDate && date > endDate) setEndDate(null);
                      }
                    }}
                  />
                )}
              </View>
              <View className="w-[12px]" />
              <View className="flex-1">
                <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[6px] mt-[8px]">Data fim</Text>
                <TouchableOpacity className="border-[1.5px] border-gl rounded-sm px-sm py-[10px] bg-gbg flex-row items-center justify-between" onPress={() => setShowEndPicker(true)} activeOpacity={0.7}>
                  <Text className={clsx('text-lg font-nunito-bold', endDate ? 'text-navy' : 'text-gray')}>
                    {endDate ? formatDate(endDate) : 'Selecionar data'}
                  </Text>
                  <Text className="text-lg">📅</Text>
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

            {/* Photo */}
            <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[6px] mt-[8px]">Foto / Banner</Text>
            <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
              {photo ? (
                <View className="h-[76px] rounded-md overflow-hidden">
                  <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} className="object-cover" />
                  <View className="absolute inset-0 bg-black/35 items-center justify-center">
                    <Text className="text-base font-nunito text-white">📷  Alterar foto</Text>
                  </View>
                </View>
              ) : (
                <View className="border-2 border-gray border-dashed rounded-md bg-gbg h-[76px] items-center justify-center gap-[4px]">
                  <Text className="text-3xl">📷</Text>
                  <Text className="text-sm font-nunito text-muted">Adicionar foto</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Regulamento */}
            <Text className="text-muted text-sm font-nunito uppercase tracking-[0.5px] mb-[6px] mt-[8px]">Regulamento (opcional)</Text>
            {rulesUrl ? (
              <View className="bg-gbg rounded-md p-sm flex-row items-center gap-[11px]">
                <View className="w-[40px] h-[40px] bg-white rounded-[10px] items-center justify-center shadow-card shrink-0">
                  <Text className="text-2xl">📄</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-md font-nunito text-navy" numberOfLines={1}>{rulesUrl.name}</Text>
                  <Text className="text-xs font-nunito-semibold text-muted mt-[2px]">Carregado{formatSize(rulesUrl.size)}</Text>
                </View>
                <TouchableOpacity onPress={() => setRulesUrl(null)}>
                  <Text className="text-lg font-nunito text-red p-[4px]">✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity className="border-2 border-gray border-dashed rounded-md bg-gbg p-sm flex-row items-center gap-[11px]" onPress={pickRegulamento} activeOpacity={0.8}>
                <View className="w-[40px] h-[40px] bg-white rounded-[10px] items-center justify-center shadow-card shrink-0">
                  <Text className="text-2xl">📄</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-md font-nunito text-navy">Carregar regulamento</Text>
                  <Text className="text-xs font-nunito-semibold text-muted mt-[2px]">PDF · max. 10 MB</Text>
                </View>
                <Text className="text-md font-nunito text-blue">Escolher</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Categorias */}
          <Text className="text-muted text-md font-nunito uppercase tracking-[0.5px] mb-[10px]">Categorias</Text>
          <View className="bg-white rounded-lg p-md mb-lg shadow-card">
            {(['M', 'F', 'MX'] as CategoryType[]).map((type, catIdx) => {
              const sel = selectedCats.filter(v => v.type === type);
              const countLabel = sel.length === 0
                ? 'nenhum'
                : `${sel.length} selecionado${sel.length > 1 ? 's' : ''}`;
              const isExpanded = expanded[type];
              return (
                <View key={type} className={clsx('pb-[4px]', catIdx > 0 && 'border-t border-t-gl pt-[10px] mt-[4px]')}>
                  <TouchableOpacity
                    className="flex-row items-center py-[4px] gap-[6px]"
                    onPress={() => setExpanded({ ...expanded, [type]: !isExpanded })}
                    activeOpacity={0.7}
                  >
                    <Text className="text-xl">{CATEGORY_CONFIG[type].emoji}</Text>
                    <Text className="flex-1 text-base font-nunito text-navy">{CATEGORY_CONFIG[type].label}</Text>
                    <Text className="text-xs font-nunito" style={sel.length > 0 ? { color: CATEGORY_CONFIG[type].color } : undefined}>
                      {sel.length > 0 ? countLabel : <Text className="text-muted">{countLabel}</Text>}
                    </Text>
                    <Text className="text-xs text-muted ml-[4px]">{isExpanded ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                  {isExpanded && (
                    <View className="flex-row flex-wrap gap-[6px] pb-sm pt-[4px]">
                      {/* Sem — exclusive chip */}
                      {(() => {
                        const semOn = selectedCats.some(v => v.type === type && v.level === 'Sem');
                        return (
                          <TouchableOpacity
                            className="px-[10px] py-[6px] rounded-[20px] border-2 border-dashed"
                            style={semOn
                              ? { borderStyle: 'solid', borderColor: CATEGORY_CONFIG[type].color, backgroundColor: CATEGORY_CONFIG[type].chipBg }
                              : { borderColor: Colors.gl, backgroundColor: Colors.white }
                            }
                            onPress={() => toggleCategory(type, 'Sem')}
                          >
                            <Text className="text-sm font-nunito" style={semOn ? { color: CATEGORY_CONFIG[type].color } : { color: Colors.muted }}>Sem</Text>
                          </TouchableOpacity>
                        );
                      })()}
                      {/* Level chips */}
                      {LEVELS[type].map(level => {
                        const isOn = selectedCats.some(v => v.type === type && v.level === level);
                        return (
                          <TouchableOpacity
                            key={level}
                            className="px-[10px] py-[6px] rounded-[20px] border-2"
                            style={isOn
                              ? { borderColor: CATEGORY_CONFIG[type].color, backgroundColor: CATEGORY_CONFIG[type].chipBg }
                              : { borderColor: Colors.gl, backgroundColor: Colors.white }
                            }
                            onPress={() => toggleCategory(type, level)}
                          >
                            <Text className="text-sm font-nunito" style={isOn ? { color: CATEGORY_CONFIG[type].color } : { color: Colors.muted }}>{level}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}

            {/* Summary */}
            {selectedCats.length > 0 && (
              <View className="bg-blue-bg rounded-md p-[10px] mt-[8px]">
                <Text className="text-sm font-nunito text-blue">
                  {selectedCats.length} categoria{selectedCats.length > 1 ? 's' : ''} criada{selectedCats.length > 1 ? 's' : ''}:
                </Text>
                <Text className="text-sm font-nunito-bold text-navy mt-[4px]">
                  {selectedCats.map(v => `${CATEGORY_CONFIG[v.type].emoji} ${v.level}`).join('  ·  ')}
                </Text>
              </View>
            )}
          </View>

          <View className="h-xl" />

          {/* Create Button */}
          <TouchableOpacity
            className={clsx('rounded-lg overflow-hidden', (!name || selectedCats.length === 0) && 'opacity-40')}
            onPress={handleCreate}
            disabled={!name || selectedCats.length === 0}
          >
            <LinearGradient colors={Gradients.primary} className="p-[15px] items-center">
              <Text className="text-[15px] font-nunito-black text-white">🏆 Criar Torneio</Text>
            </LinearGradient>
          </TouchableOpacity>
          {selectedCats.length > 0 && (
            <Text className="text-xs font-nunito-semibold text-muted text-center mt-[7px]">Configuras o nr de duplas por categoria no passo seguinte</Text>
          )}
          <View className="h-2xl" />
        </Container>
      </ScrollView>
    </View>
  );
};
