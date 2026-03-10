import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { popTo } from '../utils/navigation';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients } from '../theme';
import { getInitials } from '../utils/teamUtils';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { Container } from '../components/Layout';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ManageTeam'>;

export const ManageTeamScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  const vertente = tournament?.vertentes.find(v => v.id === route.params.vertenteId);

  const editTeamId = route.params.teamId;
  const existingTeam = editTeamId ? vertente?.teams.find(t => t.id === editTeamId) : undefined;
  const isEditing = !!existingTeam;

  const [teamName, setTeamName] = useState(existingTeam?.name ?? '');
  const [photo, setPhoto] = useState<string | undefined>(existingTeam?.photo);
  const [p1Name, setP1Name] = useState(existingTeam?.players[0].name ?? '');
  const [p1Phone, setP1Phone] = useState(existingTeam?.players[0].phone ?? '');
  const [p1Email, setP1Email] = useState(existingTeam?.players[0].email ?? '');
  const [p2Name, setP2Name] = useState(existingTeam?.players[1].name ?? '');
  const [p2Phone, setP2Phone] = useState(existingTeam?.players[1].phone ?? '');
  const [p2Email, setP2Email] = useState(existingTeam?.players[1].email ?? '');

  if (!tournament || !vertente) return null;

  const isDuplicateName = vertente.teams.some(
    t => t.id !== editTeamId && t.name.trim().toLowerCase() === teamName.trim().toLowerCase(),
  );
  const canSave = teamName.trim() && p1Name.trim() && p2Name.trim() && !isDuplicateName;

  const { label, emoji } = VERTENTE_CONFIG[vertente.type];

  const pickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para escolher uma foto.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível aceder à galeria. Tenta novamente.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <LinearGradient colors={Gradients.header} className="px-lg pb-lg">
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Duplas"
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text className="text-white text-3xl md:text-[28px] font-nunito-black mt-xs">{isEditing ? 'Editar Dupla \u270F\uFE0F' : 'Nova Dupla \u{1F3BE}'}</Text>
          {!isEditing && (
            <Text className="text-white/65 text-md font-nunito-semibold mt-[3px]">Categoria já definida — só precisas dos jogadores</Text>
          )}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-lg pb-[28px]">
        <Container>
          {/* Context info box */}
          <View className="bg-blue-bg rounded-md p-md mb-lg flex-row items-center gap-md">
            <Text className="text-2xl">{emoji}</Text>
            <View>
              <Text className="text-md font-nunito-black text-navy">{label} {vertente.level}{isEditing && existingTeam?.group ? ` · Grupo ${existingTeam.group}` : ''}</Text>
              <Text className="text-xs font-nunito-semibold text-muted">{tournament.name}</Text>
            </View>
          </View>

          {/* Nome da dupla */}
          <View className="mb-md">
            <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-xs">Nome da dupla</Text>
            <TextInput
              className={clsx(
                'w-full bg-gbg border-2 rounded-md p-md px-md font-nunito-bold text-base text-navy',
                isDuplicateName ? 'border-red' : 'border-gl',
              )}
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Ex: Os Invencíveis"
              placeholderTextColor={Colors.gray}
              autoFocus={!isEditing}
            />
            {isDuplicateName && (
              <Text className="text-xs font-nunito-semibold text-red mt-xs">Este nome já existe nesta categoria</Text>
            )}
          </View>

          {/* Foto da dupla */}
          <View className="mb-md">
            <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-xs">Foto da dupla</Text>
            <View className="flex-row items-center gap-md">
              <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
                {photo ? (
                  <Image source={{ uri: photo }} style={{ width: 66, height: 66 }} className="rounded-[33px]" />
                ) : teamName.trim() ? (
                  <LinearGradient colors={[Colors.blue, Colors.teal]} className="w-[66px] h-[66px] rounded-[33px] items-center justify-center">
                    <Text className="text-white text-2xl font-nunito-black">{getInitials(teamName)}</Text>
                  </LinearGradient>
                ) : (
                  <View className="w-[66px] h-[66px] border-2 border-gray border-dashed rounded-[33px] bg-gbg items-center justify-center gap-[2px]">
                    <Text className="text-2xl">{'\u{1F4F7}'}</Text>
                    <Text className="text-xxs font-nunito text-muted">Foto</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View className="flex-col gap-[6px]">
                {photo ? (
                  <>
                    <TouchableOpacity className="bg-white border-[1.5px] border-gl rounded-sm px-md py-[5px]" onPress={pickPhoto}>
                      <Text className="text-sm font-nunito text-navy">Alterar foto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-white border-[1.5px] border-red rounded-sm px-md py-[5px]" onPress={() => setPhoto(undefined)}>
                      <Text className="text-sm font-nunito text-red">Remover</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text className="text-sm font-nunito-semibold text-muted leading-[16px]">Aparece no pódio</Text>
                )}
              </View>
            </View>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gl my-md" />

          {/* Jogador 1 */}
          <Text className="text-md font-nunito-black text-navy mb-sm">{'\u{1F464}'} Jogador 1</Text>
          <View className="mb-md">
            <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-xs">Nome</Text>
            <TextInput className="w-full bg-gbg border-2 border-gl rounded-md p-md px-md font-nunito-bold text-base text-navy" value={p1Name} onChangeText={setP1Name} placeholder="João Silva" placeholderTextColor={Colors.gray} />
          </View>
          <View className="flex-row gap-sm mb-md">
            <View className="flex-1">
              <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-xs">Telemóvel</Text>
              <TextInput className="w-full bg-gbg border-2 border-gl rounded-md p-md px-md font-nunito-bold text-base text-navy" value={p1Phone} onChangeText={setP1Phone} placeholder="912 345 678" placeholderTextColor={Colors.gray} keyboardType="phone-pad" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-xs">Email</Text>
              <TextInput className="w-full bg-gbg border-2 border-gl rounded-md p-md px-md font-nunito-bold text-base text-navy" value={p1Email} onChangeText={setP1Email} placeholder="joao@mail.com" placeholderTextColor={Colors.gray} keyboardType="email-address" autoCapitalize="none" />
            </View>
          </View>

          {/* Divider */}
          <View className="h-[1px] bg-gl my-md" />

          {/* Jogador 2 */}
          <Text className="text-md font-nunito-black text-navy mb-sm">{'\u{1F464}'} Jogador 2</Text>
          <View className="mb-md">
            <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-xs">Nome</Text>
            <TextInput className="w-full bg-gbg border-2 border-gl rounded-md p-md px-md font-nunito-bold text-base text-navy" value={p2Name} onChangeText={setP2Name} placeholder="Marco Ramos" placeholderTextColor={Colors.gray} />
          </View>
          <View className="flex-row gap-sm mb-md">
            <View className="flex-1">
              <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-xs">Telemóvel</Text>
              <TextInput className="w-full bg-gbg border-2 border-gl rounded-md p-md px-md font-nunito-bold text-base text-navy" value={p2Phone} onChangeText={setP2Phone} placeholder="963 456 789" placeholderTextColor={Colors.gray} keyboardType="phone-pad" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-nunito text-muted uppercase tracking-[0.5px] mb-xs">Email</Text>
              <TextInput className="w-full bg-gbg border-2 border-gl rounded-md p-md px-md font-nunito-bold text-base text-navy" value={p2Email} onChangeText={setP2Email} placeholder="marco@mail.com" placeholderTextColor={Colors.gray} keyboardType="email-address" autoCapitalize="none" />
            </View>
          </View>

          {/* Buttons */}
          <View className="mt-[10px]">
            <TouchableOpacity
              className={clsx('rounded-md overflow-hidden mb-[7px]', !canSave && 'opacity-40')}
              onPress={() => canSave && navigation.goBack()}
              disabled={!canSave}
            >
              <LinearGradient colors={Gradients.primary} className="p-md items-center">
                <Text className="text-white text-base font-nunito">{isEditing ? 'Guardar alterações ✓' : 'Guardar Dupla ✓'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {!isEditing && (
              <TouchableOpacity
                className="bg-white border-2 border-gl rounded-md p-md items-center"
                onPress={() => {
                  setTeamName(''); setPhoto(undefined); setP1Name(''); setP1Phone(''); setP1Email(''); setP2Name(''); setP2Phone(''); setP2Email('');
                }}
              >
                <Text className="text-base font-nunito text-navy">+ Adicionar outra dupla em {vertente.level}</Text>
              </TouchableOpacity>
            )}
            {isEditing && (
              <TouchableOpacity
                className="bg-white border-2 border-gl rounded-md p-md items-center"
                onPress={() => navigation.goBack()}
              >
                <Text className="text-base font-nunito text-navy">Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
          <View className="h-[28px]" />
        </Container>
      </ScrollView>
      <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
    </View>
  );
};
