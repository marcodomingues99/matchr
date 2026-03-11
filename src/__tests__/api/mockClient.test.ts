import { MockClient } from '../../api/mockClient';
import { mockTournaments, mockMatches } from '../../mock/data';

const client = new MockClient();

describe('MockClient', () => {
  // ── getTournaments ──────────────────────────────────────────────────────

  it('returns all tournaments', async () => {
    const result = await client.getTournaments();
    expect(result).toBe(mockTournaments);
    expect(result.length).toBeGreaterThan(0);
  });

  // ── getTournament ───────────────────────────────────────────────────────

  it('returns a tournament by ID', async () => {
    const result = await client.getTournament('1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('1');
    expect(result!.name).toBe('Open de Padel Lisboa 2026');
  });

  it('returns null for unknown tournament ID', async () => {
    const result = await client.getTournament('nonexistent');
    expect(result).toBeNull();
  });

  // ── getCategory ─────────────────────────────────────────────────────────

  it('returns a category by ID', async () => {
    const result = await client.getCategory('v1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('v1');
    expect(result!.type).toBe('M');
  });

  it('returns category from any tournament', async () => {
    const result = await client.getCategory('v8');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('v8');
    expect(result!.tournamentId).toBe('3');
  });

  it('returns null for unknown category ID', async () => {
    const result = await client.getCategory('nonexistent');
    expect(result).toBeNull();
  });

  // ── getMatchesByCategory ────────────────────────────────────────────────

  it('returns matches for a category with resolved teams', async () => {
    const result = await client.getMatchesByCategory('v1');
    expect(result.length).toBeGreaterThan(0);
    // All matches belong to the category
    result.forEach(m => expect(m.categoryId).toBe('v1'));
    // Teams are resolved
    result.forEach(m => {
      expect(m.team1).toBeDefined();
      expect(m.team1.name).toBeTruthy();
      expect(m.team2).toBeDefined();
      expect(m.team2.name).toBeTruthy();
    });
  });

  it('returns empty array for category with no matches', async () => {
    const result = await client.getMatchesByCategory('v3');
    expect(result).toEqual([]);
  });

  it('returns empty array for unknown category', async () => {
    const result = await client.getMatchesByCategory('nonexistent');
    expect(result).toEqual([]);
  });

  // ── getBracketMatches ───────────────────────────────────────────────────

  it('returns only bracket matches (excludes groups)', async () => {
    const result = await client.getBracketMatches('v11');
    expect(result.length).toBeGreaterThan(0);
    result.forEach(m => {
      expect(m.categoryId).toBe('v11');
      expect(m.phase).not.toBe('groups');
    });
  });

  it('returns empty array when category has only group matches', async () => {
    const result = await client.getBracketMatches('v1');
    expect(result).toEqual([]);
  });

  // ── getMatchesByTournament ──────────────────────────────────────────────

  it('returns all matches across tournament categories', async () => {
    const result = await client.getMatchesByTournament('1');
    expect(result.length).toBeGreaterThan(0);
    // All matches belong to categories of tournament 1
    const t1CategoryIds = new Set(
      mockTournaments.find(t => t.id === '1')!.categories.map(c => c.id),
    );
    result.forEach(m => expect(t1CategoryIds.has(m.categoryId)).toBe(true));
  });

  it('returns empty array for tournament with no matches', async () => {
    const result = await client.getMatchesByTournament('2');
    expect(result).toEqual([]);
  });

  it('returns empty array for unknown tournament', async () => {
    const result = await client.getMatchesByTournament('nonexistent');
    expect(result).toEqual([]);
  });

  // ── getMatch ────────────────────────────────────────────────────────────

  it('returns a single match by ID with resolved teams', async () => {
    const result = await client.getMatch('g1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('g1');
    expect(result!.team1.name).toBe('Os Invencíveis');
    expect(result!.team2.name).toBe('Thunderstruck');
  });

  it('returns null for unknown match ID', async () => {
    const result = await client.getMatch('nonexistent');
    expect(result).toBeNull();
  });

  // ── Mutation stubs ─────────────────────────────────────────────────────

  it('createTournament throws Not implemented', async () => {
    await expect(
      client.createTournament({ name: 'Test', location: 'Test', startDate: '', endDate: '' }),
    ).rejects.toThrow('Not implemented');
  });

  it('updateTournament throws Not implemented', async () => {
    await expect(client.updateTournament('1', { name: 'X' })).rejects.toThrow('Not implemented');
  });

  it('addTeam throws Not implemented', async () => {
    await expect(client.addTeam('v1', { name: 'X', players: [] })).rejects.toThrow('Not implemented');
  });

  it('updateTeam throws Not implemented', async () => {
    await expect(client.updateTeam('t1', { name: 'X' })).rejects.toThrow('Not implemented');
  });

  it('removeTeam throws Not implemented', async () => {
    await expect(client.removeTeam('v1', 't1')).rejects.toThrow('Not implemented');
  });

  it('withdrawTeam throws Not implemented', async () => {
    await expect(client.withdrawTeam('v1', 't1')).rejects.toThrow('Not implemented');
  });

  it('updateCategory throws Not implemented', async () => {
    await expect(client.updateCategory('v1', { courts: 4 })).rejects.toThrow('Not implemented');
  });

  it('updateCategoryStatus throws Not implemented', async () => {
    await expect(client.updateCategoryStatus('v1', 'groups')).rejects.toThrow('Not implemented');
  });

  it('updateMatchSchedule throws Not implemented', async () => {
    await expect(client.updateMatchSchedule('g1', { court: 'C2' })).rejects.toThrow('Not implemented');
  });

  it('updateMatchScore throws Not implemented', async () => {
    await expect(client.updateMatchScore('g1', [])).rejects.toThrow('Not implemented');
  });

  it('finishMatch throws Not implemented', async () => {
    await expect(client.finishMatch('g1', 't1')).rejects.toThrow('Not implemented');
  });
});
