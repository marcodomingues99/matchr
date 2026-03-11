/**
 * Tests for the match-filtering logic used in GroupsTableScreen.
 *
 * The screen uses:
 *   mockMatches.filter(g => g.team1.group === activeGroup || g.team2.group === activeGroup)
 *
 * BUG: This only filters by group name, not by category or tournament.
 * Teams in different categories that share a group letter (e.g. both have group='A')
 * will have their matches mixed together in the view.
 */

import { mockMatches, mockTournaments, mockTeamMap } from '../mock/data';
import { ResolvedMatch } from '../types';
import { resolveMatches } from '../utils/resolveMatch';

// ── Resolve matches once so we can access team1.group / team2.group ─────────

const resolvedMockMatches = resolveMatches(mockMatches, mockTeamMap);

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Current (buggy) filter used by GroupsTableScreen */
function filterByGroup(matches: ResolvedMatch[], group: string): ResolvedMatch[] {
  return matches.filter(g => g.team1.group === group || g.team2.group === group);
}

/** Corrected filter: also require the match's teams to belong to the given category */
function filterByGroupAndCategory(
  matches: ResolvedMatch[],
  group: string,
  categoryTeamIds: Set<string>,
): ResolvedMatch[] {
  return matches.filter(
    g =>
      categoryTeamIds.has(g.team1Id) &&
      categoryTeamIds.has(g.team2Id) &&
      (g.team1.group === group || g.team2.group === group),
  );
}

// ─────────────────────────────────────────────────────────────────────────────

describe('GroupsTableScreen filteredMatches — cross-category bug', () => {
  // Category v1 (Masc M5, tournament 1): teams t1–t8, groups A/B/C
  // Category v11 (Fem F3, tournament 1): teams tb1–tb4, groups A/B
  // Both have teams with group='A', so filtering by group='A' alone
  // returns matches from BOTH categories.

  const v1TeamIds = new Set(
    mockTournaments[0].categories
      .find(v => v.id === 'v1')!
      .teams.map(t => t.id),
  );

  it('BUG: group-only filter returns matches from other categories', () => {
    // gf1 is the bracket match for F3 (v11), with teams tb1 (group A) and tb2 (group A).
    // When viewing Group A of v1, gf1 should NOT appear.
    const groupAMatches = filterByGroup(resolvedMockMatches, 'A');
    const gf1 = groupAMatches.find(g => g.id === 'gf1');
    expect(gf1).toBeDefined(); // BUG: F3 match leaks into M5 Group A view
  });

  it('corrected filter excludes matches from other categories', () => {
    const groupAMatches = filterByGroupAndCategory(resolvedMockMatches, 'A', v1TeamIds);
    const gf1 = groupAMatches.find(g => g.id === 'gf1');
    expect(gf1).toBeUndefined(); // correctly excluded
  });

  it('corrected filter still includes the v1 Group A matches', () => {
    const groupAMatches = filterByGroupAndCategory(resolvedMockMatches, 'A', v1TeamIds);
    // g1 (t1 vs t2, both group A, v1) should be included
    expect(groupAMatches.find(g => g.id === 'g1')).toBeDefined();
    // g2 (t1 vs t5, both group A, v1) should be included
    expect(groupAMatches.find(g => g.id === 'g2')).toBeDefined();
  });

  it('corrected filter excludes Group B matches when viewing Group A', () => {
    const groupAMatches = filterByGroupAndCategory(resolvedMockMatches, 'A', v1TeamIds);
    // g4 is t3 vs t4 — both Group B — should not appear in Group A view
    expect(groupAMatches.find(g => g.id === 'g4')).toBeUndefined();
  });
});

// ─── duplicate-name check skipped in edit mode (ManageTeamScreen) ────────────

describe('ManageTeamScreen — duplicate name check during edit', () => {
  /**
   * Current logic:
   *   const isDuplicateName = !isEditing && category.teams.some(...)
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
