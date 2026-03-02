export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
};

export const Gradients = {
  navyToBlue: ['#0A1628', '#1A3A6B'] as string[],
  navyToTeal: ['#0A1628', '#00C9A7'] as string[],
  blueToTeal: ['#1E5BA8', '#00C9A7'] as string[],
  heroGradient: ['#0A1628', '#12213A', '#1A3A6B'] as string[],
  cardGradient: ['rgba(30,91,168,0.3)', 'rgba(0,201,167,0.1)'] as string[],
  accentGradient: ['#FF6B35', '#FF8C5A'] as string[],
  goldGradient: ['#FFD700', '#FFE55C'] as string[],
  successGradient: ['#22C55E', '#4ADE80'] as string[],
};
