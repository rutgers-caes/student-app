import type { ReactNode } from 'react';
import type { StudentAssessment } from '@/types/student-profile';

export function formatValue(value: string | number | null | undefined) {
  return value === null || value === undefined || String(value).trim() === '' ? '-' : String(value);
}

export function formatNode(value: ReactNode) {
  return typeof value === 'string' || typeof value === 'number' ? formatValue(value) : value;
}

export function getAssessmentDateRange(assessments: StudentAssessment[]) {
  const dates = assessments
    .flatMap((assessment) => getAssessmentDisplayDates(assessment).map(parseDisplayDate))
    .filter((date): date is Date => Boolean(date))
    .sort((first, second) => first.getTime() - second.getTime());

  if (!dates.length) {
    return { first: '-', last: '-' };
  }

  return {
    first: formatDisplayDate(dates[0]),
    last: formatDisplayDate(dates[dates.length - 1]),
  };
}

export function getAssessmentsBeforeLead(assessments: StudentAssessment[]) {
  const sortedAssessments = [...assessments].sort((first, second) => {
    const firstDate = getAssessmentSortTime(first);
    const secondDate = getAssessmentSortTime(second);
    return firstDate - secondDate || first.id.localeCompare(second.id);
  });
  const firstLeadIndex = sortedAssessments.findIndex((assessment) => assessment.studentRole === 'Lead');
  return firstLeadIndex === -1 ? null : firstLeadIndex;
}

export function formatAssessmentsBeforeLead(value: number | null) {
  if (value === null) return '-';
  return `${value} ${value === 1 ? 'assessment' : 'assessments'} before lead`;
}

export function getAssessmentDisplayDates(assessment: StudentAssessment) {
  return assessment.visitDates?.length ? assessment.visitDates : [assessment.date || ''].filter(Boolean);
}

export function formatTimeInItac(value: string | null | undefined) {
  const totalDays = Number(String(value || '').match(/\d+/)?.[0] ?? 0);
  if (!totalDays) return '0 Days';

  const estimate = formatEstimatedDuration(totalDays);
  return estimate ? `${totalDays} Days (${estimate})` : `${totalDays} Days`;
}

export function getSatelliteCenter(centerCode: string) {
  const satellite = centerCode.split('-')[1]?.trim();
  return satellite && satellite.toLowerCase() !== 'itac' ? satellite : '';
}

function getAssessmentSortTime(assessment: StudentAssessment) {
  const dates = getAssessmentDisplayDates(assessment)
    .map(parseDisplayDate)
    .filter((date): date is Date => Boolean(date))
    .sort((first, second) => first.getTime() - second.getTime());

  return dates[0]?.getTime() ?? Number.MAX_SAFE_INTEGER;
}

function parseDisplayDate(value: string) {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
}

function formatDisplayDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${date.getFullYear()}`;
}

function formatDurationPart(value: number, label: string) {
  if (!value) return '';
  return `${value} ${label}${value === 1 ? '' : 's'}`;
}

function formatEstimatedDuration(totalDays: number) {
  const years = Math.floor(totalDays / 365);
  const remainingAfterYears = totalDays % 365;
  const months = Math.floor(remainingAfterYears / 30);
  const remainingAfterMonths = remainingAfterYears % 30;
  const weeks = Math.floor(remainingAfterMonths / 7);
  const days = remainingAfterMonths % 7;
  return [
    formatDurationPart(years, 'year'),
    formatDurationPart(months, 'month'),
    formatDurationPart(weeks, 'week'),
    formatDurationPart(days, 'day'),
  ].filter(Boolean).join(', ');
}
