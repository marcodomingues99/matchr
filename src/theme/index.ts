export const Colors = {
  // core palette
  navy: '#0D2C6B',
  navyDark: '#1A3A6B',
  blue: '#1A5AC8',
  teal: '#00A5C8',
  green: '#22C97A',
  greenDark: '#00AA66',
  greenDeep: '#1A7A4A',
  orange: '#FF7A1A',
  orangeDark: '#7A4A00',
  yellow: '#FFD600',
  yellowDark: '#997700',
  red: '#FF3B5C',
  redDark: '#9B0000',
  redDeep: '#7A0000',
  redLight: '#FF6B6B',
  pink: '#D4006A',
  pinkLight: '#FF6B9D',
  pinkDark: '#8B0050',
  purple: '#9B30FF',
  purpleDark: '#8B00CC',
  purpleLight: '#BB44FF',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  goldDark: '#AA8800',
  brownDark: '#5C3A00',
  brownLight: '#C87800',
  brownDeep: '#4A2C00',
  scheduledDark: '#3A4060',
  scheduledLight: '#5566AA',

  // neutrals
  muted: '#8A9BC0',
  gray: '#B0BAD0',
  graySlate: '#64748B',
  gbg: '#F2F5FB',
  gl: '#E0E8F5',
  handleGray: '#DDE1ED',
  white: '#FFFFFF',

  // semantic bg tints
  blueBg: '#E3ECFF',
  blueBgLight: '#EEF4FF',
  greenBg: '#F2FFF8',
  greenBgLight: '#DFFAEE',
  greenBgSoft: '#E8F5E9',
  redBg: '#FFE3E8',
  redBgLight: '#FFF5F5',
  redBgSoft: '#FFF0F0',
  redBorder: '#FFD0D0',
  orangeBg: '#FFF0E3',
  orangeBgLight: '#FFF0DB',
  yellowBg: '#FFFBE6',
  yellowAmber: '#FFB300',
  yellowBgWarm: '#FFF8E3',
  purpleBg: '#F5EAFF',
  purpleBgLight: '#F3E8FF',
  purpleBgSoft: '#EDE9FF',
  purpleDeep: '#6B10DF',
  tealBg: '#E0FAFA',
  pinkBg: '#FFE0F0',
  greenChipBg: '#E0F5E0',
  yellowChipBg: '#FFF8E0',

  // overlays
  overlayDark: 'rgba(10,15,35,0.65)',
  navyAlpha90: 'rgba(13,44,107,0.9)',
} as const;

type Gradient = readonly [string, string, ...string[]];

export const Gradients = {
  header: [Colors.navy, Colors.blue, Colors.teal] as Gradient,
  primary: [Colors.blue, Colors.teal] as Gradient,
  green: [Colors.green, Colors.greenDark] as Gradient,
  red: [Colors.redDark, Colors.red] as Gradient,
  masc: [Colors.navy, Colors.blue] as Gradient,
  fem: [Colors.pinkDark, Colors.pink] as Gradient,
  mix: [Colors.brownDark, Colors.brownLight] as Gradient,
  // status gradients
  finished: [Colors.greenDeep, Colors.green] as Gradient,
  live: [Colors.redDark, Colors.red] as Gradient,
  paused: [Colors.orangeDark, Colors.orange] as Gradient,
  scheduled: [Colors.scheduledDark, Colors.scheduledLight] as Gradient,
};

export const Typography = {
  fontFamily: 'Nunito_800ExtraBold',
  fontFamilyRegular: 'Nunito_400Regular',
  fontFamilySemiBold: 'Nunito_600SemiBold',
  fontFamilyBold: 'Nunito_700Bold',
  fontFamilyBlack: 'Nunito_900Black',
  fontSize: {
    xxs: 9,
    xs: 10,
    sm: 11,
    md: 12,
    base: 13,
    lg: 14,
    xl: 16,
    xxl: 20,
    xxxl: 22,
  },
};

export const TextStyles = {
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily,
    color: Colors.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
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
