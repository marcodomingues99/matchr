import { Game, Team } from '../types';

/** Maps each bracket round to its next round */
const NEXT_ROUND: Record<string, string> = {
  r16: 'qf',
  qf: 'sf',
  sf: 'final',
};

/** Propagation order for processing rounds */
const PROPAGATION_ORDER = ['r16', 'qf', 'sf'] as const;

/**
 * Check whether a team slot is a placeholder (not yet determined).
 */
export function isPlaceholderTeam(team: Team): boolean {
  return team.id.startsWith('tmp-') || team.name === '?';
}

/**
 * Given all bracket games for a vertente, propagate finished-game winners
 * (and SF losers) into subsequent rounds.
 *
 * Returns a NEW array of shallow-cloned games with updated team slots.
 * The original game objects are never mutated.
 */
export function propagateBracket(bracketGames: Game[]): Game[] {
  // Shallow-clone every game so we never touch the originals
  const games = bracketGames.map(g => ({
    ...g,
    team1: { ...g.team1 },
    team2: { ...g.team2 },
  }));

  // Index by phase
  const byPhase: Record<string, Game[]> = {};
  games.forEach(g => {
    if (!byPhase[g.phase]) byPhase[g.phase] = [];
    byPhase[g.phase].push(g);
  });

  for (const phase of PROPAGATION_ORDER) {
    const current = byPhase[phase];
    if (!current) continue;

    if (phase === 'sf') {
      // ── Semi-finals: winners → final, losers → 3rd place ──
      const finalGames = byPhase['final'];
      const thirdGames = byPhase['3rd'];
      const finalGame = finalGames?.[0];
      const thirdGame = thirdGames?.[0];

      current.forEach((sfGame, idx) => {
        if (sfGame.status !== 'finished' || !sfGame.winnerId) return;

        const winner =
          sfGame.winnerId === sfGame.team1.id ? sfGame.team1 : sfGame.team2;
        const loser =
          sfGame.winnerId === sfGame.team1.id ? sfGame.team2 : sfGame.team1;

        if (finalGame) {
          if (idx === 0) finalGame.team1 = { ...winner };
          else finalGame.team2 = { ...winner };
        }
        if (thirdGame) {
          if (idx === 0) thirdGame.team1 = { ...loser };
          else thirdGame.team2 = { ...loser };
        }
      });
    } else {
      // ── Standard pairing: consecutive pairs feed into next round ──
      const nextPhase = NEXT_ROUND[phase];
      const nextGames = byPhase[nextPhase];
      if (!nextGames) continue;

      for (let i = 0; i < current.length; i += 2) {
        const nextIdx = Math.floor(i / 2);
        if (nextIdx >= nextGames.length) break;

        const game1 = current[i];
        const game2 = current[i + 1];
        const nextGame = nextGames[nextIdx];

        if (game1?.status === 'finished' && game1.winnerId) {
          const winner =
            game1.winnerId === game1.team1.id ? game1.team1 : game1.team2;
          nextGame.team1 = { ...winner };
        }
        if (game2?.status === 'finished' && game2.winnerId) {
          const winner =
            game2.winnerId === game2.team1.id ? game2.team1 : game2.team2;
          nextGame.team2 = { ...winner };
        }
      }
    }
  }

  return games;
}
