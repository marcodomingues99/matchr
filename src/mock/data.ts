import { Tournament, Game } from '../types';

export const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Open de Padel Lisboa 2026',
    location: 'Clube Restelo',
    startDate: '14 Mar 2026',
    endDate: '16 Mar 2026',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
    vertentes: [
      {
        id: 'v1',
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
        id: 'v2',
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
        id: 'v3',
        type: 'F',
        level: 'F4',
        maxTeams: 16,
        courts: 2,
        status: 'groups', qualifiersPerGroup: 2,
        teams: [],
      },
      {
        id: 'v4',
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
        id: 'v11',
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
    ],
  },
  {
    id: '2',
    name: 'Torneio Primavera',
    location: 'Quinta da Marinha',
    startDate: '5 Abr 2026',
    endDate: '5 Abr 2026',
    status: 'upcoming',
    photo: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=800&q=80',
    vertentes: [],
  },
  {
    id: '3',
    name: 'Masters Inverno 2026',
    location: 'Cascais',
    startDate: '10 Jan 2026',
    endDate: '12 Jan 2026',
    status: 'finished',
    vertentes: [
      {
        id: 'v8', type: 'M', level: 'M5', maxTeams: 16, courts: 4, status: 'finished',
        teams: [
          { id: 'fw1', name: 'Os Campeões', group: 'A', players: [{ id: 'fp1', name: 'Ricardo Alves', phone: '911111111' }, { id: 'fp2', name: 'Bruno Dias', phone: '911111112' }] },
          { id: 'fw2', name: 'Padel Force', group: 'A', players: [{ id: 'fp3', name: 'Nuno Reis', phone: '911111113' }, { id: 'fp4', name: 'Marco Vieira', phone: '911111114' }] },
          { id: 'fw3', name: 'Smash Bros', group: 'B', players: [{ id: 'fp5', name: 'Diogo Lopes', phone: '911111115' }, { id: 'fp6', name: 'Filipe Costa', phone: '911111116' }] },
        ],
      },
      {
        id: 'v9', type: 'F', level: 'F4', maxTeams: 8, courts: 2, status: 'finished',
        teams: [
          { id: 'fw4', name: 'Power Girls', group: 'A', players: [{ id: 'fp7', name: 'Ana Santos', phone: '922222221' }, { id: 'fp8', name: 'Marta Silva', phone: '922222222' }] },
          { id: 'fw5', name: 'Net Queens', group: 'A', players: [{ id: 'fp9', name: 'Sofia Rocha', phone: '922222223' }, { id: 'fp10', name: 'Inês Pinto', phone: '922222224' }] },
        ],
      },
      {
        id: 'v10', type: 'MX', level: 'MX3', maxTeams: 8, courts: 2, status: 'finished',
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
    startDate: '2 Mar 2026',
    endDate: '2 Mar 2026',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80',
    vertentes: [
      {
        id: 'vfin',
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

export const mockGames: Game[] = [
  // ─── Grupo A ───────────────────────────────────────────────────────────────
  // t1 «Os Invencíveis»: 3 jogos propositais para demo da sheet
  {
    id: 'g1',
    team1: {
      id: 't1', name: 'Os Invencíveis', group: 'A',
      photo: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=200&q=80',
      players: [
        { id: 'p1', name: 'João Silva' }, { id: 'p2', name: 'Miguel Costa' },
      ]
    },
    team2: {
      id: 't2', name: 'Thunderstruck', group: 'A', players: [
        { id: 'p3', name: 'Rui Ferreira' }, { id: 'p4', name: 'André Santos' },
      ]
    },
    court: 'C1', date: '14 Mar', time: '10:00',
    phase: 'groups', round: 1,
    sets: [{ team1: 6, team2: 4 }, { team1: 6, team2: 3 }],
    status: 'finished', winnerId: 't1',
  },
  {
    id: 'g2',
    team1: {
      id: 't1', name: 'Os Invencíveis', group: 'A',
      photo: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=200&q=80',
      players: [
        { id: 'p1', name: 'João Silva' }, { id: 'p2', name: 'Miguel Costa' },
      ]
    },
    team2: {
      id: 't5', name: 'Net Hunters', group: 'A', players: [
        { id: 'p9', name: 'Tiago Rocha' }, { id: 'p10', name: 'Hugo Pinto' },
      ]
    },
    court: 'C2', date: '14 Mar', time: '12:00',
    phase: 'groups', round: 2,
    sets: [{ team1: 4, team2: 3 }],
    status: 'live',
  },
  {
    id: 'g3',
    team1: {
      id: 't2', name: 'Thunderstruck', group: 'A', players: [
        { id: 'p3', name: 'Rui Ferreira' }, { id: 'p4', name: 'André Santos' },
      ]
    },
    team2: {
      id: 't1', name: 'Os Invencíveis', group: 'A',
      photo: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=200&q=80',
      players: [
        { id: 'p1', name: 'João Silva' }, { id: 'p2', name: 'Miguel Costa' },
      ]
    },
    court: 'C3', date: '14 Mar', time: '15:30',
    phase: 'groups', round: 3,
    status: 'scheduled',
  },
  // ─── Grupo B ───────────────────────────────────────────────────────────────
  {
    id: 'g4',
    team1: {
      id: 't3', name: 'Power Smash', group: 'B', players: [
        { id: 'p5', name: 'Carlos Lopes' }, { id: 'p6', name: 'Pedro Martins' },
      ]
    },
    team2: {
      id: 't4', name: 'Slam Kings', group: 'B', players: [
        { id: 'p7', name: 'Rui Santos' }, { id: 'p8', name: 'Pedro Lopes' },
      ]
    },
    court: 'C1', date: '14 Mar', time: '11:00',
    phase: 'groups', round: 1,
    sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
    status: 'finished', winnerId: 't3',
  },
  {
    id: 'g5',
    team1: {
      id: 't7', name: 'Ace Force', group: 'B', players: [
        { id: 'p13', name: 'Ricardo Alves' }, { id: 'p14', name: 'Vítor Cunha' },
      ]
    },
    team2: {
      id: 't3', name: 'Power Smash', group: 'B', players: [
        { id: 'p5', name: 'Carlos Lopes' }, { id: 'p6', name: 'Pedro Martins' },
      ]
    },
    court: 'C4', date: '14 Mar', time: '14:00',
    phase: 'groups', round: 2,
    status: 'scheduled',
  },
  // ─── Grupo C ───────────────────────────────────────────────────────────────
  {
    id: 'g6',
    team1: {
      id: 't6', name: 'Purple Rain', group: 'C', players: [
        { id: 'p11', name: 'Bruno Carvalho' }, { id: 'p12', name: 'Nuno Sousa' },
      ]
    },
    team2: {
      id: 't8', name: 'Iron Wall', group: 'C', players: [
        { id: 'p15', name: 'Diogo Melo' }, { id: 'p16', name: 'Filipe Dias' },
      ]
    },
    court: 'C3', date: '14 Mar', time: '13:00',
    phase: 'groups', round: 1,
    status: 'scheduled',
  },
  // ─── Grupo Z (Torneio 4 – último jogo) ────────────────────────────────────
  {
    id: 'gz1',
    team1: { id: 'tz1', name: 'Última Barreira', group: 'Z', players: [{ id: 'pz1', name: 'Luís Figo' }, { id: 'pz2', name: 'Marco Ramos' }] },
    team2: { id: 'tz2', name: 'Ponto Final', group: 'Z', players: [{ id: 'pz3', name: 'Sérgio Montes' }, { id: 'pz4', name: 'Tiago Vaz' }] },
    court: 'C1', date: '2 Mar', time: '09:00',
    phase: 'groups', round: 1,
    sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
    status: 'finished', winnerId: 'tz1',
  },
  {
    id: 'gz2',
    team1: { id: 'tz1', name: 'Última Barreira', group: 'Z', players: [{ id: 'pz1', name: 'Luís Figo' }, { id: 'pz2', name: 'Marco Ramos' }] },
    team2: { id: 'tz3', name: 'Jogo Decisivo', group: 'Z', players: [{ id: 'pz5', name: 'Rui Norte' }, { id: 'pz6', name: 'Paulo Melo' }] },
    court: 'C2', date: '2 Mar', time: '10:30',
    phase: 'groups', round: 2,
    sets: [{ team1: 4, team2: 6 }, { team1: 3, team2: 6 }],
    status: 'finished', winnerId: 'tz3',
  },
  {
    id: 'gz3',
    team1: { id: 'tz2', name: 'Ponto Final', group: 'Z', players: [{ id: 'pz3', name: 'Sérgio Montes' }, { id: 'pz4', name: 'Tiago Vaz' }] },
    team2: { id: 'tz3', name: 'Jogo Decisivo', group: 'Z', players: [{ id: 'pz5', name: 'Rui Norte' }, { id: 'pz6', name: 'Paulo Melo' }] },
    court: 'C1', date: '2 Mar', time: '12:00',
    phase: 'groups', round: 3,
    sets: [{ team1: 7, team2: 5 }, { team1: 6, team2: 4 }],
    status: 'finished', winnerId: 'tz2',
  },
  // ─── Bracket F3 ────────────────────────────────────────────────────────────
  {
    id: 'gf1',
    team1: {
      id: 'tb1', name: 'Estrelas FC', group: 'A', players: [
        { id: 'pb1', name: 'Ana Silva' }, { id: 'pb2', name: 'Beatriz Costa' },
      ]
    },
    team2: {
      id: 'tb2', name: 'Power Ladies', group: 'A', players: [
        { id: 'pb3', name: 'Catarina Lopes' }, { id: 'pb4', name: 'Diana Santos' },
      ]
    },
    court: 'C2', date: '14 Mar', time: '11:00',
    phase: 'groups', round: 1,
    sets: [{ team1: 6, team2: 4 }],
    status: 'paused',
  },
  // ─── Bracket F3 (v11) ─────────────────────────────────────────────────────
  {
    id: 'bf1',
    team1: { id: 'tb1', name: 'Estrelas FC', group: 'A', players: [{ id: 'pb1', name: 'Ana Silva' }, { id: 'pb2', name: 'Beatriz Costa' }] },
    team2: { id: 'tb4', name: 'Ace Queens', group: 'B', players: [{ id: 'pb7', name: 'Gabriela Matos' }, { id: 'pb8', name: 'Helena Pinto' }] },
    court: 'C1', date: '15 Mar', time: '10:00',
    phase: 'sf',
    sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
    status: 'finished', winnerId: 'tb1',
  },
  {
    id: 'bf2',
    team1: { id: 'tb2', name: 'Power Ladies', group: 'A', players: [{ id: 'pb3', name: 'Catarina Lopes' }, { id: 'pb4', name: 'Diana Santos' }] },
    team2: { id: 'tb3', name: 'Wild Cards', group: 'B', players: [{ id: 'pb5', name: 'Eva Pereira' }, { id: 'pb6', name: 'Filipa Rocha' }] },
    court: 'C2', date: '15 Mar', time: '10:00',
    phase: 'sf',
    sets: [{ team1: 4, team2: 6 }],
    status: 'live',
  },
  {
    id: 'bf3',
    team1: { id: 'tb1', name: 'Estrelas FC', group: 'A', players: [{ id: 'pb1', name: 'Ana Silva' }, { id: 'pb2', name: 'Beatriz Costa' }] },
    team2: { id: 'tmp-f', name: '?', players: [{ id: 'x1', name: '' }, { id: 'x2', name: '' }] },
    court: 'C1', date: '16 Mar', time: '14:00',
    phase: 'final',
    status: 'scheduled',
  },
  {
    id: 'bf4',
    team1: { id: 'tb4', name: 'Ace Queens', group: 'B', players: [{ id: 'pb7', name: 'Gabriela Matos' }, { id: 'pb8', name: 'Helena Pinto' }] },
    team2: { id: 'tmp-3', name: '?', players: [{ id: 'x3', name: '' }, { id: 'x4', name: '' }] },
    court: 'C2', date: '16 Mar', time: '14:00',
    phase: '3rd',
    status: 'scheduled',
  },
];
