import { PageShell, StatusNotice } from '@/components/ui';
import { profilePath, studentProfilePath } from '@/data/navigation';
import { usePortalStudent } from '@/hooks/use-portal-student';
import { PeerStudentProfilePage } from './center-students-page';

export default function PeerStudentProfileRoutePage() {
  const { data: portalStudent = null, isError, isLoading } = usePortalStudent();
  const profileHref = portalStudent ? studentProfilePath(portalStudent.name) : profilePath;

  return (
    <PageShell firstName={portalStudent?.firstName || 'Student'} profileHref={profileHref} profileImage={portalStudent?.photoBase64 || ''}>
      {isLoading && <StatusBarNotice message="Loading your student profile..." />}
      {isError && <StatusBarNotice tone="error" message="Unable to refresh your profile. Showing the last available student data." />}
      {!portalStudent && !isError ? null : !portalStudent ? (
        <StatusBarNotice tone="error" message="Unable to load your profile. Please log in again." />
      ) : (
        <PeerStudentProfilePage portalStudent={portalStudent} />
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
