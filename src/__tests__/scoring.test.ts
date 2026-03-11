import { calcStats, PTS_PER_WIN } from '../utils/scoring';
import { Match } from '../types';

const finishedMatch = (
  t1Id: string,
  t2Id: string,
  sets: { team1: number; team2: number }[],
  winnerId: string,
): Match => ({
  id: `g-${t1Id}-${t2Id}`,
  categoryId: 'test-cat',
  team1Id: t1Id,
  team2Id: t2Id,
  court: 'C1',
  scheduledAt: '2026-01-01T10:00:00',
  phase: 'groups',
  sets,
  status: 'finished',
  winnerId,
});

const walkoverMatch = (t1Id: string, t2Id: string, winnerId: string): Match => ({
  id: `wo-${t1Id}-${t2Id}`,
  categoryId: 'test-cat',
  team1Id: t1Id,
  team2Id: t2Id,
  court: 'C1',
  scheduledAt: '2026-01-01T10:00:00',
  phase: 'groups',
  status: 'walkover',
  winnerId,
});

const liveMatch = (t1Id: string, t2Id: string): Match => ({
  id: `live-${t1Id}-${t2Id}`,
  categoryId: 'test-cat',
  team1Id: t1Id,
  team2Id: t2Id,
  court: 'C1',
  scheduledAt: '2026-01-01T10:00:00',
  phase: 'groups',
  sets: [{ team1: 3, team2: 2 }],
  status: 'live',
});

