import { propagateBracket, isPlaceholderTeam } from '../utils/bracketPropagation';
import { Match, Team } from '../types';

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
    expect(isPlaceholderTeam(placeholder1.id)).toBe(true);
  });
  it('detects ? id', () => {
    expect(isPlaceholderTeam('?')).toBe(true);
  });
  it('returns false for real teams', () => {
    expect(isPlaceholderTeam(t1.id)).toBe(false);
  });
});

describe('propagateBracket', () => {
  it('propagates SF winners to final and losers to 3rd place', () => {
    const matches: Match[] = [
      {
        id: 'sf1', categoryId: 'test-cat', team1Id: t1.id, team2Id: t2.id, court: 'C1', scheduledAt: '2026-03-01T10:00:00',
        phase: 'sf', status: 'finished', winnerId: 't1',
        sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
      },
      {
        id: 'sf2', categoryId: 'test-cat', team1Id: t3.id, team2Id: t4.id, court: 'C2', scheduledAt: '2026-03-01T10:00:00',
        phase: 'sf', status: 'finished', winnerId: 't4',
        sets: [{ team1: 3, team2: 6 }, { team1: 4, team2: 6 }],
      },
      {
        id: 'f1', categoryId: 'test-cat', team1Id: placeholder1.id, team2Id: placeholder2.id, court: 'C1', scheduledAt: '2026-03-02T14:00:00',
        phase: 'final', status: 'scheduled',
      },
      {
        id: '3rd1', categoryId: 'test-cat', team1Id: placeholder1.id, team2Id: placeholder2.id, court: 'C2', scheduledAt: '2026-03-02T14:00:00',
        phase: '3rd', status: 'scheduled',
      },
    ];

    const result = propagateBracket(matches);
    const final = result.find(g => g.id === 'f1')!;
    const third = result.find(g => g.id === '3rd1')!;

    // Winners go to final
    expect(final.team1Id).toBe('t1');
    expect(final.team2Id).toBe('t4');

    // Losers go to 3rd place
    expect(third.team1Id).toBe('t2');
    expect(third.team2Id).toBe('t3');
  });

  it('does not mutate original match objects', () => {
    const matches: Match[] = [
      {
        id: 'sf1', categoryId: 'test-cat', team1Id: t1.id, team2Id: t2.id, court: 'C1', scheduledAt: '2026-03-01T10:00:00',
        phase: 'sf', status: 'finished', winnerId: 't1',
        sets: [{ team1: 6, team2: 3 }],
      },
      {
        id: 'f1', categoryId: 'test-cat', team1Id: placeholder1.id, team2Id: placeholder2.id, court: 'C1', scheduledAt: '2026-03-02T14:00:00',
        phase: 'final', status: 'scheduled',
      },
    ];

    const originalFinalTeam1Id = matches[1].team1Id;
    propagateBracket(matches);
    expect(matches[1].team1Id).toBe(originalFinalTeam1Id);
  });

  it('only propagates finished matches', () => {
    const matches: Match[] = [
      {
        id: 'sf1', categoryId: 'test-cat', team1Id: t1.id, team2Id: t2.id, court: 'C1', scheduledAt: '2026-03-01T10:00:00',
        phase: 'sf', status: 'live',
        sets: [{ team1: 4, team2: 6 }],
      },
      {
        id: 'f1', categoryId: 'test-cat', team1Id: placeholder1.id, team2Id: placeholder2.id, court: 'C1', scheduledAt: '2026-03-02T14:00:00',
        phase: 'final', status: 'scheduled',
      },
    ];

    const result = propagateBracket(matches);
    const final = result.find(g => g.id === 'f1')!;

    // Placeholders should remain since SF match is still live
    expect(final.team1Id).toBe('tmp-f');
    expect(final.team2Id).toBe('tmp-3');
  });

  it('propagates QF winners to SF', () => {
    const matches: Match[] = [
      {
        id: 'qf1', categoryId: 'test-cat', team1Id: t1.id, team2Id: t2.id, court: 'C1', scheduledAt: '2026-03-01T10:00:00',
        phase: 'qf', status: 'finished', winnerId: 't1',
        sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
      },
      {
        id: 'qf2', categoryId: 'test-cat', team1Id: t3.id, team2Id: t4.id, court: 'C2', scheduledAt: '2026-03-01T10:00:00',
        phase: 'qf', status: 'finished', winnerId: 't3',
        sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
      },
      {
        id: 'sf1', categoryId: 'test-cat', team1Id: placeholder1.id, team2Id: placeholder2.id, court: 'C1', scheduledAt: '2026-03-02T10:00:00',
        phase: 'sf', status: 'scheduled',
      },
    ];

    const result = propagateBracket(matches);
    const sf = result.find(g => g.id === 'sf1')!;

    expect(sf.team1Id).toBe('t1');
    expect(sf.team2Id).toBe('t3');
  });
});
