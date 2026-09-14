import type { EntrySurveyAnswers, ExitSurveyAnswers, SurveyChoiceAnswer } from '@/types/student-survey';

export type ChoiceQuestion<TAnswers> = {
  key: keyof TAnswers;
  label: string;
  type: 'multi' | 'single';
  options: string[];
  allowOther?: boolean;
};

export type TextQuestion<TAnswers> = {
  key: keyof TAnswers;
  label: string;
  type: 'text';
};

export type SurveyQuestion<TAnswers> = ChoiceQuestion<TAnswers> | TextQuestion<TAnswers>;

export const emptyChoice = (): SurveyChoiceAnswer => ({ selected: [], other: null });

export const emptyEntrySurveyAnswers: EntrySurveyAnswers = {
  foundIacHow: emptyChoice(),
  professionalOrganizations: emptyChoice(),
  heardAboutWe2: null,
  hopeForIac: '',
};

export const emptyExitSurveyAnswers: ExitSurveyAnswers = {
  assessmentResponsibilities: emptyChoice(),
  improvedSkills: emptyChoice(),
  certifications: emptyChoice(),
  employmentStatus: emptyChoice(),
  itacEmploymentHelp: emptyChoice(),
  employerType: emptyChoice(),
  jobResponsibilities: emptyChoice(),
  wouldJoinIacAgainResponse: '',
  iacImprovements: emptyChoice(),
  whatToTellNewStudents: '',
  experienceComments: '',
};

export const entrySurveyQuestions: SurveyQuestion<EntrySurveyAnswers>[] = [
  {
    key: 'foundIacHow',
    label: 'How did you hear about our program?',
    type: 'multi',
    allowOther: true,
    options: [
      'Professor or faculty member',
      'Academic advisor/supervisor',
      'Friend/classmate/fellow student',
      'Current or former ITAC member',
      'University or department',
      'School email',
      'University website or job board',
      'External job board, such as Indeed',
      'ITAC website',
      'DOE website',
      'Handshake',
      'LinkedIn',
      'Class presentation or campus event',
      'Flyer/advertisement',
      'Work colleague',
      'Networking',
      'Online search, such as Google',
    ],
  },
  {
    key: 'professionalOrganizations',
    label: 'What professional organizations are you currently involved in?',
    type: 'multi',
    allowOther: true,
    options: ['ASME', 'IEEE', 'AIChE', 'ASCE', 'IISE', 'SME', 'APICS/ASCM', 'ASHRAE', 'AEE', 'None'],
  },
  {
    key: 'heardAboutWe2',
    label: "Have you heard about WE2, the ITAC program's student interest group?",
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    key: 'hopeForIac',
    label: 'What do you hope to learn from joining the ITAC program?',
    type: 'text',
  },
];

