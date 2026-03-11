import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ResolvedMatch, SetScore, Team } from '../types';
import { Gradients } from '../theme';
import { MATCH_STATUS } from '../utils/constants';
import { MATCH_STATUS_COLOR } from '../utils/labels';
import { formatTimePt } from '../utils/dateUtils';
import clsx from 'clsx';

interface MatchCardProps {
  match: ResolvedMatch;
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
      <LinearGradient colors={Gradients.live} style={{ width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
        <Text className="font-nunito-black text-white" style={{ fontSize: 8 }}>●</Text>
      </LinearGradient>
    );
  }
  return (
    <View
      className={clsx(
        'items-center justify-center rounded-[6px]',
        variant === 'win' ? 'bg-blue-bg' : 'bg-gbg',
      )}
      style={{ width: 24, height: 24 }}
    >
      <Text
        className={clsx(
          'text-sm font-nunito-black',
          variant === 'win' ? 'text-blue' : variant === 'lose' ? 'text-muted' : 'text-gray',
        )}
      >
        {value}
      </Text>
    </View>
  );
};

export const MatchCard: React.FC<MatchCardProps> = React.memo(({ match, onPress, onEdit, onEnterResult, onTeamPress, showDoneBadge, advanceText }) => {
  const isLive = match.status === MATCH_STATUS.LIVE;
  const isFinished = match.status === MATCH_STATUS.FINISHED;
  const isScheduled = match.status === MATCH_STATUS.SCHEDULED;
  const isPaused = match.status === MATCH_STATUS.PAUSED;

  // Determine winner / loser for finished games
  const winner = isFinished && match.winnerId
    ? (match.winnerId === match.team1.id ? match.team1 : match.team2)
    : null;
  const loser = isFinished && match.winnerId
    ? (match.winnerId === match.team1.id ? match.team2 : match.team1)
    : null;
  const winnerIs1 = winner ? match.winnerId === match.team1.id : false;

  /** Interleaved scores for the finished condensed row:
   *  for each set → winner score (blue) then loser score (muted) */
  const renderFinishedScores = () => {
    if (!match.sets.length) return null;
    return (
      <View className="flex-row gap-[3px]">
        {match.sets.map((set: SetScore, i: number) => {
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
    if (isScheduled || !match.sets.length) {
      return <ScoreBox value="–" variant="pending" />;
    }
    return (
      <View className="flex-row gap-[3px]">
        {match.sets.map((set: SetScore, i: number) => {
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
      className={clsx(
        'bg-white rounded-lg p-md mb-sm shadow-card',
        isLive && 'border-2 border-red',
        isPaused && 'border-2 border-orange',
      )}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${match.team1.name} vs ${match.team2.name}, ${formatTimePt(match.scheduledAt)}, ${match.court}${isLive ? ', ao vivo' : isFinished ? ', concluído' : isPaused ? ', pausado' : ', agendado'}`}
    >
      {/* Meta header */}
      <View className="flex-row justify-between items-center mb-sm">
        <Text
          className={clsx(
            'text-xxs font-nunito uppercase',
            isLive ? 'text-red' : isPaused ? 'text-orange' : 'text-muted',
          )}
          style={isLive ? { color: MATCH_STATUS_COLOR.live } : isPaused ? { color: MATCH_STATUS_COLOR.paused } : undefined}
        >
          {isLive ? '●' : isFinished ? '✅' : isPaused ? '⏸' : '🕒'}{' '}
          {formatTimePt(match.scheduledAt)} · {match.court}
          {isLive ? ' · Ao vivo' : isFinished && !showDoneBadge ? ' · Concluído' : isPaused ? ' · Pausado' : isScheduled ? ' · Agendado' : ''}
        </Text>
        {isScheduled && onEdit && (
          <TouchableOpacity className="bg-gbg rounded-sm px-[9px] py-[3px]" onPress={onEdit}>
            <Text className="text-xs font-nunito text-navy">✏️ Editar</Text>
          </TouchableOpacity>
        )}
        {isFinished && showDoneBadge && (
          <View className="bg-green-bg-light rounded-xl px-sm py-[2px]">
            <Text className="text-xxs font-nunito text-green">Concluído</Text>
          </View>
        )}
        {isPaused && (
          <View className="bg-orange-bg rounded-xl px-sm py-[2px]">
            <Text className="text-xxs font-nunito text-orange">⏸ Pausado</Text>
          </View>
        )}
      </View>

      {/* ── FINISHED: condensed single row ── */}
      {isFinished && winner && loser ? (
        <>
          <View className="flex-row items-center py-sm gap-sm">
            <View className="flex-1 min-w-0">
              {onTeamPress ? (
                <TouchableOpacity onPress={() => onTeamPress(winner)} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                  <Text className="text-sm font-nunito text-blue">{winner.name}</Text>
                </TouchableOpacity>
              ) : (
                <Text className="text-sm font-nunito text-blue">{winner.name}</Text>
              )}
              {onTeamPress ? (
                <TouchableOpacity onPress={() => onTeamPress(loser)} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                  <Text className="text-xxs text-muted mt-[2px]">vs {loser.name}</Text>
                </TouchableOpacity>
              ) : (
                <Text className="text-xxs text-muted mt-[2px]">vs {loser.name}</Text>
              )}
            </View>
            {renderFinishedScores()}
          </View>

          {/* Bottom actions */}
          <View className="flex-row items-center justify-between mt-sm">
            {onEnterResult && (
            <TouchableOpacity className="border-[1.5px] border-gl rounded-[10px] py-[6px] px-md items-center" onPress={onEnterResult}>
              <Text className="text-sm font-nunito-bold text-navy">✏️ Editar resultado</Text>
            </TouchableOpacity>
            )}
            {advanceText ? (
              <Text className="text-xs font-nunito text-green">{advanceText} ›</Text>
            ) : null}
          </View>
        </>
      ) : (
        <>
          {/* ── LIVE / SCHEDULED: two team rows ── */}
          {/* Team 1 */}
          <TouchableOpacity
            className="flex-row items-center py-[7px] gap-[6px] border-b border-gl"
            onPress={() => onTeamPress?.(match.team1)}
            disabled={!onTeamPress}
            activeOpacity={onTeamPress ? 0.6 : 1}
          >
            <Text className="flex-1 text-md font-nunito text-navy">{match.team1.name}</Text>
            {renderScores(1)}
          </TouchableOpacity>

          {/* Team 2 */}
          <TouchableOpacity
            className="flex-row items-center py-[7px] gap-[6px]"
            onPress={() => onTeamPress?.(match.team2)}
            disabled={!onTeamPress}
            activeOpacity={onTeamPress ? 0.6 : 1}
          >
            <Text className="flex-1 text-md font-nunito text-navy">{match.team2.name}</Text>
            {renderScores(2)}
          </TouchableOpacity>

          {/* Live CTA */}
          {isLive && onEnterResult && (
            <TouchableOpacity className="rounded-[10px] overflow-hidden mt-sm" onPress={onEnterResult}>
              <LinearGradient colors={Gradients.primary} className="p-[10px] items-center">
                <Text className="text-md font-nunito text-white">Introduzir resultado →</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Paused CTA */}
          {isPaused && onEnterResult && (
            <TouchableOpacity className="border-[1.5px] border-orange rounded-[10px] p-[9px] mt-sm items-center" onPress={onEnterResult}>
              <Text className="text-md font-nunito text-orange">▶ Retomar jogo</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </TouchableOpacity>
  );
});
