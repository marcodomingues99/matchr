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
type Route = RouteProp<RootStackParamList, 'AddTeam'>;

export const AddTeamScreen = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = mockTournaments.find(t => t.id === route.params.tournamentId) ?? mockTournaments[0];
  const vertente = tournament.vertentes.find(v => v.id === route.params.vertenteId) ?? tournament.vertentes[0];

  const [teamName, setTeamName] = useState('');
  const [p1Name, setP1Name] = useState('');
  const [p1Phone, setP1Phone] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [p2Phone, setP2Phone] = useState('');

  const canSave = teamName.trim() && p1Name.trim() && p2Name.trim();

  return (
    <View style={s.container}>
      <LinearGradient colors={Gradients.header} style={s.header}>
        <SafeAreaView edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>← Duplas</Text>
          </TouchableOpacity>
          <Text style={s.title}>Adicionar Dupla</Text>
          <Text style={s.subtitle}>{vertente.type === 'M' ? 'Masculino' : vertente.type === 'F' ? 'Feminino' : 'Misto'} · {vertente.level}</Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: Spacing.lg }}>
        {/* Team Name */}
        <Text style={s.sectionLabel}>Nome da Equipa</Text>
        <View style={s.card}>
          <TextInput
            style={s.bigInput}
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Ex: Os Invencíveis"
            placeholderTextColor={Colors.gray}
            autoFocus
          />
        </View>

        {/* Player 1 */}
        <Text style={s.sectionLabel}>Jogador 1</Text>
        <View style={s.card}>
          <Text style={s.fieldLabel}>Nome completo *</Text>
          <TextInput style={s.input} value={p1Name} onChangeText={setP1Name} placeholder="João Silva" placeholderTextColor={Colors.gray} />
          <Text style={s.fieldLabel}>Telemóvel</Text>
          <TextInput style={s.input} value={p1Phone} onChangeText={setP1Phone} placeholder="912 345 678" placeholderTextColor={Colors.gray} keyboardType="phone-pad" />
        </View>

        {/* Player 2 */}
        <Text style={s.sectionLabel}>Jogador 2</Text>
        <View style={s.card}>
          <Text style={s.fieldLabel}>Nome completo *</Text>
          <TextInput style={s.input} value={p2Name} onChangeText={setP2Name} placeholder="Miguel Costa" placeholderTextColor={Colors.gray} />
          <Text style={s.fieldLabel}>Telemóvel</Text>
          <TextInput style={s.input} value={p2Phone} onChangeText={setP2Phone} placeholder="923 456 789" placeholderTextColor={Colors.gray} keyboardType="phone-pad" />
        </View>

        <View style={{ height: 24 }} />

        <TouchableOpacity
          style={[s.saveBtn, !canSave && s.saveBtnDisabled]}
          onPress={() => canSave && navigation.goBack()}
          disabled={!canSave}
        >
          <LinearGradient colors={Gradients.primary} style={s.saveBtnGrad}>
            <Text style={s.saveBtnTxt}>✓ Guardar Dupla</Text>
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
  sectionLabel: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.card },
  bigInput: { fontSize: 18, fontFamily: 'Nunito_900Black', color: Colors.navy, padding: Spacing.sm },
  fieldLabel: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5, marginTop: 8 },
  input: { borderWidth: 1.5, borderColor: Colors.gl, borderRadius: Radii.sm, padding: Spacing.sm, fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.navy, backgroundColor: Colors.gbg },
  saveBtn: { borderRadius: Radii.lg, overflow: 'hidden' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnGrad: { padding: 15, alignItems: 'center' },
  saveBtnTxt: { color: '#fff', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
});
