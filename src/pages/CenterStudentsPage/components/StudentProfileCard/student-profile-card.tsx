import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@radix-ui/themes';
import { Award, Camera, ExternalLink, FileQuestion, Mail, Users } from 'lucide-react';
import { Card, StatusNotice } from '@/components/ui';
import { AuthServiceApi } from '@/services/auth-service';
import { queryKeys } from '@/services/query-client';
import { iconSizes } from '@/styles/iconography';
import { typographyClassNames } from '@/styles/typography';
import type { StudentProfile } from '@/types/student-profile';
import { readFileAsDataUrl } from '../../center-students-file-utils';
import type { CenterStudent, PortalStudent, StudentProfileMode } from '../../center-students-types';
import { toStudentDisplayModel } from '../../student-profile-display-model';
import type { StudentDisplayModel } from '../../student-profile-display-model';
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
  const queryClient = useQueryClient();
  const profilePhotoMutation = useMutation({
    mutationFn: (profilePhoto: string) => AuthServiceApi.updateMyProfile<StudentProfile>({ profilePhoto }),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKeys.myProfile, updatedProfile);
      queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
      onStudentUpdate?.(updatedProfile);
      setUploadedProfileImage('');
      setPhotoMessage('Profile photo updated.');
    },
    onError: (error) => {
      setUploadedProfileImage('');
      setPhotoMessage(error instanceof Error ? error.message : 'Unable to update profile photo.');
    },
  });
  const displayStudent = toStudentDisplayModel({ portalStudent, student });
  const studentProfileImage = uploadedProfileImage || displayStudent.photoBase64 || '';

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

    setPhotoMessage('');

    try {
      const profilePhoto = await readFileAsDataUrl(file);
      setUploadedProfileImage(profilePhoto);
      profilePhotoMutation.mutate(profilePhoto);
    } catch (error) {
      setUploadedProfileImage('');
      setPhotoMessage(error instanceof Error ? error.message : 'Unable to update profile photo.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <section className="grid items-stretch gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <Card as="aside" className="p-5">
        <div className="mx-auto w-fit overflow-hidden rounded-md border border-slate-200 bg-slate-50 p-2">
          <ProfileImage className="aspect-square w-[clamp(140px,42vw,220px)]" imageSrc={studentProfileImage} label={`${displayStudent.name} profile`} />
        </div>
        {mode === 'self' && (
          <>
            <input className="sr-only" id="profile-photo-upload" type="file" accept="image/*" onChange={handleProfilePhotoChange} />
            <Button asChild className="mt-4 w-full" color="gray" highContrast variant="soft">
              <label htmlFor="profile-photo-upload">
                <Camera aria-hidden="true" size={iconSizes.sm} />
                {profilePhotoMutation.isPending ? 'Uploading Photo' : 'Upload Profile Photo'}
              </label>
            </Button>
            {photoMessage && (
              <StatusNotice className="mt-3 px-3 py-2" tone={photoMessage.includes('updated') ? 'success' : 'error'}>
                {photoMessage}
              </StatusNotice>
            )}
          </>
        )}

        <Card className="mt-6 shadow-none">
          <div className="border-b border-slate-200 px-4 py-3 text-center">
            <h2 className="flex items-center justify-center gap-2 text-lg font-semibold text-slate-950">
              Assessment Count
            </h2>
          </div>
          <div className="px-3 pb-2 pt-3 text-center text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
            {displayStudent.assessmentsBeforeLeadLabel}
          </div>
          <div className="grid grid-cols-4 text-center">
            {displayStudent.assessmentCounts.map(({ label, value }) => (
              <div className="border-r border-slate-200 px-3 py-4 last:border-r-0" key={label}>
                <p className="whitespace-nowrap text-[11px] font-bold uppercase text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </Card>

      <Card as="section" className="flex h-full flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <h2 className={typographyClassNames.pageTitle}>{displayStudent.name}</h2>
          <ProfileHeaderActions displayStudent={displayStudent} mode={mode} />
        </div>

        <dl className="grid flex-1 grid-cols-1 content-start px-5 py-1 md:grid-cols-[200px_minmax(0,1fr)]">
          <ProfileRow label="Student ID" value={displayStudent.id} />
          <ProfileRow label="Center" value={<CenterValue center={displayStudent.center} satelliteCenter={displayStudent.satelliteCenter} />} />
          <ProfileRow label="Student type" value={displayStudent.type} />
          <ProfileRow label="First Assessment Date" value={displayStudent.assessmentDateRange.first} />
          <ProfileRow label="Last Assessment Date" value={displayStudent.assessmentDateRange.last} />
          <ProfileRow label="ITAC Student Certificate" value={<CertificateStatus displayStudent={displayStudent} />} />
          <ProfileRow label="Time in ITAC (estimated)" value={displayStudent.timeInItac} />
          <ProfileRow label="Email" value={<EmailLink email={displayStudent.email} />} />
        </dl>
      </Card>
    </section>
  );
}

function ProfileHeaderActions({ displayStudent, mode }: { displayStudent: StudentDisplayModel; mode: StudentProfileMode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {displayStudent.linkedin && (
        <Button asChild color="blue" variant="soft">
          <a href={displayStudent.linkedin} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" size={iconSizes.sm} />
            View LinkedIn
          </a>
        </Button>
      )}
      {mode === 'self' ? (
        <Button asChild color="sky" variant="soft">
          <Link to="/center-students">
            <Users aria-hidden="true" size={iconSizes.sm} />
            List of All Center Students
          </Link>
        </Button>
      ) : (
        <Button asChild color="sky" variant="soft">
          <a href={`mailto:${displayStudent.email}`}>
            <Mail aria-hidden="true" size={iconSizes.sm} />
            Email Student
          </a>
        </Button>
      )}
    </div>
  );
}

function CertificateStatus({ displayStudent }: { displayStudent: StudentDisplayModel }) {
  if (displayStudent.certificate.hasCertificate) {
    return (
      <span className="inline-flex items-center gap-2 font-semibold text-slate-950">
        <Award aria-label="Certificate received" className="shrink-0 text-doe-blue" size={iconSizes.lg} />
        {displayStudent.certificate.status}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span>-</span>
      {displayStudent.isPortalStudent && (
        <Button asChild color="blue" variant="soft">
          <Link to="/certificate-request">
            <FileQuestion aria-hidden="true" size={iconSizes.sm} />
            How to Request
          </Link>
        </Button>
      )}
    </div>
  );
}
