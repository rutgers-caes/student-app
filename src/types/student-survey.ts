export type SurveyKind = 'entry' | 'exit';

export type SurveyChoiceAnswer = {
  selected: string[];
  other: string | null;
};

export type EntrySurveyAnswers = {
  foundIacHow: SurveyChoiceAnswer;
  professionalOrganizations: SurveyChoiceAnswer;
  heardAboutWe2: 'Yes' | 'No' | null;
  hopeForIac: string | null;
};

export type ExitSurveyAnswers = {
  assessmentResponsibilities: SurveyChoiceAnswer;
  improvedSkills: SurveyChoiceAnswer;
  certifications: SurveyChoiceAnswer;
  employmentStatus: SurveyChoiceAnswer;
  itacEmploymentHelp: SurveyChoiceAnswer;
  employerType: SurveyChoiceAnswer;
  jobResponsibilities: SurveyChoiceAnswer;
  wouldJoinIacAgainResponse: string | null;
  iacImprovements: SurveyChoiceAnswer;
  whatToTellNewStudents: string | null;
  experienceComments: string | null;
};

export type StudentSurveyResponse<TAnswers> = {
  kind: SurveyKind;
  legacyCompleted: boolean;
  legacyCompletedAt: string | null;
  portalCompletedAt: string | null;
  completed: boolean;
  answers: TAnswers;
};

export type EntrySurveyResponse = StudentSurveyResponse<EntrySurveyAnswers>;
export type ExitSurveyResponse = StudentSurveyResponse<ExitSurveyAnswers>;
