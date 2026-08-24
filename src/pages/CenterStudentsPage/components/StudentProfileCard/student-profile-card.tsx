import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@radix-ui/themes';
import { Award, Camera, ExternalLink, FileQuestion, Mail, Users } from 'lucide-react';
import { AuthServiceApi } from '@/services/auth-service';
import type { StudentProfile } from '@/types/student-profile';
import { formatDateOnlyTokensForDisplay } from '@/utils/date-only-utils';
import { readFileAsDataUrl } from '../../center-students-file-utils';
import {
  formatAssessmentsBeforeLead,
  formatTimeInItac,
  getAssessmentDateRange,
  getAssessmentsBeforeLead,
  getSatelliteCenter,
} from '../../center-students-formatters';
import type { CenterStudent, PortalStudent, StudentProfileMode } from '../../center-students-types';
import { getAssessmentTotal, getStudentAssessmentRecords } from '../../center-students-utils';
import { CenterValue, EmailLink, ProfileRow } from '../ProfileFields';
import { ProfileImage } from '../ProfileImage';

export function StudentProfileCard({
  mode,
  onStudentUpdate,
  portalStudent,
  student,
}: {
  mode: StudentProfileMode;
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
  );
}

function ProfileHeaderActions({ mode, student }: { mode: StudentProfileMode; student: CenterStudent | StudentProfile }) {
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

function CertificateStatus({ portalStudent, student }: { portalStudent: PortalStudent; student: CenterStudent | StudentProfile }) {
  const hasCertificate = Boolean(student.certificateStatus) && student.certificateStatus.toLowerCase() !== 'no certificate';
  const certificateStatus = formatDateOnlyTokensForDisplay(student.certificateStatus);

  if (hasCertificate) {
    return (
      <span className="inline-flex items-center gap-2 font-semibold text-slate-950">
        <Award aria-label="Certificate received" className="shrink-0 text-doe-blue" size={25} />
        {certificateStatus}
      </span>
    );
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
