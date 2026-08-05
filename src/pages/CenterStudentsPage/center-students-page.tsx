import { useEffect, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Badge, Button } from '@radix-ui/themes';
import { ArrowLeft, Camera, Download, Edit3, ExternalLink, FileQuestion, ListChecks, Mail, ShieldCheck, Users } from 'lucide-react';
import { demoStudent, profileImage } from '@/data/demo-student';
import { profilePath } from '@/data/navigation';

type CenterStudent = (typeof demoStudent.centerStudents)[number];

export function StudentProfileView() {
  const currentStudent = getCurrentCenterStudent();

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
      <StudentProfileCard student={currentStudent} mode="self" />

      <div className="mt-6">
        <AssessmentPanel allowDownloads student={currentStudent} />
      </div>
    </main>
  );
}

export function PeerStudentProfilePage() {
  const { studentId } = useParams();
  const student = demoStudent.centerStudents.find((centerStudent) => centerStudent.id === studentId);

  if (!student || student.id === demoStudent.id) {
    return <Navigate to={profilePath} replace />;
  }

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
      <StudentProfileCard student={student} mode="peer" />
      <div className="mt-6">
        <AssessmentPanel student={student} />
      </div>
    </main>
  );
}

export function CenterStudentsPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
      <CenterStudentDirectory />
    </main>
  );
}

function StudentProfileCard({ mode, student }: { mode: 'self' | 'peer'; student: CenterStudent }) {
  const [uploadedProfileImage, setUploadedProfileImage] = useState('');
  const assessmentTotalForStudent = getAssessmentTotal(student.assessmentCounts);
  const studentProfileImage = uploadedProfileImage || (student.id === demoStudent.id ? profileImage : `${import.meta.env.BASE_URL}Docs/DOE_blue_seal_logo-head.png`);

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
            <img className="aspect-square w-[100px] object-contain" src={studentProfileImage} alt={`${student.name} profile`} />
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
            <ProfileRow label="ITAC Student Certificate" value={<CertificateStatus student={student} />} />
            <ProfileRow label="Time in ITAC" value={student.timeInItac} />
            {mode === 'peer' && (
              <ProfileRow
                label="Email"
                value={
                  <a className="font-semibold text-doe-blue underline underline-offset-4" href={`mailto:${student.email}`}>
                    {student.email}
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

function ProfileHeaderActions({ mode, student }: { mode: 'self' | 'peer'; student: CenterStudent }) {
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

function CenterStudentDirectory() {
  const centerStudents = getVisibleCenterStudents();

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-950">
            <Users aria-hidden="true" size={24} />
            List of All Center Students
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">{demoStudent.center} students only</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge color="blue" size="2" variant="soft">
            {centerStudents.length} students
          </Badge>
          <Button asChild color="gray" variant="soft">
            <Link to={profilePath}>
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
            <div className="text-sm font-semibold text-slate-700">{student.type}</div>
            <div className="text-sm font-semibold text-slate-700">{student.graduationYear}</div>
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

function CertificateStatus({ student }: { student: CenterStudent }) {
  const hasCertificate = student.certificateStatus.toLowerCase() !== 'no certificate';

  if (hasCertificate) {
    return student.certificateStatus;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span>No certificate</span>
      {student.id === demoStudent.id && (
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

function AssessmentPanel({ allowDownloads = false, student }: { allowDownloads?: boolean; student: CenterStudent }) {
  const hasLeadAssessments = student.assessmentCounts.lead > 0;
  const assessmentRecordsForStudent = getStudentAssessmentRecords(student);
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
                <p className="mt-1 text-base font-semibold text-slate-950">{assessment.date}</p>
              </div>
              <PersonPill name={assessment.facultyStaff} role={assessment.studentRole === 'Lead' ? 'Lead' : undefined} />
              <div className="flex flex-wrap gap-2">
                {assessment.participants.map((participant) => (
                  <PersonPill
                    highlighted={participant.name === student.name}
                    key={`${assessment.id}-${participant.name}`}
                    muted={participant.name !== student.name}
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
  muted = false,
  name,
  role,
}: {
  highlighted?: boolean;
  muted?: boolean;
  name: string;
  role?: string;
}) {
  const roleStyle = getRoleStyle(role, highlighted);

  return (
    <div className={`inline-flex min-h-11 max-w-full items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${roleStyle.container}`}>
      <span className={`h-7 w-7 shrink-0 rounded-full ${highlighted || roleStyle.isColorCoded ? 'bg-white' : 'bg-slate-200'}`}>
        <img className="h-full w-full rounded-full object-cover" src={highlighted ? profileImage : `${import.meta.env.BASE_URL}Docs/DOE_blue_seal_logo-head.png`} alt="" />
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
      <dd className="border-b border-slate-200 py-2.5 text-base text-slate-950">{value}</dd>
    </>
  );
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

function getCurrentCenterStudent() {
  return demoStudent.centerStudents.find((student) => student.id === demoStudent.id) ?? demoStudent.centerStudents[0];
}

function getVisibleCenterStudents() {
  return demoStudent.centerStudents.filter((student) => student.id !== demoStudent.id);
}

function getAssessmentTotal(counts: { lead: number; safety: number; other: number }) {
  return counts.lead + counts.safety + counts.other;
}

function getStudentAssessmentRecords(student: CenterStudent) {
  if (student.id === demoStudent.id) {
    return demoStudent.assessments;
  }

  const counts = student.assessmentCounts;
  const records = [
    {
      id: `AS${student.id}`,
      date: '05/14/2026',
      facultyStaff: demoStudent.facultyStaff || 'Dr. Patrick Phelan',
      studentRole: counts.lead > 0 ? 'Lead' : counts.safety > 0 ? 'Safety' : 'Other',
      participants: [
        { name: student.name, role: counts.lead > 0 ? 'Lead' : counts.safety > 0 ? 'Safety' : 'Other' },
        { name: 'Ariana Patel', role: 'Other' },
        { name: 'Nina Chen', role: 'Safety' },
      ],
    },
    {
      id: `AS${Number(student.id) + 40}`,
      date: '03/22/2026',
      facultyStaff: 'Dr. Ryan Milcarek',
      studentRole: counts.safety > 1 ? 'Safety' : 'Other',
      participants: [
        { name: 'Priya Shah', role: 'Lead' },
        { name: student.name, role: counts.safety > 1 ? 'Safety' : 'Other' },
        { name: 'Diego Martinez', role: 'Other' },
      ],
    },
  ];

  return records.slice(0, Math.max(1, Math.min(2, getAssessmentTotal(counts))));
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
