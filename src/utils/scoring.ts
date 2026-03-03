import { Game } from '../types';
import type { Vertente } from '../types';

export const PTS_PER_WIN = 3;

/** Format constants for a padel match (standard best-of-3 with super tie-break) */
export const MATCH_FORMAT = {
  MAX_SETS: 3,
  SETS_TO_WIN: 2,
  SUPER_TIE_BREAK_INDEX: 2, // 0-based index of the 3rd set
};

export const resolvePointsPerWin = (
  vertente?: Pick<Vertente, 'pointsPerWin'>,
): number => vertente?.pointsPerWin ?? PTS_PER_WIN;

export const resolveMatchFormat = (
  vertente?: Pick<Vertente, 'matchFormat'>,
) => ({
  MAX_SETS: vertente?.matchFormat?.maxSets ?? MATCH_FORMAT.MAX_SETS,
  SETS_TO_WIN: vertente?.matchFormat?.setsToWin ?? MATCH_FORMAT.SETS_TO_WIN,
  SUPER_TIE_BREAK_INDEX: vertente?.matchFormat?.superTieBreakIndex ?? MATCH_FORMAT.SUPER_TIE_BREAK_INDEX,
});

export interface TeamStats {
  wins: number;
  losses: number;
  played: number;
  pts: number;
  gamesWon: number;
  gamesLost: number;
}

export const calcStats = (teamId: string, games: Game[], pointsPerWin: number = PTS_PER_WIN): TeamStats => {
  const relevant = games.filter(
    g => (g.team1.id === teamId || g.team2.id === teamId) &&
         (g.status === 'finished' || g.status === 'walkover'),
  );
  let wins = 0, losses = 0, gamesWon = 0, gamesLost = 0;
  relevant.forEach(g => {
    const isT1 = g.team1.id === teamId;
    if (g.winnerId === teamId) wins++;
    else if (g.winnerId !== undefined) losses++;
    // Walkover games have no sets played — only count games-within-sets for finished games
    if (g.status === 'finished') {
      (g.sets ?? []).forEach(set => {
        gamesWon  += isT1 ? set.team1 : set.team2;
        gamesLost += isT1 ? set.team2 : set.team1;
      });
    }
  });
  return { wins, losses, played: wins + losses, pts: wins * pointsPerWin, gamesWon, gamesLost };
};
