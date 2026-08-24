import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Select, TextField } from '@radix-ui/themes';
import { ArrowLeft, CheckCircle2, Edit3, Save } from 'lucide-react';
import { AppNavbar } from '@/components/AppNavbar';
import { CenterBrandingBanner } from '@/components/CenterBrandingBanner';
import { PasswordRequirements, PasswordRule, getPasswordRules } from '@/components/PasswordRequirements';
import { CenterStudentsPage, PeerStudentProfilePage, StudentProfileView, StudentStatusBadge } from '@/pages/CenterStudentsPage';
import { profilePath, studentProfilePath } from '@/data/navigation';
import { AuthServiceApi } from '@/services/auth-service';
import { statusTextClassNames } from '@/styles/patterns';
import type { StudentProfile } from '@/types/student-profile';

type LandingPageProps = {
  view?: 'profile' | 'edit' | 'center-students' | 'student-profile';
};

type TextInputType = 'email' | 'password' | 'text' | 'date';
type TextInputAutoComplete = 'email' | 'new-password' | 'off';



export default function LandingPage({ view = 'profile' }: LandingPageProps) {
  const [portalStudent, setPortalStudent] = useState<StudentProfile | null>(null);
  const [form, setForm] = useState(() => buildProfileForm(portalStudent));
  const [savedMessage, setSavedMessage] = useState('');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isSaving, setIsSaving] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileHref = portalStudent ? studentProfilePath(portalStudent.name) : profilePath;

  useEffect(() => {
    let isMounted = true;

    AuthServiceApi.getMyProfile<StudentProfile>()
      .then((profile) => {
        if (!isMounted) return;
        setPortalStudent(profile);
        setForm(buildProfileForm(profile));
        setLoadState('ready');
        if (view === 'profile' && location.pathname === profilePath) {
          navigate(studentProfilePath(profile.name), { replace: true });
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadState('error');
      });

    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate, view]);

  const showGraduateType = useMemo(
    () => form.studentType === 'Graduate' || form.classStanding === 'Graduate Student',
    [form.classStanding, form.studentType],
  );

  const emailsAreDifferent = form.email.trim().toLowerCase() !== form.alternateEmail.trim().toLowerCase();
  const passwordRules = getPasswordRules(form.password);
  const passwordStarted = Boolean(form.currentPassword || form.password || form.confirmPassword);
  const passwordValid = Object.values(passwordRules).every(Boolean);
  const confirmPasswordMatches = Boolean(form.password) && form.password === form.confirmPassword;
  const passwordSectionValid = !passwordStarted || (Boolean(form.currentPassword) && passwordValid && confirmPasswordMatches);
  const initialFormForStudent = useMemo(() => buildProfileForm(portalStudent), [portalStudent]);
  const formChanged = Object.entries(form).some(([field, value]) => initialFormForStudent[field as keyof typeof initialFormForStudent] !== value);
  const requiredComplete =
    form.email &&
    form.alternateEmail &&
    form.studentType &&
    form.major &&
    form.graduationYear &&
    form.programStartDate &&
    form.classStanding &&
    (!showGraduateType || form.graduateStudentType);
  const canSave = Boolean(requiredComplete && emailsAreDifferent && passwordSectionValid && formChanged);

  function updateField(field: keyof typeof form, value: string) {
    setSavedMessage('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requiredComplete) {
      setSavedMessage('Please complete all required fields before saving.');
      return;
    }
    if (!emailsAreDifferent) {
      setSavedMessage('Email and alternate email must be different.');
      return;
    }
    if (!passwordSectionValid) {
      setSavedMessage('Please complete the password rules before saving.');
      return;
    }
    if (!formChanged) {
      setSavedMessage('Make a change before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const profilePayload = buildProfileUpdatePayload(form, initialFormForStudent);
      const profileChanged = Object.keys(profilePayload).length > 0;
      const updatedProfile = profileChanged
        ? await AuthServiceApi.updateMyProfile<StudentProfile>(profilePayload)
        : portalStudent;
      if (passwordStarted) await AuthServiceApi.changePassword(form.currentPassword, form.password);
      setPortalStudent(updatedProfile);
      setForm(buildProfileForm(updatedProfile));
      setSavedMessage(passwordStarted ? 'Profile and password updated.' : 'Profile updated.');
    } catch (error) {
      setSavedMessage(error instanceof Error ? error.message : 'Unable to update profile.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <AppNavbar firstName={portalStudent?.firstName || 'Student'} profileHref={profileHref} profileImage={portalStudent?.photoBase64 || ''} />
      {loadState === 'loading' && <PageNotice message="Loading your student profile..." />}
      {loadState === 'error' && <PageNotice tone="error" message="Unable to refresh your profile. Showing the last available student data." />}
      {!portalStudent && loadState !== 'error' ? null : !portalStudent ? (
        <PageNotice tone="error" message="Unable to load your profile. Please log in again." />
      ) : view === 'edit' ? (
        <EditProfileView
          form={form}
          onSubmit={handleSubmit}
          onUpdate={updateField}
          canSave={canSave && !isSaving}
          confirmPasswordMatches={confirmPasswordMatches}
          emailsAreDifferent={emailsAreDifferent}
          passwordStarted={passwordStarted}
          profileHref={profileHref}
          savedMessage={savedMessage}
          showGraduateType={showGraduateType}
          isSaving={isSaving}
        />
      ) : view === 'center-students' ? (
        <>
          <CenterBrandingBanner student={portalStudent} />
          <CenterStudentsPage portalStudent={portalStudent} />
        </>
      ) : view === 'student-profile' ? (
        <PeerStudentProfilePage portalStudent={portalStudent} />
      ) : (
        <>
          <CenterBrandingBanner
            actions={
              <>
                <StudentStatusBadge status={portalStudent.status} />
                <Button asChild className="!bg-white !text-slate-950 hover:!bg-white/90" size="3">
                  <Link to="/edit-profile">
                    <Edit3 aria-hidden="true" size={18} />
                    Edit Profile
                  </Link>
                </Button>
              </>
            }
            student={portalStudent}
          />
          <StudentProfileView portalStudent={portalStudent} onStudentUpdate={setPortalStudent} />
        </>
      )}
    </div>
  );
}

function buildProfileForm(student: StudentProfile | null) {
  return {
    email: student?.email || '',
    alternateEmail: student?.alternateEmail || '',
    studentType: student?.studentType || '',
    major: student?.major || '',
    programStartDate: student?.programStartDate || '',
    classStanding: student?.classStanding || '',
    linkedin: student?.linkedin || '',
    graduationYear: student?.graduationYear || '',
    graduateStudentType: student?.graduateStudentType || '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  };
}

function buildProfileUpdatePayload(form: Record<string, string>, initialForm: Record<string, string>) {
  const updateFields = [
    'email',
    'alternateEmail',
    'studentType',
    'major',
    'programStartDate',
    'classStanding',
    'linkedin',
    'graduationYear',
    'graduateStudentType',
  ];

  const payload: Record<string, string> = {};
  for (const field of updateFields) {
    if (form[field] !== initialForm[field]) {
      payload[field] = form[field];
    }
  }

  return payload;
}

function PageNotice({ message, tone = 'info' }: { message: string; tone?: 'info' | 'error' }) {
  return (
    <div className={tone === 'error' ? 'border-b border-red-100 bg-red-50 px-5 py-2 text-center text-sm font-semibold text-red-700' : 'border-b border-blue-100 bg-blue-50 px-5 py-2 text-center text-sm font-semibold text-blue-800'}>
      {message}
    </div>
  );
}

function EditProfileView({
  form,
  onSubmit,
  onUpdate,
  canSave,
  confirmPasswordMatches,
  emailsAreDifferent,
  passwordStarted,
  profileHref,
  savedMessage,
  showGraduateType,
  isSaving,
}: {
  form: Record<string, string>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdate: (field: keyof typeof form, value: string) => void;
  canSave: boolean;
  confirmPasswordMatches: boolean;
  emailsAreDifferent: boolean;
  passwordStarted: boolean;
  profileHref: string;
  savedMessage: string;
  showGraduateType: boolean;
  isSaving: boolean;
}) {
  return (
    <main className="mx-auto w-full max-w-[980px] px-5 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Manage Profile</p>
          <h1 className="mt-1 text-[clamp(30px,4vw,42px)] font-semibold leading-tight text-slate-950">Edit Profile</h1>
        </div>
        <Button asChild color="gray" variant="soft">
          <Link to={profileHref}>
            <ArrowLeft aria-hidden="true" size={18} />
            Back to Profile
          </Link>
        </Button>
      </div>

      <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" autoComplete="off" onSubmit={onSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <RequiredTextField label="Email" type="email" value={form.email} onChange={(value) => onUpdate('email', value)} />
          <div>
            <RequiredTextField label="Alternate email" type="email" value={form.alternateEmail} onChange={(value) => onUpdate('alternateEmail', value)} />
            {!emailsAreDifferent && <p className="mt-2 text-sm font-semibold text-red-700">Alternate email must be different from email.</p>}
          </div>
          <RequiredSelect label="Student type" value={form.studentType} options={['Undergraduate', 'Graduate']} onChange={(value) => onUpdate('studentType', value)} />
          <RequiredSelect
            label="Major"
            value={form.major}
            options={['Mechanical Engineering', 'Electrical Engineering', 'Industrial Engineering', 'Computer Science', 'Environmental Engineering', 'Other']}
            onChange={(value) => onUpdate('major', value)}
          />
          <RequiredTextField label="ITAC program start date" type="date" value={form.programStartDate} onChange={(value) => onUpdate('programStartDate', value)} />
          <RequiredSelect
            label="Class standing when joining"
            value={form.classStanding}
            options={['Freshman', 'Sophomore', 'Junior', 'Senior', 'Second-Year Senior', 'Graduate Student']}
            onChange={(value) => onUpdate('classStanding', value)}
          />
          {showGraduateType && (
            <RequiredSelect
              label="Graduate student type"
              value={form.graduateStudentType}
              options={["Master's", 'PhD', 'Other']}
              onChange={(value) => onUpdate('graduateStudentType', value)}
            />
          )}
          <TextInput label="LinkedIn" value={form.linkedin} placeholder="https://www.linkedin.com/in/name" onChange={(value) => onUpdate('linkedin', value)} />
          <RequiredTextField label="Graduation year" value={form.graduationYear} onChange={(value) => onUpdate('graduationYear', value)} />
        </div>

        <section className="mt-8 border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold text-slate-950">Password Update</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <TextInput
              autoComplete="off"
              label="Current password"
              name="current-password"
              requiredLabel
              type="password"
              value={form.currentPassword}
              onChange={(value) => onUpdate('currentPassword', value)}
            />
            <div>
              <TextInput
                autoComplete="new-password"
                label="New password"
                name="new-password"
                requiredLabel
                type="password"
                value={form.password}
                onChange={(value) => onUpdate('password', value)}
              />
              {passwordStarted && <PasswordRequirements password={form.password} />}
            </div>
            <div>
              <TextInput
                autoComplete="new-password"
                label="Confirm password"
                name="confirm-new-password"
                requiredLabel
                type="password"
                value={form.confirmPassword}
                onChange={(value) => onUpdate('confirmPassword', value)}
              />
              {passwordStarted && (
                <PasswordRule complete={confirmPasswordMatches} label={confirmPasswordMatches ? 'Passwords match' : 'Passwords must match'} />
              )}
            </div>
          </div>
        </section>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          {savedMessage ? (
            <p className={savedMessage.includes('Please') ? statusTextClassNames.error : statusTextClassNames.success}>
              {savedMessage}
            </p>
          ) : (
            <p className={statusTextClassNames.muted}>
              Required fields are marked with an asterisk <span className="text-red-700">(*)</span>
            </p>
          )}
          <Button color={canSave ? 'blue' : 'gray'} disabled={!canSave} size="3" type="submit">
            {savedMessage === 'Profile updated.' || savedMessage === 'Profile and password updated.' ? <CheckCircle2 aria-hidden="true" size={18} /> : <Save aria-hidden="true" size={18} />}
            {isSaving ? 'Saving' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </main>
  );
}

function RequiredTextField({ label, ...props }: Parameters<typeof TextInput>[0]) {
  return <TextInput label={label} required {...props} />;
}

function TextInput({
  autoComplete,
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  requiredLabel = false,
  type = 'text',
}: {
  autoComplete?: TextInputAutoComplete;
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  requiredLabel?: boolean;
  type?: TextInputType;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {(required || requiredLabel) && <span className="text-red-600"> *</span>}
      </span>
      <TextField.Root
        autoComplete={autoComplete}
        name={name}
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function RequiredSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        <span className="text-red-600"> *</span>
      </span>
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger className="w-full" aria-label={label} />
        <Select.Content>
          {options.map((option) => (
            <Select.Item value={option} key={option}>
              {option}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </label>
  );
}
