import type { Category, CategoryType } from '../types';
import { Colors } from '../theme';

/** Minimum confirmed teams required to start groups phase */
export const MIN_TEAMS_TO_START = 4;

export const getMinTeamsToStart = (
  category?: Pick<Category, 'maxTeams' | 'minTeamsToStart'>,
): number => {
  if (!category) return MIN_TEAMS_TO_START;
  return Math.max(2, Math.min(category.maxTeams, category.minTeamsToStart ?? MIN_TEAMS_TO_START));
};

export interface CategoryTypeConfig {
  label: string;       // Masculino, Feminino, Misto
  labelShort: string;  // Masc, Fem, Misto
  emoji: string;       // 👨, 👩, 👫
  gradient: readonly [string, string, ...string[]];  // 3-stop header gradient
  color: string;       // single accent color
  chipBg: string;      // light pastel chip background
  chipText: string;    // chip text / accent color
  barBg: string;       // progress bar / section tint background
}

export const CATEGORY_CONFIG: Record<CategoryType, CategoryTypeConfig> = {
  M: {
    label: 'Masculino',
    labelShort: 'Masc',
    emoji: '👨',
    gradient: [Colors.navy, Colors.blue, Colors.teal],
    color: Colors.blue,
    chipBg: Colors.blueBg,
    chipText: Colors.blue,
    barBg: '#EDF2FF',
  },
  F: {
    label: 'Feminino',
    labelShort: 'Fem',
    emoji: '👩',
    gradient: [Colors.pinkDark, Colors.pink, Colors.pinkLight],
    color: Colors.pink,
    chipBg: Colors.purpleBg,
    chipText: Colors.pinkDark,
    barBg: '#F8F0FF',
  },
  MX: {
    label: 'Misto',
    labelShort: 'Misto',
    emoji: '👫',
    gradient: [Colors.brownDark, Colors.brownLight, '#FFB347'],
    color: Colors.orange,
    chipBg: Colors.orangeBg,
    chipText: Colors.orange,
    barBg: '#FFF6EC',
  },
};
