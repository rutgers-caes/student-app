import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PageShell, StatusNotice } from '@/components/ui';
import { profilePath, studentProfilePath } from '@/data/navigation';
import { usePortalStudent } from '@/hooks/use-portal-student';
import { AuthServiceApi } from '@/services/auth-service';
import { queryKeys } from '@/services/query-client';
import type { StudentProfile } from '@/types/student-profile';
import { isPasswordValid } from '@/components/PasswordRequirements';
import { errorToast, successToast } from '@/utils/toasts';
import { EditProfileForm } from './components/EditProfileForm';
import { buildProfileForm, buildProfileUpdatePayload } from './edit-profile-utils';

export default function EditProfilePage() {
  const queryClient = useQueryClient();
  const { data: portalStudent = null, isError, isLoading } = usePortalStudent();
  const [form, setForm] = useState(() => buildProfileForm(null));
  const profileHref = portalStudent ? studentProfilePath(portalStudent.name) : profilePath;

  useEffect(() => {
    if (portalStudent) {
      setForm(buildProfileForm(portalStudent));
    }
  }, [portalStudent]);

  const showGraduateType = useMemo(
    () => form.studentType === 'Graduate' || form.studentType === 'Graduate Student' || form.classStanding === 'Graduate Student',
    [form.classStanding, form.studentType],
  );
  const emailsAreDifferent = form.email.trim().toLowerCase() !== form.alternateEmail.trim().toLowerCase();
  const passwordStarted = Boolean(form.currentPassword || form.password || form.confirmPassword);
  const passwordValid = isPasswordValid(form.password);
  const confirmPasswordMatches = Boolean(form.password) && form.password === form.confirmPassword;
  const initialFormForStudent = useMemo(() => buildProfileForm(portalStudent), [portalStudent]);
  const profilePayload = useMemo(() => buildProfileUpdatePayload(form, initialFormForStudent), [form, initialFormForStudent]);
  const profileChanged = Object.keys(profilePayload).length > 0;
  const requiredComplete =
    form.email &&
    form.alternateEmail &&
    form.studentType &&
    form.major &&
    form.graduationYear &&
    form.programStartDate &&
    form.classStanding &&
    (!showGraduateType || form.graduateStudentType);
  const canSaveProfile = Boolean(requiredComplete && emailsAreDifferent && profileChanged);
  const canUpdatePassword = Boolean(passwordStarted && form.currentPassword && passwordValid && confirmPasswordMatches);
  const saveProfileMutation = useMutation({
    mutationFn: () => AuthServiceApi.updateMyProfile<StudentProfile>(profilePayload),
    onSuccess: async (updatedProfile) => {
      queryClient.setQueryData(queryKeys.myProfile, updatedProfile);
      await queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
      setForm(buildProfileForm(updatedProfile));
      successToast('Profile updated.');
    },
    onError: (error) => {
      errorToast(error instanceof Error ? error.message : 'Unable to update profile.');
    },
  });
  const updatePasswordMutation = useMutation({
    mutationFn: () => AuthServiceApi.changePassword(form.currentPassword, form.password),
    onSuccess: () => {
      setForm((current) => ({
        ...current,
        currentPassword: '',
        password: '',
        confirmPassword: '',
      }));
      successToast('Password updated.');
    },
    onError: (error) => {
      errorToast(error instanceof Error ? error.message : 'Unable to update password. Please check your current password and try again.');
    },
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requiredComplete) {
      errorToast('Please complete all required profile fields before saving.');
      return;
    }
    if (!emailsAreDifferent) {
      errorToast('Email and alternate email must be different.');
      return;
    }
    if (!profileChanged) {
      errorToast('Make a profile change before saving.');
      return;
    }

    saveProfileMutation.mutate();
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordStarted) {
      errorToast('Enter your current password and a new password before updating.');
      return;
    }
    if (!form.currentPassword) {
      errorToast('Please enter your current password.');
      return;
    }
    if (!passwordValid || !confirmPasswordMatches) {
      errorToast('Please complete the password rules before updating your password.');
      return;
    }

    updatePasswordMutation.mutate();
  }

  return (
    <PageShell firstName={portalStudent?.firstName || 'Student'} profileHref={profileHref} profileImage={portalStudent?.photoBase64 || ''}>
      {isLoading && <StatusBarNotice message="Loading your student profile..." />}
      {isError && <StatusBarNotice tone="error" message="Unable to refresh your profile. Showing the last available student data." />}
      {!portalStudent && !isError ? null : !portalStudent ? (
        <StatusBarNotice tone="error" message="Unable to load your profile. Please log in again." />
      ) : (
        <EditProfileForm
          canSaveProfile={canSaveProfile && !saveProfileMutation.isPending}
          canUpdatePassword={canUpdatePassword && !updatePasswordMutation.isPending}
          confirmPasswordMatches={confirmPasswordMatches}
          emailsAreDifferent={emailsAreDifferent}
          form={form}
          isSavingPassword={updatePasswordMutation.isPending}
          isSavingProfile={saveProfileMutation.isPending}
          onPasswordSubmit={handlePasswordSubmit}
          onProfileSubmit={handleProfileSubmit}
          onUpdate={updateField}
          passwordStarted={passwordStarted}
          profileHref={profileHref}
          showGraduateType={showGraduateType}
        />
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
