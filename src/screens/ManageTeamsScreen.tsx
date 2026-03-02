import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors, Spacing, Radii, Gradients } from '../theme';
import { AppHeader } from '../components/AppHeader';
import { Card, GradientButton, EmptyState } from '../components/UI';
import { getTournamentById } from '../data/mockData';
import { RootStackParamList, Team } from '../types';

type Nav = StackNavigationProp<RootStackParamList, 'ManageTeams'>;
type Route = RouteProp<RootStackParamList, 'ManageTeams'>;

export const ManageTeamsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const tournament = getTournamentById(route.params.tournamentId);

  const handleDelete = (team: Team) => {
    Alert.alert('Remover Equipa', `Tens a certeza que queres remover "${team.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => {} },
    ]);
  };

  const renderTeam = ({ item, index }: { item: Team; index: number }) => (
    <Card style={styles.teamCard}>
      <View style={styles.teamRow}>
        <LinearGradient colors={Gradients.blueToTeal as any} style={styles.seedBadge}>
          <Text style={styles.seedNum}>{index + 1}</Text>
        </LinearGradient>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.name}</Text>
          <Text style={styles.playerLine}>👤 {item.player1.name}</Text>
          <Text style={styles.playerLine}>👤 {item.player2.name}</Text>
        </View>
        <View style={styles.teamActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditTeam', { tournamentId: tournament!.id, teamId: item.id })}
          >
            <Text style={styles.editBtnText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <LinearGradient colors={Gradients.heroGradient as any} style={{ flex: 1 }}>
      <AppHeader
        title="Gerir Equipas"
        showBack
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('AddTeam', { tournamentId: route.params.tournamentId })}>
            <Text style={styles.addIcon}>＋</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {tournament?.teams.length ?? 0} / {tournament?.maxTeams ?? 0} equipas
        </Text>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={Gradients.blueToTeal as any}
            style={[styles.progressFill, { width: `${Math.min(100, ((tournament?.teams.length ?? 0) / (tournament?.maxTeams ?? 1)) * 100)}%` as any }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>

      <FlatList
        data={tournament?.teams ?? []}
        keyExtractor={t => t.id}
        renderItem={renderTeam}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title="Sem equipas"
            subtitle="Adiciona equipas ao torneio"
            action={{ label: '+ Adicionar Equipa', onPress: () => navigation.navigate('AddTeam', { tournamentId: route.params.tournamentId }) }}
          />
        }
      />

      <View style={styles.bottomBar}>
        <GradientButton
          label="+ Adicionar Equipa"
          onPress={() => navigation.navigate('AddTeam', { tournamentId: route.params.tournamentId })}
          style={{ flex: 1 }}
          colors={Gradients.blueToTeal}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  addIcon: { color: Colors.teal, fontSize: 28, lineHeight: 28 },

  statsBar: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  statsText: { color: Colors.gray300, fontSize: 13, fontFamily: 'Nunito_600SemiBold', marginBottom: 6 },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radii.full, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: Radii.full },

  content: { padding: Spacing.base, paddingBottom: 100 },
  teamCard: { marginBottom: Spacing.sm },
  teamRow: { flexDirection: 'row', alignItems: 'center' },
  seedBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  seedNum: { color: Colors.white, fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  teamInfo: { flex: 1 },
  teamName: { color: Colors.white, fontSize: 16, fontFamily: 'Nunito_700Bold', marginBottom: 4 },
  playerLine: { color: Colors.gray300, fontSize: 12, fontFamily: 'Nunito_400Regular', marginBottom: 1 },
  teamActions: { flexDirection: 'row', gap: 8 },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(46,125,212,0.15)', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center', justifyContent: 'center' },
  editBtnText: { fontSize: 16 },
  deleteBtnText: { fontSize: 16 },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    paddingBottom: 32,
    backgroundColor: 'rgba(10,22,40,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
});
