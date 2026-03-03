import { calcStats, PTS_PER_WIN } from '../utils/scoring';
import { Game } from '../types';

// Minimal team factory
const team = (id: string) => ({ id, name: id, players: [] as any, group: 'A' });

const finishedGame = (
  t1Id: string,
  t2Id: string,
  sets: { team1: number; team2: number }[],
  winnerId: string,
): Game => ({
  id: `g-${t1Id}-${t2Id}`,
  team1: team(t1Id),
  team2: team(t2Id),
  court: 'C1',
  date: '1 Jan',
  time: '10:00',
  phase: 'groups',
  sets,
  status: 'finished',
  winnerId,
});

const walkoverGame = (t1Id: string, t2Id: string, winnerId: string): Game => ({
  id: `wo-${t1Id}-${t2Id}`,
  team1: team(t1Id),
  team2: team(t2Id),
  court: 'C1',
  date: '1 Jan',
  time: '10:00',
  phase: 'groups',
  status: 'walkover',
  winnerId,
});

const liveGame = (t1Id: string, t2Id: string): Game => ({
  id: `live-${t1Id}-${t2Id}`,
  team1: team(t1Id),
  team2: team(t2Id),
  court: 'C1',
  date: '1 Jan',
  time: '10:00',
  phase: 'groups',
  sets: [{ team1: 3, team2: 2 }],
  status: 'live',
});

