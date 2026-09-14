import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthServiceApi } from '@/services/auth-service';
import { queryKeys } from '@/services/query-client';
import type { SurveyKind } from '@/types/student-survey';
import type { SurveyAnswers, SurveyResponse } from '../student-survey-types';

export function useStudentSurvey(kind: SurveyKind) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.studentSurvey(kind);
  const surveyQuery = useQuery({
    queryKey,
    queryFn: () => AuthServiceApi.getStudentSurvey<SurveyResponse>(kind),
  });
  const saveSurveyMutation = useMutation({
    mutationFn: (answers: SurveyAnswers) => AuthServiceApi.saveStudentSurvey<SurveyResponse>(kind, answers),
    onSuccess: async (survey) => {
      queryClient.setQueryData(queryKey, survey);
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    saveSurveyMutation,
    surveyQuery,
  };
}
