import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { HeaderNav, HomeFAB } from '../components/Breadcrumb';
import { Colors, Gradients, Typography, TextStyles, Spacing, Radii, Shadows } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { PT_MONTHS } from '../utils/constants';
import { popTo } from '../utils/navigation';

const formatDate = (d: Date) => `${d.getDate()} ${PT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'EditTournament'>;

export const EditTournamentScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId);
  if (!tournament) return null;

  const [name, setName] = useState(tournament.name);
  const [location, setLocation] = useState(tournament.location);
  const [vertentes, setVertentes] = useState(tournament.vertentes);

  const handleRemoveVertente = (vertenteId: string) => {
    Alert.alert(
      'Remover sub-torneio',
      'Tens a certeza que queres remover este sub-torneio?',
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
      'Esta ação é irreversível. Tens a certeza que queres eliminar este torneio?',
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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [photo, setPhoto] = useState(tournament.photo ?? '');
  const [regulamento, setRegulamento] = useState<{ uri: string; name: string; size?: number } | null>(
    tournament.regulamento ? { uri: tournament.regulamento, name: tournament.regulamento.split('/').pop() ?? 'regulamento.pdf' } : null
  );

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
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Torneio"
            onBack={() => navigation.goBack()}
          />
          <Text style={s.title}>Editar Torneio</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        <Text style={s.sectionLabel}>Informação Geral</Text>
        <View style={s.card}>
          <Text style={s.fieldLabel}>Nome do torneio</Text>
          <TextInput style={s.input} value={name} onChangeText={setName} placeholderTextColor={Colors.gray} />

          <Text style={s.fieldLabel}>Foto / Banner</Text>
          <TouchableOpacity style={s.photoBanner} onPress={pickPhoto} activeOpacity={0.8}>
            {photo ? (
              <Image source={{ uri: photo }} style={s.photoBannerImg} />
            ) : null}
            <View style={s.photoBannerOverlay}>
              <Text style={s.photoBannerIcon}>📷</Text>
              <Text style={s.photoBannerTxt}>{photo ? 'Alterar foto' : 'Adicionar foto'}</Text>
            </View>
          </TouchableOpacity>

          <Text style={s.fieldLabel}>Localização</Text>
          <TextInput style={s.input} value={location} onChangeText={setLocation} placeholderTextColor={Colors.gray} />
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Data início</Text>
              <TouchableOpacity style={s.dateBtn} onPress={() => setShowStartPicker(true)} activeOpacity={0.7}>
                <Text style={[s.dateTxt, !startDate && s.datePlaceholder]}>
                  {startDate ? formatDate(startDate) : tournament.startDate}
                </Text>
                <Text style={{ fontSize: 14 }}>📅</Text>
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
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Data fim</Text>
              <TouchableOpacity style={s.dateBtn} onPress={() => setShowEndPicker(true)} activeOpacity={0.7}>
                <Text style={[s.dateTxt, !endDate && s.datePlaceholder]}>
                  {endDate ? formatDate(endDate) : tournament.endDate}
                </Text>
                <Text style={{ fontSize: 14 }}>📅</Text>
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

          <Text style={s.fieldLabel}>Regulamento</Text>
          {regulamento ? (
            <View style={s.regulamentoRow}>
              <View style={s.regulamentoIcon}>
                <Text style={{ fontSize: 18 }}>📄</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.regulamentoName} numberOfLines={1}>{regulamento.name}</Text>
                <Text style={s.regulamentoSub}>Regulamento carregado</Text>
              </View>
              <TouchableOpacity onPress={() => setRegulamento(null)}>
                <Text style={s.regulamentoRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.regulamentoAdd} onPress={pickRegulamento}>
              <Text style={s.regulamentoAddIcon}>📎</Text>
              <Text style={s.regulamentoAddTxt}>Anexar regulamento (PDF)</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={s.sectionLabel}>Sub-torneios</Text>
        {vertentes.map((v, i) => (
          <View key={v.id} style={s.vertCard}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}
              onPress={() => navigation.navigate('ConfigureVertente', { tournamentId: tournament.id, vertenteIndex: 0, isLast: true, pendingVertentes: JSON.stringify([{ type: v.type, level: v.level }]) })}
            >
              <View style={[s.vertDot, { backgroundColor: VERTENTE_CONFIG[v.type].color }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.vertTitle}>{VERTENTE_CONFIG[v.type].label} · {v.level}</Text>
                <Text style={s.vertSub}>{v.teams.length}/{v.maxTeams} duplas · {v.courts} courts</Text>
              </View>
              <Text style={s.vertArrow}>✏️</Text>
            </TouchableOpacity>
            {v.status === 'config' && (
              <TouchableOpacity onPress={() => handleRemoveVertente(v.id)} style={s.vertDelete}>
                <Text style={s.vertDeleteTxt}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={{ height: 24 }} />

        <TouchableOpacity style={s.saveBtn} onPress={() => navigation.goBack()}>
          <LinearGradient colors={Gradients.primary} style={s.saveGrad}>
            <Text style={s.saveTxt}>✓ Guardar alterações</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Danger zone */}
        <View style={s.dangerCard}>
          <Text style={s.dangerTitle}>⚠️ Zona de risco</Text>
          <TouchableOpacity style={s.dangerBtn} onPress={handleDeleteTournament}>
            <Text style={s.dangerBtnTxt}>🗑️ Eliminar torneio</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
      <HomeFAB onPress={() => navigation.dispatch(popTo('Home'))} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 4 },
  scroll: { flex: 1 },
  sectionLabel: { ...TextStyles.sectionLabel, fontSize: Typography.fontSize.md, marginBottom: 10 },
  card: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.card },
  fieldLabel: { ...TextStyles.sectionLabel, marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.sm, padding: Spacing.sm, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBold, color: Colors.navy, backgroundColor: Colors.gbg },
  row: { flexDirection: 'row', marginTop: 4 },
  dateBtn: { borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.sm, paddingHorizontal: Spacing.sm, paddingVertical: 10, backgroundColor: Colors.gbg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateTxt: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBold, color: Colors.navy },
  datePlaceholder: { color: Colors.gray },
  photoBanner: { height: 80, borderRadius: Radii.md, overflow: 'hidden', backgroundColor: Colors.navy, marginBottom: 4 },
  photoBannerImg: { position: 'absolute', width: '100%', height: '100%' },
  photoBannerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.30)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoBannerIcon: { fontSize: 18 },
  photoBannerTxt: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.white },
  regulamentoRow: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: Colors.gbg, borderRadius: Radii.sm, padding: 12 },
  regulamentoIcon: { width: 38, height: 38, backgroundColor: Colors.white, borderRadius: 9, alignItems: 'center', justifyContent: 'center', ...Shadows.card, flexShrink: 0 },
  regulamentoName: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.navy },
  regulamentoSub: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 2 },
  regulamentoRemove: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily, color: Colors.red, paddingHorizontal: 4 },
  regulamentoAdd: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.sm, borderStyle: 'dashed', padding: 12, backgroundColor: Colors.gbg },
  regulamentoAddIcon: { fontSize: 16 },
  regulamentoAddTxt: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilyBold, color: Colors.muted },
  vertCard: { backgroundColor: Colors.white, borderRadius: Radii.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.sm, ...Shadows.card, overflow: 'hidden' },
  vertDelete: { paddingHorizontal: 10, paddingVertical: 4, borderLeftWidth: 1, borderLeftColor: Colors.redBorder, marginLeft: 8 },
  vertDeleteTxt: { fontSize: 16 },
  vertDot: { width: 10, height: 10, borderRadius: 5 },
  vertTitle: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
  vertSub: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted },
  vertArrow: { fontSize: 14 },
  saveBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: Spacing.xl },
  saveGrad: { padding: 15, alignItems: 'center' },
  saveTxt: { color: Colors.white, fontSize: 15, fontFamily: Typography.fontFamily },
  dangerCard: { backgroundColor: Colors.redBgSoft, borderRadius: Radii.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.redBorder },
  dangerTitle: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.red, marginBottom: 10 },
  dangerBtn: { backgroundColor: Colors.redBg, borderRadius: Radii.md, padding: 12, alignItems: 'center' },
  dangerBtnTxt: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.red },
});
