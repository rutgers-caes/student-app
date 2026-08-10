import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Select, TextField } from '@radix-ui/themes';
import { ArrowLeft, CheckCircle2, Circle, Save } from 'lucide-react';
import { AppNavbar } from '@/components/AppNavbar';
import { CenterStudentsPage, PeerStudentProfilePage, StudentProfileView } from '@/pages/CenterStudentsPage/center-students-page';
import { centers } from '@/data/CenterBranding';
import { demoStudent, profileImage } from '@/data/demo-student';
import { profilePath } from '@/data/navigation';
import { AuthServiceApi } from '@/services/auth-service';

type LandingPageProps = {
  view?: 'profile' | 'edit' | 'center-students' | 'student-profile';
};

type TextInputType = 'email' | 'password' | 'text' | 'date';

const initialProfileForm = {
  email: demoStudent.email,
  alternateEmail: demoStudent.alternateEmail,
  studentType: demoStudent.studentType,
  major: demoStudent.major,
  programStartDate: demoStudent.programStartDate,
  classStanding: demoStudent.classStanding,
  linkedin: demoStudent.linkedin,
  graduationYear: demoStudent.graduationYear,
  graduateStudentType: demoStudent.graduateStudentType,
  password: '',
  confirmPassword: '',
};

export default function LandingPage({ view = 'profile' }: LandingPageProps) {
  const portalStudent = AuthServiceApi.getStoredStudentProfile<typeof demoStudent>() || demoStudent;
  const [form, setForm] = useState(initialProfileForm);
  const [savedMessage, setSavedMessage] = useState('');

  const showGraduateType = useMemo(
    () => form.studentType === 'Graduate' || form.classStanding === 'Graduate Student',
    [form.classStanding, form.studentType],
  );

  const emailsAreDifferent = form.email.trim().toLowerCase() !== form.alternateEmail.trim().toLowerCase();
  const passwordRules = {
    length: form.password.length >= 8,
    number: /\d/.test(form.password),
    symbol: /[^A-Za-z0-9]/.test(form.password),
  };
  const passwordStarted = Boolean(form.password || form.confirmPassword);
  const passwordValid = Object.values(passwordRules).every(Boolean);
  const confirmPasswordMatches = Boolean(form.password) && form.password === form.confirmPassword;
  const passwordSectionValid = !passwordStarted || (passwordValid && confirmPasswordMatches);
  const formChanged = Object.entries(form).some(([field, value]) => initialProfileForm[field as keyof typeof initialProfileForm] !== value);
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    setSavedMessage('Profile saved for demo.');
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <AppNavbar firstName={portalStudent.firstName} profileImage={portalStudent.photoBase64 || profileImage} />
      {view === 'edit' ? (
        <EditProfileView
          form={form}
          onSubmit={handleSubmit}
          onUpdate={updateField}
          canSave={canSave}
          confirmPasswordMatches={confirmPasswordMatches}
          emailsAreDifferent={emailsAreDifferent}
          passwordRules={passwordRules}
          passwordStarted={passwordStarted}
          savedMessage={savedMessage}
          showGraduateType={showGraduateType}
        />
      ) : view === 'center-students' ? (
        <CenterStudentsPage />
      ) : view === 'student-profile' ? (
        <>
          <CenterBrandingBanner student={portalStudent} />
          <PeerStudentProfilePage />
        </>
      ) : (
        <>
          <CenterBrandingBanner student={portalStudent} />
          <StudentProfileView />
        </>
      )}
    </div>
  );
}

