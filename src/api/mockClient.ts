import type {
  Tournament,
  Category,
  CategoryStatus,
  Team,
  Match,
  ResolvedMatch,
  SetScore,
} from '../types';
import type { ApiClient } from './client';
import { mockTournaments, mockMatches, mockTeamMap } from '../mock/data';
import { resolveMatch } from '../utils/resolveMatch';

export class MockClient implements ApiClient {
  /** Returns all tournaments (with categories embedded) */
  async getTournaments(): Promise<Tournament[]> {
    return mockTournaments;
  }

  /** Returns a tournament by ID, or null if not found */
  async getTournament(id: string): Promise<Tournament | null> {
    return mockTournaments.find(t => t.id === id) ?? null;
  }

  /** Returns a category by ID (searching across all tournaments), or null if not found */
  async getCategory(categoryId: string): Promise<Category | null> {
    for (const t of mockTournaments) {
      const cat = t.categories.find(c => c.id === categoryId);
      if (cat) return cat;
    }
    return null;
  }

  /** Returns all matches of a category (all phases), with teams resolved */
  async getMatchesByCategory(categoryId: string): Promise<ResolvedMatch[]> {
    return mockMatches
      .filter(m => m.categoryId === categoryId)
      .map(m => resolveMatch(m, mockTeamMap));
  }

  /** Returns only bracket matches (excludes phase 'groups') of a category, with teams resolved */
  async getBracketMatches(categoryId: string): Promise<ResolvedMatch[]> {
    return mockMatches
      .filter(m => m.categoryId === categoryId && m.phase !== 'groups')
      .map(m => resolveMatch(m, mockTeamMap));
  }

  /** Returns all matches across all categories of a tournament, with teams resolved */
  async getMatchesByTournament(tournamentId: string): Promise<ResolvedMatch[]> {
    const tournament = mockTournaments.find(t => t.id === tournamentId);
    const categoryIds = new Set(tournament?.categories.map(c => c.id) ?? []);
    return mockMatches
      .filter(m => categoryIds.has(m.categoryId))
      .map(m => resolveMatch(m, mockTeamMap));
  }

  /** Returns a single match by ID with teams resolved, or null if not found */
  async getMatch(matchId: string): Promise<ResolvedMatch | null> {
    const match = mockMatches.find(m => m.id === matchId);
    if (!match) return null;
    return resolveMatch(match, mockTeamMap);
  }

  // ── Mutations (stubs — Phase 1) ──────────────────────────────────────────

  async createTournament(_input: Omit<Tournament, 'id' | 'status' | 'categories'>): Promise<Tournament> {
    throw new Error('Not implemented');
  }

  async updateTournament(_id: string, _input: Partial<Omit<Tournament, 'id' | 'categories'>>): Promise<Tournament> {
    throw new Error('Not implemented');
  }

  async addTeam(_categoryId: string, _input: Omit<Team, 'id'>): Promise<Team> {
    throw new Error('Not implemented');
  }

  async updateTeam(_teamId: string, _input: Partial<Omit<Team, 'id'>>): Promise<Team> {
    throw new Error('Not implemented');
  }

  async removeTeam(_categoryId: string, _teamId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async withdrawTeam(_categoryId: string, _teamId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async updateCategory(
    _categoryId: string,
    _input: Partial<Pick<Category, 'courts' | 'qualifiersPerGroup' | 'matchFormat' | 'minTeamsToStart' | 'pointsPerWin'>>,
  ): Promise<Category> {
    throw new Error('Not implemented');
  }

  async updateCategoryStatus(_categoryId: string, _status: CategoryStatus): Promise<Category> {
    throw new Error('Not implemented');
  }

  async updateMatchSchedule(_matchId: string, _input: { court?: string; scheduledAt?: string }): Promise<Match> {
    throw new Error('Not implemented');
  }

  async updateMatchScore(_matchId: string, _sets: SetScore[]): Promise<Match> {
    throw new Error('Not implemented');
  }

  async finishMatch(_matchId: string, _winnerId: string): Promise<Match> {
    throw new Error('Not implemented');
  }

  // ── Suggested methods (to be implemented as needed) ─────────────────────────

  async deleteTournament(_id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async startTournament(_id: string): Promise<Tournament> {
    throw new Error('Not implemented');
  }

  async finishTournament(_id: string): Promise<Tournament> {
    throw new Error('Not implemented');
  }

  async createCategory(
    _tournamentId: string,
    _input: Omit<Category, 'id' | 'teams' | 'status'>,
  ): Promise<Category> {
    throw new Error('Not implemented');
  }

  async deleteCategory(_categoryId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async generateGroups(_categoryId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async importGroupSchedule(_categoryId: string, _file: unknown): Promise<void> {
    throw new Error('Not implemented');
  }

  async generateBracket(_categoryId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async startMatch(_matchId: string): Promise<Match> {
    throw new Error('Not implemented');
  }

  async pauseMatch(_matchId: string): Promise<Match> {
    throw new Error('Not implemented');
  }

  async resumeMatch(_matchId: string): Promise<Match> {
    throw new Error('Not implemented');
  }

  async walkoverMatch(_matchId: string, _winnerId: string): Promise<Match> {
    throw new Error('Not implemented');
  }

  async deleteTeam(_categoryId: string, _teamId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
