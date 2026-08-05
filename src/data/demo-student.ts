import studentJson from '../../data.json';

const studentName = studentJson.name || 'CAES Student';

function normalizeStudentStatus(status?: string) {
  return status?.toLowerCase().includes('active') ? 'Active' : 'Former';
}

const assessmentRecords = [
  {
    id: studentJson.AssessmentID || 'AS0617',
    date: '06/04/2026',
    facultyStaff: studentJson['Faculty/Staff'] || 'Dr. Patrick Phelan',
    studentRole: 'Lead',
    participants: [
      { name: studentName, role: 'Lead' },
      { name: 'John Doe', role: 'Other' },
      { name: 'Pearl Lam', role: 'Safety' },
    ],
  },
  {
    id: 'AS0615',
    date: '04/24/2026',
    facultyStaff: 'Dr. Patrick Phelan',
    studentRole: 'Other',
    participants: [
      { name: studentName, role: 'Other' },
      { name: 'Siddhartha Anindya Chowdhury', role: 'Safety' },
      { name: 'Florian Hagenau', role: 'Other' },
    ],
  },
  {
    id: 'AS0614',
    date: '03/27/2026',
    facultyStaff: 'Dr. Ryan Milcarek',
    studentRole: 'Other',
    participants: [
      { name: 'Jesus Ramos', role: 'Lead' },
      { name: 'Joseph Elliott', role: 'Safety' },
      { name: studentName, role: 'Other' },
    ],
  },
];

const assessmentCounts = {
  lead: assessmentRecords.filter((assessment) => assessment.studentRole === 'Lead').length,
  safety: assessmentRecords.filter((assessment) => assessment.studentRole === 'Safety').length,
  other: assessmentRecords.filter((assessment) => assessment.studentRole === 'Other').length,
};

const centerAssessmentCounts = [
  assessmentCounts,
  { lead: 2, safety: 1, other: 3 },
  { lead: 0, safety: 2, other: 4 },
  { lead: 1, safety: 0, other: 2 },
  { lead: 0, safety: 0, other: 1 },
  { lead: 3, safety: 1, other: 5 },
];

const centerStudentDefaults = [
  {
    id: String(studentJson.studentID || '4274'),
    name: studentName,
    email: studentJson.email || 'caes.student@example.edu',
    type: studentJson.Type || 'Undergraduate',
    status: normalizeStudentStatus(studentJson.Status || 'Active'),
    major: studentJson.Major || 'Mechanical Engineering',
    graduationYear: '2026',
    classStanding: 'Junior',
    linkedin: 'https://www.linkedin.com/company/center-for-advanced-energy-systems/',
  },
  {
    id: '4275',
    name: 'Ariana Patel',
    email: 'ariana.patel@example.edu',
    type: 'Undergraduate',
    status: 'Active',
    major: 'Electrical Engineering',
    graduationYear: '2025',
    classStanding: 'Senior',
    linkedin: 'https://www.linkedin.com',
  },
  {
    id: '4276',
    name: 'Marcus Johnson',
    email: 'marcus.johnson@example.edu',
    type: 'Graduate',
    status: 'Former',
    major: 'Mechanical Engineering',
    graduationYear: '2024',
    classStanding: 'Graduate Student',
    linkedin: '',
  },
  {
    id: '4277',
    name: 'Priya Shah',
    email: 'priya.shah@example.edu',
    type: 'Undergraduate',
    status: 'Active',
    major: 'Industrial Engineering',
    graduationYear: '2027',
    classStanding: 'Sophomore',
    linkedin: 'https://www.linkedin.com',
  },
  {
    id: '4278',
    name: 'Diego Martinez',
    email: 'diego.martinez@example.edu',
    type: 'Undergraduate',
    status: 'Former',
    major: 'Environmental Engineering',
    graduationYear: '2023',
    classStanding: 'Senior',
    linkedin: '',
  },
  {
    id: '4279',
    name: 'Nina Chen',
    email: 'nina.chen@example.edu',
    type: 'Graduate',
    status: 'Active',
    major: 'Computer Science',
    graduationYear: '2026',
    classStanding: 'Graduate Student',
    linkedin: 'https://www.linkedin.com',
  },
];

export const fallbackProfileImage = `${import.meta.env.BASE_URL}Docs/student.jpeg`;

export const demoStudent = {
  id: String(studentJson.studentID || '4274'),
  firstName: studentName.split(' ')[0] || 'Student',
  name: studentName,
  center: (studentJson.Center || 'RU-IAC | Rutgers, State Univ. of NJ').replaceAll('IAC', 'ITAC'),
  centerCode: (studentJson.Center || 'RU-IAC').replaceAll('IAC', 'ITAC').split('|')[0].trim(),
  studentType: studentJson.Type || 'Undergraduate',
  status: normalizeStudentStatus(studentJson.Status || 'Former'),
  assessmentConnected: Boolean(studentJson.AssessmentID),
  assessmentCounts,
  assessments: assessmentRecords,
  certificateStatus: 'No certificate',
  timeInItac: '1 year',
  linkedin: 'https://www.linkedin.com/company/center-for-advanced-energy-systems/',
  photoBase64: '',
  email: studentJson.email || 'caes.student@example.edu',
  alternateEmail: studentJson.email || 'caes.personal@example.com',
  major: studentJson.Major || 'Mechanical Engineering',
  graduationYear: '2026',
  programStartDate: '2024-08-26',
  classStanding: 'Junior',
  graduateStudentType: '',
  facultyStaff: studentJson['Faculty/Staff'] || '',
  assessmentId: studentJson.AssessmentID || '',
  centerStudents: centerStudentDefaults.map((student, index) => ({
    ...student,
    center: (studentJson.Center || 'RU-IAC | Rutgers, State Univ. of NJ').replaceAll('IAC', 'ITAC'),
    centerCode: (studentJson.Center || 'RU-IAC').replaceAll('IAC', 'ITAC').split('|')[0].trim(),
    assessmentCounts: centerAssessmentCounts[index],
    timeInItac: index === 0 ? '1 year' : `${Math.max(1, 6 - index)} ${index > 4 ? 'months' : 'years'}`,
    certificateStatus: index === 2 || index === 4 ? 'Certificate issued' : 'No certificate',
  })),
};

export const profileImage = demoStudent.photoBase64 || fallbackProfileImage;
