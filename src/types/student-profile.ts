export type StudentAssessmentCounts = {
  beforeLead: number;
  lead: number;
  safety: number;
  other: number;
};

export type StudentAssessmentParticipant = {
  participantId: number;
  name: string;
  photoBase64: string;
  role: 'Lead' | 'Safety' | 'Other';
};

export type StudentAssessment = {
  id: string;
  date: string;
  facultyStaff: string;
  facultyStaffParticipants: StudentAssessmentParticipant[];
  studentRole: 'Lead' | 'Safety' | 'Other';
  participants: StudentAssessmentParticipant[];
};

export type CenterStudentProfile = {
  id: string;
  name: string;
  center: string;
  centerCode: string;
  type: string;
  studentType: string;
  status: 'Active' | 'Former';
  assessmentCounts: StudentAssessmentCounts;
  certificateStatus: string;
  timeInItac: string;
  linkedin: string;
  photoBase64: string;
  email: string;
  alternateEmail: string;
  major: string;
  graduationYear: string;
  programStartDate: string;
  classStanding: string;
  graduateStudentType: string;
};

export type StudentProfile = CenterStudentProfile & {
  firstName: string;
  assessmentConnected: boolean;
  assessments: StudentAssessment[];
  facultyStaff: string;
  assessmentId: string;
  centerStudents: CenterStudentProfile[];
};
