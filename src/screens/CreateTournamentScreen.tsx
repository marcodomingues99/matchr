import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { RootStackParamList } from '../types';
import { HeaderNav } from '../components/Breadcrumb';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type VertType = 'M' | 'F' | 'MX';
type SelectedVert = { type: VertType; level: string };

const LEVELS: Record<VertType, string[]> = {
  M: ['M6', 'M5', 'M4', 'M3', 'M2', 'M1'],
  F: ['F6', 'F5', 'F4', 'F3', 'F2', 'F1'],
  MX: ['MX6', 'MX5', 'MX4', 'MX3', 'MX2', 'MX1'],
};
const CAT_LABEL: Record<VertType, string> = { M: 'Masculino', F: 'Feminino', MX: 'Misto' };
const CAT_EMOJI: Record<VertType, string> = { M: '👨', F: '👩', MX: '👫' };
const CAT_COLOR: Record<VertType, string> = { M: Colors.blue, F: '#9B30FF', MX: Colors.orange };
const CAT_BG: Record<VertType, string> = { M: '#E3ECFF', F: '#F3E8FF', MX: '#FFF0E3' };

export const CreateTournamentScreen = () => {
  const navigation = useNavigation<Nav>();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [regulamento, setRegulamento] = useState<{ uri: string; name: string; size?: number } | null>(null);
  const [selectedVerts, setSelectedVerts] = useState<SelectedVert[]>([]);
  const [expanded, setExpanded] = useState<Record<VertType, boolean>>({ M: true, F: true, MX: false });

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

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    return ` · ${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const PT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const formatDate = (d: Date) => `${d.getDate()} ${PT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

  const toggleVert = (type: VertType, level: string) => {
    if (level === 'Sem') {
      const hasSem = selectedVerts.some(v => v.type === type && v.level === 'Sem');
      const withoutType = selectedVerts.filter(v => v.type !== type);
      setSelectedVerts(hasSem ? withoutType : [...withoutType, { type, level: 'Sem' }]);
    } else {
      const withoutSem = selectedVerts.filter(v => !(v.type === type && v.level === 'Sem'));
      const exists = withoutSem.findIndex(v => v.type === type && v.level === level);
      setSelectedVerts(exists >= 0 ? withoutSem.filter((_, i) => i !== exists) : [...withoutSem, { type, level }]);
    }
  };

  const handleCreate = () => {
    if (!name || selectedVerts.length === 0) return;
    navigation.navigate('ConfigureVertente', {
      tournamentId: 'new',
      vertenteIndex: 0,
      isLast: selectedVerts.length === 1,
      pendingVertentes: JSON.stringify(selectedVerts),
    });
  };

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <HeaderNav
            backLabel="Início"
            onBack={() => navigation.navigate('Home')}
          />
          <Text style={s.title}>Criar Torneio</Text>
          <Text style={s.subtitle}>Preenche os dados do teu evento</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        {/* Basic Info */}
        <Text style={s.sectionLabel}>Informação Geral</Text>
        <View style={s.card}>
          <Text style={s.fieldLabel}>Nome do torneio *</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Open de Padel Lisboa 2026"
            placeholderTextColor={Colors.gray}
          />
          <Text style={s.fieldLabel}>Localização</Text>
          <TextInput
            style={s.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Ex: Clube Restelo"
            placeholderTextColor={Colors.gray}
          />
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Data início</Text>
              <TouchableOpacity style={s.dateBtn} onPress={() => setShowStartPicker(true)} activeOpacity={0.7}>
                <Text style={[s.dateTxt, !startDate && s.datePlaceholder]}>
                  {startDate ? formatDate(startDate) : '14 Mar 2026'}
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
                  {endDate ? formatDate(endDate) : '16 Mar 2026'}
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

          {/* Photo */}
          <Text style={s.fieldLabel}>Foto / Banner</Text>
          <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
            {photo ? (
              <View style={s.photoBanner}>
                <Image source={{ uri: photo }} style={s.photoBannerImg} />
                <View style={s.photoBannerOverlay}>
                  <Text style={s.photoBannerOverlayTxt}>📷  Alterar foto</Text>
                </View>
              </View>
            ) : (
              <View style={s.photoEmpty}>
                <Text style={{ fontSize: 22 }}>📷</Text>
                <Text style={s.photoEmptyTxt}>Adicionar foto</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Regulamento */}
          <Text style={[s.fieldLabel, { marginTop: 8 }]}>Regulamento (opcional)</Text>
          {regulamento ? (
            <View style={s.regLoaded}>
              <View style={s.regIcon}><Text style={{ fontSize: 20 }}>📄</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.regName} numberOfLines={1}>{regulamento.name}</Text>
                <Text style={s.regSub}>Carregado{formatSize(regulamento.size)}</Text>
              </View>
              <TouchableOpacity onPress={() => setRegulamento(null)}>
                <Text style={s.regRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.regEmpty} onPress={pickRegulamento} activeOpacity={0.8}>
              <View style={s.regIcon}><Text style={{ fontSize: 20 }}>📄</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.regTitle}>Carregar regulamento</Text>
                <Text style={s.regSub}>PDF · máx. 10 MB</Text>
              </View>
              <Text style={s.regChoose}>Escolher</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sub-torneios */}
        <Text style={s.sectionLabel}>Sub-torneios (categorias + vertentes)</Text>
        <View style={s.card}>
          {(['M', 'F', 'MX'] as VertType[]).map((type, catIdx) => {
            const sel = selectedVerts.filter(v => v.type === type);
            const countLabel = sel.length === 0
              ? 'nenhum'
              : `${sel.length} selecionado${sel.length > 1 ? 's' : ''}`;
            const isExpanded = expanded[type];
            return (
              <View key={type} style={[s.catSection, catIdx > 0 && s.catSectionBorder]}>
                <TouchableOpacity
                  style={s.catHeader}
                  onPress={() => setExpanded({ ...expanded, [type]: !isExpanded })}
                  activeOpacity={0.7}
                >
                  <Text style={s.catEmoji}>{CAT_EMOJI[type]}</Text>
                  <Text style={s.catLabel}>{CAT_LABEL[type]}</Text>
                  <Text style={[s.catCount, sel.length > 0 && { color: CAT_COLOR[type] }]}>
                    {countLabel}
                  </Text>
                  <Text style={s.catToggle}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {isExpanded && (
                  <View style={s.vertGrid}>
                    {/* Sem — exclusive chip */}
                    {(() => {
                      const semOn = selectedVerts.some(v => v.type === type && v.level === 'Sem');
                      return (
                        <TouchableOpacity
                          style={[
                            s.vertChip, s.vertChipSem,
                            semOn && { borderStyle: 'solid', borderColor: CAT_COLOR[type], backgroundColor: CAT_BG[type] },
                          ]}
                          onPress={() => toggleVert(type, 'Sem')}
                        >
                          <Text style={[s.vertChipTxt, semOn && { color: CAT_COLOR[type] }]}>Sem</Text>
                        </TouchableOpacity>
                      );
                    })()}
                    {/* Level chips */}
                    {LEVELS[type].map(level => {
                      const isOn = selectedVerts.some(v => v.type === type && v.level === level);
                      return (
                        <TouchableOpacity
                          key={level}
                          style={[s.vertChip, isOn && { borderColor: CAT_COLOR[type], backgroundColor: CAT_BG[type] }]}
                          onPress={() => toggleVert(type, level)}
                        >
                          <Text style={[s.vertChipTxt, isOn && { color: CAT_COLOR[type] }]}>{level}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}

          {/* Summary */}
          {selectedVerts.length > 0 && (
            <View style={s.summaryBox}>
              <Text style={s.summaryTitle}>
                {selectedVerts.length} sub-torneio{selectedVerts.length > 1 ? 's' : ''} criado{selectedVerts.length > 1 ? 's' : ''}:
              </Text>
              <Text style={s.summaryBody}>
                {selectedVerts.map(v => `${CAT_EMOJI[v.type]} ${v.level}`).join('  ·  ')}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />

        {/* Create Button */}
        <TouchableOpacity
          style={[s.createBtn, (!name || selectedVerts.length === 0) && s.createBtnDisabled]}
          onPress={handleCreate}
          disabled={!name || selectedVerts.length === 0}
        >
          <LinearGradient colors={Gradients.primary} style={s.createBtnGrad}>
            <Text style={s.createBtnTxt}>🏆 Criar Torneio</Text>
          </LinearGradient>
        </TouchableOpacity>
        {selectedVerts.length > 0 && (
          <Text style={s.createNote}>Configuras o nº de duplas por vertente no passo seguinte</Text>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gbg },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  back: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: 'Nunito_700Bold', paddingTop: 8, marginBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontFamily: 'Nunito_900Black', marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginTop: 4 },
  scroll: { flex: 1 },
  sectionLabel: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.card },
  fieldLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.sm, padding: Spacing.sm, fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.navy, backgroundColor: Colors.gbg },
  row: { flexDirection: 'row', marginTop: 4 },

  /* ── Date picker ── */
  dateBtn: {
    borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 10,
    backgroundColor: Colors.gbg, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  dateTxt: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.navy },
  datePlaceholder: { color: Colors.gray },

  /* ── Photo ── */
  photoEmpty: {
    borderWidth: 2, borderColor: Colors.gray, borderStyle: 'dashed',
    borderRadius: Radii.md, backgroundColor: Colors.gbg, height: 76,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  photoEmptyTxt: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  photoBanner: { height: 76, borderRadius: Radii.md, overflow: 'hidden' },
  photoBannerImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  photoBannerOverlayTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },

  /* ── Regulamento ── */
  regEmpty: {
    borderWidth: 2, borderColor: Colors.gray, borderStyle: 'dashed',
    borderRadius: Radii.md, backgroundColor: Colors.gbg,
    padding: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 11,
  },
  regLoaded: {
    backgroundColor: Colors.gbg, borderRadius: Radii.md,
    padding: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 11,
  },
  regIcon: {
    width: 40, height: 40, backgroundColor: '#fff', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', ...Shadows.card, flexShrink: 0,
  },
  regTitle: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  regName: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  regSub: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, marginTop: 2 },
  regChoose: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.blue },
  regRemove: { fontSize: 14, fontFamily: 'Nunito_800ExtraBold', color: Colors.red, padding: 4 },

  /* ── Sub-torneios ── */
  catSection: { paddingBottom: 4 },
  catSectionBorder: { borderTopWidth: 1, borderTopColor: Colors.gl, paddingTop: 10, marginTop: 4 },
  catHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 6 },
  catEmoji: { fontSize: 16 },
  catLabel: { flex: 1, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  catCount: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  catToggle: { fontSize: 10, color: Colors.muted, marginLeft: 4 },
  vertGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: 8, paddingTop: 4 },
  vertChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.gl,
  },
  vertChipSem: { borderStyle: 'dashed' },
  vertChipTxt: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },

  /* ── Summary ── */
  summaryBox: {
    backgroundColor: '#E3ECFF', borderRadius: Radii.md,
    padding: 10, marginTop: 8,
  },
  summaryTitle: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.blue },
  summaryBody: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: Colors.navy, marginTop: 4 },

  /* ── Create ── */
  createBtn: { borderRadius: Radii.lg, overflow: 'hidden' },
  createBtnDisabled: { opacity: 0.4 },
  createBtnGrad: { padding: 15, alignItems: 'center' },
  createBtnTxt: { fontSize: 15, fontFamily: 'Nunito_900Black', color: '#fff' },
  createNote: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: Colors.muted, textAlign: 'center', marginTop: 7 },
});
