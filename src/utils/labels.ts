import { Colors } from '../theme';
import type { CategoryStatus, MatchStatus, BracketRound } from '../types';
import { CATEGORY_STATUS, MATCH_STATUS } from './constants';

/** Accent color per category lifecycle status */
export const STATUS_COLOR: Record<CategoryStatus, string> = {
  config: Colors.orange,
  groups: Colors.blue,
  bracket: Colors.teal,
  finished: Colors.green,
};

/** Accent color per match status */
export const MATCH_STATUS_COLOR: Record<MatchStatus, string> = {
  live:      Colors.red,
  paused:    Colors.orange,
  finished:  Colors.green,
  scheduled: Colors.muted,
  walkover:  Colors.muted,
};

/** Display label per category lifecycle status */
export const STATUS_LABEL: Record<CategoryStatus, string> = {
  config: 'A configurar',
  groups: 'Fase de grupos',
  bracket: 'Eliminatórias',
  finished: 'Concluído',
};

/** Display label per match status */
export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  [MATCH_STATUS.LIVE]: '● Ao vivo',
  [MATCH_STATUS.PAUSED]: '⏸ Pausado',
  [MATCH_STATUS.FINISHED]: '✓ Concluído',
  [MATCH_STATUS.SCHEDULED]: '⏰ Agendado',
  [MATCH_STATUS.WALKOVER]: '⚠️ Walkover',
};

/** Bracket round labels by phase key */
export const BRACKET_ROUND_LABEL: Record<BracketRound, string> = {
  r16: 'Oitavos',
  qf: 'Quartos',
  sf: 'Meias',
  final: 'Final',
  '3rd': '3º Lugar',
};