describe('calcStats', () => {
  it('returns all zeros with no games', () => {
    expect(calcStats('t1', [])).toEqual({
      wins: 0, losses: 0, played: 0, pts: 0, gamesWon: 0, gamesLost: 0,
    });
  });

  it('ignores live and scheduled games', () => {
    const games: Game[] = [liveGame('t1', 't2')];
    expect(calcStats('t1', games)).toEqual({
      wins: 0, losses: 0, played: 0, pts: 0, gamesWon: 0, gamesLost: 0,
    });
  });

  it('counts a win when team is winner of a finished game', () => {
    const games = [finishedGame('t1', 't2', [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }], 't1')];
    const stats = calcStats('t1', games);
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(0);
    expect(stats.played).toBe(1);
    expect(stats.pts).toBe(PTS_PER_WIN);
  });

  it('counts a loss when team loses a finished game', () => {
    const games = [finishedGame('t1', 't2', [{ team1: 3, team2: 6 }, { team1: 4, team2: 6 }], 't2')];
    const stats = calcStats('t1', games);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(1);
    expect(stats.played).toBe(1);
    expect(stats.pts).toBe(0);
  });

  it('counts sets correctly when team is team1', () => {
    const games = [finishedGame('t1', 't2', [{ team1: 6, team2: 3 }, { team1: 7, team2: 5 }], 't1')];
    const stats = calcStats('t1', games);
    expect(stats.gamesWon).toBe(13);   // 6 + 7
    expect(stats.gamesLost).toBe(8);   // 3 + 5
  });

  it('counts sets correctly when team is team2', () => {
    const games = [finishedGame('t1', 't2', [{ team1: 6, team2: 3 }, { team1: 5, team2: 7 }], 't1')];
    const stats = calcStats('t2', games);
    expect(stats.gamesWon).toBe(10);   // 3 + 7
    expect(stats.gamesLost).toBe(11);  // 6 + 5
  });

  it('does not count sets for walkover games', () => {
    const games = [walkoverGame('t1', 't2', 't1')];
    const stats = calcStats('t1', games);
    expect(stats.wins).toBe(1);
    expect(stats.gamesWon).toBe(0);
    expect(stats.gamesLost).toBe(0);
  });

  it('counts walkover loss correctly', () => {
    const games = [walkoverGame('t1', 't2', 't2')];
    const stats = calcStats('t1', games);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(1);
    expect(stats.pts).toBe(0);
  });

  it('accumulates stats across multiple games', () => {
    const games = [
      finishedGame('t1', 't2', [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }], 't1'),
      finishedGame('t3', 't1', [{ team1: 6, team2: 4 }, { team1: 6, team2: 3 }], 't3'),
      walkoverGame('t1', 't4', 't1'),
    ];
    const stats = calcStats('t1', games);
    expect(stats.wins).toBe(2);
    expect(stats.losses).toBe(1);
    expect(stats.played).toBe(3);
    expect(stats.pts).toBe(2 * PTS_PER_WIN);
    // Sets from game1 (t1 is team1): won 6+6=12, lost 3+4=7
    // Sets from game2 (t1 is team2): won 4+3=7, lost 6+6=12
    expect(stats.gamesWon).toBe(12 + 7);
    expect(stats.gamesLost).toBe(7 + 12);
  });

  it('ignores games where the team is not a participant', () => {
    const games = [finishedGame('t2', 't3', [{ team1: 6, team2: 3 }], 't2')];
    expect(calcStats('t1', games)).toEqual({
      wins: 0, losses: 0, played: 0, pts: 0, gamesWon: 0, gamesLost: 0,
    });
  });

  it('finished game with undefined winnerId is not counted as a win or loss', () => {
    const gameWithNoWinner: Game = {
      ...finishedGame('t1', 't2', [{ team1: 6, team2: 3 }], 't1'),
      winnerId: undefined,
    };
    const stats = calcStats('t1', [gameWithNoWinner]);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(0);
    expect(stats.played).toBe(0);
  });

  it('ignores scheduled games', () => {
    const scheduled: Game = {
      id: 'sched-1',
      team1: team('t1'),
      team2: team('t2'),
      court: 'C1',
      date: '1 Jan',
      time: '10:00',
      phase: 'groups',
      status: 'scheduled',
    };
    expect(calcStats('t1', [scheduled])).toEqual({
      wins: 0, losses: 0, played: 0, pts: 0, gamesWon: 0, gamesLost: 0,
    });
  });

  it('ignores paused games', () => {
    const paused: Game = {
      id: 'paused-1',
      team1: team('t1'),
      team2: team('t2'),
      court: 'C1',
      date: '1 Jan',
      time: '10:00',
      phase: 'groups',
      sets: [{ team1: 6, team2: 3 }],
      status: 'paused',
    };
    expect(calcStats('t1', [paused])).toEqual({
      wins: 0, losses: 0, played: 0, pts: 0, gamesWon: 0, gamesLost: 0,
    });
  });

  it('counts win correctly when team is team2', () => {
    const games = [finishedGame('t1', 't2', [{ team1: 3, team2: 6 }, { team1: 4, team2: 6 }], 't2')];
    const stats = calcStats('t2', games);
    expect(stats.wins).toBe(1);
    expect(stats.losses).toBe(0);
    expect(stats.played).toBe(1);
    expect(stats.pts).toBe(PTS_PER_WIN);
    expect(stats.gamesWon).toBe(12);  // 6 + 6
    expect(stats.gamesLost).toBe(7);  // 3 + 4
  });

  it('handles a 3-set match (super tie-break)', () => {
    const games = [finishedGame('t1', 't2', [
      { team1: 6, team2: 4 },
      { team1: 3, team2: 6 },
      { team1: 10, team2: 7 },
    ], 't1')];
    const stats = calcStats('t1', games);
    expect(stats.wins).toBe(1);
    expect(stats.gamesWon).toBe(6 + 3 + 10);  // 19
    expect(stats.gamesLost).toBe(4 + 6 + 7);  // 17
  });

  it('handles finished game with empty sets array', () => {
    const games = [finishedGame('t1', 't2', [], 't1')];
    const stats = calcStats('t1', games);
    expect(stats.wins).toBe(1);
    expect(stats.played).toBe(1);
    expect(stats.gamesWon).toBe(0);
    expect(stats.gamesLost).toBe(0);
  });

  it('handles finished game with undefined sets', () => {
    const game: Game = {
      ...finishedGame('t1', 't2', [], 't1'),
      sets: undefined,
    };
    const stats = calcStats('t1', [game]);
    expect(stats.wins).toBe(1);
    expect(stats.gamesWon).toBe(0);
    expect(stats.gamesLost).toBe(0);
  });

  it('handles a set with zero scores', () => {
    const games = [finishedGame('t1', 't2', [{ team1: 6, team2: 0 }, { team1: 6, team2: 0 }], 't1')];
    const stats = calcStats('t1', games);
    expect(stats.gamesWon).toBe(12);
    expect(stats.gamesLost).toBe(0);
  });

  it('walkover loss as team2', () => {
    const games = [walkoverGame('t1', 't2', 't1')];
    const stats = calcStats('t2', games);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(1);
    expect(stats.played).toBe(1);
    expect(stats.pts).toBe(0);
    expect(stats.gamesWon).toBe(0);
    expect(stats.gamesLost).toBe(0);
  });

  it('mixes finished, walkover, live, scheduled, and paused games', () => {
    const games: Game[] = [
      finishedGame('t1', 't2', [{ team1: 6, team2: 4 }, { team1: 6, team2: 3 }], 't1'),
      walkoverGame('t3', 't1', 't1'),
      liveGame('t1', 't4'),
      { id: 'sched', team1: team('t1'), team2: team('t5'), court: 'C1', date: '2 Jan', time: '11:00', phase: 'groups', status: 'scheduled' },
      { id: 'paused', team1: team('t6'), team2: team('t1'), court: 'C1', date: '2 Jan', time: '12:00', phase: 'groups', sets: [{ team1: 5, team2: 4 }], status: 'paused' },
      finishedGame('t1', 't7', [{ team1: 2, team2: 6 }, { team1: 3, team2: 6 }], 't7'),
    ];
    const stats = calcStats('t1', games);
    // 2 wins (finished vs t2 + walkover vs t3), 1 loss (finished vs t7)
    expect(stats.wins).toBe(2);
    expect(stats.losses).toBe(1);
    expect(stats.played).toBe(3);
    expect(stats.pts).toBe(2 * PTS_PER_WIN);
    // Sets only from the two finished games:
    // vs t2: won 6+6=12, lost 4+3=7
    // vs t7: won 2+3=5, lost 6+6=12
    expect(stats.gamesWon).toBe(12 + 5);
    expect(stats.gamesLost).toBe(7 + 12);
  });

  it('same team playing multiple games as both team1 and team2', () => {
    const games = [
      finishedGame('t1', 't2', [{ team1: 6, team2: 2 }], 't1'),  // t1 is team1 → win
      finishedGame('t3', 't1', [{ team1: 4, team2: 6 }], 't1'),  // t1 is team2 → win
      finishedGame('t4', 't1', [{ team1: 6, team2: 3 }], 't4'),  // t1 is team2 → loss
    ];
    const stats = calcStats('t1', games);
    expect(stats.wins).toBe(2);
    expect(stats.losses).toBe(1);
    expect(stats.played).toBe(3);
    // Game 1 (team1): won 6, lost 2
    // Game 2 (team2): won 6, lost 4
    // Game 3 (team2): won 3, lost 6
    expect(stats.gamesWon).toBe(6 + 6 + 3);
    expect(stats.gamesLost).toBe(2 + 4 + 6);
  });
});
