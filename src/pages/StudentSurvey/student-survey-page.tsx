import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@radix-ui/themes';
import { ClipboardCheck, Save } from 'lucide-react';
import { AppNavbar } from '@/components/AppNavbar';
import { studentProfilePath } from '@/data/navigation';
import { ApiRequestError, AuthServiceApi } from '@/services/auth-service';
import type { StudentProfile } from '@/types/student-profile';
import type { SurveyKind } from '@/types/student-survey';
import { successToast } from '@/utils/toasts';
import { useUnsavedChangesGuard } from '@/utils/use-unsaved-changes-guard';
import { SurveyQuestionField } from './components/SurveyQuestionField';
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
  const portalStudent = AuthServiceApi.getStoredStudentProfile<StudentProfile>();
  const title = kind === 'entry' ? 'Entry Survey' : 'Exit Survey';
  const questions = useMemo(() => getSurveyQuestions(kind), [kind]);
  const [answers, setAnswers] = useState<SurveyAnswers>(getEmptySurveyAnswers(kind));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [portalCompletedAt, setPortalCompletedAt] = useState<string | null>(null);
  const [legacyCompleted, setLegacyCompleted] = useState(false);
  const [legacyCompletedAt, setLegacyCompletedAt] = useState<string | null>(null);
  const [savedAnswersSnapshot, setSavedAnswersSnapshot] = useState(
    serializeSurveyAnswers(getEmptySurveyAnswers(kind)),
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setSavedMessage('');

    AuthServiceApi.getStudentSurvey<SurveyResponse>(kind)
      .then((survey) => {
        if (!active) return;
        const loadedAnswers = mergeSurveyAnswers(kind, survey.answers);
        setAnswers(loadedAnswers);
        setSavedAnswersSnapshot(serializeSurveyAnswers(loadedAnswers));
        setPortalCompletedAt(survey.portalCompletedAt);
        setLegacyCompleted(survey.legacyCompleted);
        setLegacyCompletedAt(survey.legacyCompletedAt);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError instanceof ApiRequestError ? requestError.message : 'Unable to load the survey.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [kind]);

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
    setSaving(true);
    setError('');
    setSavedMessage('');

    if (!isValid) {
      setSaving(false);
      setError('Please answer every question before saving.');
      return;
    }

    try {
      const survey = await AuthServiceApi.saveStudentSurvey<SurveyResponse>(kind, answers);
      const savedAnswers = mergeSurveyAnswers(kind, survey.answers);
      setAnswers(savedAnswers);
      setSavedAnswersSnapshot(serializeSurveyAnswers(savedAnswers));
      setPortalCompletedAt(survey.portalCompletedAt);
      setLegacyCompleted(survey.legacyCompleted);
      setLegacyCompletedAt(survey.legacyCompletedAt);
      setSavedMessage(`${title} saved.`);
      successToast(`${title} saved.`);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : `Unable to save the ${title.toLowerCase()}.`,
      );
    } finally {
      setSaving(false);
    }
  }

  const isDirty = serializeSurveyAnswers(answers) !== savedAnswersSnapshot;
  const isValid = questions.every((question) => isQuestionAnswered(answers, question));
  const guardDialog = useUnsavedChangesGuard({
    when: isDirty && !saving,
    message: 'All changes will not be saved.',
  });
  const completedText = portalCompletedAt
    ? `Submitted ${formatCompletedAt(portalCompletedAt)}`
    : legacyCompleted
      ? `Completed in the legacy portal${legacyCompletedAt ? ` on ${formatCompletedAt(legacyCompletedAt)}` : ''}`
      : 'Not submitted yet';

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      {guardDialog}
      <AppNavbar firstName={portalStudent?.firstName || 'Student'} profileHref={portalStudent ? studentProfilePath(portalStudent.name) : '/profile'} profileImage={portalStudent?.photoBase64 || ''} />
      <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
        <form className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" onSubmit={handleSubmit}>
          <header className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-doe-blue">
                <ClipboardCheck aria-hidden="true" size={22} />
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
            <p className={error ? 'text-sm font-semibold text-red-700' : 'text-sm font-semibold text-green-700'}>
              {error || savedMessage || (isDirty && !isValid ? 'Please answer every question before saving.' : '')}
            </p>
            <Button color="blue" disabled={loading || saving || !isDirty || !isValid} size="3" type="submit">
              <Save aria-hidden="true" size={18} />
              {saving ? 'Saving...' : `Save ${title}`}
            </Button>
          </footer>
        </form>
      </main>
    </div>
  );
}
