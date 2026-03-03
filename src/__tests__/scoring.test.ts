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
      wins: 0, losses: 0, played: 0, pts: 0, setsWon: 0, setsLost: 0,
    });
  });

  it('ignores live and scheduled games', () => {
    const games: Game[] = [liveGame('t1', 't2')];
    expect(calcStats('t1', games)).toEqual({
      wins: 0, losses: 0, played: 0, pts: 0, setsWon: 0, setsLost: 0,
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
    expect(stats.setsWon).toBe(13);   // 6 + 7
    expect(stats.setsLost).toBe(8);   // 3 + 5
  });

  it('counts sets correctly when team is team2', () => {
    const games = [finishedGame('t1', 't2', [{ team1: 6, team2: 3 }, { team1: 5, team2: 7 }], 't1')];
    const stats = calcStats('t2', games);
    expect(stats.setsWon).toBe(10);   // 3 + 7
    expect(stats.setsLost).toBe(11);  // 6 + 5
  });

  it('does not count sets for walkover games', () => {
    const games = [walkoverGame('t1', 't2', 't1')];
    const stats = calcStats('t1', games);
    expect(stats.wins).toBe(1);
    expect(stats.setsWon).toBe(0);
    expect(stats.setsLost).toBe(0);
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
    expect(stats.setsWon).toBe(12 + 7);
    expect(stats.setsLost).toBe(7 + 12);
  });

  it('ignores games where the team is not a participant', () => {
    const games = [finishedGame('t2', 't3', [{ team1: 6, team2: 3 }], 't2')];
    expect(calcStats('t1', games)).toEqual({
      wins: 0, losses: 0, played: 0, pts: 0, setsWon: 0, setsLost: 0,
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
});
