/**
 * Tests for the saveSet / set-entry logic extracted from EnterResultScreen.
 *
 * The logic is extracted here so it can be unit-tested without React Native.
 */

import { MATCH_FORMAT } from '../utils/scoring';

interface SetState { team1: string; team2: string; saved: boolean }

/** saveSet logic, matching the fixed implementation in EnterResultScreen. */
function saveSetFixed(sets: SetState[]): SetState[] {
  const currentSetIdx = sets.findIndex(s => !s.saved);
  if (currentSetIdx === -1) return sets;

  const newSets = sets.map((s, i) =>
    i === currentSetIdx ? { ...s, saved: true } : s
  );

  const allSaved = newSets.every(s => s.saved);
  if (allSaved && newSets.length < MATCH_FORMAT.MAX_SETS) {
    let t1Wins = 0, t2Wins = 0;
    newSets.forEach(s => {
      const s1 = parseInt(s.team1) || 0;
      const s2 = parseInt(s.team2) || 0;
      if (s1 > s2) t1Wins++; else if (s2 > s1) t2Wins++;
    });
    if (t1Wins < MATCH_FORMAT.SETS_TO_WIN && t2Wins < MATCH_FORMAT.SETS_TO_WIN) {
      newSets.push({ team1: '', team2: '', saved: false });
    }
  }
  return newSets;
}

// ─── BUG: shallow-copy mutation ───────────────────────────────────────────────

describe('saveSet — no state mutation', () => {
  it('does NOT mutate the original set objects', () => {
    const original: SetState[] = [
      { team1: '6', team2: '3', saved: false },
    ];
    const originalRef = original[0];

    saveSetFixed(original);

    expect(originalRef.saved).toBe(false); // original is untouched
  });
});

// ─── Set progression logic ────────────────────────────────────────────────────

describe('saveSet — set progression (using fixed version)', () => {
  it('marks the current set as saved', () => {
    const sets: SetState[] = [{ team1: '6', team2: '3', saved: false }];
    const result = saveSetFixed(sets);
    expect(result[0].saved).toBe(true);
  });

  it('adds a second set when first set is saved and match is not over', () => {
    const sets: SetState[] = [{ team1: '6', team2: '3', saved: false }];
    const result = saveSetFixed(sets);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ team1: '', team2: '', saved: false });
  });

  it('adds a super tie-break (set 3) when first two sets split 1-1', () => {
    const sets: SetState[] = [
      { team1: '6', team2: '3', saved: true },  // team1 won set 1
      { team1: '3', team2: '6', saved: false }, // team2 about to win set 2
    ];
    const result = saveSetFixed(sets);
    expect(result).toHaveLength(3);
    expect(result[2]).toEqual({ team1: '', team2: '', saved: false });
  });

  it('does NOT add a 4th set after the super tie-break', () => {
    const sets: SetState[] = [
      { team1: '6', team2: '3', saved: true },
      { team1: '3', team2: '6', saved: true },
      { team1: '10', team2: '7', saved: false }, // super tie-break being saved
    ];
    const result = saveSetFixed(sets);
    expect(result).toHaveLength(3);   // still 3, no 4th set added
    expect(result.every(s => s.saved)).toBe(true);
  });

  it('does NOT add a new set when team1 has already won 2-0', () => {
    const sets: SetState[] = [
      { team1: '6', team2: '3', saved: true },
      { team1: '6', team2: '4', saved: false }, // winning set being saved
    ];
    const result = saveSetFixed(sets);
    expect(result).toHaveLength(2);   // match over — no new set
    expect(result.every(s => s.saved)).toBe(true);
  });

  it('does NOT add a new set when team2 has already won 2-0', () => {
    const sets: SetState[] = [
      { team1: '3', team2: '6', saved: true },
      { team1: '4', team2: '6', saved: false },
    ];
    const result = saveSetFixed(sets);
    expect(result).toHaveLength(2);
    expect(result.every(s => s.saved)).toBe(true);
  });

  it('returns the same sets unchanged when there is no unsaved set', () => {
    const sets: SetState[] = [
      { team1: '6', team2: '3', saved: true },
      { team1: '6', team2: '4', saved: true },
    ];
    const result = saveSetFixed(sets);
    expect(result).toHaveLength(2);
    expect(result).toBe(sets); // same reference — nothing changed
  });
});

// ─── Confirm button visibility logic ─────────────────────────────────────────

describe('confirm-result button visibility condition', () => {
  const canConfirm = (sets: SetState[]) =>
    sets.every(s => s.saved) && sets.length >= MATCH_FORMAT.SETS_TO_WIN;

  it('is hidden when only 1 set is saved', () => {
    expect(canConfirm([{ team1: '6', team2: '3', saved: true }])).toBe(false);
  });

  it('is visible when 2 sets are all saved', () => {
    expect(canConfirm([
      { team1: '6', team2: '3', saved: true },
      { team1: '6', team2: '4', saved: true },
    ])).toBe(true);
  });

  it('is hidden when the second set is not yet saved', () => {
    expect(canConfirm([
      { team1: '6', team2: '3', saved: true },
      { team1: '', team2: '', saved: false },
    ])).toBe(false);
  });

  it('is visible after a super tie-break (3 saved sets)', () => {
    expect(canConfirm([
      { team1: '6', team2: '3', saved: true },
      { team1: '3', team2: '6', saved: true },
      { team1: '10', team2: '7', saved: true },
    ])).toBe(true);
  });
});
