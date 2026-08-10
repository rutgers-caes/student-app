import type { CenterStudentProfile, StudentAssessment, StudentProfile } from '@/types/student-profile';

export type StudentRole = 'Lead' | 'Safety' | 'Other';

export function getCurrentCenterStudent(portalStudent: StudentProfile) {
  return portalStudent.centerStudents.find((student) => student.id === portalStudent.id) ?? portalStudent;
}

export function getVisibleCenterStudents(portalStudent: StudentProfile) {
  return portalStudent.centerStudents
    .filter((student) => student.id !== portalStudent.id)
    .sort((firstStudent, secondStudent) => getStudentStatusSortOrder(firstStudent.status) - getStudentStatusSortOrder(secondStudent.status));
}

export function getAssessmentTotal(counts: { lead: number; safety: number; other: number }) {
  return counts.lead + counts.safety + counts.other;
}

export function getStudentAssessmentRecords(portalStudent: StudentProfile, student: CenterStudentProfile | StudentProfile) {
  if ('assessments' in student) {
    return student.assessments;
  }

  return student.id === portalStudent.id ? portalStudent.assessments : [];
}

export function getFacultyStaffParticipants(assessment: Pick<StudentAssessment, 'facultyStaff' | 'facultyStaffParticipants'>) {
  if (assessment.facultyStaffParticipants?.length) {
    return sortParticipantsByRole(assessment.facultyStaffParticipants);
  }

  return assessment.facultyStaff
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name, index) => ({
      participantId: index,
      name,
      role: 'Other' as const,
    }));
}

export function sortParticipantsByRole<T extends { role: StudentRole; name: string }>(participants: T[]) {
  return [...participants].sort((first, second) => {
    const roleDifference = getRoleSortOrder(first.role) - getRoleSortOrder(second.role);
    return roleDifference || first.name.localeCompare(second.name);
  });
}

export function getRoleStyle(role?: string, highlighted = false) {
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

function getStudentStatusSortOrder(status: string) {
  return status.toLowerCase() === 'active' ? 0 : 1;
}

function getRoleSortOrder(role: StudentRole) {
  if (role === 'Lead') return 0;
  if (role === 'Safety') return 1;
  return 2;
}
