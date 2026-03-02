import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Game, SetScore } from '../types';
import { Colors, Spacing, Radii, Shadows, Gradients } from '../theme';

interface GameCardProps {
  game: Game;
  onPress?: () => void;
  onEdit?: () => void;
  onEnterResult?: () => void;
  /** Called when a team name is tapped – opens the Jogos da Dupla sheet */
  onTeamPress?: (team: Team) => void;
  /** For bracket cards: shows green "Concluído" badge in header */
  showDoneBadge?: boolean;
  /** For bracket cards: e.g. "Slam Kings → Quartos" */
  advanceText?: string;
}

// Coloured 24×24 score box matching the HTML design
const ScoreBox = ({
  value,
  variant,
}: {
  value: string | number;
  variant: 'win' | 'lose' | 'live' | 'pending';
}) => {
  if (variant === 'live') {
    return (
      <LinearGradient colors={[Colors.red, Colors.orange]} style={gc.box}>
        <Text style={[gc.boxTxt, { color: '#fff', fontSize: 8 }]}>●</Text>
      </LinearGradient>
    );
  }
  const boxStyle = variant === 'win' ? gc.boxWin : variant === 'lose' ? gc.boxLose : gc.boxPending;
  const txtStyle = variant === 'win' ? gc.boxTxtWin : variant === 'lose' ? gc.boxTxtLose : gc.boxTxtPending;
  return (
    <View style={[gc.box, boxStyle]}>
      <Text style={[gc.boxTxt, txtStyle]}>{value}</Text>
    </View>
  );
};

