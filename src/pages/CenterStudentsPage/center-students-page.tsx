import { useEffect, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Badge, Button } from '@radix-ui/themes';
import { ArrowLeft, Camera, Eye, ExternalLink, FileQuestion, Mail, ShieldCheck, User, Users } from 'lucide-react';
import { CenterBrandingBanner } from '@/components/CenterBrandingBanner';
import { studentProfilePath } from '@/data/navigation';
import { AuthServiceApi } from '@/services/auth-service';
import type { CenterStudentProfile, StudentAssessment, StudentProfile } from '@/types/student-profile';
import {
  getAssessmentTotal,
  getCurrentCenterStudent,
  getFacultyStaffParticipants,
  getRoleStyle,
  getStudentAssessmentRecords,
  getVisibleCenterStudents,
  sortParticipantsByRole,
} from './center-students-utils';

type PortalStudent = StudentProfile;
type CenterStudent = CenterStudentProfile;

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

function StudentProfileCard({
  mode,
  onStudentUpdate,
  portalStudent,
  student,
}: {
  mode: 'self' | 'peer';
  onStudentUpdate?: (student: StudentProfile) => void;
  portalStudent: PortalStudent;
  student: CenterStudent | StudentProfile;
}) {
  const [uploadedProfileImage, setUploadedProfileImage] = useState('');
  const [photoMessage, setPhotoMessage] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const assessmentTotalForStudent = getAssessmentTotal(student.assessmentCounts);
  const assessmentRecordsForStudent = getStudentAssessmentRecords(portalStudent, student);
  const assessmentDateRange = getAssessmentDateRange(assessmentRecordsForStudent);
  const assessmentsBeforeLead = getAssessmentsBeforeLead(assessmentRecordsForStudent);
  const satelliteCenter = student.satelliteCenterName || getSatelliteCenter(student.centerCode);
  const studentProfileImage = uploadedProfileImage || student.photoBase64 || '';

  async function handleProfilePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 3_500_000) {
      setPhotoMessage('Profile photo must be 3.5 MB or smaller.');
      event.target.value = '';
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoMessage('');

    try {
      const profilePhoto = await readFileAsDataUrl(file);
      setUploadedProfileImage(profilePhoto);
      const updatedProfile = await AuthServiceApi.updateMyProfile<StudentProfile>({ profilePhoto });
      onStudentUpdate?.(updatedProfile);
      setUploadedProfileImage('');
      setPhotoMessage('Profile photo updated.');
    } catch (error) {
      setUploadedProfileImage('');
      setPhotoMessage(error instanceof Error ? error.message : 'Unable to update profile photo.');
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  }

  return (
    <>
      <section className="grid items-stretch gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mx-auto w-fit overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2">
            <ProfileImage className="aspect-square w-[clamp(140px,42vw,220px)]" imageSrc={studentProfileImage} label={`${student.name} profile`} />
          </div>
          {mode === 'self' && (
            <>
              <input className="sr-only" id="profile-photo-upload" type="file" accept="image/*" onChange={handleProfilePhotoChange} />
              <Button asChild className="mt-4 w-full" color="gray" highContrast variant="soft">
                <label htmlFor="profile-photo-upload">
                  <Camera aria-hidden="true" size={18} />
                  {isUploadingPhoto ? 'Uploading Photo' : 'Upload Profile Photo'}
                </label>
              </Button>
              {photoMessage && (
                <p className={`mt-3 text-center text-sm font-semibold ${photoMessage.includes('updated') ? 'text-green-700' : 'text-red-700'}`}>
                  {photoMessage}
                </p>
              )}
            </>
          )}

          <div className="mt-6 rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 px-4 py-3 text-center">
              <h2 className="flex items-center justify-center gap-2 text-lg font-semibold text-slate-950">
                Assessment Count
              </h2>
            </div>
            <div className="px-3 pb-2 pt-3 text-center text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
              {formatAssessmentsBeforeLead(assessmentsBeforeLead)}
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

        <section className="flex h-full flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
            <h2 className="text-[clamp(28px,2.6vw,36px)] font-semibold leading-tight text-slate-950">{student.name}</h2>
            <ProfileHeaderActions mode={mode} student={student} />
          </div>

          <dl className="grid flex-1 grid-cols-1 content-start px-5 py-1 md:grid-cols-[200px_minmax(0,1fr)]">
            <ProfileRow label="Student ID" value={student.id} />
            <ProfileRow label="Center" value={<CenterValue center={student.center} satelliteCenter={satelliteCenter} />} />
            <ProfileRow label="Student type" value={student.type} />
            <ProfileRow label="First Assessment Date" value={assessmentDateRange.first} />
            <ProfileRow label="Last Assessment Date" value={assessmentDateRange.last} />
            <ProfileRow label="ITAC Student Certificate" value={<CertificateStatus portalStudent={portalStudent} student={student} />} />
            <ProfileRow label="Time in ITAC (estimated)" value={formatTimeInItac(student.timeInItac)} />
            <ProfileRow label="Email" value={<EmailLink email={student.email} />} />
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
  const directoryGridColumns = 'grid-cols-[120px_minmax(220px,1.15fr)_170px_120px_82px_82px_82px_minmax(260px,1.2fr)]';

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
        <div className={`grid min-w-[1140px] ${directoryGridColumns} items-center border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-[0.06em] text-slate-500`}>
          <div className="text-center">Role</div>
          <div>Name</div>
          <div>Type</div>
          <div>Grad Year</div>
          <div className="text-center">Lead</div>
          <div className="text-center">Safety</div>
          <div className="text-center">Other</div>
          <div>Email</div>
        </div>

        {centerStudents.map((student, index) => (
          <div
            className={`grid min-w-[1140px] ${directoryGridColumns} items-center border-b border-slate-200 px-5 py-4 last:border-b-0 ${
              index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
            }`}
            key={student.id}
          >
            <div className="flex justify-center">
              <StudentStatusDot status={student.status} />
            </div>
            <Link className="w-fit rounded-md text-base font-bold text-doe-blue underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-200" to={`/students/${student.id}`}>
              {student.name}
            </Link>
            <div className="text-sm font-semibold text-slate-700">{formatValue(student.type)}</div>
            <div className="text-sm font-semibold text-slate-700">{formatValue(student.graduationYear)}</div>
            <div className="flex justify-center"><AssessmentCountBadge value={student.assessmentCounts.lead} /></div>
            <div className="flex justify-center"><AssessmentCountBadge value={student.assessmentCounts.safety} /></div>
            <div className="flex justify-center"><AssessmentCountBadge value={student.assessmentCounts.other} /></div>
            <a className="truncate text-sm font-semibold text-doe-blue underline underline-offset-4" href={`mailto:${student.email}`}>
              {formatValue(student.email)}
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
      <span>-</span>
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

        {allowDownloads && (
          <div className="text-left sm:text-center">
            <p className="mb-2 text-base font-bold text-slate-800">View Student Related Metrics</p>
            <div className="flex flex-wrap gap-2 sm:justify-center">
              {hasAssessments ? (
                <Button asChild color="blue">
                  <Link to="/assessments/metrics/all">
                    <Eye aria-hidden="true" size={17} />
                    All Assessments Metrics
                  </Link>
                </Button>
              ) : (
                <span title="No assessments yet">
                  <Button type="button" color="blue" disabled>
                    <Eye aria-hidden="true" size={17} />
                    All Assessments Metrics
                  </Button>
                </span>
              )}
              {hasLeadAssessments && (
                <Button asChild color="blue">
                  <Link to="/assessments/metrics/lead">
                  <Eye aria-hidden="true" size={17} />
                    As Lead Metrics
                </Link>
              </Button>
              )}
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
              <div className="flex flex-col gap-2">
                {getFacultyStaffParticipants(assessment).map((facultyStaff) => (
                  <PersonPill key={`${assessment.id}-${facultyStaff.participantId}-${facultyStaff.name}`} name={facultyStaff.name} role={facultyStaff.role} />
                ))}
              </div>
              <div className="flex flex-wrap content-start items-start gap-2">
                {sortParticipantsByRole(assessment.participants).map((participant) => (
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
    <div className={`inline-flex h-11 w-60 max-w-full items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold ${roleStyle.container}`}>
      <span className={`h-7 w-7 shrink-0 rounded-full ${highlighted || roleStyle.isColorCoded ? 'bg-white' : 'bg-slate-200'}`}>
        <ProfileImage className="h-full w-full rounded-full" imageSrc={imageSrc || ''} label="" />
      </span>
      {role && <span className={`text-xs font-bold ${roleStyle.roleText}`}>{role}</span>}
      <span className={muted ? 'truncate text-slate-600' : 'truncate'}>{name}</span>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt className="flex min-h-14 items-center border-b border-slate-200 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-slate-500">{label}</dt>
      <dd className="flex min-h-14 items-center border-b border-slate-200 py-2.5 text-base text-slate-950">{formatNode(value)}</dd>
    </>
  );
}

function EmailLink({ email }: { email: string }) {
  if (!email) return '-';

  return (
    <a className="font-semibold text-doe-blue underline underline-offset-4" href={`mailto:${email}`}>
      {email}
    </a>
  );
}

function CenterValue({ center, satelliteCenter }: { center: string; satelliteCenter: string }) {
  return (
    <div>
      <div>{formatValue(center)}</div>
      {satelliteCenter && (
        <div className="mt-1">
          Satellite Center: <span className="font-semibold">{satelliteCenter}</span>
        </div>
      )}
    </div>
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

function getAssessmentDateRange(assessments: StudentAssessment[]) {
  const dates = assessments
    .map((assessment) => parseDisplayDate(assessment.date))
    .filter((date): date is Date => Boolean(date))
    .sort((first, second) => first.getTime() - second.getTime());

  if (!dates.length) {
    return { first: '-', last: '-' };
  }

  return {
    first: formatDisplayDate(dates[0]),
    last: formatDisplayDate(dates[dates.length - 1]),
  };
}

function getAssessmentsBeforeLead(assessments: StudentAssessment[]) {
  const sortedAssessments = [...assessments].sort((first, second) => {
    const firstDate = parseDisplayDate(first.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const secondDate = parseDisplayDate(second.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return firstDate - secondDate || first.id.localeCompare(second.id);
  });
  const firstLeadIndex = sortedAssessments.findIndex((assessment) => assessment.studentRole === 'Lead');
  return firstLeadIndex === -1 ? null : firstLeadIndex;
}

function formatAssessmentsBeforeLead(value: number | null) {
  if (value === null) return '-';
  return `${value} ${value === 1 ? 'assessment' : 'assessments'} before lead`;
}

function parseDisplayDate(value: string) {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
}

function formatDisplayDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${date.getFullYear()}`;
}

function formatTimeInItac(value: string | null | undefined) {
  const totalDays = Number(String(value || '').match(/\d+/)?.[0] ?? 0);
  if (!totalDays) return '0 Days';

  const estimate = formatEstimatedDuration(totalDays);
  return estimate ? `${totalDays} Days (${estimate})` : `${totalDays} Days`;
}

function formatDurationPart(value: number, label: string) {
  if (!value) return '';
  return `${value} ${label}${value === 1 ? '' : 's'}`;
}

function formatEstimatedDuration(totalDays: number) {
  const years = Math.floor(totalDays / 365);
  const remainingAfterYears = totalDays % 365;
  const months = Math.floor(remainingAfterYears / 30);
  const remainingAfterMonths = remainingAfterYears % 30;
  const weeks = Math.floor(remainingAfterMonths / 7);
  const days = remainingAfterMonths % 7;
  return [
    formatDurationPart(years, 'year'),
    formatDurationPart(months, 'month'),
    formatDurationPart(weeks, 'week'),
    formatDurationPart(days, 'day'),
  ].filter(Boolean).join(', ');
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string' && reader.result.startsWith('data:image/')) {
        resolve(reader.result);
        return;
      }

      reject(new Error('Please choose a valid image file.'));
    });
    reader.addEventListener('error', () => reject(new Error('Unable to read profile photo.')));
    reader.readAsDataURL(file);
  });
}

function getSatelliteCenter(centerCode: string) {
  const satellite = centerCode.split('-')[1]?.trim();
  return satellite && satellite.toLowerCase() !== 'itac' ? satellite : '';
}
export function StudentStatusBadge({ compact = false, status }: { compact?: boolean; status: string }) {
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
