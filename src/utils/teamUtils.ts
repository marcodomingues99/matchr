import { Colors } from '../theme';

export const AVATAR_GRADIENTS: [string, string][] = [
  [Colors.blue, Colors.teal],
  [Colors.purpleDark, Colors.purpleLight],
  [Colors.green, Colors.greenDark],
  [Colors.orange, Colors.yellow],
  [Colors.red, '#FF9A8B'],
  [Colors.purple, '#FF44AA'],
];

export const getInitials = (name: string): string =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase().slice(0, 2);
