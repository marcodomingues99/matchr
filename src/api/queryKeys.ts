export const tournamentKeys = {
  all: ['tournaments'] as const,
  detail: (id: string) => ['tournaments', id] as const,
};

export const categoryKeys = {
  detail: (categoryId: string) => ['categories', categoryId] as const,
};

export const matchKeys = {
  byCategory: (categoryId: string) => ['matches', { categoryId }] as const,
  bracket: (categoryId: string) => ['matches', { categoryId, bracket: true }] as const,
  byTournament: (tournamentId: string) => ['matches', { tournamentId }] as const,
  detail: (matchId: string) => ['matches', matchId] as const,
};
