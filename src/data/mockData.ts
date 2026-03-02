import { Tournament } from '../types';

export const mockTournaments: Tournament[] = [
  {
    id: 't1',
    name: 'Torneio de Verão 2025',
    date: '2025-07-15',
    location: 'Padel Arena Lisboa',
    surface: 'indoor',
    format: 'groups',
    status: 'active',
    maxTeams: 8,
    createdAt: '2025-06-01',
    teams: [
      { id: 'tm1', name: 'Dupla Alfa', player1: { id: 'p1', name: 'João Silva' }, player2: { id: 'p2', name: 'Miguel Costa' } },
      { id: 'tm2', name: 'Team Beta', player1: { id: 'p3', name: 'Pedro Nunes' }, player2: { id: 'p4', name: 'Rui Alves' } },
      { id: 'tm3', name: 'Os Campeões', player1: { id: 'p5', name: 'Carlos Mendes' }, player2: { id: 'p6', name: 'Tiago Rocha' } },
      { id: 'tm4', name: 'Padel Kings', player1: { id: 'p7', name: 'André Lima' }, player2: { id: 'p8', name: 'Bruno Ferreira' } },
      { id: 'tm5', name: 'Power Pair', player1: { id: 'p9', name: 'Diogo Santos' }, player2: { id: 'p10', name: 'Filipe Gomes' } },
      { id: 'tm6', name: 'Smash Bros', player1: { id: 'p11', name: 'Hugo Martins' }, player2: { id: 'p12', name: 'Ivan Sousa' } },
      { id: 'tm7', name: 'Net Force', player1: { id: 'p13', name: 'Jorge Pinto' }, player2: { id: 'p14', name: 'Luís Pereira' } },
      { id: 'tm8', name: 'Lob Masters', player1: { id: 'p15', name: 'Marco Dias' }, player2: { id: 'p16', name: 'Nuno Carvalho' } },
    ],
    groups: [
      {
        id: 'g1',
        name: 'Grupo A',
        teamIds: ['tm1', 'tm2', 'tm3', 'tm4'],
        games: [
          { id: 'gm1', team1Id: 'tm1', team2Id: 'tm2', groupId: 'g1', status: 'completed', sets: [{ team1: 6, team2: 4 }, { team1: 6, team2: 3 }], winnerId: 'tm1' },
          { id: 'gm2', team1Id: 'tm3', team2Id: 'tm4', groupId: 'g1', status: 'completed', sets: [{ team1: 4, team2: 6 }, { team1: 6, team2: 4 }, { team1: 10, team2: 7 }], winnerId: 'tm4' },
          { id: 'gm3', team1Id: 'tm1', team2Id: 'tm3', groupId: 'g1', status: 'in_progress', sets: [], court: 1 },
          { id: 'gm4', team1Id: 'tm2', team2Id: 'tm4', groupId: 'g1', status: 'scheduled', sets: [] },
          { id: 'gm5', team1Id: 'tm1', team2Id: 'tm4', groupId: 'g1', status: 'scheduled', sets: [] },
          { id: 'gm6', team1Id: 'tm2', team2Id: 'tm3', groupId: 'g1', status: 'scheduled', sets: [] },
        ],
      },
      {
        id: 'g2',
        name: 'Grupo B',
        teamIds: ['tm5', 'tm6', 'tm7', 'tm8'],
        games: [
          { id: 'gm7', team1Id: 'tm5', team2Id: 'tm6', groupId: 'g2', status: 'completed', sets: [{ team1: 7, team2: 5 }, { team1: 6, team2: 4 }], winnerId: 'tm5' },
          { id: 'gm8', team1Id: 'tm7', team2Id: 'tm8', groupId: 'g2', status: 'completed', sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 2 }], winnerId: 'tm7' },
          { id: 'gm9', team1Id: 'tm5', team2Id: 'tm7', groupId: 'g2', status: 'scheduled', sets: [] },
          { id: 'gm10', team1Id: 'tm6', team2Id: 'tm8', groupId: 'g2', status: 'scheduled', sets: [] },
          { id: 'gm11', team1Id: 'tm5', team2Id: 'tm8', groupId: 'g2', status: 'scheduled', sets: [] },
          { id: 'gm12', team1Id: 'tm6', team2Id: 'tm7', groupId: 'g2', status: 'scheduled', sets: [] },
        ],
      },
    ],
  },
  {
    id: 't2',
    name: 'Liga Inverno Cascais',
    date: '2025-08-20',
    location: 'Cascais Padel Club',
    surface: 'outdoor',
    format: 'elimination',
    status: 'draft',
    maxTeams: 16,
    createdAt: '2025-07-10',
    teams: [
      { id: 'tm9', name: 'Eagles', player1: { id: 'p17', name: 'Oscar Lima' }, player2: { id: 'p18', name: 'Paulo Serra' } },
      { id: 'tm10', name: 'Wolves', player1: { id: 'p19', name: 'Quim Batista' }, player2: { id: 'p20', name: 'Ricardo Fonseca' } },
    ],
  },
  {
    id: 't3',
    name: 'Americano Setembro',
    date: '2025-06-01',
    location: 'Sport Club Porto',
    format: 'americano',
    status: 'completed',
    maxTeams: 12,
    createdAt: '2025-05-01',
    teams: [],
  },
];

export const getTournamentById = (id: string): Tournament | undefined =>
  mockTournaments.find(t => t.id === id);

export const getTeamById = (tournament: Tournament, teamId: string) =>
  tournament.teams.find(t => t.id === teamId);

export const getGameById = (tournament: Tournament, gameId: string) =>
  tournament.groups?.flatMap(g => g.games).find(g => g.id === gameId) ??
  tournament.rounds?.flatMap(r => r.games).find(g => g.id === gameId);
