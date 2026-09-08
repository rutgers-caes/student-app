import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@radix-ui/themes';
import { Edit3 } from 'lucide-react';
import { CenterBrandingBanner } from '@/components/CenterBrandingBanner';
import { PageShell, StatusNotice } from '@/components/ui';
import { StudentProfileView, StudentStatusBadge } from '@/pages/CenterStudentsPage';
import { profilePath, studentProfilePath } from '@/data/navigation';
import { usePortalStudent } from '@/hooks/use-portal-student';
import { queryKeys } from '@/services/query-client';
import { iconSizes } from '@/styles/iconography';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: portalStudent = null, isError, isLoading } = usePortalStudent();
  const location = useLocation();
  const navigate = useNavigate();
  const profileHref = portalStudent ? studentProfilePath(portalStudent.name) : profilePath;

  useEffect(() => {
    if (portalStudent && location.pathname === profilePath) {
      navigate(studentProfilePath(portalStudent.name), { replace: true });
    }
  }, [location.pathname, navigate, portalStudent]);

  return (
    <PageShell firstName={portalStudent?.firstName || 'Student'} profileHref={profileHref} profileImage={portalStudent?.photoBase64 || ''}>
      {isLoading && <StatusBarNotice message="Loading your student profile..." />}
      {isError && <StatusBarNotice tone="error" message="Unable to refresh your profile. Showing the last available student data." />}
      {!portalStudent && !isError ? null : !portalStudent ? (
        <StatusBarNotice tone="error" message="Unable to load your profile. Please log in again." />
      ) : (
        <>
          <CenterBrandingBanner
            actions={
              <>
                <StudentStatusBadge status={portalStudent.status} />
                <Button asChild className="!bg-white !text-slate-950 hover:!bg-white/90" size="3">
                  <Link to="/edit-profile">
                    <Edit3 aria-hidden="true" size={iconSizes.sm} />
                    Edit Profile
                  </Link>
                </Button>
              </>
            }
            student={portalStudent}
          />
          <StudentProfileView
            portalStudent={portalStudent}
            onStudentUpdate={(student) => {
              queryClient.setQueryData(queryKeys.myProfile, student);
              queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
            }}
          />
        </>
      )}
    </PageShell>
  );
}

function StatusBarNotice({ message, tone = 'info' }: { message: string; tone?: 'info' | 'error' }) {
  return (
    <StatusNotice className="rounded-none border-x-0 border-t-0 px-5 py-2" tone={tone}>
      {message}
    </StatusNotice>
  );
}
