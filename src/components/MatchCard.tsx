import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Game } from '../types';
import { Colors, Spacing, Radii, Shadows } from '../theme';

interface Props {
  game: Game;
  onPress?: () => void;
  onEdit?: () => void;
}

function ScoreBox({ value, win }: { value: number | string; win?: boolean }) {
  return (
    <View style={[ss.scoreBox, win && ss.scoreWin]}>
      <Text style={[ss.scoreText, win && ss.scoreTextWin]}>{value}</Text>
    </View>
  );
}

export default function MatchCard({ game, onPress, onEdit }: Props) {
  const isLive = game.status === 'live';
  const isDone = game.status === 'finished';
  const isPaused = game.status === 'paused';

  return (
    <TouchableOpacity style={[ss.card, isLive && ss.cardLive, isPaused && ss.cardPaused]} onPress={onPress} activeOpacity={0.85}>
      <View style={ss.header}>
        <Text style={ss.label}>
          {isDone ? '✅' : isLive ? '🔴' : isPaused ? '⏸' : '🕒'}{' '}
          {game.time} · {game.court}
        </Text>
        <View style={ss.headerRight}>
          {isLive && <View style={ss.liveDot} />}
          {onEdit && !isLive && !isDone && (
            <TouchableOpacity onPress={onEdit} style={ss.editBtn}>
              <Text style={ss.editText}>✏️</Text>
            </TouchableOpacity>
          )}
          {isDone && <Text style={ss.doneBadge}>Concluído</Text>}
          {isPaused && <Text style={ss.pausedBadge}>Pausado</Text>}
        </View>
      </View>

      {[game.team1, game.team2].map((team, i) => (
        <View key={i} style={[ss.teamRow, i === 0 && ss.teamRowBorder]}>
          <Text style={[ss.teamName, isDone && game.winnerId === team.id && ss.teamWin]} numberOfLines={1}>
            {team.name}
          </Text>
          <View style={ss.scores}>
            {(isDone || isLive) && game.sets ? game.sets.map((s, si) => (
              <ScoreBox key={si} value={i === 0 ? s.team1 : s.team2} win={isDone && game.winnerId === team.id} />
            )) : <Text style={ss.dash}>–</Text>}
          </View>
        </View>
      ))}

      {isDone && game.winnerId && (
        <View style={ss.advance}>
          <Text style={ss.advanceText}>
            {game.winnerId === game.team1.id ? game.team1.name : game.team2.name} → próxima ronda ›
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const ss = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: Radii.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.card },
  cardLive: { borderWidth: 2, borderColor: Colors.red },
  cardPaused: { borderWidth: 2, borderColor: Colors.orange },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  label: { fontSize: 9, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.red },
  editBtn: { padding: 4 },
  editText: { fontSize: 14 },
  doneBadge: { fontSize: 9, fontFamily: 'Nunito_800ExtraBold', color: Colors.green, backgroundColor: '#DFFAEE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  pausedBadge: { fontSize: 9, fontFamily: 'Nunito_800ExtraBold', color: Colors.orange, backgroundColor: '#FFF0E3', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs + 2 },
  teamRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gl },
  teamName: { flex: 1, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  teamWin: { color: Colors.blue },
  scores: { flexDirection: 'row', gap: 4 },
  dash: { fontSize: 14, color: Colors.gray, fontFamily: 'Nunito_700Bold' },
  advance: { marginTop: Spacing.xs, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.gl },
  advanceText: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.green, textAlign: 'right' },
  scoreBox: { width: 26, height: 26, borderRadius: 6, backgroundColor: Colors.gbg, alignItems: 'center', justifyContent: 'center' },
  scoreWin: { backgroundColor: Colors.blue },
  scoreText: { fontSize: 12, fontFamily: 'Nunito_900Black', color: Colors.navy },
  scoreTextWin: { color: Colors.white },
});
