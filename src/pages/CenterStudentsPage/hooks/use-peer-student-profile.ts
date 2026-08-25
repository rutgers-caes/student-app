import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthServiceApi } from '@/services/auth-service';
import { queryKeys } from '@/services/query-client';
import type { StudentProfile } from '@/types/student-profile';
import type { PortalStudent } from '../center-students-types';

type ProfileLoadState = 'idle' | 'loading' | 'loaded' | 'error';

export function usePeerStudentProfile(portalStudent: PortalStudent, studentId?: string) {
  const directoryStudent = useMemo(
    () => portalStudent.centerStudents.find((centerStudent) => centerStudent.id === studentId),
    [portalStudent.centerStudents, studentId],
  );
  const shouldLoadPeer = Boolean(studentId && studentId !== portalStudent.id);
  const profileQuery = useQuery({
    queryKey: queryKeys.studentProfile(studentId || ''),
    queryFn: () => AuthServiceApi.getStudentProfile<StudentProfile>(studentId || ''),
    enabled: shouldLoadPeer,
  });
  const studentProfile = profileQuery.data ?? null;
  const profileLoadState: ProfileLoadState = !shouldLoadPeer
    ? 'idle'
    : profileQuery.isError
      ? directoryStudent ? 'loaded' : 'error'
      : profileQuery.isLoading
        ? directoryStudent ? 'loaded' : 'loading'
        : 'loaded';

  return {
    profileLoadState,
    student: studentProfile || directoryStudent,
  };
}
