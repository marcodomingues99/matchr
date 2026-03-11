export type CategoryType = 'M' | 'F' | 'MX';
export type CategoryLevel = `${CategoryType}${1 | 2 | 3 | 4 | 5 | 6}` | 'Sem';

export type TournamentStatus = 'upcoming' | 'active' | 'finished';
/** Derived from CATEGORY_STATUS in utils/constants.ts — keep in sync */
export type CategoryStatus = 'config' | 'groups' | 'bracket' | 'finished';
/** Derived from MATCH_STATUS in utils/constants.ts — keep in sync */
export type MatchStatus = 'scheduled' | 'live' | 'paused' | 'finished' | 'walkover';
export type MatchPhase = 'groups' | 'r16' | 'qf' | 'sf' | 'final' | '3rd';
export type BracketRound = Exclude<MatchPhase, 'groups'>;

export interface Player {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface Team {
  id: string;
  name: string;
  photo?: string;
  players: Player[];
  group?: string;
  withdrawn?: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  /** ISO 8601 local datetime — e.g. '2026-03-14T00:00:00' */
  startDate: string;
  /** ISO 8601 local datetime — e.g. '2026-03-16T00:00:00' */
  endDate: string;
  photo?: string;
  rulesUrl?: string;
  categories: Category[];
  status: TournamentStatus;
}

export interface MatchFormat {
  maxSets: number;
  setsToWin: number;
  superTieBreakIndex: number;
}

export interface Category {
  id: string;
  tournamentId: string;
  type: CategoryType;
  level: CategoryLevel;
  maxTeams: number;
  teams: Team[];
  courts: number;
  status: CategoryStatus;
  qualifiersPerGroup?: number; // how many teams advance from each group (default 2)
  minTeamsToStart?: number;
  pointsPerWin?: number;
  matchFormat?: MatchFormat;
}

export interface TeamStats {
  wins: number;
  losses: number;
  played: number;
  pts: number;
  setsWon: number;
  setsLost: number;
}

/** Games won by each side within a single set — positional (follows Match.team1Id / team2Id) */
export interface SetScore {
  team1: number;
  team2: number;
}

export interface Match {
  id: string;
  categoryId: string;
  team1Id: string;
  team2Id: string;
  court: string;
  /** ISO 8601 local datetime — e.g. '2026-03-14T10:00:00' */
  scheduledAt: string;
  phase: MatchPhase;
  round?: number;
  sets: SetScore[];
  status: MatchStatus;
  winnerId?: string;
}

/** Match with resolved Team objects — used by UI components */
export interface ResolvedMatch extends Match {
  team1: Team;
  team2: Team;
}

type TournamentParams = { tournamentId: string };
type CategoryParams = TournamentParams & { categoryId: string };
type MatchParams = CategoryParams & { matchId: string };

export type RootStackParamList = {
  Home: undefined;
  CreateTournament: undefined;
  EditTournament: TournamentParams;
  TournamentDetail: TournamentParams;
  UpcomingTournament: TournamentParams;
  ConfigureCategory: TournamentParams & { categoryIndex: number; isLast: boolean; pendingCategories?: { type: CategoryType; level: string }[] };
  CategoryHub: CategoryParams;
  ManageTeam: CategoryParams & { teamId?: string };
  EditTeam: CategoryParams & { teamId: string };
  TeamList: CategoryParams;
  WithdrawConfirm: CategoryParams & { teamId: string };
  GroupsEmpty: CategoryParams;
  GroupsTable: CategoryParams;
  GroupsGames: CategoryParams;
  Knockout: CategoryParams;
  EditMatch: MatchParams;
  EnterResult: MatchParams;
  MatchPaused: MatchParams;
  ConfirmCloseMatch: MatchParams;
  ConfirmCloseCategory: CategoryParams;
  Podium: CategoryParams;
  Export: CategoryParams;
  FinishedTournament: TournamentParams;
};
