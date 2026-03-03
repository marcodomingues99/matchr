import { Colors } from '../theme';

/** Gradient pool for group card headers — cycles for any number of groups */
export const GROUP_GRADIENT_POOL: [string, string][] = [
  [Colors.navy, Colors.blue],
  [Colors.greenDeep, Colors.green],
  [Colors.purpleDark, Colors.purpleLight],
  ['#CC4400', Colors.orange],
  ['#006B6B', Colors.teal],
  [Colors.pinkDark, Colors.pink],
  [Colors.brownDark, Colors.brownLight],
  ['#1A5A1A', '#44AA44'],
];

/** Chip colour pool for the team list — cycles with the same order */
export const GROUP_CHIP_POOL: Array<{ bg: string; text: string }> = [
  { bg: Colors.blueBg, text: Colors.blue },
  { bg: Colors.greenBgLight, text: Colors.greenDeep },
  { bg: Colors.purpleBg, text: Colors.purpleDark },
  { bg: Colors.orangeBg, text: Colors.orange },
  { bg: Colors.tealBg, text: '#006B6B' },
  { bg: Colors.pinkBg, text: Colors.pinkDark },
  { bg: Colors.yellowChipBg, text: Colors.brownDark },
  { bg: Colors.greenChipBg, text: '#1A5A1A' },
];
