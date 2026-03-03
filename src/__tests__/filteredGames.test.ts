/**
 * Tests for the game-filtering logic used in GroupsTableScreen.
 *
 * The screen uses:
 *   mockGames.filter(g => g.team1.group === activeGroup || g.team2.group === activeGroup)
 *
 * BUG: This only filters by group name, not by vertente or tournament.
 * Teams in different vertentes that share a group letter (e.g. both have group='A')
 * will have their games mixed together in the view.
 */

import { mockGames, mockTournaments } from '../mock/data';
import { Game } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Current (buggy) filter used by GroupsTableScreen */
function filterByGroup(games: Game[], group: string): Game[] {
  return games.filter(g => g.team1.group === group || g.team2.group === group);
}

/** Corrected filter: also require the game's teams to belong to the given vertente */
function filterByGroupAndVertente(
  games: Game[],
  group: string,
  vertenteTeamIds: Set<string>,
): Game[] {
  return games.filter(
    g =>
      vertenteTeamIds.has(g.team1.id) &&
      vertenteTeamIds.has(g.team2.id) &&
      (g.team1.group === group || g.team2.group === group),
  );
}

// ─────────────────────────────────────────────────────────────────────────────

describe('GroupsTableScreen filteredGames — cross-vertente bug', () => {
  // Vertente v1 (Masc M5, tournament 1): teams t1–t8, groups A/B/C
  // Vertente v11 (Fem F3, tournament 1): teams tb1–tb4, groups A/B
  // Both have teams with group='A', so filtering by group='A' alone
  // returns games from BOTH vertentes.

  const v1TeamIds = new Set(
    mockTournaments[0].vertentes
      .find(v => v.id === 'v1')!
      .teams.map(t => t.id),
  );

  it('BUG: group-only filter returns games from other vertentes', () => {
    // gf1 is the bracket game for F3 (v11), with teams tb1 (group A) and tb2 (group A).
    // When viewing Group A of v1, gf1 should NOT appear.
    const groupAGames = filterByGroup(mockGames, 'A');
    const gf1 = groupAGames.find(g => g.id === 'gf1');
    expect(gf1).toBeDefined(); // BUG: F3 game leaks into M5 Group A view
  });

  it('corrected filter excludes games from other vertentes', () => {
    const groupAGames = filterByGroupAndVertente(mockGames, 'A', v1TeamIds);
    const gf1 = groupAGames.find(g => g.id === 'gf1');
    expect(gf1).toBeUndefined(); // correctly excluded
  });

  it('corrected filter still includes the v1 Group A games', () => {
    const groupAGames = filterByGroupAndVertente(mockGames, 'A', v1TeamIds);
    // g1 (t1 vs t2, both group A, v1) should be included
    expect(groupAGames.find(g => g.id === 'g1')).toBeDefined();
    // g2 (t1 vs t5, both group A, v1) should be included
    expect(groupAGames.find(g => g.id === 'g2')).toBeDefined();
  });

  it('corrected filter excludes Group B games when viewing Group A', () => {
    const groupAGames = filterByGroupAndVertente(mockGames, 'A', v1TeamIds);
    // g4 is t3 vs t4 — both Group B — should not appear in Group A view
    expect(groupAGames.find(g => g.id === 'g4')).toBeUndefined();
  });
});

// ─── duplicate-name check skipped in edit mode (AddTeamScreen) ───────────────

describe('AddTeamScreen — duplicate name check during edit', () => {
  /**
   * Current logic:
   *   const isDuplicateName = !isEditing && vertente.teams.some(...)
   *
   * BUG: when isEditing=true the check is completely bypassed, so a team can
   * be renamed to match an existing team's name.
   */

  function isDuplicateNameBuggy(
    isEditing: boolean,
    teamName: string,
    existingTeams: { id: string; name: string }[],
    editTeamId?: string,
  ): boolean {
    return (
      !isEditing &&
      existingTeams.some(
        t => t.name.trim().toLowerCase() === teamName.trim().toLowerCase(),
      )
    );
  }

  function isDuplicateNameFixed(
    isEditing: boolean,
    teamName: string,
    existingTeams: { id: string; name: string }[],
    editTeamId?: string,
  ): boolean {
    return existingTeams.some(
      t =>
        t.id !== editTeamId && // exclude the team being edited
        t.name.trim().toLowerCase() === teamName.trim().toLowerCase(),
    );
  }

  const teams = [
    { id: 't1', name: 'Os Invencíveis' },
    { id: 't2', name: 'Thunderstruck' },
  ];

  it('BUG: editing mode skips duplicate check — rename to existing name is allowed', () => {
    // Renaming t2 to "Os Invencíveis" (same as t1) should be rejected, but isn't
    const isDup = isDuplicateNameBuggy(true, 'Os Invencíveis', teams, 't2');
    expect(isDup).toBe(false); // BUG: no collision detected while editing
  });

  it('fixed version detects duplicate even in edit mode', () => {
    const isDup = isDuplicateNameFixed(true, 'Os Invencíveis', teams, 't2');
    expect(isDup).toBe(true); // correctly blocked
  });

  it('fixed version allows keeping the same name when editing (not a duplicate of itself)', () => {
    // t1 is editing its own name — should not flag as duplicate
    const isDup = isDuplicateNameFixed(true, 'Os Invencíveis', teams, 't1');
    expect(isDup).toBe(false);
  });

  it('add mode (not editing) correctly blocks duplicates', () => {
    const isDup = isDuplicateNameBuggy(false, 'Thunderstruck', teams);
    expect(isDup).toBe(true);
  });

  it('add mode allows new unique names', () => {
    const isDup = isDuplicateNameBuggy(false, 'Power Smash', teams);
    expect(isDup).toBe(false);
  });
});
