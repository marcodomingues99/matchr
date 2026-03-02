export const Colors = {
  navy: '#0D2C6B',
  blue: '#1A5AC8',
  teal: '#00A5C8',
  green: '#22C97A',
  orange: '#FF7A1A',
  yellow: '#FFD600',
  red: '#FF3B5C',
  muted: '#8A9BC0',
  gray: '#B0BAD0',
  gbg: '#F2F5FB',
  gl: '#E0E8F5',
  white: '#FFFFFF',
};

export const Gradients = {
  header: [Colors.navy, Colors.blue, Colors.teal] as string[],
  primary: [Colors.blue, Colors.teal] as string[],
  green: [Colors.green, '#00AA66'] as string[],
  red: ['#9B0000', Colors.red] as string[],
  masc: [Colors.navy, Colors.blue] as string[],
  fem: ['#8B0050', '#D4006A'] as string[],
  mix: ['#5C3A00', '#C87800'] as string[],
};

export const Typography = {
  fontFamily: 'Nunito_800ExtraBold',
  fontFamilyRegular: 'Nunito_400Regular',
  fontFamilyBold: 'Nunito_700Bold',
  fontFamilyBlack: 'Nunito_900Black',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};
