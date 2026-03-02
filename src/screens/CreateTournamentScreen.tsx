import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;

const VERTENTE_TYPES = ['M', 'F', 'MX'] as const;
const LEVELS: Record<string, string[]> = {
  M: ['M6','M5','M4','M3','M2','M1'],
  F: ['F6','F5','F4','F3','F2','F1'],
  MX: ['MX6','MX5','MX4','MX3','MX2','MX1','Sem'],
};

interface VertenteConfig { type: 'M'|'F'|'MX'; level: string; maxTeams: number; courts: number; }

export const CreateTournamentScreen = () => {
  const navigation = useNavigation<Nav>();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vertentes, setVertentes] = useState<VertenteConfig[]>([]);
  const [addingVert, setAddingVert] = useState(false);
  const [newVert, setNewVert] = useState<VertenteConfig>({ type: 'M', level: 'M5', maxTeams: 16, courts: 2 });

  const addVertente = () => {
    setVertentes([...vertentes, { ...newVert }]);
    setAddingVert(false);
  };

  const removeVertente = (i: number) => setVertentes(vertentes.filter((_, idx) => idx !== i));

  const typeColor = { M: Colors.blue, F: '#D4006A', MX: '#C87800' };
  const typeEmoji = { M: '👨', F: '👩', MX: '👫' };

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={s.title}>Criar Torneio</Text>
          <Text style={s.subtitle}>Preenche os dados do teu evento</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        {/* Basic Info */}
        <Text style={s.sectionLabel}>Informação Geral</Text>
        <View style={s.card}>
          <Text style={s.fieldLabel}>Nome do torneio *</Text>
          <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Ex: Open de Padel Lisboa 2026" placeholderTextColor={Colors.gray} />
          <Text style={s.fieldLabel}>Localização</Text>
          <TextInput style={s.input} value={location} onChangeText={setLocation} placeholder="Ex: Clube Restelo" placeholderTextColor={Colors.gray} />
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Data início</Text>
              <TextInput style={s.input} value={startDate} onChangeText={setStartDate} placeholder="14 Mar 2026" placeholderTextColor={Colors.gray} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Data fim</Text>
              <TextInput style={s.input} value={endDate} onChangeText={setEndDate} placeholder="16 Mar 2026" placeholderTextColor={Colors.gray} />
            </View>
          </View>
        </View>

        {/* Vertentes */}
        <View style={s.sectionRow}>
          <Text style={s.sectionLabel}>Sub-torneios</Text>
          <TouchableOpacity onPress={() => setAddingVert(true)}>
            <Text style={s.addLink}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>

        {vertentes.length === 0 && !addingVert && (
          <View style={s.emptyCard}>
            <Text style={s.emptyIcon}>🎾</Text>
            <Text style={s.emptyText}>Nenhum sub-torneio{'\n'}Adiciona pelo menos um</Text>
          </View>
        )}

        {vertentes.map((v, i) => (
          <View key={i} style={s.vertCard}>
            <View style={[s.vertDot, { backgroundColor: typeColor[v.type] }]} />
            <Text style={s.vertEmoji}>{typeEmoji[v.type]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.vertTitle}>{v.type === 'M' ? 'Masculino' : v.type === 'F' ? 'Feminino' : 'Misto'} · {v.level}</Text>
              <Text style={s.vertSub}>{v.maxTeams} duplas · {v.courts} courts</Text>
            </View>
            <TouchableOpacity onPress={() => removeVertente(i)} style={s.removeBtn}>
              <Text style={s.removeTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {addingVert && (
          <View style={s.addCard}>
            <Text style={s.addCardTitle}>Novo Sub-torneio</Text>
            <Text style={s.fieldLabel}>Modalidade</Text>
            <View style={s.typeRow}>
              {VERTENTE_TYPES.map(t => (
                <TouchableOpacity key={t} style={[s.typeBtn, newVert.type === t && s.typeBtnActive]} onPress={() => setNewVert({ ...newVert, type: t, level: LEVELS[t][1] })}>
                  <Text style={[s.typeTxt, newVert.type === t && s.typeTxtActive]}>{typeEmoji[t]} {t === 'M' ? 'Masc' : t === 'F' ? 'Fem' : 'Misto'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.fieldLabel}>Nível</Text>
            <View style={s.levelGrid}>
              {LEVELS[newVert.type].map(l => (
                <TouchableOpacity key={l} style={[s.levelBtn, newVert.level === l && s.levelBtnActive]} onPress={() => setNewVert({ ...newVert, level: l })}>
                  <Text style={[s.levelTxt, newVert.level === l && s.levelTxtActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Máx. duplas</Text>
                <View style={s.spinnerRow}>
                  {[8,16,24,32].map(n => (
                    <TouchableOpacity key={n} style={[s.spinnerBtn, newVert.maxTeams === n && s.spinnerBtnActive]} onPress={() => setNewVert({ ...newVert, maxTeams: n })}>
                      <Text style={[s.spinnerTxt, newVert.maxTeams === n && s.spinnerTxtActive]}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Courts</Text>
                <View style={s.spinnerRow}>
                  {[1,2,3,4,6].map(n => (
                    <TouchableOpacity key={n} style={[s.spinnerBtn, newVert.courts === n && s.spinnerBtnActive]} onPress={() => setNewVert({ ...newVert, courts: n })}>
                      <Text style={[s.spinnerTxt, newVert.courts === n && s.spinnerTxtActive]}>{n}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <View style={s.addCardBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setAddingVert(false)}>
                <Text style={s.cancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.addBtn} onPress={addVertente}>
                <Text style={s.addBtnTxt}>Adicionar ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />

        {/* Create Button */}
        <TouchableOpacity
          style={[s.createBtn, (!name || vertentes.length === 0) && s.createBtnDisabled]}
          onPress={() => name && vertentes.length > 0 && navigation.goBack()}
          disabled={!name || vertentes.length === 0}
        >
          <LinearGradient colors={Gradients.primary} style={s.createBtnGrad}>
            <Text style={s.createBtnTxt}>🏆 Criar Torneio</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 },
  sectionLabel: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  addLink: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.blue },
  card: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.card },
  fieldLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.sm, padding: Spacing.sm, fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.navy, backgroundColor: Colors.gbg },
  row: { flexDirection: 'row', marginTop: 4 },
  emptyCard: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: 24, alignItems: 'center', marginBottom: Spacing.md, ...Shadows.card },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.muted, textAlign: 'center', lineHeight: 20 },
  vertCard: { backgroundColor: '#fff', borderRadius: Radii.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm, ...Shadows.card },
  vertDot: { width: 8, height: 8, borderRadius: 4 },
  vertEmoji: { fontSize: 18 },
  vertTitle: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  vertSub: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.muted },
  removeBtn: { padding: 4 },
  removeTxt: { fontSize: 14, color: Colors.red },
  addCard: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.card },
  addCardTitle: { fontSize: 14, fontFamily: 'Nunito_900Black', color: Colors.navy, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  typeBtn: { flex: 1, borderRadius: Radii.sm, padding: Spacing.sm, backgroundColor: Colors.gbg, alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  typeBtnActive: { borderColor: Colors.blue, backgroundColor: '#EEF4FF' },
  typeTxt: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  typeTxtActive: { color: Colors.blue },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  levelBtn: { borderRadius: Radii.sm, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Colors.gbg, borderWidth: 1.5, borderColor: 'transparent' },
  levelBtnActive: { borderColor: Colors.blue, backgroundColor: '#EEF4FF' },
  levelTxt: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  levelTxtActive: { color: Colors.blue },
  spinnerRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  spinnerBtn: { borderRadius: Radii.sm, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.gbg, borderWidth: 1.5, borderColor: 'transparent' },
  spinnerBtnActive: { borderColor: Colors.blue, backgroundColor: '#EEF4FF' },
  spinnerTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  spinnerTxtActive: { color: Colors.blue },
  addCardBtns: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, backgroundColor: Colors.gbg, borderRadius: Radii.md, padding: 12, alignItems: 'center' },
  cancelTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted },
  addBtn: { flex: 2, backgroundColor: Colors.blue, borderRadius: Radii.md, padding: 12, alignItems: 'center' },
  addBtnTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  createBtn: { borderRadius: Radii.lg, overflow: 'hidden' },
  createBtnDisabled: { opacity: 0.4 },
  createBtnGrad: { padding: 15, alignItems: 'center' },
  createBtnTxt: { fontSize: 15, fontFamily: 'Nunito_900Black', color: '#fff' },
});
