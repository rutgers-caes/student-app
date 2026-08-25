import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@radix-ui/themes';
import { ArrowLeft, KeyRound, Save } from 'lucide-react';
import { PasswordRequirements, PasswordRule } from '@/components/PasswordRequirements';
import { Card, FormField, FormSelect } from '@/components/ui';
import { iconSizes } from '@/styles/iconography';
import { typographyClassNames } from '@/styles/typography';

const studentTypeOptions = ['Undergraduate', 'Graduate'];
const majorOptions = [
  'Accounting',
  'Aerospace Engineering',
  'Business',
  'Chemical Engineering',
  'Civil Engineering',
  'Communications',
  'Construction Management',
  'Design, Construction & Planning',
  'Electrical/Computer Engineering',
  'Energy Engineering',
  'Energy Systems Engineering',
  'Environmental Engineering',
  'Industrial Engineering',
  'Mechanical Engineering',
  'Petroleum Engineering',
  'Other',
];
const classStandingOptions = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Second-Year Senior', 'Graduate Student'];
const graduateStudentTypeOptions = ["Master's", 'PhD', 'Other'];

export function EditProfileForm({
  canSaveProfile,
  canUpdatePassword,
  confirmPasswordMatches,
  emailsAreDifferent,
  form,
  isSavingPassword,
  isSavingProfile,
  onPasswordSubmit,
  onProfileSubmit,
  onUpdate,
  passwordStarted,
  profileHref,
  showGraduateType,
}: {
  canSaveProfile: boolean;
  canUpdatePassword: boolean;
  confirmPasswordMatches: boolean;
  emailsAreDifferent: boolean;
  form: Record<string, string>;
  isSavingPassword: boolean;
  isSavingProfile: boolean;
  onPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onProfileSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdate: (field: keyof typeof form, value: string) => void;
  passwordStarted: boolean;
  profileHref: string;
  showGraduateType: boolean;
}) {
  return (
    <main className="mx-auto w-full max-w-[980px] px-5 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={typographyClassNames.eyebrow}>Manage Profile</p>
          <h1 className={`mt-1 ${typographyClassNames.pageTitle}`}>Edit Profile</h1>
        </div>
        <Button asChild color="gray" variant="soft">
          <Link to={profileHref}>
            <ArrowLeft aria-hidden="true" size={iconSizes.sm} />
            Back to Profile
          </Link>
        </Button>
      </div>

      <Card as="form" className="p-6" autoComplete="off" onSubmit={onProfileSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <RequiredTextField label="Email" type="email" value={form.email} onChange={(value) => onUpdate('email', value)} />
          <div>
            <RequiredTextField label="Alternate email" type="email" value={form.alternateEmail} onChange={(value) => onUpdate('alternateEmail', value)} />
            {!emailsAreDifferent && <p className="mt-2 text-sm font-semibold text-red-700">Alternate email must be different from email.</p>}
          </div>
          <RequiredSelect label="Student type" value={form.studentType} options={withCurrentOption(studentTypeOptions, form.studentType)} onChange={(value) => onUpdate('studentType', value)} />
          <RequiredSelect
            label="Major"
            value={form.major}
            options={withCurrentOption(majorOptions, form.major)}
            onChange={(value) => onUpdate('major', value)}
          />
          <RequiredTextField label="ITAC program start date" type="date" value={form.programStartDate} onChange={(value) => onUpdate('programStartDate', value)} />
          <RequiredSelect
            label="Class standing when joining"
            value={form.classStanding}
            options={withCurrentOption(classStandingOptions, form.classStanding)}
            onChange={(value) => onUpdate('classStanding', value)}
          />
          {showGraduateType && (
            <RequiredSelect
              label="Graduate student type"
              value={form.graduateStudentType}
              options={withCurrentOption(graduateStudentTypeOptions, form.graduateStudentType)}
              onChange={(value) => onUpdate('graduateStudentType', value)}
            />
          )}
          <FormField label="LinkedIn" value={form.linkedin} placeholder="https://www.linkedin.com/in/name" onChange={(value) => onUpdate('linkedin', value)} />
          <RequiredTextField label="Graduation year" value={form.graduationYear} onChange={(value) => onUpdate('graduationYear', value)} />
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-slate-700">
            Required fields are marked with an asterisk <span className="text-red-700">(*)</span>
          </p>
          <Button color={canSaveProfile ? 'blue' : 'gray'} disabled={!canSaveProfile} size="3" type="submit">
            <Save aria-hidden="true" size={iconSizes.sm} />
            {isSavingProfile ? 'Saving' : 'Save Profile'}
          </Button>
        </div>
      </Card>

      <Card as="form" className="mt-6 p-6" autoComplete="off" onSubmit={onPasswordSubmit}>
        <section>
          <h2 className="text-xl font-semibold text-slate-950">Password Update</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <FormField
              autoComplete="off"
              label="Current password"
              name="current-password"
              requiredLabel
              type="password"
              value={form.currentPassword}
              onChange={(value) => onUpdate('currentPassword', value)}
            />
            <div>
              <FormField
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
              <FormField
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
          <p className="text-sm font-semibold text-slate-700">
            Password changes are saved separately from profile details.
          </p>
          <Button color={canUpdatePassword ? 'blue' : 'gray'} disabled={!canUpdatePassword} size="3" type="submit">
            <KeyRound aria-hidden="true" size={iconSizes.sm} />
            {isSavingPassword ? 'Updating' : 'Update Password'}
          </Button>
        </div>
      </Card>
    </main>
  );
}

function RequiredTextField({ label, ...props }: Parameters<typeof FormField>[0]) {
  return <FormField label={label} required {...props} />;
}

function RequiredSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return <FormSelect label={label} value={value} options={options} required onChange={onChange} />;
}

function withCurrentOption(options: string[], currentValue: string) {
  const normalizedCurrentValue = currentValue.trim();
  if (!normalizedCurrentValue || options.includes(normalizedCurrentValue)) return options;
  return [normalizedCurrentValue, ...options];
}
