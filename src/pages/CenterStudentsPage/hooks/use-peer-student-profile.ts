import { useEffect, useState } from 'react';
import { AuthServiceApi } from '@/services/auth-service';
import type { StudentProfile } from '@/types/student-profile';
import type { PortalStudent } from '../center-students-types';

type ProfileLoadState = 'idle' | 'loading' | 'loaded' | 'error';

export function usePeerStudentProfile(portalStudent: PortalStudent, studentId?: string) {
  const directoryStudent = portalStudent.centerStudents.find((centerStudent) => centerStudent.id === studentId);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [profileLoadState, setProfileLoadState] = useState<ProfileLoadState>('idle');

  useEffect(() => {
    let isMounted = true;
    setStudentProfile(null);

    if (studentId && studentId !== portalStudent.id) {
      setProfileLoadState(directoryStudent ? 'loaded' : 'loading');
      AuthServiceApi.getStudentProfile<StudentProfile>(studentId)
        .then((profile) => {
          if (!isMounted) return;
          setStudentProfile(profile);
          setProfileLoadState('loaded');
        })
        .catch(() => {
          if (!isMounted) return;
          setStudentProfile(null);
          setProfileLoadState(directoryStudent ? 'loaded' : 'error');
        });
    } else {
      setProfileLoadState('idle');
    }

    return () => {
      isMounted = false;
    };
  }, [directoryStudent, portalStudent.id, studentId]);

  return {
    profileLoadState,
    student: studentProfile || directoryStudent,
  };
}
