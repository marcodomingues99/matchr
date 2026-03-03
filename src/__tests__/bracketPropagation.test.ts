import { propagateBracket, isPlaceholderTeam } from '../utils/bracketPropagation';
import { Game, Team } from '../types';

const makeTeam = (id: string, name: string): Team => ({
  id,
  name,
  players: [{ id: `${id}-p1`, name: `Player 1` }, { id: `${id}-p2`, name: `Player 2` }],
});

const t1 = makeTeam('t1', 'Team Alpha');
const t2 = makeTeam('t2', 'Team Beta');
const t3 = makeTeam('t3', 'Team Gamma');
const t4 = makeTeam('t4', 'Team Delta');
const placeholder1 = makeTeam('tmp-f', '?');
const placeholder2 = makeTeam('tmp-3', '?');

describe('isPlaceholderTeam', () => {
  it('detects tmp- prefix', () => {
    expect(isPlaceholderTeam(placeholder1)).toBe(true);
  });
  it('detects ? name', () => {
    expect(isPlaceholderTeam({ ...t1, name: '?' })).toBe(true);
  });
  it('returns false for real teams', () => {
    expect(isPlaceholderTeam(t1)).toBe(false);
  });
});

describe('propagateBracket', () => {
  it('propagates SF winners to final and losers to 3rd place', () => {
    const games: Game[] = [
      {
        id: 'sf1', team1: t1, team2: t2, court: 'C1', date: '1 Mar', time: '10:00',
        phase: 'sf', status: 'finished', winnerId: 't1',
        sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
      },
      {
        id: 'sf2', team1: t3, team2: t4, court: 'C2', date: '1 Mar', time: '10:00',
        phase: 'sf', status: 'finished', winnerId: 't4',
        sets: [{ team1: 3, team2: 6 }, { team1: 4, team2: 6 }],
      },
      {
        id: 'f1', team1: placeholder1, team2: placeholder2, court: 'C1', date: '2 Mar', time: '14:00',
        phase: 'final', status: 'scheduled',
      },
      {
        id: '3rd1', team1: placeholder1, team2: placeholder2, court: 'C2', date: '2 Mar', time: '14:00',
        phase: '3rd', status: 'scheduled',
      },
    ];

    const result = propagateBracket(games);
    const final = result.find(g => g.id === 'f1')!;
    const third = result.find(g => g.id === '3rd1')!;

    // Winners go to final
    expect(final.team1.id).toBe('t1');
    expect(final.team2.id).toBe('t4');

    // Losers go to 3rd place
    expect(third.team1.id).toBe('t2');
    expect(third.team2.id).toBe('t3');
  });

  it('does not mutate original game objects', () => {
    const games: Game[] = [
      {
        id: 'sf1', team1: t1, team2: t2, court: 'C1', date: '1 Mar', time: '10:00',
        phase: 'sf', status: 'finished', winnerId: 't1',
        sets: [{ team1: 6, team2: 3 }],
      },
      {
        id: 'f1', team1: placeholder1, team2: placeholder2, court: 'C1', date: '2 Mar', time: '14:00',
        phase: 'final', status: 'scheduled',
      },
    ];

    const originalFinalTeam1Id = games[1].team1.id;
    propagateBracket(games);
    expect(games[1].team1.id).toBe(originalFinalTeam1Id);
  });

  it('only propagates finished games', () => {
    const games: Game[] = [
      {
        id: 'sf1', team1: t1, team2: t2, court: 'C1', date: '1 Mar', time: '10:00',
        phase: 'sf', status: 'live',
        sets: [{ team1: 4, team2: 6 }],
      },
      {
        id: 'f1', team1: placeholder1, team2: placeholder2, court: 'C1', date: '2 Mar', time: '14:00',
        phase: 'final', status: 'scheduled',
      },
    ];

    const result = propagateBracket(games);
    const final = result.find(g => g.id === 'f1')!;

    // Placeholders should remain since SF game is still live
    expect(final.team1.id).toBe('tmp-f');
    expect(final.team2.id).toBe('tmp-3');
  });

  it('propagates QF winners to SF', () => {
    const games: Game[] = [
      {
        id: 'qf1', team1: t1, team2: t2, court: 'C1', date: '1 Mar', time: '10:00',
        phase: 'qf', status: 'finished', winnerId: 't1',
        sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
      },
      {
        id: 'qf2', team1: t3, team2: t4, court: 'C2', date: '1 Mar', time: '10:00',
        phase: 'qf', status: 'finished', winnerId: 't3',
        sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
      },
      {
        id: 'sf1', team1: placeholder1, team2: placeholder2, court: 'C1', date: '2 Mar', time: '10:00',
        phase: 'sf', status: 'scheduled',
      },
    ];

    const result = propagateBracket(games);
    const sf = result.find(g => g.id === 'sf1')!;

    expect(sf.team1.id).toBe('t1');
    expect(sf.team2.id).toBe('t3');
  });
});
