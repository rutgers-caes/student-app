import studentJson from '../../data.json';

const studentParticipants = studentJson['Student Participants'] ?? [];
const studentName = studentJson.name || 'CAES Student';

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
      { name: 'Siddhartha Anindya Chowdhury', role: 'Other' },
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

export const fallbackProfileImage = '/Docs/student.jpeg';

export const demoStudent = {
  id: String(studentJson.studentID || '4274'),
  firstName: studentName.split(' ')[0] || 'Student',
  name: studentName,
  center: studentJson.Center || 'RU-IAC | Rutgers, State Univ. of NJ',
  centerCode: (studentJson.Center || 'RU-IAC').split('|')[0].trim(),
  studentType: studentJson.Type || 'Undergraduate',
  status: studentJson.Status || 'Former Student',
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
  centerStudents: studentParticipants.map((student, index) => ({
    id: String(index + 1),
    name: student.name,
    email: student.email,
    type: studentJson.Type || 'Undergraduate',
    status: index === 0 ? studentJson.Status || 'Active' : 'Center Student',
  })),
};

export const profileImage = demoStudent.photoBase64 || fallbackProfileImage;

export const assessmentTotal =
  demoStudent.assessmentCounts.lead + demoStudent.assessmentCounts.safety + demoStudent.assessmentCounts.other;
