import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { SubBadge } from '../components/SubBadge';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Spacing, Radii } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddTeam'>;

const typeEmoji = { M: '👨', F: '👩', MX: '👫' };
const typeLabel = { M: 'Masculino', F: 'Feminino', MX: 'Misto' };

export const AddTeamScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];

  // Detect edit mode via teamId param
  const editTeamId = (route.params as any).teamId as string | undefined;
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

  const canSave = teamName.trim() && p1Name.trim() && p2Name.trim();

  const label = typeLabel[vertente.type];
  const emoji = typeEmoji[vertente.type];

  const getInitials = (name: string) =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para escolher uma foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Duplas"
            onBack={() => navigation.navigate('TeamList', { tournamentId: tournament.id, vertenteId: vertente.id })}
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
            style={s.fieldInput}
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Ex: Os Invencíveis"
            placeholderTextColor={Colors.gray}
            autoFocus={!isEditing}
          />
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
      <HomeFAB onPress={() => navigation.navigate('TournamentDetail', { tournamentId: tournament.id })} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black', marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontFamily: 'Nunito_600SemiBold', marginTop: 3 },

  // Content
  scroll: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 28 },

  // Context info box
  contextBox: {
    backgroundColor: '#E3ECFF',
    borderRadius: 11,
    padding: Spacing.md,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contextEmoji: { fontSize: 20 },
  contextName: { fontSize: 12, fontFamily: 'Nunito_900Black', color: Colors.navy },
  contextTournament: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted },

  // Fields
  fieldGroup: { marginBottom: 11 },
  fieldLabel: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 },
  fieldInput: {
    width: '100%',
    backgroundColor: Colors.gbg,
    borderWidth: 2,
    borderColor: Colors.gl,
    borderRadius: 11,
    padding: 11,
    paddingHorizontal: 13,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: Colors.navy,
  },

  // Photo
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  photoCircle: {
    width: 66, height: 66,
    borderWidth: 2, borderColor: Colors.gray, borderStyle: 'dashed',
    borderRadius: 33,
    backgroundColor: Colors.gbg,
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  photoImage: { width: 66, height: 66, borderRadius: 33 },
  photoIcon: { fontSize: 20 },
  photoHint: { fontSize: 9, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  photoCaption: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, lineHeight: 16 },
  photoActions: { flexDirection: 'column', gap: 6 },
  photoBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: Colors.gl,
    borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  photoBtnTxt: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  photoBtnDanger: { borderColor: Colors.red },
  photoBtnDangerTxt: { color: Colors.red },
  avatarCircle: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontSize: 20, fontFamily: 'Nunito_900Black' },

  // Divider
  divider: { height: 1, backgroundColor: Colors.gl, marginVertical: 12 },

  // Player section
  playerHeader: { fontSize: 12, fontFamily: 'Nunito_900Black', color: Colors.navy, marginBottom: 9 },

  // 2-col row
  row2col: { flexDirection: 'row', gap: 8, marginBottom: 11 },
  col: { flex: 1 },

  // Buttons
  btnPrimary: { borderRadius: 11, overflow: 'hidden', marginBottom: 7 },
  btnDisabled: { opacity: 0.4 },
  btnGrad: { padding: 13, alignItems: 'center' },
  btnPrimaryTxt: { color: '#fff', fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  btnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Colors.gl,
    borderRadius: 11,
    padding: 12,
    alignItems: 'center',
  },
  btnSecondaryTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },

});
