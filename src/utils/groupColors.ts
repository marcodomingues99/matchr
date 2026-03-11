import { Colors } from '../theme';

/** Gradient pool for group card headers — cycles for any number of groups */
export const GROUP_GRADIENT_POOL: [string, string][] = [
  [Colors.navy, Colors.blue],
  [Colors.greenDeep, Colors.green],
  [Colors.purpleDark, Colors.purpleLight],
  [Colors.orangeDeep, Colors.orange],
  [Colors.tealDark, Colors.teal],
  [Colors.pinkDark, Colors.pink],
  [Colors.brownDark, Colors.brownLight],
  [Colors.greenForest, Colors.greenMedium],
];

/** Chip colour pool for the team list — cycles with the same order */
export const GROUP_CHIP_POOL: Array<{ bg: string; text: string }> = [
  { bg: Colors.blueBg, text: Colors.blue },
  { bg: Colors.greenBgLight, text: Colors.greenDeep },
  { bg: Colors.purpleBg, text: Colors.purpleDark },
  { bg: Colors.orangeBg, text: Colors.orange },
  { bg: Colors.tealBg, text: Colors.tealDark },
  { bg: Colors.pinkBg, text: Colors.pinkDark },
  { bg: Colors.yellowChipBg, text: Colors.brownDark },
  { bg: Colors.greenChipBg, text: Colors.greenForest },
];
