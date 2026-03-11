import { Tournament, Match } from '../types';
import { buildTeamMap } from '../utils/resolveMatch';

export const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Open de Padel Lisboa 2026',
    location: 'Clube Restelo',
    startDate: '2026-03-14T00:00:00',
    endDate: '2026-03-16T00:00:00',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
    categories: [
      {
        id: 'v1', tournamentId: '1',
        type: 'M',
        level: 'M5',
        maxTeams: 16,
        courts: 4,
        status: 'groups', qualifiersPerGroup: 2,
        teams: [
          {
            id: 't1', name: 'Os Invencíveis', group: 'A',
            photo: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=200&q=80',
            players: [
              { id: 'p1', name: 'João Silva', phone: '912345678', email: 'joao@email.com' },
              { id: 'p2', name: 'Miguel Costa', phone: '923456789', email: 'miguel@email.com' },
            ]
          },
          {
            id: 't2', name: 'Thunderstruck', group: 'A', players: [
              { id: 'p3', name: 'Rui Ferreira', phone: '934567890' },
              { id: 'p4', name: 'André Santos', phone: '945678901' },
            ]
          },
          {
            id: 't3', name: 'Power Smash', group: 'B', players: [
              { id: 'p5', name: 'Carlos Lopes', phone: '956789012' },
              { id: 'p6', name: 'Pedro Martins', phone: '967890123' },
            ]
          },
          {
            id: 't4', name: 'Slam Kings', group: 'B', players: [
              { id: 'p7', name: 'Rui Santos', phone: '978901234' },
              { id: 'p8', name: 'Pedro Lopes', phone: '989012345' },
            ]
          },
          {
            id: 't5', name: 'Net Hunters', group: 'A', players: [
              { id: 'p9', name: 'Tiago Rocha', phone: '990123456' },
              { id: 'p10', name: 'Hugo Pinto', phone: '901234567' },
            ]
          },
          {
            id: 't6', name: 'Purple Rain', group: 'C', players: [
              { id: 'p11', name: 'Bruno Carvalho', phone: '912345679' },
              { id: 'p12', name: 'Nuno Sousa', phone: '923456780' },
            ]
          },
          {
            id: 't7', name: 'Ace Force', group: 'B', players: [
              { id: 'p13', name: 'Ricardo Alves', phone: '934567891' },
              { id: 'p14', name: 'Vítor Cunha', phone: '945678902' },
            ]
          },
          {
            id: 't8', name: 'Iron Wall', group: 'C', players: [
              { id: 'p15', name: 'Diogo Melo', phone: '956789013' },
              { id: 'p16', name: 'Filipe Dias', phone: '967890124' },
            ]
          },
        ],
      },
      {
        id: 'v2', tournamentId: '1',
        type: 'M',
        level: 'M4',
        maxTeams: 16,
        courts: 2,
        status: 'groups', qualifiersPerGroup: 2,
        teams: [
          { id: 'tm1', name: 'Relâmpago', group: 'A', players: [{ id: 'pm1', name: 'Duarte Mendes' }, { id: 'pm2', name: 'Henrique Vaz' }] },
          { id: 'tm2', name: 'Padel Warriors', group: 'A', players: [{ id: 'pm3', name: 'Tomás Ribeiro' }, { id: 'pm4', name: 'Bernardo Gomes' }] },
          { id: 'tm3', name: 'Full Ace', group: 'A', players: [{ id: 'pm5', name: 'Gustavo Neves' }, { id: 'pm6', name: 'Leonardo Franco' }] },
          { id: 'tm4', name: 'Bandeja Mortal', group: 'B', players: [{ id: 'pm7', name: 'Samuel Pires' }, { id: 'pm8', name: 'Dinis Soares' }] },
          { id: 'tm5', name: 'Contra-Ataque', group: 'B', players: [{ id: 'pm9', name: 'Rodrigo Cardoso' }, { id: 'pm10', name: 'Afonso Moreira' }] },
          { id: 'tm6', name: 'Vibora Kings', group: 'B', players: [{ id: 'pm11', name: 'Martim Oliveira' }, { id: 'pm12', name: 'Lourenço Reis' }] },
          { id: 'tm7', name: 'Smash Bros', group: 'C', players: [{ id: 'pm13', name: 'Francisco Teixeira' }, { id: 'pm14', name: 'Gonçalo Lima' }] },
          { id: 'tm8', name: 'Fundo do Court', group: 'C', players: [{ id: 'pm15', name: 'Vicente Araújo' }, { id: 'pm16', name: 'Salvador Matos' }] },
          { id: 'tm9', name: 'Drop Shot FC', group: 'C', withdrawn: true, players: [{ id: 'pm17', name: 'Carlos Faria' }, { id: 'pm18', name: 'Ricardo Braga' }] },
          { id: 'tm10', name: 'Os Lobinhos', group: 'A', players: [{ id: 'pm19', name: 'Ivo Monteiro' }, { id: 'pm20', name: 'Alexandre Cunha' }] },
        ],
      },
      {
        id: 'v3', tournamentId: '1',
        type: 'F',
        level: 'F4',
        maxTeams: 16,
        courts: 2,
        status: 'groups', qualifiersPerGroup: 2,
        teams: [],
      },
      {
        id: 'v4', tournamentId: '1',
        type: 'MX',
        level: 'MX3',
        maxTeams: 8,
        courts: 2,
        status: 'config',
        teams: [
          { id: 'tc1', name: 'Mix & Match', players: [{ id: 'pc1', name: 'Ricardo Nunes', phone: '911223344' }, { id: 'pc2', name: 'Sara Oliveira', phone: '911223345' }] },
          { id: 'tc2', name: 'Padel Fusion', players: [{ id: 'pc3', name: 'André Vieira', phone: '911223346' }, { id: 'pc4', name: 'Marta Rodrigues', phone: '911223347' }] },
          { id: 'tc3', name: 'Court Breakers', players: [{ id: 'pc5', name: 'Tiago Barros', phone: '911223348' }, { id: 'pc6', name: 'Joana Ferreira', phone: '911223349' }] },
          { id: 'tc4', name: 'Volley Mix', players: [{ id: 'pc7', name: 'Daniel Sousa', phone: '911223350' }, { id: 'pc8', name: 'Inês Cardoso', phone: '911223351' }] },
        ],
      },
      {
        id: 'v11', tournamentId: '1',
        type: 'F',
        level: 'F3',
        maxTeams: 8,
        courts: 2,
        status: 'bracket',
        teams: [
          {
            id: 'tb1', name: 'Estrelas FC', group: 'A', players: [
              { id: 'pb1', name: 'Ana Silva' }, { id: 'pb2', name: 'Beatriz Costa' },
            ]
          },
          {
            id: 'tb2', name: 'Power Ladies', group: 'A', players: [
              { id: 'pb3', name: 'Catarina Lopes' }, { id: 'pb4', name: 'Diana Santos' },
            ]
          },
          {
            id: 'tb3', name: 'Wild Cards', group: 'B', players: [
              { id: 'pb5', name: 'Eva Pereira' }, { id: 'pb6', name: 'Filipa Rocha' },
            ]
          },
          {
            id: 'tb4', name: 'Ace Queens', group: 'B', players: [
              { id: 'pb7', name: 'Gabriela Matos' }, { id: 'pb8', name: 'Helena Pinto' },
            ]
          },
        ],
      },
      {
        id: 'v12', tournamentId: '1',
        type: 'M',
        level: 'M3',
        maxTeams: 8,
        courts: 2,
        status: 'groups', qualifiersPerGroup: 2,
        teams: [
          { id: 'tn1', name: 'Fúria', group: 'A', players: [{ id: 'pn1', name: 'Vasco Gama' }, { id: 'pn2', name: 'Rui Patrício' }] },
          { id: 'tn2', name: 'Top Spin', group: 'A', players: [{ id: 'pn3', name: 'Nélson Semedo' }, { id: 'pn4', name: 'João Félix' }] },
          { id: 'tn3', name: 'Padel Pros', group: 'B', players: [{ id: 'pn5', name: 'Bernardo Silva' }, { id: 'pn6', name: 'Rafael Leão' }] },
          { id: 'tn4', name: 'Court Masters', group: 'B', players: [{ id: 'pn7', name: 'Vitinha Sousa' }, { id: 'pn8', name: 'Gonçalo Ramos' }] },
        ],
      },
      {
        id: 'v13', tournamentId: '1',
        type: 'F',
        level: 'F5',
        maxTeams: 8,
        courts: 2,
        status: 'config',
        teams: [
          { id: 'tf1', name: 'Smash Sisters', players: [{ id: 'pf1', name: 'Mariana Soares' }, { id: 'pf2', name: 'Carolina Pinto' }] },
          { id: 'tf2', name: 'Net Divas', players: [{ id: 'pf3', name: 'Leonor Reis' }, { id: 'pf4', name: 'Matilde Cunha' }] },
          { id: 'tf3', name: 'Bandeja Queens', players: [{ id: 'pf5', name: 'Francisca Lima' }, { id: 'pf6', name: 'Teresa Neves' }] },
        ],
      },
      {
        id: 'v14', tournamentId: '1',
        type: 'MX',
        level: 'MX4',
        maxTeams: 8,
        courts: 2,
        status: 'groups', qualifiersPerGroup: 2,
        teams: [
          { id: 'tx1', name: 'Dupla Dinâmica', group: 'A', players: [{ id: 'px1', name: 'Miguel Veloso' }, { id: 'px2', name: 'Rita Pereira' }] },
          { id: 'tx2', name: 'Padel United', group: 'A', players: [{ id: 'px3', name: 'Fábio Coentrão' }, { id: 'px4', name: 'Cláudia Vieira' }] },
          { id: 'tx3', name: 'Mix Power', group: 'B', players: [{ id: 'px5', name: 'André Gomes' }, { id: 'px6', name: 'Daniela Ruah' }] },
          { id: 'tx4', name: 'Court Royale', group: 'B', players: [{ id: 'px7', name: 'Rúben Neves' }, { id: 'px8', name: 'Sara Sampaio' }] },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Torneio Primavera',
    location: 'Quinta da Marinha',
    startDate: '2026-04-05T00:00:00',
    endDate: '2026-04-05T00:00:00',
    status: 'upcoming',
    photo: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=800&q=80',
    categories: [],
  },
  {
    id: '3',
    name: 'Masters Inverno 2026',
    location: 'Cascais',
    startDate: '2026-01-10T00:00:00',
    endDate: '2026-01-12T00:00:00',
    status: 'finished',
    categories: [
      {
        id: 'v8', tournamentId: '3', type: 'M', level: 'M5', maxTeams: 16, courts: 4, status: 'finished',
        teams: [
          { id: 'fw1', name: 'Os Campeões', group: 'A', players: [{ id: 'fp1', name: 'Ricardo Alves', phone: '911111111' }, { id: 'fp2', name: 'Bruno Dias', phone: '911111112' }] },
          { id: 'fw2', name: 'Padel Force', group: 'A', players: [{ id: 'fp3', name: 'Nuno Reis', phone: '911111113' }, { id: 'fp4', name: 'Marco Vieira', phone: '911111114' }] },
          { id: 'fw3', name: 'Smash Bros', group: 'B', players: [{ id: 'fp5', name: 'Diogo Lopes', phone: '911111115' }, { id: 'fp6', name: 'Filipe Costa', phone: '911111116' }] },
        ],
      },
      {
        id: 'v9', tournamentId: '3', type: 'F', level: 'F4', maxTeams: 8, courts: 2, status: 'finished',
        teams: [
          { id: 'fw4', name: 'Power Girls', group: 'A', players: [{ id: 'fp7', name: 'Ana Santos', phone: '922222221' }, { id: 'fp8', name: 'Marta Silva', phone: '922222222' }] },
          { id: 'fw5', name: 'Net Queens', group: 'A', players: [{ id: 'fp9', name: 'Sofia Rocha', phone: '922222223' }, { id: 'fp10', name: 'Inês Pinto', phone: '922222224' }] },
        ],
      },
      {
        id: 'v10', tournamentId: '3', type: 'MX', level: 'MX3', maxTeams: 8, courts: 2, status: 'finished',
        teams: [
          { id: 'fw6', name: 'Mix Masters', group: 'A', players: [{ id: 'fp11', name: 'Tomás Neves', phone: '933333331' }, { id: 'fp12', name: 'Beatriz Lima', phone: '933333332' }] },
          { id: 'fw7', name: 'Padel Duo', group: 'A', players: [{ id: 'fp13', name: 'Hugo Mendes', phone: '933333333' }, { id: 'fp14', name: 'Clara Ferreira', phone: '933333334' }] },
        ],
      },
    ],
  },
  {
    id: '4',
    name: 'Circuito Setúbal – Último Jogo',
    location: 'Clube Naval Setúbal',
    startDate: '2026-03-02T00:00:00',
    endDate: '2026-03-02T00:00:00',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
    categories: [
      {
        id: 'vfin', tournamentId: '4',
        type: 'M',
        level: 'M4',
        maxTeams: 4,
        courts: 2,
        status: 'groups', qualifiersPerGroup: 2,
        teams: [
          {
            id: 'tz1', name: 'Última Barreira', group: 'Z',
            players: [
              { id: 'pz1', name: 'Luís Figo', phone: '910000001' },
              { id: 'pz2', name: 'Marco Ramos', phone: '910000002' },
            ],
          },
          {
            id: 'tz2', name: 'Ponto Final', group: 'Z',
            players: [
              { id: 'pz3', name: 'Sérgio Montes', phone: '910000003' },
              { id: 'pz4', name: 'Tiago Vaz', phone: '910000004' },
            ],
          },
          {
            id: 'tz3', name: 'Jogo Decisivo', group: 'Z',
            players: [
              { id: 'pz5', name: 'Rui Norte', phone: '910000005' },
              { id: 'pz6', name: 'Paulo Melo', phone: '910000006' },
            ],
          },
        ],
      },
    ],
  },
];

/** Pre-built team lookup from all tournaments */
export const mockTeamMap = buildTeamMap(mockTournaments);

export const mockMatches: Match[] = [
  // ─── Grupo A ───────────────────────────────────────────────────────────────
  {
    id: 'g1', categoryId: 'v1',
    team1Id: 't1', team2Id: 't2',
    court: 'C1', scheduledAt: '2026-03-14T10:00:00',
    phase: 'groups', round: 1,
    sets: [{ team1: 6, team2: 4 }, { team1: 6, team2: 3 }],
    status: 'finished', winnerId: 't1',
  },
  {
    id: 'g2', categoryId: 'v1',
    team1Id: 't1', team2Id: 't5',
    court: 'C2', scheduledAt: '2026-03-14T12:00:00',
    phase: 'groups', round: 2,
    sets: [{ team1: 4, team2: 3 }],
    status: 'live',
  },
  {
    id: 'g3', categoryId: 'v1',
    team1Id: 't2', team2Id: 't1',
    court: 'C3', scheduledAt: '2026-03-14T15:30:00',
    phase: 'groups', round: 3,
    sets: [],
    status: 'scheduled',
  },
  // ─── Grupo B ───────────────────────────────────────────────────────────────
  {
    id: 'g4', categoryId: 'v1',
    team1Id: 't3', team2Id: 't4',
    court: 'C1', scheduledAt: '2026-03-14T11:00:00',
    phase: 'groups', round: 1,
    sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
    status: 'finished', winnerId: 't3',
  },
  {
    id: 'g5', categoryId: 'v1',
    team1Id: 't7', team2Id: 't3',
    court: 'C4', scheduledAt: '2026-03-14T14:00:00',
    phase: 'groups', round: 2,
    sets: [],
    status: 'scheduled',
  },
  // ─── Grupo C ───────────────────────────────────────────────────────────────
  {
    id: 'g6', categoryId: 'v1',
    team1Id: 't6', team2Id: 't8',
    court: 'C3', scheduledAt: '2026-03-14T13:00:00',
    phase: 'groups', round: 1,
    sets: [],
    status: 'scheduled',
  },
  // ─── Grupo Z (Torneio 4 – último jogo) ────────────────────────────────────
  {
    id: 'gz1', categoryId: 'vfin',
    team1Id: 'tz1', team2Id: 'tz2',
    court: 'C1', scheduledAt: '2026-03-02T09:00:00',
    phase: 'groups', round: 1,
    sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
    status: 'finished', winnerId: 'tz1',
  },
  {
    id: 'gz2', categoryId: 'vfin',
    team1Id: 'tz1', team2Id: 'tz3',
    court: 'C2', scheduledAt: '2026-03-02T10:30:00',
    phase: 'groups', round: 2,
    sets: [{ team1: 4, team2: 6 }, { team1: 3, team2: 6 }],
    status: 'finished', winnerId: 'tz3',
  },
  {
    id: 'gz3', categoryId: 'vfin',
    team1Id: 'tz2', team2Id: 'tz3',
    court: 'C1', scheduledAt: '2026-03-02T12:00:00',
    phase: 'groups', round: 3,
    sets: [{ team1: 7, team2: 5 }, { team1: 6, team2: 4 }],
    status: 'finished', winnerId: 'tz2',
  },
  // ─── Groups F3 (v11) ─────────────────────────────────────────────────────
  {
    id: 'gf1', categoryId: 'v11',
    team1Id: 'tb1', team2Id: 'tb2',
    court: 'C2', scheduledAt: '2026-03-14T11:00:00',
    phase: 'groups', round: 1,
    sets: [{ team1: 6, team2: 4 }],
    status: 'paused',
  },
  // ─── Bracket F3 (v11) ─────────────────────────────────────────────────────
  {
    id: 'bf1', categoryId: 'v11',
    team1Id: 'tb1', team2Id: 'tb4',
    court: 'C1', scheduledAt: '2026-03-15T10:00:00',
    phase: 'sf',
    sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
    status: 'finished', winnerId: 'tb1',
  },
  {
    id: 'bf2', categoryId: 'v11',
    team1Id: 'tb2', team2Id: 'tb3',
    court: 'C2', scheduledAt: '2026-03-15T10:00:00',
    phase: 'sf',
    sets: [{ team1: 4, team2: 6 }],
    status: 'live',
  },
  {
    id: 'bf3', categoryId: 'v11',
    team1Id: 'tb1', team2Id: 'tmp-f',
    court: 'C1', scheduledAt: '2026-03-16T14:00:00',
    phase: 'final',
    sets: [],
    status: 'scheduled',
  },
  {
    id: 'bf4', categoryId: 'v11',
    team1Id: 'tb4', team2Id: 'tmp-3',
    court: 'C2', scheduledAt: '2026-03-16T14:00:00',
    phase: '3rd',
    sets: [],
    status: 'scheduled',
  },
];
