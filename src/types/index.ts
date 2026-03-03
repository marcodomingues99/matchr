export type VertenteType = 'M' | 'F' | 'MX';
export type VertenteLevel = 'M6' | 'M5' | 'M4' | 'M3' | 'M2' | 'M1' | 'F6' | 'F5' | 'F4' | 'F3' | 'F2' | 'F1' | 'MX6' | 'MX5' | 'MX4' | 'MX3' | 'MX2' | 'MX1' | 'Sem';

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
  players: [Player, Player];
  group?: string;
  withdrawn?: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  photo?: string;
  regulamento?: string;
  vertentes: Vertente[];
  status: 'upcoming' | 'active' | 'finished';
}

export interface Vertente {
  id: string;
  type: VertenteType;
  level: VertenteLevel;
  maxTeams: number;
  teams: Team[];
  courts: number;
  status: 'config' | 'groups' | 'bracket' | 'finished';
  qualifiersPerGroup?: number; // how many teams advance from each group (default 2)
}

export interface SetScore {
  team1: number;
  team2: number;
}

export interface Game {
  id: string;
  team1: Team;
  team2: Team;
  court: string;
  date: string;
  time: string;
  phase: 'groups' | 'r16' | 'qf' | 'sf' | 'final' | '3rd';
  round?: number;
  sets?: SetScore[];
  status: 'scheduled' | 'live' | 'paused' | 'finished' | 'walkover';
  winnerId?: string;
}

export type RootStackParamList = {
  Home: undefined;
  CreateTournament: undefined;
  EditTournament: { tournamentId: string };
  TournamentDetail: { tournamentId: string };
  UpcomingTournament: { tournamentId: string };
  ConfigureVertente: { tournamentId: string; vertenteIndex: number; isLast: boolean; pendingVertentes?: string };
  VertenteHub: { tournamentId: string; vertenteId: string };
  AddTeam: { tournamentId: string; vertenteId: string; teamId?: string };
  EditTeam: { tournamentId: string; vertenteId: string; teamId: string };
  TeamList: { tournamentId: string; vertenteId: string };
  WithdrawConfirm: { tournamentId: string; vertenteId: string; teamId: string };
  GroupsEmpty: { tournamentId: string; vertenteId: string };
  GroupsTable: { tournamentId: string; vertenteId: string };
  GroupsGames: { tournamentId: string; vertenteId: string };
  Bracket: { tournamentId: string; vertenteId: string };
  EditGame: { tournamentId: string; vertenteId: string; gameId: string };
  EnterResult: { tournamentId: string; vertenteId: string; gameId: string };
  GamePaused: { tournamentId: string; vertenteId: string; gameId: string };
  ConfirmClose: { tournamentId: string; vertenteId: string; gameId: string };
  ConfirmCloseTournament: { tournamentId: string; vertenteId: string };
  Podium: { tournamentId: string; vertenteId: string };
  Export: { tournamentId: string; vertenteId: string };
  FinishedTournament: { tournamentId: string };
};
