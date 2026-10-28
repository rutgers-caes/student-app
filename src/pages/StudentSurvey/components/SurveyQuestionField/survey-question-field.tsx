import { Checkbox, TextArea, TextField } from '@radix-ui/themes';
import { surveyChoiceLabel } from '@/data/survey-choice-labels';
import type { SurveyAnswers, StudentSurveyQuestion } from '../../student-survey-types';
import {
  getChoiceAnswer,
  getOtherAnswer,
  getSingleAnswer,
  getTextAnswer,
  isSelectedChoice,
} from '../../student-survey-utils';

type SurveyQuestionFieldProps = {
  answers: SurveyAnswers;
  kind: string;
  onChoiceChange: (key: keyof SurveyAnswers, option: string, checked: boolean) => void;
  onOtherChange: (key: keyof SurveyAnswers, value: string) => void;
  onSingleChange: (key: keyof SurveyAnswers, option: string) => void;
  onTextChange: (key: keyof SurveyAnswers, value: string) => void;
  question: StudentSurveyQuestion;
};

export function SurveyQuestionField({
  answers,
  kind,
  onChoiceChange,
  onOtherChange,
  onSingleChange,
  onTextChange,
  question,
}: SurveyQuestionFieldProps) {
  return (
    <section className="grid min-h-[150px] grid-cols-1 md:grid-cols-[minmax(320px,42%)_minmax(0,1fr)]">
      <div className="border-b border-slate-200 px-6 py-5 md:border-b-0 md:border-r">
        <h2 className="text-lg font-semibold leading-relaxed text-slate-950">{question.label}</h2>
      </div>
      <div className="grid content-start gap-3 px-6 py-5">
        {question.type === 'text' ? (
          <TextArea
            aria-label={question.label}
            className="min-h-[120px]"
            value={getTextAnswer(answers, question.key)}
            onChange={(event) => onTextChange(question.key, event.target.value)}
          />
        ) : (
          <>
            {question.type === 'single' ? (
              <select
                aria-label={question.label}
                className="w-full rounded-md border border-slate-300 bg-white p-3 text-slate-900"
                value={getSingleAnswer(answers, question.key)}
                onChange={(event) => onSingleChange(question.key, event.target.value)}
              >
                <option value="">Select one</option>
                {question.options.map((option) => <option key={option} value={option}>{surveyChoiceLabel(option)}</option>)}
              </select>
            ) : (
            <details className="rounded-md border border-slate-300 bg-white">
              <summary aria-label={question.label} className="cursor-pointer p-3 text-slate-900 focus-visible:outline-2">
                Select all that apply ({question.options.filter((option) => isSelectedChoice(getChoiceAnswer(answers, question.key), option)).length} selected)
              </summary>
              <div className="grid max-h-80 gap-3 overflow-y-auto border-t border-slate-200 p-3">
              {question.options.map((option) => {
                const choice = getChoiceAnswer(answers, question.key);
                const selected = isSelectedChoice(choice, option);
                return (
                  <label
                    className="flex min-h-8 cursor-pointer items-center gap-3 text-base font-medium text-slate-800"
                    key={option}
                  >
                      <Checkbox
                        name={`${kind}-${String(question.key)}`}
                        checked={selected}
                        onCheckedChange={(checked) => onChoiceChange(question.key, option, checked === true)}
                      />
                    <span>{surveyChoiceLabel(option)}</span>
                  </label>
                );
              })}
              </div>
            </details>
            )}

            {question.allowOther ? (
              <label className="grid items-center gap-3 sm:grid-cols-[80px_minmax(0,1fr)]">
                <span className="text-base font-semibold text-slate-800">Other</span>
                <TextField.Root
                  size="2"
                  value={getOtherAnswer(getChoiceAnswer(answers, question.key), question.options)}
                  onChange={(event) => onOtherChange(question.key, event.target.value)}
                />
              </label>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
