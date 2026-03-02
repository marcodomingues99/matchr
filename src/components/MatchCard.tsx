import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Game, SetScore } from '../types';
import { Colors, Spacing, Radii, Shadows } from '../theme';

interface Props {
  game: Game;
  onPress?: () => void;
  onEdit?: () => void;
  advanceText?: string;
}

function ScoreBox({ value, variant }: { value: number | string; variant: 'win' | 'lose' | 'pending' }) {
  const boxStyle = variant === 'win' ? ss.scoreWin : variant === 'lose' ? ss.scoreLose : ss.scorePending;
  const txtStyle = variant === 'win' ? ss.scoreTextWin : variant === 'lose' ? ss.scoreTextLose : ss.scoreTextPending;
  return (
    <View style={[ss.scoreBox, boxStyle]}>
      <Text style={[ss.scoreText, txtStyle]}>{value}</Text>
    </View>
  );
}

export default function MatchCard({ game, onPress, onEdit, advanceText }: Props) {
  const isLive = game.status === 'live';
  const isDone = game.status === 'finished';
  const isPaused = game.status === 'paused';

  const winner = isDone && game.winnerId
    ? (game.winnerId === game.team1.id ? game.team1 : game.team2)
    : null;
  const loser = isDone && game.winnerId
    ? (game.winnerId === game.team1.id ? game.team2 : game.team1)
    : null;
  const winnerIs1 = winner ? game.winnerId === game.team1.id : false;

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

      {/* ── FINISHED: condensed single row ── */}
      {isDone && winner && loser ? (
        <>
          <View style={ss.finishedRow}>
            <View style={ss.finishedNames}>
              <Text style={ss.winnerNameText}>{winner.name}</Text>
              <Text style={ss.vsLoser}>vs {loser.name}</Text>
            </View>
            {game.sets && (
              <View style={ss.scores}>
                {game.sets.map((set: SetScore, i: number) => {
                  const winScore = winnerIs1 ? set.team1 : set.team2;
                  const loseScore = winnerIs1 ? set.team2 : set.team1;
                  return (
                    <React.Fragment key={i}>
                      <ScoreBox value={winScore} variant="win" />
                      <ScoreBox value={loseScore} variant="lose" />
                    </React.Fragment>
                  );
                })}
              </View>
            )}
          </View>
          {(onEdit || advanceText) && (
            <View style={ss.finishedFooter}>
              {onEdit && (
                <TouchableOpacity style={ss.editResultBtn} onPress={onEdit}>
                  <Text style={ss.editResultTxt}>✏️ Editar resultado</Text>
                </TouchableOpacity>
              )}
              {advanceText && <Text style={ss.advanceText}>{advanceText} ›</Text>}
            </View>
          )}
        </>
      ) : (
        <>
          {/* ── LIVE / SCHEDULED: two team rows ── */}
          {[game.team1, game.team2].map((team, i) => (
            <View key={i} style={[ss.teamRow, i === 0 && ss.teamRowBorder]}>
              <Text style={ss.teamName} numberOfLines={1}>
                {team.name}
              </Text>
              <View style={ss.scores}>
                {(isLive) && game.sets ? game.sets.map((s, si) => {
                  const myScore = i === 0 ? s.team1 : s.team2;
                  const oppScore = i === 0 ? s.team2 : s.team1;
                  return <ScoreBox key={si} value={myScore} variant={myScore > oppScore ? 'win' : 'lose'} />;
                }) : <Text style={ss.dash}>–</Text>}
              </View>
            </View>
          ))}
        </>
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
  doneBadge: { fontSize: 9, fontFamily: 'Nunito_800ExtraBold', color: Colors.green, backgroundColor: '#DFFAEE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, overflow: 'hidden' },
  pausedBadge: { fontSize: 9, fontFamily: 'Nunito_800ExtraBold', color: Colors.orange, backgroundColor: '#FFF0E3', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, overflow: 'hidden' },

  /* ── Finished condensed row ── */
  finishedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  finishedNames: { flex: 1, minWidth: 0 },
  winnerNameText: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.blue },
  vsLoser: { fontSize: 9, color: Colors.muted, marginTop: 2 },
  finishedFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  editResultBtn: { borderWidth: 1.5, borderColor: Colors.gl, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 13, alignItems: 'center' },
  editResultTxt: { color: Colors.navy, fontSize: 11, fontFamily: 'Nunito_700Bold' },
  advanceText: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.green },

  /* ── Live / Scheduled team rows ── */
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xs + 2 },
  teamRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gl },
  teamName: { flex: 1, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  scores: { flexDirection: 'row', gap: 4 },
  dash: { fontSize: 14, color: Colors.gray, fontFamily: 'Nunito_700Bold' },

  /* Score boxes — matching HTML: light blue bg + blue text for winner */
  scoreBox: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  scoreWin: { backgroundColor: '#E3ECFF' },
  scoreLose: { backgroundColor: Colors.gbg },
  scorePending: { backgroundColor: Colors.gbg },
  scoreText: { fontSize: 11, fontFamily: 'Nunito_900Black' },
  scoreTextWin: { color: Colors.blue },
  scoreTextLose: { color: Colors.muted },
  scoreTextPending: { color: Colors.gray },
});
