import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { RootStackParamList, VertenteType } from '../types';
import { HeaderNav } from '../components/Breadcrumb';
import { Colors, Gradients, Typography, TextStyles, Spacing, Radii, Shadows } from '../theme';
import { VERTENTE_CONFIG } from '../utils/vertenteConfig';
import { PT_MONTHS } from '../utils/constants';

type Nav = StackNavigationProp<RootStackParamList>;
type VertType = VertenteType;
type SelectedVert = { type: VertType; level: string };

const LEVELS: Record<VertType, string[]> = {
  M: ['M6', 'M5', 'M4', 'M3', 'M2', 'M1'],
  F: ['F6', 'F5', 'F4', 'F3', 'F2', 'F1'],
  MX: ['MX6', 'MX5', 'MX4', 'MX3', 'MX2', 'MX1'],
};

const formatDate = (d: Date) => `${d.getDate()} ${PT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

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
                  {startDate ? formatDate(startDate) : 'Selecionar data'}
                </Text>
                <Text style={{ fontSize: Typography.fontSize.lg }}>📅</Text>
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
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Data fim</Text>
              <TouchableOpacity style={s.dateBtn} onPress={() => setShowEndPicker(true)} activeOpacity={0.7}>
                <Text style={[s.dateTxt, !endDate && s.datePlaceholder]}>
                  {endDate ? formatDate(endDate) : 'Selecionar data'}
                </Text>
                <Text style={{ fontSize: Typography.fontSize.lg }}>📅</Text>
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
                <Text style={{ fontSize: Typography.fontSize.xxxl }}>📷</Text>
                <Text style={s.photoEmptyTxt}>Adicionar foto</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Regulamento */}
          <Text style={[s.fieldLabel, { marginTop: 8 }]}>Regulamento (opcional)</Text>
          {regulamento ? (
            <View style={s.regLoaded}>
              <View style={s.regIcon}><Text style={{ fontSize: Typography.fontSize.xxl }}>📄</Text></View>
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
              <View style={s.regIcon}><Text style={{ fontSize: Typography.fontSize.xxl }}>📄</Text></View>
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
                  <Text style={s.catEmoji}>{VERTENTE_CONFIG[type].emoji}</Text>
                  <Text style={s.catLabel}>{VERTENTE_CONFIG[type].label}</Text>
                  <Text style={[s.catCount, sel.length > 0 && { color: VERTENTE_CONFIG[type].color }]}>
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
                            semOn && { borderStyle: 'solid', borderColor: VERTENTE_CONFIG[type].color, backgroundColor: VERTENTE_CONFIG[type].chipBg },
                          ]}
                          onPress={() => toggleVert(type, 'Sem')}
                        >
                          <Text style={[s.vertChipTxt, semOn && { color: VERTENTE_CONFIG[type].color }]}>Sem</Text>
                        </TouchableOpacity>
                      );
                    })()}
                    {/* Level chips */}
                    {LEVELS[type].map(level => {
                      const isOn = selectedVerts.some(v => v.type === type && v.level === level);
                      return (
                        <TouchableOpacity
                          key={level}
                          style={[s.vertChip, isOn && { borderColor: VERTENTE_CONFIG[type].color, backgroundColor: VERTENTE_CONFIG[type].chipBg }]}
                          onPress={() => toggleVert(type, level)}
                        >
                          <Text style={[s.vertChipTxt, isOn && { color: VERTENTE_CONFIG[type].color }]}>{level}</Text>
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
                {selectedVerts.map(v => `${VERTENTE_CONFIG[v.type].emoji} ${v.level}`).join('  ·  ')}
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
  title: { color: Colors.white, fontSize: Typography.fontSize.xxxl, fontFamily: Typography.fontFamilyBlack, marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamilySemiBold, marginTop: 4 },
  scroll: { flex: 1 },
  sectionLabel: { ...TextStyles.sectionLabel, fontSize: Typography.fontSize.md, marginBottom: 10 },
  card: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.card },
  fieldLabel: { ...TextStyles.sectionLabel, marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.sm, padding: Spacing.sm, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBold, color: Colors.navy, backgroundColor: Colors.gbg },
  row: { flexDirection: 'row', marginTop: 4 },

  /* ── Date picker ── */
  dateBtn: {
    borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: 10,
    backgroundColor: Colors.gbg, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  dateTxt: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamilyBold, color: Colors.navy },
  datePlaceholder: { color: Colors.gray },

  /* ── Photo ── */
  photoEmpty: {
    borderWidth: 2, borderColor: Colors.gray, borderStyle: 'dashed',
    borderRadius: Radii.md, backgroundColor: Colors.gbg, height: 76,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  photoEmptyTxt: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily, color: Colors.muted },
  photoBanner: { height: 76, borderRadius: Radii.md, overflow: 'hidden' },
  photoBannerImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  photoBannerOverlayTxt: { fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.white },

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
    width: 40, height: 40, backgroundColor: Colors.white, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', ...Shadows.card, flexShrink: 0,
  },
  regTitle: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.navy },
  regName: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.navy },
  regSub: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, marginTop: 2 },
  regChoose: { fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily, color: Colors.blue },
  regRemove: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily, color: Colors.red, padding: 4 },

  /* ── Sub-torneios ── */
  catSection: { paddingBottom: 4 },
  catSectionBorder: { borderTopWidth: 1, borderTopColor: Colors.gl, paddingTop: 10, marginTop: 4 },
  catHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, gap: 6 },
  catEmoji: { fontSize: Typography.fontSize.xl },
  catLabel: { flex: 1, fontSize: Typography.fontSize.base, fontFamily: Typography.fontFamily, color: Colors.navy },
  catCount: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamily, color: Colors.muted },
  catToggle: { fontSize: Typography.fontSize.xs, color: Colors.muted, marginLeft: 4 },
  vertGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: 8, paddingTop: 4 },
  vertChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.gl,
  },
  vertChipSem: { borderStyle: 'dashed' },
  vertChipTxt: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily, color: Colors.muted },

  /* ── Summary ── */
  summaryBox: {
    backgroundColor: Colors.blueBg, borderRadius: Radii.md,
    padding: 10, marginTop: 8,
  },
  summaryTitle: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily, color: Colors.blue },
  summaryBody: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamilyBold, color: Colors.navy, marginTop: 4 },

  /* ── Create ── */
  createBtn: { borderRadius: Radii.lg, overflow: 'hidden' },
  createBtnDisabled: { opacity: 0.4 },
  createBtnGrad: { padding: 15, alignItems: 'center' },
  createBtnTxt: { fontSize: 15, fontFamily: Typography.fontFamilyBlack, color: Colors.white },
  createNote: { fontSize: Typography.fontSize.xs, fontFamily: Typography.fontFamilySemiBold, color: Colors.muted, textAlign: 'center', marginTop: 7 },
});
