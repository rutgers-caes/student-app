import { Link, Navigate, useParams } from 'react-router-dom';
import { Button } from '@radix-ui/themes';
import { ArrowLeft } from 'lucide-react';
import { CenterBrandingBanner } from '@/components/CenterBrandingBanner';
import { StatusNotice } from '@/components/ui';
import { studentProfilePath } from '@/data/navigation';
import type { StudentProfile } from '@/types/student-profile';
import { getCurrentCenterStudent } from './center-students-utils';
import { AssessmentPanel } from './components/AssessmentPanel';
import { CenterStudentDirectory } from './components/CenterStudentDirectory';
import { StudentProfileCard } from './components/StudentProfileCard';
import { StudentStatusBadge } from './components/StudentStatus';
import { usePeerStudentProfile } from './hooks/use-peer-student-profile';

type PortalStudent = StudentProfile;

export function StudentProfileView({
  onStudentUpdate,
  portalStudent,
}: {
  onStudentUpdate?: (student: StudentProfile) => void;
  portalStudent: PortalStudent;
}) {
  const currentStudent = getCurrentCenterStudent(portalStudent);

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
      <StudentProfileCard onStudentUpdate={onStudentUpdate} portalStudent={portalStudent} student={currentStudent} mode="self" />

      <div className="mt-6">
        <AssessmentPanel allowDownloads portalStudent={portalStudent} student={currentStudent} />
      </div>
    </main>
  );
}

export function PeerStudentProfilePage({ portalStudent }: { portalStudent: PortalStudent }) {
  const { studentId } = useParams();
  const { profileLoadState, student } = usePeerStudentProfile(portalStudent, studentId);
  const profileHref = studentProfilePath(portalStudent.name);

  if (!studentId || studentId === portalStudent.id || student?.id === portalStudent.id) {
    return <Navigate to={profileHref} replace />;
  }

  if (!student && (profileLoadState === 'idle' || profileLoadState === 'loading')) {
    return <PageMessage message="Loading student profile..." />;
  }

  if (profileLoadState === 'error') {
    return <PageMessage tone="error" message="Unable to load assessment details for this student. Please try again later." />;
  }

  if (!student) {
    return <Navigate to={profileHref} replace />;
  }

  return (
    <>
      <CenterBrandingBanner
        actions={
          <>
            <StudentStatusBadge status={student.status} />
            <Button asChild className="!bg-white !text-slate-950 hover:!bg-white/90" size="3">
              <Link to="/center-students">
                <ArrowLeft aria-hidden="true" size={18} />
                Back to Center Students
              </Link>
            </Button>
          </>
        }
        student={student}
      />
      <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
        <StudentProfileCard portalStudent={portalStudent} student={student} mode="peer" />
        <div className="mt-6">
          <AssessmentPanel portalStudent={portalStudent} student={student} />
        </div>
      </main>
    </>
  );
}

export function CenterStudentsPage({ portalStudent }: { portalStudent: PortalStudent }) {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
      <CenterStudentDirectory portalStudent={portalStudent} />
    </main>
  );
}

function PageMessage({ message, tone = 'info' }: { message: string; tone?: 'info' | 'error' }) {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
      <StatusNotice tone={tone}>{message}</StatusNotice>
    </main>
  );
}

export { StudentStatusBadge };