describe('calcStats', () => {
  it('returns all zeros with no matches', () => {
    expect(calcStats('t1', [])).toEqual({
      wins: 0, losses: 0, played: 0, pts: 0, setsWon: 0, setsLost: 0,
    });
  });

  it('ignores live and scheduled matches', () => {
    const matches: Match[] = [liveMatch('t1', 't2')];
    expect(calcStats('t1', matches)).toEqual({
      wins: 0, losses: 0, played: 0, pts: 0, setsWon: 0, setsLost: 0,
    });
  });

  it('counts a win when team is winner of a finished match', () => {
    const matches = [finishedMatch('t1', 't2', [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }], 't1')];
    const stats = calcStats('t1', matches);
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(0);
    expect(stats.played).toBe(1);
    expect(stats.pts).toBe(PTS_PER_WIN);
  });

  it('counts a loss when team loses a finished match', () => {
    const matches = [finishedMatch('t1', 't2', [{ team1: 3, team2: 6 }, { team1: 4, team2: 6 }], 't2')];
    const stats = calcStats('t1', matches);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(1);
    expect(stats.played).toBe(1);
    expect(stats.pts).toBe(0);
  });

  it('counts sets correctly when team is team1', () => {
    const matches = [finishedMatch('t1', 't2', [{ team1: 6, team2: 3 }, { team1: 7, team2: 5 }], 't1')];
    const stats = calcStats('t1', matches);
    expect(stats.setsWon).toBe(13);   // 6 + 7
    expect(stats.setsLost).toBe(8);   // 3 + 5
  });

  it('counts sets correctly when team is team2', () => {
    const matches = [finishedMatch('t1', 't2', [{ team1: 6, team2: 3 }, { team1: 5, team2: 7 }], 't1')];
    const stats = calcStats('t2', matches);
    expect(stats.setsWon).toBe(10);   // 3 + 7
    expect(stats.setsLost).toBe(11);  // 6 + 5
  });

  it('does not count sets for walkover matches', () => {
    const matches = [walkoverMatch('t1', 't2', 't1')];
    const stats = calcStats('t1', matches);
    expect(stats.wins).toBe(1);
    expect(stats.setsWon).toBe(0);
    expect(stats.setsLost).toBe(0);
  });

  it('counts walkover loss correctly', () => {
    const matches = [walkoverMatch('t1', 't2', 't2')];
    const stats = calcStats('t1', matches);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(1);
    expect(stats.pts).toBe(0);
  });

  it('accumulates stats across multiple matches', () => {
    const matches = [
      finishedMatch('t1', 't2', [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }], 't1'),
      finishedMatch('t3', 't1', [{ team1: 6, team2: 4 }, { team1: 6, team2: 3 }], 't3'),
      walkoverMatch('t1', 't4', 't1'),
    ];
    const stats = calcStats('t1', matches);
    expect(stats.wins).toBe(2);
    expect(stats.losses).toBe(1);
    expect(stats.played).toBe(3);
    expect(stats.pts).toBe(2 * PTS_PER_WIN);
    // Sets from game1 (t1 is team1): won 6+6=12, lost 3+4=7
    // Sets from game2 (t1 is team2): won 4+3=7, lost 6+6=12
    expect(stats.setsWon).toBe(12 + 7);
    expect(stats.setsLost).toBe(7 + 12);
  });

  it('ignores matches where the team is not a participant', () => {
    const matches = [finishedMatch('t2', 't3', [{ team1: 6, team2: 3 }], 't2')];
    expect(calcStats('t1', matches)).toEqual({
      wins: 0, losses: 0, played: 0, pts: 0, setsWon: 0, setsLost: 0,
    });
  });

  it('finished match with undefined winnerId is not counted as a win or loss', () => {
    const matchWithNoWinner: Match = {
      ...finishedMatch('t1', 't2', [{ team1: 6, team2: 3 }], 't1'),
      winnerId: undefined,
    };
    const stats = calcStats('t1', [matchWithNoWinner]);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(0);
    expect(stats.played).toBe(0);
  });

  it('ignores scheduled matches', () => {
    const scheduled: Match = {
      id: 'sched-1',
      categoryId: 'test-cat',
      team1Id: 't1',
      team2Id: 't2',
      court: 'C1',
      scheduledAt: '2026-01-01T10:00:00',
      phase: 'groups',
      status: 'scheduled',
    };
    expect(calcStats('t1', [scheduled])).toEqual({
      wins: 0, losses: 0, played: 0, pts: 0, setsWon: 0, setsLost: 0,
    });
  });

  it('ignores paused matches', () => {
    const paused: Match = {
      id: 'paused-1',
      categoryId: 'test-cat',
      team1Id: 't1',
      team2Id: 't2',
      court: 'C1',
      scheduledAt: '2026-01-01T10:00:00',
      phase: 'groups',
      sets: [{ team1: 6, team2: 3 }],
      status: 'paused',
    };
    expect(calcStats('t1', [paused])).toEqual({
      wins: 0, losses: 0, played: 0, pts: 0, setsWon: 0, setsLost: 0,
    });
  });

  it('counts win correctly when team is team2', () => {
    const matches = [finishedMatch('t1', 't2', [{ team1: 3, team2: 6 }, { team1: 4, team2: 6 }], 't2')];
    const stats = calcStats('t2', matches);
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(0);
    expect(stats.played).toBe(1);
    expect(stats.pts).toBe(PTS_PER_WIN);
    expect(stats.setsWon).toBe(12);  // 6 + 6
    expect(stats.setsLost).toBe(7);  // 3 + 4
  });

  it('handles a 3-set match (super tie-break)', () => {
    const matches = [finishedMatch('t1', 't2', [
      { team1: 6, team2: 4 },
      { team1: 3, team2: 6 },
      { team1: 10, team2: 7 },
    ], 't1')];
    const stats = calcStats('t1', matches);
    expect(stats.wins).toBe(1);
    expect(stats.setsWon).toBe(6 + 3 + 10);  // 19
    expect(stats.setsLost).toBe(4 + 6 + 7);  // 17
  });

  it('handles finished match with empty sets array', () => {
    const matches = [finishedMatch('t1', 't2', [], 't1')];
    const stats = calcStats('t1', matches);
    expect(stats.wins).toBe(1);
    expect(stats.played).toBe(1);
    expect(stats.setsWon).toBe(0);
    expect(stats.setsLost).toBe(0);
  });

  it('handles finished match with undefined sets', () => {
    const match: Match = {
      ...finishedMatch('t1', 't2', [], 't1'),
      sets: undefined,
    };
    const stats = calcStats('t1', [match]);
    expect(stats.wins).toBe(1);
    expect(stats.setsWon).toBe(0);
    expect(stats.setsLost).toBe(0);
  });

  it('handles a set with zero scores', () => {
    const matches = [finishedMatch('t1', 't2', [{ team1: 6, team2: 0 }, { team1: 6, team2: 0 }], 't1')];
    const stats = calcStats('t1', matches);
    expect(stats.setsWon).toBe(12);
    expect(stats.setsLost).toBe(0);
  });

  it('walkover loss as team2', () => {
    const matches = [walkoverMatch('t1', 't2', 't1')];
    const stats = calcStats('t2', matches);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(1);
    expect(stats.played).toBe(1);
    expect(stats.pts).toBe(0);
    expect(stats.setsWon).toBe(0);
    expect(stats.setsLost).toBe(0);
  });

  it('mixes finished, walkover, live, scheduled, and paused matches', () => {
    const matches: Match[] = [
      finishedMatch('t1', 't2', [{ team1: 6, team2: 4 }, { team1: 6, team2: 3 }], 't1'),
      walkoverMatch('t3', 't1', 't1'),
      liveMatch('t1', 't4'),
      { id: 'sched', categoryId: 'test-cat', team1Id: 't1', team2Id: 't5', court: 'C1', scheduledAt: '2026-01-02T11:00:00', phase: 'groups', status: 'scheduled' },
      { id: 'paused', categoryId: 'test-cat', team1Id: 't6', team2Id: 't1', court: 'C1', scheduledAt: '2026-01-02T12:00:00', phase: 'groups', sets: [{ team1: 5, team2: 4 }], status: 'paused' },
      finishedMatch('t1', 't7', [{ team1: 2, team2: 6 }, { team1: 3, team2: 6 }], 't7'),
    ];
    const stats = calcStats('t1', matches);
    // 2 wins (finished vs t2 + walkover vs t3), 1 loss (finished vs t7)
    expect(stats.wins).toBe(2);
    expect(stats.losses).toBe(1);
    expect(stats.played).toBe(3);
    expect(stats.pts).toBe(2 * PTS_PER_WIN);
    // Sets only from the two finished matches:
    // vs t2: won 6+6=12, lost 4+3=7
    // vs t7: won 2+3=5, lost 6+6=12
    expect(stats.setsWon).toBe(12 + 5);
    expect(stats.setsLost).toBe(7 + 12);
  });

  it('same team playing multiple matches as both team1 and team2', () => {
    const matches = [
      finishedMatch('t1', 't2', [{ team1: 6, team2: 2 }], 't1'),  // t1 is team1 → win
      finishedMatch('t3', 't1', [{ team1: 4, team2: 6 }], 't1'),  // t1 is team2 → win
      finishedMatch('t4', 't1', [{ team1: 6, team2: 3 }], 't4'),  // t1 is team2 → loss
    ];
    const stats = calcStats('t1', matches);
    expect(stats.wins).toBe(2);
    expect(stats.losses).toBe(1);
    expect(stats.played).toBe(3);
    // Match 1 (team1): won 6, lost 2
    // Match 2 (team2): won 6, lost 4
    // Match 3 (team2): won 3, lost 6
    expect(stats.setsWon).toBe(6 + 6 + 3);
    expect(stats.setsLost).toBe(2 + 4 + 6);
  });
});
