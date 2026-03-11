import { Match, BracketRound } from '../types';
import { MATCH_STATUS } from './constants';

/** Maps each bracket round to its next round */
const NEXT_ROUND: Partial<Record<BracketRound, BracketRound>> = {
  r16: 'qf',
  qf: 'sf',
  sf: 'final',
};

/** Propagation order for processing rounds */
const PROPAGATION_ORDER = ['r16', 'qf', 'sf'] as const;

/** Prefix used for placeholder team IDs (not yet determined) */
export const PLACEHOLDER_PREFIX = 'tmp-';

/**
 * Check whether a team ID is a placeholder (not yet determined).
 */
export function isPlaceholderTeam(teamId: string): boolean {
  return teamId.startsWith(PLACEHOLDER_PREFIX) || teamId === '?';
}

/** Whether a match is decided (has a winner) */
function isDecided(m: Match): boolean {
  return (m.status === MATCH_STATUS.FINISHED || m.status === MATCH_STATUS.WALKOVER) && !!m.winnerId;
}

/**
 * Given all bracket matches for a category, propagate finished-match winners
 * (and SF losers) into subsequent rounds.
 *
 * Returns a NEW array of shallow-cloned matches with updated team IDs.
 * The original match objects are never mutated.
 */
export function propagateBracket(bracketMatches: Match[]): Match[] {
  // Shallow-clone every match so we never touch the originals
  const matches = bracketMatches.map(m => ({ ...m }));

  // Index by phase
  const byPhase: Record<string, Match[]> = {};
  matches.forEach(m => {
    if (!byPhase[m.phase]) byPhase[m.phase] = [];
    byPhase[m.phase].push(m);
  });

  for (const phase of PROPAGATION_ORDER) {
    const current = byPhase[phase];
    if (!current) continue;

    if (phase === 'sf') {
      // ── Semi-finals: winners → final, losers → 3rd place ──
      const finalMatches = byPhase['final'];
      const thirdMatches = byPhase['3rd'];
      const finalMatch = finalMatches?.[0];
      const thirdMatch = thirdMatches?.[0];

      current.forEach((sfMatch, idx) => {
        if (!isDecided(sfMatch)) return;

        const winnerId = sfMatch.winnerId!;
        const loserId = sfMatch.team1Id === winnerId ? sfMatch.team2Id : sfMatch.team1Id;

        if (finalMatch) {
          if (idx === 0) finalMatch.team1Id = winnerId;
          else finalMatch.team2Id = winnerId;
        }
        if (thirdMatch) {
          if (idx === 0) thirdMatch.team1Id = loserId;
          else thirdMatch.team2Id = loserId;
        }
      });
    } else {
      // ── Standard pairing: consecutive pairs feed into next round ──
      const nextPhase = NEXT_ROUND[phase as BracketRound];
      if (!nextPhase) continue;
      const nextMatches = byPhase[nextPhase];
      if (!nextMatches) continue;

      for (let i = 0; i < current.length; i += 2) {
        const nextIdx = Math.floor(i / 2);
        if (nextIdx >= nextMatches.length) break;

        const match1 = current[i];
        const match2 = current[i + 1];
        const nextMatch = nextMatches[nextIdx];

        if (match1 && isDecided(match1)) {
          nextMatch.team1Id = match1.winnerId!;
        }
        if (match2 && isDecided(match2)) {
          nextMatch.team2Id = match2.winnerId!;
        }
      }
    }
  }

  return matches;
}
