import { Game } from '../types';

export const PTS_PER_WIN = 3;

/** Format constants for a padel match (standard best-of-3 with super tie-break) */
export const MATCH_FORMAT = {
  MAX_SETS: 3,
  SETS_TO_WIN: 2,
  SUPER_TIE_BREAK_INDEX: 2, // 0-based index of the 3rd set
};

export interface TeamStats {
  wins: number;
  losses: number;
  played: number;
  pts: number;
  setsWon: number;
  setsLost: number;
}

export const calcStats = (teamId: string, games: Game[]): TeamStats => {
  const relevant = games.filter(
    g => (g.team1.id === teamId || g.team2.id === teamId) &&
         (g.status === 'finished' || g.status === 'walkover'),
  );
  let wins = 0, losses = 0, setsWon = 0, setsLost = 0;
  relevant.forEach(g => {
    const isT1 = g.team1.id === teamId;
    if (g.winnerId === teamId) wins++;
    else if (g.winnerId !== undefined) losses++;
    // Walkover games have no sets played — only count sets for finished games
    if (g.status === 'finished') {
      (g.sets ?? []).forEach(set => {
        setsWon  += isT1 ? set.team1 : set.team2;
        setsLost += isT1 ? set.team2 : set.team1;
      });
    }
  });
  return { wins, losses, played: wins + losses, pts: wins * PTS_PER_WIN, setsWon, setsLost };
};
