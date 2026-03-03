import { Colors } from '../theme';

/** Sentinel used when a tournament is being created and has no real ID yet */
export const NEW_TOURNAMENT_ID = 'new' as const;

/** Minimum confirmed teams required to start groups phase */
export const MIN_TEAMS_TO_START = 4;

/** Vertente lifecycle statuses */
export const VERTENTE_STATUS = {
  CONFIG: 'config',
  GROUPS: 'groups',
  BRACKET: 'bracket',
  FINISHED: 'finished',
} as const;

/** Game lifecycle statuses */
export const GAME_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  PAUSED: 'paused',
  FINISHED: 'finished',
  WALKOVER: 'walkover',
} as const;

/** Portuguese month abbreviation → 0-based month index */
export const MONTHS: Record<string, number> = {
  Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
  Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
};

/** Portuguese month abbreviations ordered 0–11 (inverse of MONTHS, for date formatting) */
export const PT_MONTHS = Object.keys(MONTHS);

/** Parse a Portuguese date string "5 Abr 2026" → Date, or null on failure */
export const parseDatePt = (s: string): Date | null => {
  const parts = s.trim().split(/\s+/);
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const month = MONTHS[parts[1]];
  const year = parseInt(parts[2]);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  return new Date(year, month, day);
};

/** Accent color per vertente lifecycle status */
export const STATUS_COLOR: Record<string, string> = {
  config: Colors.orange,
  groups: Colors.blue,
  bracket: Colors.teal,
  finished: Colors.green,
};

/** Accent color per game status */
export const GAME_STATUS_COLOR = {
  live:      Colors.red,
  paused:    Colors.orange,
  finished:  Colors.green,
  scheduled: Colors.muted,
  walkover:  Colors.muted,
} as const;

/** Display label per vertente lifecycle status */
export const STATUS_LABEL: Record<string, string> = {
  config: 'A configurar',
  groups: 'Fase de grupos',
  bracket: 'Bracket',
  finished: 'Concluído',
};

/** Display label per game status */
export const GAME_STATUS_LABEL: Record<string, string> = {
  [GAME_STATUS.LIVE]: '● Ao vivo',
  [GAME_STATUS.PAUSED]: '⏸ Pausado',
  [GAME_STATUS.FINISHED]: '✓ Concluído',
  [GAME_STATUS.SCHEDULED]: '⏰ Agendado',
  [GAME_STATUS.WALKOVER]: '⚠️ Walkover',
};

/** Vertente phase order (least → most advanced) */
export const PHASE_ORDER = [
  VERTENTE_STATUS.CONFIG,
  VERTENTE_STATUS.GROUPS,
  VERTENTE_STATUS.BRACKET,
  VERTENTE_STATUS.FINISHED,
] as const;

/** Progress weight per vertente phase (0–1) */
export const PHASE_WEIGHT: Record<string, number> = {
  [VERTENTE_STATUS.CONFIG]: 0,
  [VERTENTE_STATUS.GROUPS]: 0.33,
  [VERTENTE_STATUS.BRACKET]: 0.66,
  [VERTENTE_STATUS.FINISHED]: 1,
};

/** Bracket round labels by phase key */
export const BRACKET_ROUND_LABEL: Record<string, string> = {
  r16: 'Oitavos',
  qf: 'Quartos',
  sf: 'Meias',
  final: 'Final',
};

/** Bracket round display order */
export const BRACKET_ROUND_ORDER = ['r16', 'qf', 'sf', 'final'] as const;
