import { useEffect, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Badge, Button } from '@radix-ui/themes';
import { ArrowLeft, Camera, Download, Edit3, ExternalLink, FileQuestion, ListChecks, Mail, ShieldCheck, User, Users } from 'lucide-react';
import { profilePath, studentProfilePath } from '@/data/navigation';
import { AuthServiceApi } from '@/services/auth-service';
import type { CenterStudentProfile, StudentProfile } from '@/types/student-profile';

type PortalStudent = StudentProfile;
type CenterStudent = CenterStudentProfile;

export function StudentProfileView({ portalStudent }: { portalStudent: PortalStudent }) {
  const currentStudent = getCurrentCenterStudent(portalStudent);

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
      <StudentProfileCard portalStudent={portalStudent} student={currentStudent} mode="self" />

      <div className="mt-6">
        <AssessmentPanel allowDownloads portalStudent={portalStudent} student={currentStudent} />
      </div>
    </main>
  );
}

export function PeerStudentProfilePage({ portalStudent }: { portalStudent: PortalStudent }) {
  const { studentId } = useParams();
  const directoryStudent = portalStudent.centerStudents.find((centerStudent) => centerStudent.id === studentId);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const student = studentProfile || directoryStudent;
  const profileHref = studentProfilePath(portalStudent.name);

  useEffect(() => {
    let isMounted = true;

    if (studentId && studentId !== portalStudent.id) {
      AuthServiceApi.getStudentProfile<StudentProfile>(studentId)
        .then((profile) => {
          if (isMounted) setStudentProfile(profile);
        })
        .catch(() => {
          if (isMounted) setStudentProfile(null);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [portalStudent.id, studentId]);

  if (!student || student.id === portalStudent.id) {
    return <Navigate to={profileHref} replace />;
  }

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
      <StudentProfileCard portalStudent={portalStudent} student={student} mode="peer" />
      <div className="mt-6">
        <AssessmentPanel portalStudent={portalStudent} student={student} />
      </div>
    </main>
  );
}

export function CenterStudentsPage({ portalStudent }: { portalStudent: PortalStudent }) {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
      <CenterStudentDirectory portalStudent={portalStudent} />
    </main>
  );
}

function StudentProfileCard({ mode, portalStudent, student }: { mode: 'self' | 'peer'; portalStudent: PortalStudent; student: CenterStudent | StudentProfile }) {
  const [uploadedProfileImage, setUploadedProfileImage] = useState('');
  const assessmentTotalForStudent = getAssessmentTotal(student.assessmentCounts);
  const studentProfileImage = uploadedProfileImage || student.photoBase64 || '';

  function handleProfilePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadedProfileImage(URL.createObjectURL(file));
  }

  useEffect(() => {
    return () => {
      if (uploadedProfileImage) {
        URL.revokeObjectURL(uploadedProfileImage);
      }
    };
  }, [uploadedProfileImage]);

  return (
    <>
      <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          {mode === 'peer' && <p className="mt-1 text-sm font-semibold text-slate-600">Center student profile</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StudentStatusBadge status={student.status} />
          {mode === 'self' ? (
            <Button asChild color="blue" size="3">
              <Link to="/edit-profile">
                <Edit3 aria-hidden="true" size={18} />
                Edit Profile
              </Link>
            </Button>
          ) : (
            <Button asChild color="gray" variant="soft">
              <Link to="/center-students">
                <ArrowLeft aria-hidden="true" size={18} />
                Back to Center Students
              </Link>
            </Button>
          )}
        </div>
      </section>

      <section className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mx-auto w-fit overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2">
            <ProfileImage className="aspect-square w-[100px]" imageSrc={studentProfileImage} label={`${student.name} profile`} />
          </div>
          {mode === 'self' && (
            <>
              <input className="sr-only" id="profile-photo-upload" type="file" accept="image/*" onChange={handleProfilePhotoChange} />
              <Button asChild className="mt-4 w-full" color="gray" highContrast variant="soft">
                <label htmlFor="profile-photo-upload">
                  <Camera aria-hidden="true" size={18} />
                  Upload Profile Photo
                </label>
              </Button>
            </>
          )}

          <div className="mt-6 rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                <ListChecks aria-hidden="true" size={20} />
                Assessment Count
              </h2>
            </div>
            <div className="px-3 pb-2 pt-3 text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
              # of Assessments Before Lead
            </div>
            <div className="grid grid-cols-4 text-center">
              {[
                ['Lead', student.assessmentCounts.lead],
                ['Safety', student.assessmentCounts.safety],
                ['Other', student.assessmentCounts.other],
                ['Total', assessmentTotalForStudent],
              ].map(([label, value]) => (
                <div className="border-r border-slate-200 px-3 py-4 last:border-r-0" key={label}>
                  <p className="whitespace-nowrap text-[11px] font-bold uppercase text-slate-500">{label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
            <h2 className="text-2xl font-semibold text-slate-950">{student.name}</h2>
            <ProfileHeaderActions mode={mode} student={student} />
          </div>

          <dl className="grid grid-cols-1 px-5 py-1 md:grid-cols-[200px_minmax(0,1fr)]">
            <ProfileRow label="Student ID" value={student.id} />
            <ProfileRow label="Center" value={student.center} />
            <ProfileRow label="Student type" value={student.type} />
            <ProfileRow label="Student role" value={<StudentStatusBadge status={student.status} compact />} />
            <ProfileRow label="ITAC Student Certificate" value={<CertificateStatus portalStudent={portalStudent} student={student} />} />
            <ProfileRow label="Time in ITAC" value={student.timeInItac} />
            {mode === 'peer' && (
              <ProfileRow
                label="Email"
                value={
                  <a className="font-semibold text-doe-blue underline underline-offset-4" href={`mailto:${student.email}`}>
                    {formatValue(student.email)}
                  </a>
                }
              />
            )}
          </dl>
        </section>
      </section>
    </>
  );
}

function ProfileHeaderActions({ mode, student }: { mode: 'self' | 'peer'; student: CenterStudent | StudentProfile }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {student.linkedin && (
        <Button asChild color="blue" variant="soft">
          <a href={student.linkedin} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" size={18} />
            View LinkedIn
          </a>
        </Button>
      )}
      {mode === 'self' ? (
        <Button asChild color="sky" variant="soft">
          <Link to="/center-students">
            <Users aria-hidden="true" size={18} />
            List of All Center Students
          </Link>
        </Button>
      ) : (
        <Button asChild color="sky" variant="soft">
          <a href={`mailto:${student.email}`}>
            <Mail aria-hidden="true" size={18} />
            Email Student
          </a>
        </Button>
      )}
    </div>
  );
}

function CenterStudentDirectory({ portalStudent }: { portalStudent: PortalStudent }) {
  const centerStudents = getVisibleCenterStudents(portalStudent);
  const profileHref = studentProfilePath(portalStudent.name);

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-950">
            <Users aria-hidden="true" size={24} />
            List of All Center Students
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">{portalStudent.center} students only</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge color="blue" size="2" variant="soft">
            {centerStudents.length} students
          </Badge>
          <Button asChild color="gray" variant="soft">
            <Link to={profileHref}>
              <ArrowLeft aria-hidden="true" size={18} />
              Back to Profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[940px] grid-cols-[90px_minmax(220px,1.3fr)_150px_120px_90px_90px_90px_120px] border-b border-slate-200 px-5 py-3 text-sm font-bold uppercase tracking-[0.04em] text-slate-500">
          <div>Role</div>
          <div>Name</div>
          <div>Type</div>
          <div>Grad Year</div>
          <div>Lead</div>
          <div>Safety</div>
          <div>Other</div>
          <div>Email</div>
        </div>

        {centerStudents.map((student, index) => (
          <div
            className={`grid min-w-[940px] grid-cols-[90px_minmax(220px,1.3fr)_150px_120px_90px_90px_90px_120px] items-center border-b border-slate-200 px-5 py-4 last:border-b-0 ${
              index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
            }`}
            key={student.id}
          >
            <StudentStatusDot status={student.status} />
            <Link className="w-fit rounded-md text-base font-bold text-doe-blue underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-200" to={`/students/${student.id}`}>
              {student.name}
            </Link>
            <div className="text-sm font-semibold text-slate-700">{formatValue(student.type)}</div>
            <div className="text-sm font-semibold text-slate-700">{formatValue(student.graduationYear)}</div>
            <AssessmentCountBadge value={student.assessmentCounts.lead} />
            <AssessmentCountBadge value={student.assessmentCounts.safety} />
            <AssessmentCountBadge value={student.assessmentCounts.other} />
            <a className="text-sm font-semibold text-doe-blue underline underline-offset-4" href={`mailto:${student.email}`}>
              Email
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

function CertificateStatus({ portalStudent, student }: { portalStudent: PortalStudent; student: CenterStudent | StudentProfile }) {
  const hasCertificate = Boolean(student.certificateStatus) && student.certificateStatus.toLowerCase() !== 'no certificate';

  if (hasCertificate) {
    return student.certificateStatus;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span>No certificate</span>
      {student.id === portalStudent.id && (
        <Button asChild color="blue" variant="soft">
          <Link to="/certificate-request">
            <FileQuestion aria-hidden="true" size={18} />
            How to Request
          </Link>
        </Button>
      )}
    </div>
  );
}

function AssessmentPanel({ allowDownloads = false, portalStudent, student }: { allowDownloads?: boolean; portalStudent: PortalStudent; student: CenterStudent | StudentProfile }) {
  const hasLeadAssessments = student.assessmentCounts.lead > 0;
  const assessmentRecordsForStudent = getStudentAssessmentRecords(portalStudent, student);
  const assessmentTotalForStudent = getAssessmentTotal(student.assessmentCounts);
  const hasAssessments = assessmentTotalForStudent > 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
            <ShieldCheck aria-hidden="true" size={22} />
            Assessments
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {hasAssessments ? `${assessmentTotalForStudent} connected assessments` : 'Not currently connected with any assessments.'}
          </p>
        </div>

        {allowDownloads && hasAssessments && (
          <div className="text-left sm:text-center">
            <p className="mb-2 text-base font-bold text-slate-800">Download Student Related Metrics</p>
            <div className="flex flex-wrap gap-2 sm:justify-center">
              <Button type="button" color="blue" onClick={() => alert('Placeholder: download all assessments')}>
                <Download aria-hidden="true" size={17} />
                All Assessments
              </Button>
              <Button
                type="button"
                color="blue"
                disabled={!hasLeadAssessments}
                onClick={() => alert('Placeholder: download assessments where student is lead')}
              >
                <Download aria-hidden="true" size={17} />
                As Lead
              </Button>
            </div>
          </div>
        )}
      </div>

      {hasAssessments ? (
        <div className="overflow-x-auto">
          <div className="grid min-w-[760px] grid-cols-[150px_260px_minmax(360px,1fr)] border-b border-slate-200 px-5 py-3 text-sm font-bold uppercase tracking-[0.04em] text-slate-500">
            <div>ID</div>
            <div>Faculty/Staff</div>
            <div>Student Participants</div>
          </div>
          {assessmentRecordsForStudent.map((assessment, index) => (
            <div
              className={`grid min-w-[760px] grid-cols-[150px_260px_minmax(360px,1fr)] gap-4 border-b border-slate-200 px-5 py-4 last:border-b-0 ${
                index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
              }`}
              key={assessment.id}
            >
              <div>
                <a
                  className="text-lg font-bold text-doe-blue underline underline-offset-4"
                  href={`https://itac.university/assessment/${assessment.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {assessment.id}
                </a>
                <p className="mt-1 text-base font-semibold text-slate-950">{formatValue(assessment.date)}</p>
              </div>
              <PersonPill name={formatValue(assessment.facultyStaff)} role={assessment.studentRole === 'Lead' ? 'Lead' : undefined} />
              <div className="flex flex-wrap gap-2">
                {assessment.participants.map((participant) => (
                  <PersonPill
                    highlighted={String(participant.participantId) === student.id}
                    imageSrc={participant.photoBase64}
                    key={`${assessment.id}-${participant.participantId}`}
                    muted={String(participant.participantId) !== student.id}
                    name={participant.name}
                    role={participant.role}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-5 py-5 text-slate-600">Not currently connected with any assessments.</p>
      )}
    </section>
  );
}

function PersonPill({
  highlighted = false,
  imageSrc,
  muted = false,
  name,
  role,
}: {
  highlighted?: boolean;
  imageSrc?: string;
  muted?: boolean;
  name: string;
  role?: string;
}) {
  const roleStyle = getRoleStyle(role, highlighted);

  return (
    <div className={`inline-flex min-h-11 max-w-full items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${roleStyle.container}`}>
      <span className={`h-7 w-7 shrink-0 rounded-full ${highlighted || roleStyle.isColorCoded ? 'bg-white' : 'bg-slate-200'}`}>
        <ProfileImage className="h-full w-full rounded-full" imageSrc={highlighted ? imageSrc || '' : ''} label="" />
      </span>
      {role && <span className={`text-xs font-bold ${roleStyle.roleText}`}>{role}</span>}
      <span className={muted ? 'truncate text-slate-600' : 'truncate'}>{name}</span>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt className="border-b border-slate-200 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-slate-500">{label}</dt>
      <dd className="border-b border-slate-200 py-2.5 text-base text-slate-950">{formatNode(value)}</dd>
    </>
  );
}

function ProfileImage({ className, imageSrc, label }: { className: string; imageSrc: string; label: string }) {
  if (imageSrc) {
    return <img className={`${className} object-cover`} src={imageSrc} alt={label} />;
  }

  return (
    <span className={`${className} grid place-items-center bg-slate-100 text-slate-400`} aria-label={label || undefined} aria-hidden={!label}>
      <User size={28} />
    </span>
  );
}

function formatValue(value: string | number | null | undefined) {
  return value === null || value === undefined || String(value).trim() === '' ? '-' : String(value);
}

function formatNode(value: ReactNode) {
  return typeof value === 'string' || typeof value === 'number' ? formatValue(value) : value;
}

function StudentStatusBadge({ compact = false, status }: { compact?: boolean; status: string }) {
  const isActive = status.toLowerCase() === 'active';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 font-bold shadow-sm ${
        compact ? 'py-1 text-sm' : 'py-2 text-base'
      } ${isActive ? 'border-green-200 bg-green-100 text-green-800' : 'border-red-200 bg-red-100 text-red-800'}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-green-600' : 'bg-red-600'}`} aria-hidden="true" />
      {status}
    </span>
  );
}

function StudentStatusDot({ status }: { status: string }) {
  const isActive = status.toLowerCase() === 'active';

  return (
    <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
      <span className={`h-3 w-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true" />
      {isActive ? 'Active' : 'Former'}
    </span>
  );
}

function AssessmentCountBadge({ value }: { value: number }) {
  return <span className="inline-flex h-8 w-10 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-800">{value}</span>;
}

function getCurrentCenterStudent(portalStudent: PortalStudent) {
  return portalStudent.centerStudents.find((student) => student.id === portalStudent.id) ?? portalStudent;
}

function getVisibleCenterStudents(portalStudent: PortalStudent) {
  return portalStudent.centerStudents.filter((student) => student.id !== portalStudent.id);
}

function getAssessmentTotal(counts: { lead: number; safety: number; other: number }) {
  return counts.lead + counts.safety + counts.other;
}

function getStudentAssessmentRecords(portalStudent: PortalStudent, student: CenterStudent | StudentProfile) {
  if ('assessments' in student) {
    return student.assessments;
  }

  return student.id === portalStudent.id ? portalStudent.assessments : [];
}

function getRoleStyle(role?: string, highlighted = false) {
  const highlightBorder = highlighted ? ' border-black ring-1 ring-black' : '';

  if (role === 'Lead') {
    return {
      container: `border-green-300 bg-green-100 text-green-950${highlightBorder}`,
      isColorCoded: true,
      roleText: 'text-green-700',
    };
  }

  if (role === 'Safety') {
    return {
      container: `border-yellow-300 bg-yellow-100 text-yellow-950${highlightBorder}`,
      isColorCoded: true,
      roleText: 'text-yellow-700',
    };
  }

  if (role === 'Other') {
    return {
      container: `border-sky-300 bg-sky-100 text-sky-950${highlightBorder}`,
      isColorCoded: true,
      roleText: 'text-sky-700',
    };
  }

  return {
    container: highlighted ? 'border-black bg-white text-slate-950 ring-1 ring-black' : 'border-slate-300 bg-white text-slate-700',
    isColorCoded: false,
    roleText: 'text-slate-400',
  };
}
