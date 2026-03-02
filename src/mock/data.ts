import { Tournament, Game } from '../types';

export const mockTournaments: Tournament[] = [
  // ── TORNEIO 1 — ACTIVE (a decorrer) ──────────────────────────────
  {
    id: '1',
    name: 'Open de Padel Lisboa 2026',
    location: 'Clube Restelo',
    startDate: '14 Mar 2026',
    endDate: '16 Mar 2026',
    status: 'active',
    vertentes: [
      // v1 — fase de grupos (já existia)
      {
        id: 'v1',
        type: 'M',
        level: 'M5',
        maxTeams: 16,
        courts: 4,
        status: 'groups',
        teams: [
          { id: 't1', name: 'Os Invencíveis', group: 'A', players: [
            { id: 'p1', name: 'João Silva', phone: '912345678', email: 'joao@email.com' },
            { id: 'p2', name: 'Miguel Costa', phone: '923456789', email: 'miguel@email.com' },
          ]},
          { id: 't2', name: 'Thunderstruck', group: 'A', players: [
            { id: 'p3', name: 'Rui Ferreira', phone: '934567890' },
            { id: 'p4', name: 'André Santos', phone: '945678901' },
          ]},
          { id: 't3', name: 'Power Smash', group: 'B', players: [
            { id: 'p5', name: 'Carlos Lopes', phone: '956789012' },
            { id: 'p6', name: 'Pedro Martins', phone: '967890123' },
          ]},
          { id: 't4', name: 'Slam Kings', group: 'B', players: [
            { id: 'p7', name: 'Rui Santos', phone: '978901234' },
            { id: 'p8', name: 'Pedro Lopes', phone: '989012345' },
          ]},
          { id: 't5', name: 'Net Hunters', group: 'A', players: [
            { id: 'p9', name: 'Tiago Rocha', phone: '990123456' },
            { id: 'p10', name: 'Hugo Pinto', phone: '901234567' },
          ]},
          { id: 't6', name: 'Purple Rain', group: 'C', players: [
            { id: 'p11', name: 'Bruno Carvalho', phone: '912345679' },
            { id: 'p12', name: 'Nuno Sousa', phone: '923456780' },
          ]},
          { id: 't7', name: 'Ace Force', group: 'B', players: [
            { id: 'p13', name: 'Ricardo Alves', phone: '934567891' },
            { id: 'p14', name: 'Vítor Cunha', phone: '945678902' },
          ]},
          { id: 't8', name: 'Iron Wall', group: 'C', players: [
            { id: 'p15', name: 'Diogo Melo', phone: '956789013' },
            { id: 'p16', name: 'Filipe Dias', phone: '967890124' },
          ]},
        ],
      },
      // v2 — feminino, fase de grupos (já existia)
      {
        id: 'v2',
        type: 'F',
        level: 'F4',
        maxTeams: 16,
        courts: 2,
        status: 'groups',
        teams: [],
      },
      // v3 — misto, já na FINAL (bracket)
      {
        id: 'v3',
        type: 'MX',
        level: 'MX4',
        maxTeams: 8,
        courts: 2,
        status: 'bracket',
        teams: [
          { id: 'tx1', name: 'Fogo & Gelo', players: [
            { id: 'px1', name: 'Ana Ribeiro', phone: '911111111' },
            { id: 'px2', name: 'Tomás Mendes', phone: '922222222' },
          ]},
          { id: 'tx2', name: 'Dupla Dinâmica', players: [
            { id: 'px3', name: 'Marta Gonçalves', phone: '933333333' },
            { id: 'px4', name: 'Diogo Almeida', phone: '944444444' },
          ]},
          { id: 'tx3', name: 'Smash Duo', players: [
            { id: 'px5', name: 'Inês Tavares', phone: '955555555' },
            { id: 'px6', name: 'Bernardo Reis', phone: '966666666' },
          ]},
          { id: 'tx4', name: 'Padel Stars', players: [
            { id: 'px7', name: 'Sofia Lopes', phone: '977777777' },
            { id: 'px8', name: 'Guilherme Pinto', phone: '988888888' },
          ]},
          { id: 'tx5', name: 'Mix & Match', players: [
            { id: 'px9', name: 'Beatriz Cruz', phone: '911112222' },
            { id: 'px10', name: 'Henrique Faria', phone: '922223333' },
          ]},
          { id: 'tx6', name: 'Court Breakers', players: [
            { id: 'px11', name: 'Catarina Sousa', phone: '933334444' },
            { id: 'px12', name: 'Rafael Neves', phone: '944445555' },
          ]},
          { id: 'tx7', name: 'Top Spin', players: [
            { id: 'px13', name: 'Joana Ferreira', phone: '955556666' },
            { id: 'px14', name: 'André Moreira', phone: '966667777' },
          ]},
          { id: 'tx8', name: 'Volley Kings', players: [
            { id: 'px15', name: 'Leonor Dias', phone: '977778888' },
            { id: 'px16', name: 'Miguel Rocha', phone: '988889999' },
          ]},
        ],
      },
    ],
  },

  // ── TORNEIO 2 — FINISHED (concluído) ─────────────────────────────
  {
    id: '2',
    name: 'Torneio de Inverno Cascais',
    location: 'Padel Cascais Arena',
    startDate: '7 Feb 2026',
    endDate: '9 Feb 2026',
    status: 'finished',
    vertentes: [
      {
        id: 'v2-1',
        type: 'M',
        level: 'M3',
        maxTeams: 8,
        courts: 3,
        status: 'finished',
        teams: [
          { id: 'tf1', name: 'Reis do Court', players: [
            { id: 'pf1', name: 'Afonso Duarte', phone: '910000001' },
            { id: 'pf2', name: 'Luís Pereira', phone: '910000002' },
          ]},
          { id: 'tf2', name: 'Padel Nation', players: [
            { id: 'pf3', name: 'Marco Teixeira', phone: '910000003' },
            { id: 'pf4', name: 'David Nunes', phone: '910000004' },
          ]},
          { id: 'tf3', name: 'Volley Bros', players: [
            { id: 'pf5', name: 'Gonçalo Pires', phone: '910000005' },
            { id: 'pf6', name: 'Simão Marques', phone: '910000006' },
          ]},
          { id: 'tf4', name: 'Glass Wall', players: [
            { id: 'pf7', name: 'Fábio Vieira', phone: '910000007' },
            { id: 'pf8', name: 'Renato Campos', phone: '910000008' },
          ]},
          { id: 'tf5', name: 'Drop Shot FC', players: [
            { id: 'pf9', name: 'Ivo Azevedo', phone: '910000009' },
            { id: 'pf10', name: 'Sérgio Oliveira', phone: '910000010' },
          ]},
          { id: 'tf6', name: 'Bandeja Club', players: [
            { id: 'pf11', name: 'Nelson Barros', phone: '910000011' },
            { id: 'pf12', name: 'Paulo Maia', phone: '910000012' },
          ]},
          { id: 'tf7', name: 'Smash Bros', players: [
            { id: 'pf13', name: 'Vasco Correia', phone: '910000013' },
            { id: 'pf14', name: 'Xavier Lima', phone: '910000014' },
          ]},
          { id: 'tf8', name: 'Net Force', players: [
            { id: 'pf15', name: 'Hélder Ramos', phone: '910000015' },
            { id: 'pf16', name: 'Jorge Santos', phone: '910000016' },
          ]},
        ],
      },
      {
        id: 'v2-2',
        type: 'F',
        level: 'F3',
        maxTeams: 8,
        courts: 2,
        status: 'finished',
        teams: [
          { id: 'tff1', name: 'Pink Panthers', players: [
            { id: 'pff1', name: 'Carolina Martins', phone: '920000001' },
            { id: 'pff2', name: 'Diana Fonseca', phone: '920000002' },
          ]},
          { id: 'tff2', name: 'Power Girls', players: [
            { id: 'pff3', name: 'Eva Santos', phone: '920000003' },
            { id: 'pff4', name: 'Francisca Lopes', phone: '920000004' },
          ]},
          { id: 'tff3', name: 'Net Queens', players: [
            { id: 'pff5', name: 'Gabriela Rocha', phone: '920000005' },
            { id: 'pff6', name: 'Helena Melo', phone: '920000006' },
          ]},
          { id: 'tff4', name: 'Ace Ladies', players: [
            { id: 'pff7', name: 'Isabel Alves', phone: '920000007' },
            { id: 'pff8', name: 'Joana Cunha', phone: '920000008' },
          ]},
        ],
      },
    ],
  },

  // ── TORNEIO 3 — UPCOMING (futuro) ────────────────────────────────
  {
    id: '3',
    name: 'Spring Padel Fest 2026',
    location: 'Padel Village Oeiras',
    startDate: '18 Abr 2026',
    endDate: '20 Abr 2026',
    status: 'upcoming',
    vertentes: [
      {
        id: 'v3-1',
        type: 'M',
        level: 'M4',
        maxTeams: 16,
        courts: 4,
        status: 'config',
        teams: [
          { id: 'tu1', name: 'Los Hermanos', players: [
            { id: 'pu1', name: 'Tiago Batista', phone: '930000001' },
            { id: 'pu2', name: 'Manuel Gomes', phone: '930000002' },
          ]},
          { id: 'tu2', name: 'Court Riders', players: [
            { id: 'pu3', name: 'Nuno Fernandes', phone: '930000003' },
            { id: 'pu4', name: 'Oscar Monteiro', phone: '930000004' },
          ]},
        ],
      },
      {
        id: 'v3-2',
        type: 'F',
        level: 'F4',
        maxTeams: 8,
        courts: 2,
        status: 'config',
        teams: [],
      },
      {
        id: 'v3-3',
        type: 'MX',
        level: 'MX3',
        maxTeams: 12,
        courts: 3,
        status: 'config',
        teams: [],
      },
    ],
  },
];

