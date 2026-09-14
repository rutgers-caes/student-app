import { useQuery } from '@tanstack/react-query';
import { AuthServiceApi } from '@/services/auth-service';
import { queryKeys } from '@/services/query-client';
import type { StudentProfile } from '@/types/student-profile';

export function usePortalStudent() {
  return useQuery({
    queryKey: queryKeys.myProfile,
    queryFn: () => AuthServiceApi.getMyProfile<StudentProfile>(),
  });
}
