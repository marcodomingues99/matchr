import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { popTo } from '../utils/navigation';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Typography, TextStyles, Spacing, Radii } from '../theme';
import { getInitials } from '../utils/teamUtils';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddTeam'>;

export const AddTeamScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  if (!tournament) return null;
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId);
  if (!vertente) return null;

  // Detect edit mode via teamId param
  const editTeamId = route.params.teamId;
  const existingTeam = editTeamId ? vertente.teams.find(t => t.id === editTeamId) : undefined;
  const isEditing = !!existingTeam;

  const [teamName, setTeamName] = useState(existingTeam?.name ?? '');
  const [photo, setPhoto] = useState<string | undefined>(existingTeam?.photo);
  const [p1Name, setP1Name] = useState(existingTeam?.players[0].name ?? '');
  const [p1Phone, setP1Phone] = useState(existingTeam?.players[0].phone ?? '');
  const [p1Email, setP1Email] = useState(existingTeam?.players[0].email ?? '');
  const [p2Name, setP2Name] = useState(existingTeam?.players[1].name ?? '');
  const [p2Phone, setP2Phone] = useState(existingTeam?.players[1].phone ?? '');
  const [p2Email, setP2Email] = useState(existingTeam?.players[1].email ?? '');

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
    <View style={s.container}>
      {/* ── Header ── */}
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Duplas"
            onBack={() => navigation.goBack()}
          />
          <SubBadge type={vertente.type} level={vertente.level} />
          <Text style={s.title}>{isEditing ? 'Editar Dupla ✏️' : 'Nova Dupla 🎾'}</Text>
          {!isEditing && (
            <Text style={s.subtitle}>Categoria já definida — só precisas dos jogadores</Text>
          )}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>

        {/* ── Context info box ── */}
        <View style={s.contextBox}>
          <Text style={s.contextEmoji}>{emoji}</Text>
          <View>
            <Text style={s.contextName}>{label} {vertente.level}{isEditing && existingTeam?.group ? ` · Grupo ${existingTeam.group}` : ''}</Text>
            <Text style={s.contextTournament}>{tournament.name}</Text>
          </View>
        </View>

        {/* ── Nome da dupla ── */}
        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>Nome da dupla</Text>
          <TextInput
            style={[s.fieldInput, isDuplicateName && s.fieldInputError]}
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Ex: Os Invencíveis"
            placeholderTextColor={Colors.gray}
            autoFocus={!isEditing}
          />
          {isDuplicateName && (
            <Text style={s.fieldError}>Este nome já existe nesta vertente</Text>
          )}
        </View>

        {/* ── Foto da dupla ── */}
        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>Foto da dupla</Text>
          <View style={s.photoRow}>
            <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
              {photo ? (
                <Image source={{ uri: photo }} style={s.photoImage} />
              ) : teamName.trim() ? (
                <LinearGradient colors={[Colors.blue, Colors.teal]} style={s.avatarCircle}>
                  <Text style={s.avatarTxt}>{getInitials(teamName)}</Text>
                </LinearGradient>
              ) : (
                <View style={s.photoCircle}>
                  <Text style={s.photoIcon}>📷</Text>
                  <Text style={s.photoHint}>Foto</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={s.photoActions}>
              {photo ? (
                <>
                  <TouchableOpacity style={s.photoBtn} onPress={pickPhoto}>
                    <Text style={s.photoBtnTxt}>Alterar foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.photoBtn, s.photoBtnDanger]} onPress={() => setPhoto(undefined)}>
                    <Text style={[s.photoBtnTxt, s.photoBtnDangerTxt]}>Remover</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={s.photoCaption}>Aparece no pódio</Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={s.divider} />

        {/* ── Jogador 1 ── */}
        <Text style={s.playerHeader}>👤 Jogador 1</Text>
        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>Nome</Text>
          <TextInput style={s.fieldInput} value={p1Name} onChangeText={setP1Name} placeholder="João Silva" placeholderTextColor={Colors.gray} />
        </View>
        <View style={s.row2col}>
          <View style={s.col}>
            <Text style={s.fieldLabel}>Telemóvel</Text>
            <TextInput style={s.fieldInput} value={p1Phone} onChangeText={setP1Phone} placeholder="912 345 678" placeholderTextColor={Colors.gray} keyboardType="phone-pad" />
          </View>
          <View style={s.col}>
            <Text style={s.fieldLabel}>Email</Text>
            <TextInput style={s.fieldInput} value={p1Email} onChangeText={setP1Email} placeholder="joao@mail.com" placeholderTextColor={Colors.gray} keyboardType="email-address" autoCapitalize="none" />
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={s.divider} />

        {/* ── Jogador 2 ── */}
        <Text style={s.playerHeader}>👤 Jogador 2</Text>
        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>Nome</Text>
          <TextInput style={s.fieldInput} value={p2Name} onChangeText={setP2Name} placeholder="Marco Ramos" placeholderTextColor={Colors.gray} />
        </View>
        <View style={s.row2col}>
          <View style={s.col}>
            <Text style={s.fieldLabel}>Telemóvel</Text>
            <TextInput style={s.fieldInput} value={p2Phone} onChangeText={setP2Phone} placeholder="963 456 789" placeholderTextColor={Colors.gray} keyboardType="phone-pad" />
          </View>
          <View style={s.col}>
            <Text style={s.fieldLabel}>Email</Text>
            <TextInput style={s.fieldInput} value={p2Email} onChangeText={setP2Email} placeholder="marco@mail.com" placeholderTextColor={Colors.gray} keyboardType="email-address" autoCapitalize="none" />
          </View>
        </View>

        {/* ── Buttons ── */}
        <View style={{ marginTop: 10 }}>
          <TouchableOpacity
            style={[s.btnPrimary, !canSave && s.btnDisabled]}
            onPress={() => canSave && navigation.goBack()}
            disabled={!canSave}
          >
            <LinearGradient colors={Gradients.primary} style={s.btnGrad}>
              <Text style={s.btnPrimaryTxt}>{isEditing ? 'Guardar alterações ✓' : 'Guardar Dupla ✓'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {!isEditing && (
            <TouchableOpacity style={s.btnSecondary} onPress={() => {
              setTeamName(''); setPhoto(undefined); setP1Name(''); setP1Phone(''); setP1Email(''); setP2Name(''); setP2Phone(''); setP2Email('');
            }}>
              <Text style={s.btnSecondaryTxt}>+ Adicionar outra dupla em {vertente.level}</Text>
            </TouchableOpacity>
          )}
          {isEditing && (
            <TouchableOpacity style={s.btnSecondary} onPress={() => navigation.goBack()}>
              <Text style={s.btnSecondaryTxt}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 28 }} />
      </ScrollView>
      <HomeFAB onPress={() => navigation.dispatch(popTo('TournamentDetail'))} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  // Header
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,0.65)', fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilySemiBold, marginTop: 3 },

  // Content
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: 28 },

  // Context info box
  contextBox: {
    backgroundColor: Colors.blueBg,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  contextEmoji: { fontSize: Typography.fontSize.xxl },
  contextName: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilyBlack, color: Colors.navy },
  contextTournament: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted },

  // Fields
  fieldGroup: { marginBottom: Spacing.md },
  fieldLabel: { ...TextStyles.sectionLabel, marginBottom: Spacing.xs },
  fieldInput: {
    width: '100%',
    backgroundColor: Colors.gbg,
    borderWidth: 2,
    borderColor: Colors.gl,
    borderRadius: Radii.md,
    padding: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontFamily: Typography.fontFamilyBold,
    fontSize: Typography.fontSize.base,
    color: Colors.navy,
  },
  fieldInputError: { borderColor: Colors.red },
  fieldError: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.red, marginTop: 4 },

  // Photo
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  photoCircle: {
    width: 66, height: 66,
    borderWidth: 2, borderColor: Colors.gray, borderStyle: 'dashed',
    borderRadius: 33,
    backgroundColor: Colors.gbg,
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  photoImage: { width: 66, height: 66, borderRadius: 33 },
  photoIcon: { fontSize: Typography.fontSize.xxl },
  photoHint: { fontSize: Typography.fontSize.xxs, fontFamily: Typography.fontFamily, color: Colors.muted },
  photoCaption: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, lineHeight: 16 },
  photoActions: { flexDirection: 'column', gap: 6 },
  photoBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.gl,
    borderRadius: Radii.sm,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  photoBtnTxt: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily, color: Colors.navy },
  photoBtnDanger: { borderColor: Colors.red },
  photoBtnDangerTxt: { color: Colors.red },
  avatarCircle: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: Colors.white, fontSize: Typography.fontSize.xxl, fontFamily: Typography.fontFamilyBlack },

  // Divider
  divider: { height: 1, backgroundColor: Colors.gl, marginVertical: 12 },

  // Player section
  playerHeader: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamilyBlack, color: Colors.navy, marginBottom: Spacing.sm },

  // 2-col row
  row2col: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  col: { flex: 1 },

  // Buttons
  btnPrimary: { borderRadius: Radii.md, overflow: 'hidden', marginBottom: 7 },
  btnDisabled: { opacity: 0.4 },
  btnGrad: { padding: Spacing.md, alignItems: 'center' },
  btnPrimaryTxt: { color: Colors.white, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily },
  btnSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.gl,
    borderRadius: Radii.md,
    padding: 12,
    alignItems: 'center',
  },
  btnSecondaryTxt: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },

});