export const GameCard: React.FC<GameCardProps> = ({ game, onPress, onEdit, onEnterResult, onTeamPress, showDoneBadge, advanceText }) => {
  const isLive = game.status === 'live';
  const isFinished = game.status === 'finished';
  const isScheduled = game.status === 'scheduled';
  const isPaused = game.status === 'paused';

  // Determine winner / loser for finished games
  const winner = isFinished && game.winnerId
    ? (game.winnerId === game.team1.id ? game.team1 : game.team2)
    : null;
  const loser = isFinished && game.winnerId
    ? (game.winnerId === game.team1.id ? game.team2 : game.team1)
    : null;
  const winnerIs1 = winner ? game.winnerId === game.team1.id : false;

  /** Interleaved scores for the finished condensed row:
   *  for each set → winner score (blue) then loser score (muted) */
  const renderFinishedScores = () => {
    if (!game.sets?.length) return null;
    return (
      <View style={gc.scores}>
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
    );
  };

  /** Per-team score row for live / paused / scheduled */
  const renderScores = (forTeam: 1 | 2) => {
    if (isScheduled || !game.sets?.length) {
      return <ScoreBox value="–" variant="pending" />;
    }
    return (
      <View style={gc.scores}>
        {game.sets.map((set: SetScore, i: number) => {
          const myScore = forTeam === 1 ? set.team1 : set.team2;
          const oppScore = forTeam === 1 ? set.team2 : set.team1;
          const wonSet = myScore > oppScore;
          return <ScoreBox key={i} value={myScore} variant={wonSet ? 'win' : 'lose'} />;
        })}
        {isLive && <ScoreBox value="●" variant="live" />}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[gc.card, isLive && gc.cardLive, isPaused && gc.cardPaused]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Meta header */}
      <View style={gc.metaRow}>
        <Text style={[gc.meta, isLive && gc.metaLive, isPaused && gc.metaPaused]}>
          {isLive ? '●' : isFinished ? '✅' : isPaused ? '⏸' : '🕒'}{' '}
          {game.time} · {game.court}
          {isLive ? ' · Ao vivo' : isFinished && !showDoneBadge ? ' · Concluído' : isPaused ? ' · Pausado' : isScheduled ? ' · Agendado' : ''}
        </Text>
        {isScheduled && onEdit && (
          <TouchableOpacity style={gc.editBtn} onPress={onEdit}>
            <Text style={gc.editBtnTxt}>✏️ Editar</Text>
          </TouchableOpacity>
        )}
        {isFinished && showDoneBadge && (
          <View style={gc.doneBadge}>
            <Text style={gc.doneBadgeTxt}>Concluído</Text>
          </View>
        )}
        {isPaused && (
          <View style={gc.pausedBadge}>
            <Text style={gc.pausedBadgeTxt}>⏸ Pausado</Text>
          </View>
        )}
      </View>

      {/* ── FINISHED: condensed single row ── */}
      {isFinished && winner && loser ? (
        <>
          <View style={gc.finishedRow}>
            <View style={gc.finishedNames}>
              {onTeamPress ? (
                <TouchableOpacity onPress={() => onTeamPress(winner)} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                  <Text style={gc.winnerName}>{winner.name}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={gc.winnerName}>{winner.name}</Text>
              )}
              {onTeamPress ? (
                <TouchableOpacity onPress={() => onTeamPress(loser)} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                  <Text style={gc.vsLoser}>vs {loser.name}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={gc.vsLoser}>vs {loser.name}</Text>
              )}
            </View>
            {renderFinishedScores()}
          </View>

          {/* Bottom actions */}
          <View style={gc.finishedFooter}>
            <TouchableOpacity style={gc.editResultBtn} onPress={onEnterResult}>
              <Text style={gc.editResultTxt}>✏️ Editar resultado</Text>
            </TouchableOpacity>
            {advanceText ? (
              <Text style={gc.advanceText}>{advanceText} ›</Text>
            ) : null}
          </View>
        </>
      ) : (
        <>
          {/* ── LIVE / SCHEDULED: two team rows ── */}
          {/* Team 1 */}
          <TouchableOpacity
            style={[gc.teamRow, gc.teamRowBorder]}
            onPress={() => onTeamPress?.(game.team1)}
            disabled={!onTeamPress}
            activeOpacity={onTeamPress ? 0.6 : 1}
          >
            <Text style={gc.teamName}>{game.team1.name}</Text>
            {renderScores(1)}
          </TouchableOpacity>

          {/* Team 2 */}
          <TouchableOpacity
            style={gc.teamRow}
            onPress={() => onTeamPress?.(game.team2)}
            disabled={!onTeamPress}
            activeOpacity={onTeamPress ? 0.6 : 1}
          >
            <Text style={gc.teamName}>{game.team2.name}</Text>
            {renderScores(2)}
          </TouchableOpacity>

          {/* Live CTA */}
          {isLive && onEnterResult && (
            <TouchableOpacity style={gc.resultWrap} onPress={onEnterResult}>
              <LinearGradient colors={Gradients.primary} style={gc.resultGrad}>
                <Text style={gc.resultTxt}>Introduzir resultado →</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Paused CTA */}
          {isPaused && onEnterResult && (
            <TouchableOpacity style={gc.resumeWrap} onPress={onEnterResult}>
              <Text style={gc.resumeTxt}>▶ Retomar jogo</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const gc = StyleSheet.create({
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
  cardPaused: {
    borderWidth: 2,
    borderColor: Colors.orange,
  },

  /* Meta row */
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  meta: { fontSize: 9, fontFamily: 'Nunito_800ExtraBold', color: Colors.muted, textTransform: 'uppercase' },
  metaLive: { color: Colors.red },
  metaPaused: { color: Colors.orange },
  editBtn: { backgroundColor: Colors.gbg, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3 },
  editBtnTxt: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },
  doneBadge: { backgroundColor: '#DFFAEE', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  doneBadgeTxt: { fontSize: 9, fontFamily: 'Nunito_800ExtraBold', color: Colors.green },
  pausedBadge: { backgroundColor: '#FFF0E3', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  pausedBadgeTxt: { fontSize: 9, fontFamily: 'Nunito_800ExtraBold', color: Colors.orange },

  /* ── Finished condensed row ── */
  finishedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  finishedNames: { flex: 1, minWidth: 0 },
  winnerName: { fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: Colors.blue },
  vsLoser: { fontSize: 9, color: Colors.muted, marginTop: 2 },
  finishedFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  advanceText: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: Colors.green },

  /* ── Live / Scheduled team rows ── */
  teamRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, gap: 6 },
  teamRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.gl },
  teamName: { flex: 1, fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: Colors.navy },

  /* Score boxes */
  scores: { flexDirection: 'row', gap: 3 },
  box: {
    width: 24, height: 24, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  boxWin: { backgroundColor: '#E3ECFF' },
  boxLose: { backgroundColor: Colors.gbg },
  boxPending: { backgroundColor: Colors.gbg },
  boxTxt: { fontSize: 11, fontFamily: 'Nunito_900Black' },
  boxTxtWin: { color: Colors.blue },
  boxTxtLose: { color: Colors.muted },
  boxTxtPending: { color: Colors.gray },

  resumeWrap: { borderWidth: 1.5, borderColor: Colors.orange, borderRadius: 10, padding: 9, marginTop: 8, alignItems: 'center' },
  resumeTxt: { color: Colors.orange, fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  /* Buttons */
  resultWrap: { borderRadius: 10, overflow: 'hidden', marginTop: 8 },
  resultGrad: { padding: 10, alignItems: 'center' },
  resultTxt: { color: '#fff', fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  editResultBtn: {
    borderWidth: 1.5, borderColor: Colors.gl,
    borderRadius: 10, paddingVertical: 6, paddingHorizontal: 13, alignItems: 'center',
  },
  editResultTxt: { color: Colors.navy, fontSize: 11, fontFamily: 'Nunito_700Bold' },
});
