import type { StudentProfile } from '@/types/student-profile';

export function buildProfileForm(student: StudentProfile | null) {
  return {
    email: student?.email || '',
    alternateEmail: student?.alternateEmail || '',
    studentType: normalizeStudentType(student?.studentType || student?.type),
    major: normalizeTextValue(student?.major),
    programStartDate: normalizeDateInputValue(student?.programStartDate),
    classStanding: student?.classStanding || '',
    linkedin: student?.linkedin || '',
    graduationYear: student?.graduationYear || '',
    graduateStudentType: student?.graduateStudentType || '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  };
}

export function buildProfileUpdatePayload(form: Record<string, string>, initialForm: Record<string, string>) {
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

function normalizeStudentType(value: string | null | undefined) {
  const studentType = normalizeTextValue(value);
  return studentType === 'Graduate Student' ? 'Graduate' : studentType;
}

function normalizeTextValue(value: string | null | undefined) {
  return value?.trim() || '';
}

function normalizeDateInputValue(value: string | null | undefined) {
  const date = normalizeTextValue(value);
  const isoDate = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDate) return `${isoDate[1]}-${isoDate[2]}-${isoDate[3]}`;

  const displayDate = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!displayDate) return date;

  const month = displayDate[1].padStart(2, '0');
  const day = displayDate[2].padStart(2, '0');
  return `${displayDate[3]}-${month}-${day}`;
}
