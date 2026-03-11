import type { CategoryStatus, MatchStatus } from '../types';

/** Sentinel used when a tournament is being created and has no real ID yet */
export const NEW_TOURNAMENT_ID = 'new' as const;

/** Category lifecycle statuses — values must match CategoryStatus type */
export const CATEGORY_STATUS = {
  CONFIG: 'config',
  GROUPS: 'groups',
  BRACKET: 'bracket',
  FINISHED: 'finished',
} as const satisfies Record<string, CategoryStatus>;

/** Match lifecycle statuses — values must match MatchStatus type */
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  PAUSED: 'paused',
  FINISHED: 'finished',
  WALKOVER: 'walkover',
} as const satisfies Record<string, MatchStatus>;

/** Category phase order (least → most advanced) */
export const PHASE_ORDER = [
  CATEGORY_STATUS.CONFIG,
  CATEGORY_STATUS.GROUPS,
  CATEGORY_STATUS.BRACKET,
  CATEGORY_STATUS.FINISHED,
] as const;

/** Progress weight per category phase (0–1) */
export const PHASE_WEIGHT: Record<CategoryStatus, number> = {
  [CATEGORY_STATUS.CONFIG]: 0,
  [CATEGORY_STATUS.GROUPS]: 0.33,
  [CATEGORY_STATUS.BRACKET]: 0.66,
  [CATEGORY_STATUS.FINISHED]: 1,
};

/** Bracket round display order — excludes '3rd' (rendered separately below the final) */
export const BRACKET_ROUND_ORDER = ['r16', 'qf', 'sf', 'final'] as const;
