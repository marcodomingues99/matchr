import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Game } from '../types';
import { Colors, Spacing, Radii, Shadows } from '../theme';

interface GameCardProps {
  game: Game;
  onPress?: () => void;
  onEdit?: () => void;
  onEnterResult?: () => void;
}

const StatusBadge: React.FC<{ status: Game['status'] }> = ({ status }) => {
  const config = {
    finished: { label: 'Concluído', bg: '#DFFAEE', color: Colors.green },
    live: { label: 'Ao vivo', bg: '#FFE3E8', color: Colors.red },
    paused: { label: 'Em pausa', bg: '#FFF4E3', color: Colors.orange },
    scheduled: { label: 'Agendado', bg: Colors.gbg, color: Colors.muted },
    walkover: { label: 'W.O.', bg: '#DFFAEE', color: Colors.green },
  }[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      {status === 'live' && <View style={styles.liveDot} />}
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

export const GameCard: React.FC<GameCardProps> = ({ game, onPress, onEdit, onEnterResult }) => {
  const isLive = game.status === 'live';
  const isFinished = game.status === 'finished';
  const isScheduled = game.status === 'scheduled';

  const formatSets = () => {
    if (!game.sets?.length) return null;
    return game.sets.map((s, i) => (
      <View key={i} style={styles.setGroup}>
        <Text style={[styles.setScore, game.winnerId === game.team1.id ? styles.winner : styles.loser]}>{s.team1}</Text>
        <Text style={[styles.setScore, game.winnerId === game.team2.id ? styles.winner : styles.loser]}>{s.team2}</Text>
      </View>
    ));
  };

  return (
    <TouchableOpacity
      style={[styles.card, isLive && styles.cardLive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.meta}>
          {isLive ? '🕙' : isFinished ? '✅' : '🕒'} {game.time} · {game.court} · Jogo {game.id}
        </Text>
        <View style={styles.headerRight}>
          <StatusBadge status={game.status} />
          {isScheduled && onEdit && (
            <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
              <Text style={styles.editBtnText}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Team 1 */}
      <View style={[styles.teamRow, styles.teamRowBorder]}>
        <Text style={[styles.teamName, isFinished && game.winnerId === game.team1.id && styles.winnerText]}>
          {game.team1.name}
        </Text>
        <View style={styles.scores}>
          {isFinished || isLive ? formatSets()?.map((s, i) => (
            <Text key={i} style={[styles.score, isFinished && game.winnerId === game.team1.id && styles.scoreWinner]}>
              {game.sets?.[i]?.team1 ?? '●'}
            </Text>
          )) : <Text style={styles.scoreDash}>–</Text>}
        </View>
      </View>

      {/* Team 2 */}
      <View style={styles.teamRow}>
        <Text style={[styles.teamName, isFinished && game.winnerId === game.team2.id && styles.winnerText]}>
          {game.team2.name}
        </Text>
        <View style={styles.scores}>
          {isFinished || isLive ? game.sets?.map((s, i) => (
            <Text key={i} style={[styles.score, isFinished && game.winnerId === game.team2.id && styles.scoreWinner]}>
              {s.team2}
            </Text>
          )) : <Text style={styles.scoreDash}>–</Text>}
        </View>
      </View>

      {isLive && onEnterResult && (
        <TouchableOpacity style={styles.resultBtn} onPress={onEnterResult}>
          <Text style={styles.resultBtnText}>Introduzir resultado →</Text>
        </TouchableOpacity>
      )}
      {isFinished && (
        <TouchableOpacity style={styles.editResultBtn} onPress={onEdit}>
          <Text style={styles.editResultBtnText}>✏️ Editar resultado</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  cardLive: {
    borderWidth: 2,
    borderColor: Colors.red,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  meta: {
    fontSize: 9,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.muted,
    textTransform: 'uppercase',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: { fontSize: 9, fontFamily: 'Nunito_800ExtraBold' },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.red,
  },
  editBtn: {
    backgroundColor: Colors.gbg,
    borderRadius: 8,
    padding: 4,
    paddingHorizontal: 8,
  },
  editBtnText: { fontSize: 12 },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  teamRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gl,
  },
  teamName: {
    fontSize: 13,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.navy,
    flex: 1,
  },
  winnerText: { color: Colors.green },
  scores: {
    flexDirection: 'row',
    gap: 6,
  },
  setGroup: { flexDirection: 'column', alignItems: 'center' },
  score: {
    fontSize: 14,
    fontFamily: 'Nunito_900Black',
    color: Colors.muted,
    minWidth: 20,
    textAlign: 'center',
  },
  scoreWinner: { color: Colors.blue },
  scoreDash: {
    fontSize: 14,
    fontFamily: 'Nunito_900Black',
    color: Colors.gray,
  },
  winner: {},
  loser: {},
  resultBtn: {
    backgroundColor: Colors.blue,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  resultBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
  },
  editResultBtn: {
    borderWidth: 1.5,
    borderColor: Colors.gl,
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  editResultBtnText: {
    color: Colors.navy,
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
});
