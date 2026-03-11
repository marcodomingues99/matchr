import type { Match, ResolvedMatch, Team, Tournament } from '../types';

const PLACEHOLDER_TEAM: Team = { id: '?', name: '?', players: [] };

/** Resolve a raw Match (with IDs) into a ResolvedMatch (with full Team objects) */
export function resolveMatch(match: Match, teamMap: Map<string, Team>): ResolvedMatch {
  return {
    ...match,
    team1: teamMap.get(match.team1Id) ?? { ...PLACEHOLDER_TEAM, id: match.team1Id },
    team2: teamMap.get(match.team2Id) ?? { ...PLACEHOLDER_TEAM, id: match.team2Id },
  };
}

/** Resolve an array of raw Matches */
export function resolveMatches(matches: Match[], teamMap: Map<string, Team>): ResolvedMatch[] {
  return matches.map(m => resolveMatch(m, teamMap));
}

/** Build a team lookup map from tournament data */
export function buildTeamMap(tournaments: Tournament[]): Map<string, Team> {
  const map = new Map<string, Team>();
  tournaments.forEach(t =>
    t.categories.forEach(c =>
      c.teams.forEach(team => map.set(team.id, team)),
    ),
  );
  return map;
}
