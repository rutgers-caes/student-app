import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@radix-ui/themes';
import { ClipboardCheck, Save } from 'lucide-react';
import { Card, PageShell, StatusNotice } from '@/components/ui';
import { profilePath, studentProfilePath } from '@/data/navigation';
import { usePortalStudent } from '@/hooks/use-portal-student';
import { ApiRequestError } from '@/services/auth-service';
import { iconSizes } from '@/styles/iconography';
import type { SurveyKind } from '@/types/student-survey';
import { successToast } from '@/utils/toasts';
import { useUnsavedChangesGuard } from '@/utils/use-unsaved-changes-guard';
import { SurveyQuestionField } from './components/SurveyQuestionField';
import { useStudentSurvey } from './hooks/use-student-survey';
import type { SurveyAnswers, SurveyResponse } from './student-survey-types';
import {
  formatCompletedAt,
  getChoiceAnswer,
  getEmptySurveyAnswers,
  getSurveyQuestions,
  isQuestionAnswered,
  mergeSurveyAnswers,
  serializeSurveyAnswers,
} from './student-survey-utils';

type StudentSurveyPageProps = {
  kind: SurveyKind;
};

export default function StudentSurveyPage({ kind }: StudentSurveyPageProps) {
  const { data: portalStudent = null } = usePortalStudent();
  const { saveSurveyMutation, surveyQuery } = useStudentSurvey(kind);
  const title = kind === 'entry' ? 'Entry Survey' : 'Exit Survey';
  const questions = useMemo(() => getSurveyQuestions(kind), [kind]);
  const [answers, setAnswers] = useState<SurveyAnswers>(getEmptySurveyAnswers(kind));
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [portalCompletedAt, setPortalCompletedAt] = useState<string | null>(null);
  const [legacyCompleted, setLegacyCompleted] = useState(false);
  const [legacyCompletedAt, setLegacyCompletedAt] = useState<string | null>(null);
  const [savedAnswersSnapshot, setSavedAnswersSnapshot] = useState(
    serializeSurveyAnswers(getEmptySurveyAnswers(kind)),
  );

  const applySurveyResponse = useCallback((survey: SurveyResponse) => {
    const loadedAnswers = mergeSurveyAnswers(kind, survey.answers);
    setAnswers(loadedAnswers);
    setSavedAnswersSnapshot(serializeSurveyAnswers(loadedAnswers));
    setPortalCompletedAt(survey.portalCompletedAt);
    setLegacyCompleted(survey.legacyCompleted);
    setLegacyCompletedAt(survey.legacyCompletedAt);
  }, [kind]);

  useEffect(() => {
    const emptyAnswers = getEmptySurveyAnswers(kind);
    setAnswers(emptyAnswers);
    setSavedAnswersSnapshot(serializeSurveyAnswers(emptyAnswers));
    setPortalCompletedAt(null);
    setLegacyCompleted(false);
    setLegacyCompletedAt(null);
    setError('');
    setSavedMessage('');
  }, [kind]);

  useEffect(() => {
    if (!surveyQuery.data) return;
    applySurveyResponse(surveyQuery.data);
  }, [applySurveyResponse, surveyQuery.data]);

  useEffect(() => {
    if (!surveyQuery.error) return;
    setError(surveyQuery.error instanceof ApiRequestError ? surveyQuery.error.message : 'Unable to load the survey.');
  }, [surveyQuery.error]);

  function clearSaveState() {
    setError('');
    setSavedMessage('');
  }

  function updateChoice(key: keyof SurveyAnswers, option: string, checked: boolean) {
    clearSaveState();
    setAnswers((current) => {
      const currentChoice = getChoiceAnswer(current, key);
      const selected = checked
        ? [...currentChoice.selected, option]
        : currentChoice.selected.filter((item) => item !== option);
      return {
        ...current,
        [key]: {
          ...currentChoice,
          selected: [...new Set(selected)],
        },
      };
    });
  }

  function updateSingle(key: keyof SurveyAnswers, option: string) {
    clearSaveState();
    setAnswers((current) => ({
      ...current,
      [key]: typeof current[key] === 'string' || current[key] === null
        ? option
        : { ...getChoiceAnswer(current, key), selected: [option] },
    }));
  }

  function updateOther(key: keyof SurveyAnswers, value: string) {
    clearSaveState();
    setAnswers((current) => ({
      ...current,
      [key]: {
        ...getChoiceAnswer(current, key),
        other: value,
      },
    }));
  }

  function updateText(key: keyof SurveyAnswers, value: string) {
    clearSaveState();
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSavedMessage('');

    if (!isValid) {
      setError('Please answer every question before saving.');
      return;
    }

    try {
      const survey = await saveSurveyMutation.mutateAsync(answers);
      applySurveyResponse(survey);
      setSavedMessage(`${title} saved.`);
      successToast(`${title} saved.`);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : `Unable to save the ${title.toLowerCase()}.`,
      );
    }
  }

  const isDirty = serializeSurveyAnswers(answers) !== savedAnswersSnapshot;
  const isValid = questions.every((question) => isQuestionAnswered(answers, question));
  const loading = surveyQuery.isLoading;
  const saving = saveSurveyMutation.isPending;
  const guardDialog = useUnsavedChangesGuard({
    when: isDirty && !saving,
    message: 'All changes will not be saved.',
  });
  const completedText = portalCompletedAt
    ? `Submitted ${formatCompletedAt(portalCompletedAt)}`
    : legacyCompleted
      ? `Completed in the legacy portal${legacyCompletedAt ? ` on ${formatCompletedAt(legacyCompletedAt)}` : ''}`
      : 'Not submitted yet';
  const profileHref = portalStudent ? studentProfilePath(portalStudent.name) : profilePath;

  return (
    <PageShell firstName={portalStudent?.firstName || 'Student'} profileHref={profileHref} profileImage={portalStudent?.photoBase64 || ''}>
      {guardDialog}
      <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
        <Card as="form" className="overflow-hidden" onSubmit={handleSubmit}>
          <header className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-doe-blue">
                <ClipboardCheck aria-hidden="true" size={iconSizes.lg} />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase text-slate-500">{completedText}</p>
                <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="px-6 py-10 text-sm font-semibold text-slate-600">Loading survey...</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {questions.map((question) => (
                <SurveyQuestionField
                  answers={answers}
                  kind={kind}
                  key={String(question.key)}
                  onChoiceChange={updateChoice}
                  onOtherChange={updateOther}
                  onSingleChange={updateSingle}
                  onTextChange={updateText}
                  question={question}
                />
              ))}
            </div>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <div className="min-h-11 flex-1">
              {error && <StatusNotice className="px-4 py-2 text-left" role="alert" tone="error">{error}</StatusNotice>}
              {!error && savedMessage && <StatusNotice className="px-4 py-2 text-left" tone="success">{savedMessage}</StatusNotice>}
              {!error && !savedMessage && isDirty && !isValid && (
                <StatusNotice className="px-4 py-2 text-left" tone="info">Please answer every question before saving.</StatusNotice>
              )}
            </div>
            <Button color="blue" disabled={loading || saving || !isDirty || !isValid} size="3" type="submit">
              <Save aria-hidden="true" size={iconSizes.sm} />
              {saving ? 'Saving...' : `Save ${title}`}
            </Button>
          </footer>
        </Card>
      </main>
    </PageShell>
  );
}
