import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Select, TextField } from '@radix-ui/themes';
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { AppNavbar } from '@/components/AppNavbar';
import { CenterStudentsPage, PeerStudentProfilePage, StudentProfileView } from '@/pages/CenterStudentsPage/center-students-page';
import { demoStudent, profileImage } from '@/data/demo-student';
import { profilePath } from '@/data/navigation';

type LandingPageProps = {
  view?: 'profile' | 'edit' | 'center-students' | 'student-profile';
};

type TextInputType = 'email' | 'password' | 'text' | 'date';

export default function LandingPage({ view = 'profile' }: LandingPageProps) {
  const [form, setForm] = useState({
    email: demoStudent.email,
    alternateEmail: demoStudent.alternateEmail,
    linkedin: demoStudent.linkedin,
    studentType: demoStudent.studentType,
    major: demoStudent.major,
    graduationYear: demoStudent.graduationYear,
    programStartDate: demoStudent.programStartDate,
    classStanding: demoStudent.classStanding,
    graduateStudentType: demoStudent.graduateStudentType,
    password: '',
    confirmPassword: '',
  });
  const [savedMessage, setSavedMessage] = useState('');

  const showGraduateType = useMemo(
    () => form.studentType === 'Graduate' || form.classStanding === 'Graduate Student',
    [form.classStanding, form.studentType],
  );

  const requiredComplete =
    form.email &&
    form.alternateEmail &&
    form.studentType &&
    form.major &&
    form.graduationYear &&
    form.programStartDate &&
    form.classStanding &&
    (!showGraduateType || form.graduateStudentType);

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
    setSavedMessage('Profile saved for demo.');
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <AppNavbar firstName={demoStudent.firstName} profileImage={profileImage} />
      {view === 'edit' ? (
        <EditProfileView
          form={form}
          onSubmit={handleSubmit}
          onUpdate={updateField}
          requiredComplete={Boolean(requiredComplete)}
          savedMessage={savedMessage}
          showGraduateType={showGraduateType}
        />
      ) : view === 'center-students' ? (
        <CenterStudentsPage />
      ) : view === 'student-profile' ? (
        <PeerStudentProfilePage />
      ) : (
        <StudentProfileView />
      )}
    </div>
  );
}

function EditProfileView({
  form,
  onSubmit,
  onUpdate,
  requiredComplete,
  savedMessage,
  showGraduateType,
}: {
  form: Record<string, string>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdate: (field: keyof typeof form, value: string) => void;
  requiredComplete: boolean;
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
          <RequiredTextField label="Alternate email" type="email" value={form.alternateEmail} onChange={(value) => onUpdate('alternateEmail', value)} />
          <TextInput label="LinkedIn" value={form.linkedin} placeholder="https://www.linkedin.com/in/name" onChange={(value) => onUpdate('linkedin', value)} />
          <RequiredSelect label="Student type" value={form.studentType} options={['Undergraduate', 'Graduate']} onChange={(value) => onUpdate('studentType', value)} />
          <RequiredSelect
            label="Major"
            value={form.major}
            options={['Mechanical Engineering', 'Electrical Engineering', 'Industrial Engineering', 'Computer Science', 'Environmental Engineering', 'Other']}
            onChange={(value) => onUpdate('major', value)}
          />
          <RequiredTextField label="Graduation year" value={form.graduationYear} onChange={(value) => onUpdate('graduationYear', value)} />
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
        </div>

        <section className="mt-8 border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold text-slate-950">Password Update</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            
            <TextInput label="New password" required type="password" value={form.password} onChange={(value) => onUpdate('password', value)} />
            <TextInput label="Confirm password" required type="password" value={form.confirmPassword} onChange={(value) => onUpdate('confirmPassword', value)} />
          </div>
        </section>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <p className={savedMessage.includes('Please') ? 'text-sm font-semibold text-red-700' : 'text-sm font-semibold text-green-700'}>
            {savedMessage || 'Required fields are marked with an asterisk.'}
          </p>
          <Button color="blue" disabled={!requiredComplete} size="3" type="submit">
            {savedMessage === 'Profile saved for demo.' ? <CheckCircle2 aria-hidden="true" size={18} /> : <Save aria-hidden="true" size={18} />}
            Save Profile
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