export const mockGames: Game[] = [
  // ── Jogos do torneio 1, vertente v1 (grupos) ─────────────────────
  {
    id: 'g1',
    team1: { id: 't1', name: 'Os Invencíveis', group: 'A', players: [
      { id: 'p1', name: 'João Silva' }, { id: 'p2', name: 'Miguel Costa' },
    ]},
    team2: { id: 't2', name: 'Thunderstruck', group: 'A', players: [
      { id: 'p3', name: 'Rui Ferreira' }, { id: 'p4', name: 'André Santos' },
    ]},
    court: 'C1', date: '14 Mar', time: '10:00',
    phase: 'groups', round: 1,
    sets: [{ team1: 6, team2: 4 }, { team1: 6, team2: 3 }],
    status: 'finished', winnerId: 't1',
  },
  {
    id: 'g2',
    team1: { id: 't3', name: 'Power Smash', group: 'B', players: [
      { id: 'p5', name: 'Carlos Lopes' }, { id: 'p6', name: 'Pedro Martins' },
    ]},
    team2: { id: 't4', name: 'Slam Kings', group: 'B', players: [
      { id: 'p7', name: 'Rui Santos' }, { id: 'p8', name: 'Pedro Lopes' },
    ]},
    court: 'C2', date: '14 Mar', time: '12:00',
    phase: 'groups', round: 1,
    sets: [{ team1: 4, team2: 3 }],
    status: 'live',
  },
  {
    id: 'g3',
    team1: { id: 't5', name: 'Net Hunters', group: 'A', players: [
      { id: 'p9', name: 'Tiago Rocha' }, { id: 'p10', name: 'Hugo Pinto' },
    ]},
    team2: { id: 't6', name: 'Purple Rain', group: 'C', players: [
      { id: 'p11', name: 'Bruno Carvalho' }, { id: 'p12', name: 'Nuno Sousa' },
    ]},
    court: 'C3', date: '14 Mar', time: '14:00',
    phase: 'groups', round: 1,
    status: 'scheduled',
  },
  {
    id: 'g4',
    team1: { id: 't7', name: 'Ace Force', group: 'B', players: [
      { id: 'p13', name: 'Ricardo Alves' }, { id: 'p14', name: 'Vítor Cunha' },
    ]},
    team2: { id: 't8', name: 'Iron Wall', group: 'C', players: [
      { id: 'p15', name: 'Diogo Melo' }, { id: 'p16', name: 'Filipe Dias' },
    ]},
    court: 'C1', date: '14 Mar', time: '15:30',
    phase: 'groups', round: 1,
    status: 'scheduled',
  },

  // ── Jogos do torneio 1, vertente v3 (bracket — já na final) ──────
  {
    id: 'gx1',
    team1: { id: 'tx1', name: 'Fogo & Gelo', players: [
      { id: 'px1', name: 'Ana Ribeiro' }, { id: 'px2', name: 'Tomás Mendes' },
    ]},
    team2: { id: 'tx2', name: 'Dupla Dinâmica', players: [
      { id: 'px3', name: 'Marta Gonçalves' }, { id: 'px4', name: 'Diogo Almeida' },
    ]},
    court: 'C1', date: '15 Mar', time: '09:00',
    phase: 'qf', round: 1,
    sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 4 }],
    status: 'finished', winnerId: 'tx1',
  },
  {
    id: 'gx2',
    team1: { id: 'tx3', name: 'Smash Duo', players: [
      { id: 'px5', name: 'Inês Tavares' }, { id: 'px6', name: 'Bernardo Reis' },
    ]},
    team2: { id: 'tx4', name: 'Padel Stars', players: [
      { id: 'px7', name: 'Sofia Lopes' }, { id: 'px8', name: 'Guilherme Pinto' },
    ]},
    court: 'C2', date: '15 Mar', time: '09:00',
    phase: 'qf', round: 1,
    sets: [{ team1: 4, team2: 6 }, { team1: 6, team2: 3 }, { team1: 10, team2: 7 }],
    status: 'finished', winnerId: 'tx3',
  },
  {
    id: 'gx3',
    team1: { id: 'tx5', name: 'Mix & Match', players: [
      { id: 'px9', name: 'Beatriz Cruz' }, { id: 'px10', name: 'Henrique Faria' },
    ]},
    team2: { id: 'tx6', name: 'Court Breakers', players: [
      { id: 'px11', name: 'Catarina Sousa' }, { id: 'px12', name: 'Rafael Neves' },
    ]},
    court: 'C1', date: '15 Mar', time: '11:00',
    phase: 'qf', round: 1,
    sets: [{ team1: 6, team2: 2 }, { team1: 6, team2: 1 }],
    status: 'finished', winnerId: 'tx5',
  },
  {
    id: 'gx4',
    team1: { id: 'tx7', name: 'Top Spin', players: [
      { id: 'px13', name: 'Joana Ferreira' }, { id: 'px14', name: 'André Moreira' },
    ]},
    team2: { id: 'tx8', name: 'Volley Kings', players: [
      { id: 'px15', name: 'Leonor Dias' }, { id: 'px16', name: 'Miguel Rocha' },
    ]},
    court: 'C2', date: '15 Mar', time: '11:00',
    phase: 'qf', round: 1,
    sets: [{ team1: 3, team2: 6 }, { team1: 6, team2: 4 }, { team1: 8, team2: 10 }],
    status: 'finished', winnerId: 'tx8',
  },
  {
    id: 'gx5',
    team1: { id: 'tx1', name: 'Fogo & Gelo', players: [
      { id: 'px1', name: 'Ana Ribeiro' }, { id: 'px2', name: 'Tomás Mendes' },
    ]},
    team2: { id: 'tx3', name: 'Smash Duo', players: [
      { id: 'px5', name: 'Inês Tavares' }, { id: 'px6', name: 'Bernardo Reis' },
    ]},
    court: 'C1', date: '15 Mar', time: '14:00',
    phase: 'sf', round: 1,
    sets: [{ team1: 6, team2: 4 }, { team1: 7, team2: 5 }],
    status: 'finished', winnerId: 'tx1',
  },
  {
    id: 'gx6',
    team1: { id: 'tx5', name: 'Mix & Match', players: [
      { id: 'px9', name: 'Beatriz Cruz' }, { id: 'px10', name: 'Henrique Faria' },
    ]},
    team2: { id: 'tx8', name: 'Volley Kings', players: [
      { id: 'px15', name: 'Leonor Dias' }, { id: 'px16', name: 'Miguel Rocha' },
    ]},
    court: 'C2', date: '15 Mar', time: '14:00',
    phase: 'sf', round: 1,
    sets: [{ team1: 6, team2: 3 }, { team1: 6, team2: 2 }],
    status: 'finished', winnerId: 'tx5',
  },
  // FINAL — agendada
  {
    id: 'gx7',
    team1: { id: 'tx1', name: 'Fogo & Gelo', players: [
      { id: 'px1', name: 'Ana Ribeiro' }, { id: 'px2', name: 'Tomás Mendes' },
    ]},
    team2: { id: 'tx5', name: 'Mix & Match', players: [
      { id: 'px9', name: 'Beatriz Cruz' }, { id: 'px10', name: 'Henrique Faria' },
    ]},
    court: 'C1', date: '16 Mar', time: '15:00',
    phase: 'final', round: 1,
    status: 'scheduled',
  },
];

export const MOCK_TOURNAMENTS = mockTournaments;
