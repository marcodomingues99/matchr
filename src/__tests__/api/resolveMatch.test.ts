import { resolveMatch, resolveMatches } from '../../utils/resolveMatch';
import type { Match, Team } from '../../types';

const teamA: Team = { id: 'tA', name: 'Team A', players: [] };
const teamB: Team = { id: 'tB', name: 'Team B', players: [] };

const baseMatch: Match = {
  id: 'g1',
  categoryId: 'v1',
  team1Id: 'tA',
  team2Id: 'tB',
  phase: 'groups',
  group: 'A',
  round: 1,
  court: 'C1',
  scheduledAt: '2026-03-01T10:00:00',
  status: 'scheduled',
  sets: [],
  winnerId: undefined,
};

const teamMap = new Map<string, Team>([
  ['tA', teamA],
  ['tB', teamB],
]);

describe('resolveMatch', () => {
  it('resolves both teams correctly', () => {
    const result = resolveMatch(baseMatch, teamMap);
    expect(result.team1).toBe(teamA);
    expect(result.team2).toBe(teamB);
    expect(result.id).toBe('g1');
  });

  it('returns a placeholder team when team1 is not in the map', () => {
    const match = { ...baseMatch, team1Id: 'missing' };
    const result = resolveMatch(match, teamMap);
    expect(result.team1).toEqual({ id: 'missing', name: '?', players: [] });
    expect(result.team2).toBe(teamB);
  });

  it('returns a placeholder team when team2 is not in the map', () => {
    const match = { ...baseMatch, team2Id: 'missing' };
    const result = resolveMatch(match, teamMap);
    expect(result.team1).toBe(teamA);
    expect(result.team2).toEqual({ id: 'missing', name: '?', players: [] });
  });
});

describe('resolveMatches', () => {
  it('resolves an array of matches', () => {
    const results = resolveMatches([baseMatch], teamMap);
    expect(results).toHaveLength(1);
    expect(results[0].team1).toBe(teamA);
  });

  it('returns placeholder teams for unresolvable matches', () => {
    const bad = { ...baseMatch, id: 'g2', team1Id: 'ghost' };
    const results = resolveMatches([baseMatch, bad], teamMap);
    expect(results).toHaveLength(2);
    expect(results[1].team1).toEqual({ id: 'ghost', name: '?', players: [] });
  });
});
