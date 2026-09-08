import { QueryClient } from '@tanstack/react-query';

/**
 * A global query client for managing and caching API requests for time-sensitive data
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export const queryKeys = {
  assessmentMetrics: (mode: 'all' | 'lead') => ['assessmentMetrics', mode] as const,
  jobPostingCount: ['jobPostingCount'] as const,
  myProfile: ['myProfile'] as const,
  studentProfile: (studentId: string) => ['studentProfile', studentId] as const,
  studentSurvey: (kind: 'entry' | 'exit') => ['studentSurvey', kind] as const,
};
