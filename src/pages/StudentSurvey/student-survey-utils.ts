import {
  emptyChoice,
  emptyEntrySurveyAnswers,
  emptyExitSurveyAnswers,
  entrySurveyQuestions,
  exitSurveyQuestions,
} from '@/data/entry-exit-surveys';
import type { SurveyChoiceAnswer, SurveyKind } from '@/types/student-survey';
import type { StudentSurveyQuestion, SurveyAnswers, SurveyResponse } from './student-survey-types';

const equivalentChoiceLabels = new Map<string, string>([
  ['Analysis and documentation of assessment recommendations (AR\'s)', 'Analysis and documentation of assessment recommendations'],
  ['Solving problems within the constraints of time, money and human resources', 'Solving problems within constraints of time, money, and human resources'],
  ['Ability to structure decision and make good decisions', 'Ability to structure and make good decisions'],
  ['Ability to transfer outside technology to the current (soon to be) emmployer', 'Ability to transfer outside technology to the current or future employer'],
  ['Soon to graduate, have contacted potential employers but have not been offered a position', 'Soon to graduate - have contacted potential employers but have not been offered a position'],
  ['Soon to graduate, have been offered one or more positions but have not made a final decision', 'Soon to graduate - have been offered one or more positions but have not made a final decision'],
  ['Arrange an annual meeting of ITAC students', 'Arrange an annual meeting of ITAC students'],
  ['Improve web-based interactions among ITAC students', 'Improve web-based interactions among ITAC students'],
  ['Arrange summer co-op/intern/part-time work opportunities with ITAC clients', 'Arrange summer co-op/intern/part-time work opportunities with ITAC clients'],
  ['Arrange to research opportunities with DOE or national laboratories', 'Arrange research opportunities with DOE or national laboratories'],
]);

export function getSurveyQuestions(kind: SurveyKind): StudentSurveyQuestion[] {
  return (kind === 'entry' ? entrySurveyQuestions : exitSurveyQuestions) as StudentSurveyQuestion[];
}

export function getEmptySurveyAnswers(kind: SurveyKind): SurveyAnswers {
  return kind === 'entry' ? emptyEntrySurveyAnswers : emptyExitSurveyAnswers;
}

export function formatCompletedAt(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isChoiceAnswer(value: unknown): value is SurveyChoiceAnswer {
  return Boolean(value && typeof value === 'object' && 'selected' in value);
}

export function getChoiceAnswer(answers: SurveyAnswers, key: keyof SurveyAnswers): SurveyChoiceAnswer {
  const value = answers[key];
  return isChoiceAnswer(value) ? value : emptyChoice();
}

export function getTextAnswer(answers: SurveyAnswers, key: keyof SurveyAnswers): string {
  const value = answers[key];
  return typeof value === 'string' ? value : '';
}

export function getSingleAnswer(answers: SurveyAnswers, key: keyof SurveyAnswers): string {
  const value = (answers as Record<string, unknown>)[String(key)];
  if (typeof value === 'string') return equivalentChoiceLabels.get(value) ?? value;
  if (!isChoiceAnswer(value)) return '';
  const selected = value.selected[0] || '';
  return equivalentChoiceLabels.get(selected) ?? selected;
}

export function isSelectedChoice(choice: SurveyChoiceAnswer, option: string) {
  return choice.selected.some((selected) => (equivalentChoiceLabels.get(selected) ?? selected) === option);
}

export function getOtherAnswer(choice: SurveyChoiceAnswer, options: string[]) {
  if (choice.other) return choice.other;
  return choice.selected
    .filter((selected) => !options.some((option) => (equivalentChoiceLabels.get(selected) ?? selected) === option))
    .join(' | ');
}

function normalizeChoiceForQuestion(
  answer: SurveyChoiceAnswer,
  question: StudentSurveyQuestion,
): SurveyChoiceAnswer {
  if (question.type === 'text') return answer;

  const selected: string[] = [];
  const unmatched: string[] = [];

  for (const value of answer.selected) {
    const normalized = equivalentChoiceLabels.get(value) ?? value;
    if (question.options.includes(normalized)) selected.push(normalized);
    else if (value.trim()) unmatched.push(value.trim());
  }

  const otherValues = [answer.other, ...unmatched].filter((value): value is string => Boolean(value));

  return {
    selected: question.type === 'single' ? selected.slice(0, 1) : [...new Set(selected)],
    other: otherValues.length ? [...new Set(otherValues)].join(' | ') : null,
  };
}

function normalizeIncomingAnswers(kind: SurveyKind, answers: SurveyAnswers): SurveyAnswers {
  return getSurveyQuestions(kind).reduce((current, question) => {
    const value = current[question.key];
    if (!isChoiceAnswer(value)) return current;
    return {
      ...current,
      [question.key]: normalizeChoiceForQuestion(value, question),
    };
  }, answers);
}

export function mergeSurveyAnswers(kind: SurveyKind, incoming: SurveyResponse['answers']): SurveyAnswers {
  const merged = kind === 'entry'
    ? { ...emptyEntrySurveyAnswers, ...incoming }
    : { ...emptyExitSurveyAnswers, ...incoming };
  return normalizeIncomingAnswers(kind, merged as SurveyAnswers);
}

function normalizeForComparison(value: unknown): unknown {
  if (!isChoiceAnswer(value)) return typeof value === 'string' ? value.trim() : value;
  return {
    selected: [...value.selected].map((item) => item.trim()).filter(Boolean).sort(),
    other: value.other?.trim() || null,
  };
}

export function serializeSurveyAnswers(answers: SurveyAnswers) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [key, normalizeForComparison(value)]),
    ),
  );
}

export function isQuestionAnswered(answers: SurveyAnswers, question: StudentSurveyQuestion) {
  if (question.type === 'text') return getTextAnswer(answers, question.key).trim().length > 0;
  if (question.type === 'single' && getSingleAnswer(answers, question.key).trim()) return true;

  const choice = getChoiceAnswer(answers, question.key);
  return choice.selected.length > 0 || Boolean(choice.other?.trim());
}
