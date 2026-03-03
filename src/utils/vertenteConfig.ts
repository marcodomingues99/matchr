import { VertenteType } from '../types';
import { Colors } from '../theme';

export interface VertenteTypeConfig {
  label: string;       // Masculino, Feminino, Misto
  labelShort: string;  // Masc, Fem, Misto
  emoji: string;       // 👨, 👩, 👫
  gradient: readonly [string, string, ...string[]];  // 3-stop header gradient
  color: string;       // single accent color
  chipBg: string;      // light pastel chip background
  chipText: string;    // chip text / accent color
  barBg: string;       // progress bar / section tint background
}

export const VERTENTE_CONFIG: Record<VertenteType, VertenteTypeConfig> = {
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
