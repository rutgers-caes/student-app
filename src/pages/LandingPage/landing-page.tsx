import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Select, TextField } from '@radix-ui/themes';
import { Camera, CheckCircle2, Download, Edit3, ExternalLink, ListChecks, Save, ShieldCheck, Users } from 'lucide-react';
import { AppNavbar } from '@/components/AppNavbar';
import { assessmentTotal, demoStudent, profileImage } from '@/data/demo-student';
import { profilePath } from '@/data/navigation';

type LandingPageProps = {
  view?: 'profile' | 'edit';
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
      ) : (
        <StudentProfileView />
      )}
    </div>
  );
}

function StudentProfileView() {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
      <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">{demoStudent.centerCode}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-4 py-2 text-base font-bold text-green-800 shadow-sm">
            {demoStudent.status}
          </span>
          <Button asChild color="blue" size="3">
            <Link to="/edit-profile">
              <Edit3 aria-hidden="true" size={18} />
              Edit Profile
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <img className="aspect-square w-full object-contain p-10" src={profileImage} alt={`${demoStudent.name} profile`} />
          </div>
          <Button className="mt-4 w-full" color="gray" highContrast variant="soft">
            <Camera aria-hidden="true" size={18} />
            Upload Profile Photo
          </Button>

          <div className="mt-6 rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                <ListChecks aria-hidden="true" size={20} />
                Assessment Count
              </h2>
            </div>
            <div className="grid grid-cols-4 text-center">
              {[
                ['Lead', demoStudent.assessmentCounts.lead],
                ['Safety', demoStudent.assessmentCounts.safety],
                ['Other', demoStudent.assessmentCounts.other],
                ['Total', assessmentTotal],
              ].map(([label, value]) => (
                <div className="border-r border-slate-200 px-3 py-4 last:border-r-0" key={label}>
                  <p className="whitespace-nowrap text-[11px] font-bold uppercase text-slate-500">{label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-3xl font-semibold text-slate-950">{demoStudent.name}</h2>
              </div>
              <Button color="sky" variant="soft">
                <Users aria-hidden="true" size={18} />
                List of All Center Students
              </Button>
            </div>

            <dl className="grid grid-cols-1 px-6 py-2 md:grid-cols-[240px_minmax(0,1fr)]">
              <ProfileRow label="Student ID" value={demoStudent.id} />
              <ProfileRow label="Student name" value={demoStudent.name} />
              <ProfileRow label="Center" value={demoStudent.center} />
              <ProfileRow label="Student type" value={demoStudent.studentType} />
              <ProfileRow label="Student/alumni status" value={demoStudent.status} />
              <ProfileRow label="ITAC Student Certificate" value={demoStudent.certificateStatus} />
              <ProfileRow label="Time in ITAC" value={demoStudent.timeInItac} />
              <ProfileRow
                label="LinkedIn"
                value={
                  demoStudent.linkedin ? (
                    <a className="inline-flex items-center gap-1 text-doe-blue underline underline-offset-4" href={demoStudent.linkedin} target="_blank" rel="noreferrer">
                      View LinkedIn
                      <ExternalLink aria-hidden="true" size={16} />
                    </a>
                  ) : (
                    'Not available'
                  )
                }
              />
            </dl>
          </section>

        </div>
      </section>

      <div className="mt-6">
        <AssessmentPanel />
      </div>
    </main>
  );
}

function AssessmentPanel() {
  const hasLeadAssessments = demoStudent.assessmentCounts.lead > 0;
  const leadDownloadLabel = hasLeadAssessments ? 'As Lead' : 'As Lead';

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
            <ShieldCheck aria-hidden="true" size={22} />
            Assessments
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {demoStudent.assessmentConnected
              ? `${demoStudent.assessmentCounts.other} assessments before Lead`
              : 'Not currently connected with any assessments.'}
          </p>
        </div>

        {demoStudent.assessmentConnected && (
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
                {leadDownloadLabel}
              </Button>
            </div>
          </div>
        )}
      </div>

      {demoStudent.assessmentConnected ? (
        <div className="overflow-x-auto">
          <div className="grid min-w-[760px] grid-cols-[150px_260px_minmax(360px,1fr)] border-b border-slate-200 px-5 py-3 text-sm font-bold uppercase tracking-[0.04em] text-slate-500">
            <div>ID</div>
            <div>Faculty/Staff</div>
            <div>Student Participants</div>
          </div>
          {demoStudent.assessments.map((assessment, index) => (
            <div
              className={`grid min-w-[760px] grid-cols-[150px_260px_minmax(360px,1fr)] gap-4 border-b border-slate-200 px-5 py-4 last:border-b-0 ${
                index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
              }`}
              key={assessment.id}
            >
              <div>
                <p className="text-lg font-bold text-doe-blue">{assessment.id}</p>
                <p className="mt-1 text-base font-semibold text-slate-950">{assessment.date}</p>
              </div>
              <PersonPill name={assessment.facultyStaff} role={assessment.studentRole === 'Lead' ? 'Lead' : undefined} muted={assessment.studentRole !== 'Lead'} />
              <div className="flex flex-wrap gap-2">
                {assessment.participants.map((participant) => (
                  <PersonPill
                    highlighted={participant.name === demoStudent.name}
                    key={`${assessment.id}-${participant.name}`}
                    muted={participant.name !== demoStudent.name}
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
    <div
      className={`inline-flex min-h-11 max-w-full items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${roleStyle.container}`}
    >
      <span className={`h-7 w-7 shrink-0 rounded-full ${highlighted || roleStyle.isColorCoded ? 'bg-white' : 'bg-slate-200'}`}>
        <img className="h-full w-full rounded-full object-cover" src={highlighted ? profileImage : '/Docs/DOE_blue_seal_logo-head.png'} alt="" />
      </span>
      {role && <span className={`text-xs font-bold ${roleStyle.roleText}`}>{role}</span>}
      <span className="truncate">{name}</span>
    </div>
  );
}

function getRoleStyle(role?: string, highlighted = false) {
  if (highlighted && role === 'Lead') {
    return {
      container: 'border-green-300 bg-green-100 text-green-950',
      isColorCoded: true,
      roleText: 'text-green-700',
    };
  }

  if (highlighted && role === 'Safety') {
    return {
      container: 'border-yellow-300 bg-yellow-100 text-yellow-950',
      isColorCoded: true,
      roleText: 'text-yellow-700',
    };
  }

  return {
    container: highlighted ? 'border-blue-500 bg-sky-200 text-slate-950' : 'border-slate-300 bg-white text-slate-700',
    isColorCoded: false,
    roleText: 'text-slate-400',
  };
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
          <Link to={profilePath}>Back to Profile</Link>
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

function ProfileRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="border-b border-slate-200 py-3 text-sm font-bold uppercase tracking-[0.04em] text-slate-500">{label}</dt>
      <dd className="border-b border-slate-200 py-3 text-lg text-slate-950">{value}</dd>
    </>
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
