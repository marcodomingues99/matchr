import type { Match, MatchFormat, Category, TeamStats } from '../types';

export const PTS_PER_WIN = 3;

/** Default format for a padel match (standard best-of-3 with super tie-break) */
export const DEFAULT_MATCH_FORMAT: MatchFormat = {
  maxSets: 3,
  setsToWin: 2,
  superTieBreakIndex: 2, // 0-based index of the 3rd set
};

export const resolvePointsPerWin = (
  category?: Pick<Category, 'pointsPerWin'>,
): number => category?.pointsPerWin ?? PTS_PER_WIN;

export const resolveMatchFormat = (
  format?: Partial<MatchFormat>,
): MatchFormat => ({
  maxSets: format?.maxSets ?? DEFAULT_MATCH_FORMAT.maxSets,
  setsToWin: format?.setsToWin ?? DEFAULT_MATCH_FORMAT.setsToWin,
  superTieBreakIndex: format?.superTieBreakIndex ?? DEFAULT_MATCH_FORMAT.superTieBreakIndex,
});

export const calcStats = (teamId: string, matches: Match[], pointsPerWin: number = PTS_PER_WIN): TeamStats => {
  const relevant = matches.filter(
    m => (m.team1Id === teamId || m.team2Id === teamId) &&
         (m.status === 'finished' || m.status === 'walkover'),
  );
  let wins = 0, losses = 0, setsWon = 0, setsLost = 0;
  relevant.forEach(m => {
    const isT1 = m.team1Id === teamId;
    if (m.winnerId === teamId) wins++;
    else if (m.winnerId != null) losses++;
    // Walkover matches have no sets played — only count games-within-sets for finished matches
    if (m.status === 'finished') {
      (m.sets ?? []).forEach(set => {
        setsWon  += isT1 ? set.team1 : set.team2;
        setsLost += isT1 ? set.team2 : set.team1;
      });
    }
  });
  return { wins, losses, played: wins + losses, pts: wins * pointsPerWin, setsWon, setsLost };
};
