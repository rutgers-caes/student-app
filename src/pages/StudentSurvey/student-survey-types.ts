import type { SurveyQuestion } from '@/data/entry-exit-surveys';
import type {
  EntrySurveyAnswers,
  EntrySurveyResponse,
  ExitSurveyAnswers,
  ExitSurveyResponse,
} from '@/types/student-survey';

export type SurveyAnswers = EntrySurveyAnswers | ExitSurveyAnswers;
export type SurveyResponse = EntrySurveyResponse | ExitSurveyResponse;
export type StudentSurveyQuestion = SurveyQuestion<SurveyAnswers>;
