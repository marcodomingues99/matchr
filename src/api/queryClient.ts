import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,   // mock data never goes stale — TODO: set appropriate stale times when backend is live
      gcTime: Infinity,      // never garbage-collect during mock phase — TODO: revisit when backend is live
    },
  },
});
