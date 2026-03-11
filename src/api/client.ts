import type {
  Tournament,
  Category,
  CategoryStatus,
  Team,
  Match,
  ResolvedMatch,
  SetScore,
  MatchFormat,
} from '../types';
import { MockClient } from './mockClient';

export interface ApiClient {
  /** Returns all tournaments (with categories embedded) */
  getTournaments(): Promise<Tournament[]>;

  /** Returns a tournament by ID, or null if not found */
  getTournament(id: string): Promise<Tournament | null>;

  /** Returns a category by ID (searching across all tournaments), or null if not found */
  getCategory(categoryId: string): Promise<Category | null>;

  /** Returns all matches of a category (all phases), with teams resolved */
  getMatchesByCategory(categoryId: string): Promise<ResolvedMatch[]>;

  /** Returns only bracket matches (excludes phase 'groups') of a category, with teams resolved */
  getBracketMatches(categoryId: string): Promise<ResolvedMatch[]>;

  /** Returns all matches across all categories of a tournament, with teams resolved */
  getMatchesByTournament(tournamentId: string): Promise<ResolvedMatch[]>;

  /** Returns a single match by ID with teams resolved, or null if not found */
  getMatch(matchId: string): Promise<ResolvedMatch | null>;

  // ── Mutations (stubs — Phase 1) ──────────────────────────────────────────

  /** Creates a new tournament. Returns the created tournament with generated ID */
  createTournament(input: Omit<Tournament, 'id' | 'status' | 'categories'>): Promise<Tournament>;

  /** Updates editable fields of a tournament. Returns the updated tournament */
  updateTournament(id: string, input: Partial<Omit<Tournament, 'id' | 'categories'>>): Promise<Tournament>;

  /** Adds a team to a category. Returns the created team with generated ID */
  addTeam(categoryId: string, input: Omit<Team, 'id'>): Promise<Team>;

  /** Updates editable fields of a team. Returns the updated team */
  updateTeam(teamId: string, input: Partial<Omit<Team, 'id'>>): Promise<Team>;

  /** Removes a team from a category entirely */
  removeTeam(categoryId: string, teamId: string): Promise<void>;

  /** Marks a team as withdrawn from a category */
  withdrawTeam(categoryId: string, teamId: string): Promise<void>;

  /** Updates configurable fields of a category (courts, qualifiers, match format, etc.) */
  updateCategory(
    categoryId: string,
    input: Partial<Pick<Category, 'courts' | 'qualifiersPerGroup' | 'matchFormat' | 'minTeamsToStart' | 'pointsPerWin'>>,
  ): Promise<Category>;

  /** Updates the status of a category (config → groups → bracket → finished) */
  updateCategoryStatus(categoryId: string, status: CategoryStatus): Promise<Category>;

  /** Updates the court and/or scheduled time of a match */
  updateMatchSchedule(matchId: string, input: { court?: string; scheduledAt?: string }): Promise<Match>;

  /** Updates the set scores of a match */
  updateMatchScore(matchId: string, sets: SetScore[]): Promise<Match>;

  /** Finishes a match, setting the winner */
  finishMatch(matchId: string, winnerId: string): Promise<Match>;

  // ── Suggested methods (to be implemented as needed) ─────────────────────────
  //
  // These are methods that the app will likely need based on existing UI flows
  // and TODOs found across screens. Implement when ready.

  // -- Tournament lifecycle --

  /** Permanently deletes a tournament and all its categories/matches */
  deleteTournament(id: string): Promise<void>;

  /** Transitions a tournament from 'upcoming' to 'active' */
  startTournament(id: string): Promise<Tournament>;

  /** Transitions a tournament from 'active' to 'finished' */
  finishTournament(id: string): Promise<Tournament>;

  // -- Category CRUD --

  /** Creates a new category inside a tournament. Returns the created category with generated ID */
  createCategory(tournamentId: string, input: Omit<Category, 'id' | 'teams' | 'status'>): Promise<Category>;

  /** Permanently deletes a category and all its matches */
  deleteCategory(categoryId: string): Promise<void>;

  // -- Groups phase --

  /** Auto-generates group assignments and group-phase matches for a category */
  generateGroups(categoryId: string): Promise<void>;

  /** Imports a group schedule from an external file (e.g. Excel) */
  importGroupSchedule(categoryId: string, file: unknown): Promise<void>;

  // -- Bracket phase --

  /** Generates bracket matches based on group results (qualifiers advance) */
  generateBracket(categoryId: string): Promise<void>;

  // -- Match lifecycle --

  /** Transitions a match from 'scheduled' to 'live' */
  startMatch(matchId: string): Promise<Match>;

  /** Pauses a live match, setting status to 'paused' */
  pauseMatch(matchId: string): Promise<Match>;

  /** Resumes a paused match, setting status back to 'live' */
  resumeMatch(matchId: string): Promise<Match>;

  /** Finishes a match as walkover — sets winner without scores */
  walkoverMatch(matchId: string, winnerId: string): Promise<Match>;

  // -- Team management --

  /** Permanently deletes a team from a category (only allowed during 'config' status) */
  deleteTeam(categoryId: string, teamId: string): Promise<void>;
}

export const api: ApiClient = new MockClient();