function CenterBrandingBanner({ student }: { student: typeof demoStudent }) {
  const centerCode = student.centerCode.split('-')[0];
  const center = centers.find((centerOption) => centerOption.code === centerCode);
  const primaryColor = center?.colors[0] || '#607aa8';
  const accentColor = center?.colors[1] || '#ffffff';
  const centerName = center?.name || student.center.split('|')[1]?.trim() || student.center;

  return (
    <section className="border-b border-slate-200" style={{ backgroundColor: primaryColor }}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/35 bg-white/15 text-base font-black tracking-normal shadow-sm"
            style={{ color: accentColor }}
            aria-hidden="true"
          >
            {centerCode}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/75">Center Affiliation</p>
            <h1 className="mt-0.5 text-[clamp(18px,2vw,24px)] font-semibold leading-tight tracking-normal text-white">{centerName}</h1>
          </div>
        </div>
        <div className="rounded-lg border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
          {student.centerCode}
        </div>
      </div>
    </section>
  );
}

function EditProfileView({
  form,
  onSubmit,
  onUpdate,
  canSave,
  confirmPasswordMatches,
  emailsAreDifferent,
  passwordRules,
  passwordStarted,
  savedMessage,
  showGraduateType,
}: {
  form: Record<string, string>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdate: (field: keyof typeof form, value: string) => void;
  canSave: boolean;
  confirmPasswordMatches: boolean;
  emailsAreDifferent: boolean;
  passwordRules: Record<'length' | 'number' | 'symbol', boolean>;
  passwordStarted: boolean;
  savedMessage: string;
  showGraduateType: boolean;
}) {
  return (
    <main className="mx-auto w-full max-w-[980px] px-5 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Manage Profile</p>
          <h1 className="mt-1 text-[clamp(30px,4vw,42px)] font-semibold leading-tight text-slate-950">Edit Profile</h1>
        </div>
        <Button asChild color="gray" variant="soft">
          <Link to={profilePath}>
            <ArrowLeft aria-hidden="true" size={18} />
            Back to Profile
          </Link>
        </Button>
      </div>

      <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSubmit}>
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
            <div>
              <TextInput label="New password" type="password" value={form.password} onChange={(value) => onUpdate('password', value)} />
              {passwordStarted && <PasswordRuleList rules={passwordRules} />}
            </div>
            <div>
              <TextInput label="Confirm password" type="password" value={form.confirmPassword} onChange={(value) => onUpdate('confirmPassword', value)} />
              {passwordStarted && (
                <PasswordRule complete={confirmPasswordMatches} label={confirmPasswordMatches ? 'Passwords match' : 'Passwords must match'} />
              )}
            </div>
          </div>
        </section>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <p className={savedMessage.includes('Please') ? 'text-sm font-semibold text-red-700' : 'text-sm font-semibold text-green-700'}>
            {savedMessage || 'Required fields are marked with an asterisk.'}
          </p>
          <Button color={canSave ? 'blue' : 'gray'} disabled={!canSave} size="3" type="submit">
            {savedMessage === 'Profile saved for demo.' ? <CheckCircle2 aria-hidden="true" size={18} /> : <Save aria-hidden="true" size={18} />}
            Save Profile
          </Button>
        </div>
      </form>
    </main>
  );
}

function PasswordRuleList({ rules }: { rules: Record<'length' | 'number' | 'symbol', boolean> }) {
  return (
    <div className="mt-3 space-y-1">
      <PasswordRule complete={rules.length} label="At least 8 characters" />
      <PasswordRule complete={rules.number} label="At least 1 number" />
      <PasswordRule complete={rules.symbol} label="At least 1 special symbol" />
    </div>
  );
}

function PasswordRule({ complete, label }: { complete: boolean; label: string }) {
  const Icon = complete ? CheckCircle2 : Circle;

  return (
    <p className={complete ? 'flex items-center gap-2 text-sm font-semibold text-green-700' : 'flex items-center gap-2 text-sm font-semibold text-slate-500'}>
      <Icon aria-hidden="true" size={14} />
      {label}
    </p>
  );
}

function RequiredTextField({ label, ...props }: Parameters<typeof TextInput>[0]) {
  return <TextInput label={label} required {...props} />;
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: TextInputType;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <TextField.Root required={required} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
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
