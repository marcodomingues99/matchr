import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { mockTournaments } from '../mock/data';
import { Colors, Gradients, Spacing, Radii, Shadows } from '../theme';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'EditTournament'>;

export const EditTournamentScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];

  const [name, setName] = useState(tournament.name);
  const [location, setLocation] = useState(tournament.location);
  const [startDate, setStartDate] = useState(tournament.startDate);
  const [endDate, setEndDate] = useState(tournament.endDate);

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Torneio</Text>
          </TouchableOpacity>
          <Text style={s.title}>Editar Torneio</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        <Text style={s.sectionLabel}>Informação Geral</Text>
        <View style={s.card}>
          <Text style={s.fieldLabel}>Nome do torneio</Text>
          <TextInput style={s.input} value={name} onChangeText={setName} placeholderTextColor={Colors.gray} />
          <Text style={s.fieldLabel}>Localização</Text>
          <TextInput style={s.input} value={location} onChangeText={setLocation} placeholderTextColor={Colors.gray} />
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Data início</Text>
              <TextInput style={s.input} value={startDate} onChangeText={setStartDate} placeholderTextColor={Colors.gray} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Data fim</Text>
              <TextInput style={s.input} value={endDate} onChangeText={setEndDate} placeholderTextColor={Colors.gray} />
            </View>
          </View>
        </View>

        <Text style={s.sectionLabel}>Sub-torneios</Text>
        {tournament.vertentes.map((v, i) => (
          <TouchableOpacity
            key={v.id}
            style={s.vertCard}
            onPress={() => navigation.navigate('ConfigureVertente', { tournamentId: tournament.id, vertenteIndex: i, isLast: i === tournament.vertentes.length - 1 })}
          >
            <View style={[s.vertDot, { backgroundColor: v.type === 'M' ? Colors.blue : v.type === 'F' ? '#D4006A' : '#C87800' }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.vertTitle}>{v.type === 'M' ? 'Masculino' : v.type === 'F' ? 'Feminino' : 'Misto'} · {v.level}</Text>
              <Text style={s.vertSub}>{v.teams.length}/{v.maxTeams} duplas · {v.courts} courts</Text>
            </View>
            <Text style={s.vertArrow}>✏️</Text>
          </TouchableOpacity>
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
          <TouchableOpacity style={s.dangerBtn}>
            <Text style={s.dangerBtnTxt}>🗑️ Eliminar torneio</Text>
          </TouchableOpacity>
        </View>
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
  scroll: { flex: 1 },
  sectionLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.card },
  fieldLabel: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.sm, padding: Spacing.sm, fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.navy, backgroundColor: Colors.gbg },
  row: { flexDirection: 'row', marginTop: 4 },
  vertCard: { backgroundColor: '#fff', borderRadius: Radii.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.sm, ...Shadows.card },
  vertDot: { width: 10, height: 10, borderRadius: 5 },
  vertTitle: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  vertSub: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.muted },
  vertArrow: { fontSize: 14 },
  saveBtn: { borderRadius: Radii.lg, overflow: 'hidden', marginBottom: Spacing.xl },
  saveGrad: { padding: 15, alignItems: 'center' },
  saveTxt: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  dangerCard: { backgroundColor: '#FFF0F0', borderRadius: Radii.lg, padding: Spacing.md, borderWidth: 1, borderColor: '#FFD0D0' },
  dangerTitle: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.red, marginBottom: 10 },
  dangerBtn: { backgroundColor: '#FFE3E8', borderRadius: Radii.md, padding: 12, alignItems: 'center' },
  dangerBtnTxt: { fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.red },
});