export const exitSurveyQuestions: SurveyQuestion<ExitSurveyAnswers>[] = [
  {
    key: 'assessmentResponsibilities',
    label: 'What were your responsibilities on the assessments?',
    type: 'multi',
    allowOther: true,
    options: [
      'Finding new clients (marketing)',
      'Pre-visit data collection',
      'Preliminary analysis of data in preparation for site visit',
      'Ensuring professional conduct of the assessment team',
      'Maintenance of diagnostic instruments',
      'Initial briefing of plant manager',
      'Leading on-site assessment decision making',
      'Enforcing on-site assessment safety precautions',
      'On-site use of diagnostic instruments',
      'Debriefing of plant manager',
      'Analysis and documentation of assessment recommendations',
      'Contributing to or lead author of assessment reports',
      'Post-assessment follow-up with client',
      'ITAC Lead Student',
    ],
  },
  {
    key: 'improvedSkills',
    label: 'Which personal skills and capabilities were enhanced as a result of your participation in the ITAC Program??',
    type: 'multi',
    allowOther: true,
    options: [
      'Ability to grasp quickly the key features of new problems',
      'Breadth and depth of technical understanding',
      'Ability to define steps needed to solve new problems',
      'Ability to communicate ideas in writing',
      'Ability to communicate ideas verbally',
      'Creativity and innovations',
      'Integrating and synthesizing information from different fields',
      'Ability to work in teams',
      'Understanding the relationship between work and customer needs',
      'Meeting business goals while satisfying technical requirements',
      'Leadership ability',
      'Solving problems within constraints of time, money, and human resources',
      'Ability to structure and make good decisions',
      'Ability to transfer outside technology to the current or future employer',
      'Confidence in ability to make appropriate recommendations',
    ],
  },
  {
    key: 'certifications',
    label: 'What registrations and/or certifications have you received?',
    type: 'multi',
    allowOther: true,
    options: [
      'Certified Energy Manager (CEM)',
      'Certified Quality Manager (CQM)',
      'Fundamentals of Engineering Exam (FE)',
      'Principles and Practice Exam (PE)',
      'I have not received any registrations or certifications',
    ],
  },
  {
    key: 'employmentStatus',
    label: 'Please indicate your current employment status.',
    type: 'single',
    allowOther: true,
    options: [
      'Graduated - currently employed, including self-employed',
      'Graduated - still searching for a job',
      'Soon to graduate - have accepted a job offer',
      'Soon to graduate - have been offered one or more positions but have not made a final decision',
      'Soon to graduate - have contacted potential employers but have not been offered a position',
      'Soon to graduate - have not yet begun searching for a position',
      'Still working towards an undergraduate degree',
      'Still working towards a graduate degree',
      'Still working towards a degree, but accepted different position, such as a co-op position',
      'Planning on pursuing graduate school',
      'Graduated or soon to graduate but plan on taking some time off',
    ],
  },
  {
    key: 'itacEmploymentHelp',
    label: 'Did your experience with the ITAC Program help you get your job?',
    type: 'multi',
    allowOther: true,
    options: [
      'Yes, employed by ITAC program client',
      'Yes, received a reference from ITAC program client',
      'Yes, experience enhanced resume',
      'Yes, received referral from Center Director',
      'Yes, experience was preparation for starting own business',
      'No, it did not help me',
    ],
  },
  {
    key: 'employerType',
    label: 'What type of employer do/will you work for?',
    type: 'multi',
    allowOther: true,
    options: [
      'Manufacturing',
      'Electric power/utility',
      'Government (federal, state, or local)',
      'Consulting Firm',
      'Design and/or construction',
      'Academia',
      'Continued Study',
      'Energy services company',
      'Research and Development',
      'Self-employed, such as consultant',
      'Not employed',
    ],
  },
  {
    key: 'jobResponsibilities',
    label: "Do your current position's responsibilities entail/will entail finding ways to address any of the following?",
    type: 'multi',
    allowOther: true,
    options: ['Save energy', 'Reduce waste', 'Enhance productivity', 'None of the above'],
  },
  {
    key: 'wouldJoinIacAgainResponse',
    label: 'If you had to start school over again, would you join the ITAC program?',
    type: 'text',
  },
  {
    key: 'iacImprovements',
    label: 'How can the ITAC Program be improved?',
    type: 'multi',
    allowOther: true,
    options: [
      'Allow student semester exchange with other schools',
      'Arrange an annual meeting of ITAC students',
      'Improve web-based interactions among ITAC students',
      'Improve verbal communications among ITAC students at different schools',
      'Arrange summer co-op/intern/part-time work opportunities with ITAC clients',
      'Arrange opportunities for summer employment with DOE or national laboratories',
      'Arrange research opportunities with DOE or national laboratories',
      'Guiding on site use of diagnostic instruments',
      'Increase student salaries',
      'Increase hours students can work for their ITAC',
      'Provide students with better tools to conduct assessments',
    ],
  },
  {
    key: 'whatToTellNewStudents',
    label: 'What would you tell an incoming student about the ITAC?',
    type: 'text',
  },
  {
    key: 'experienceComments',
    label: 'Please provide any comments regarding your ITAC experience that you would like to share with ITAC leadership.',
    type: 'text',
  },
];
