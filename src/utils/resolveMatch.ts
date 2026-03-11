import type { Match, ResolvedMatch, Team, Tournament } from '../types';

/** Placeholder returned when a bracket slot is not yet determined */
const placeholderTeam = (id: string): Team => ({ id, name: '?', players: [] });

/** Resolve a raw Match (with IDs) into a ResolvedMatch (with full Team objects) */
export function resolveMatch(match: Match, teamMap: Map<string, Team>): ResolvedMatch {
  const team1 = teamMap.get(match.team1Id) ?? placeholderTeam(match.team1Id);
  const team2 = teamMap.get(match.team2Id) ?? placeholderTeam(match.team2Id);
  return { ...match, team1, team2 };
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
