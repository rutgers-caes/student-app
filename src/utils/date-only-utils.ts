const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_ONLY_TOKEN_REGEX = /\b(\d{4})-(\d{2})-(\d{2})\b/g;

const pad2 = (value: number) => String(value).padStart(2, '0');

const isValidDateOnly = (year: number, month: number, day: number): boolean => {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year && utc.getUTCMonth() + 1 === month && utc.getUTCDate() === day
  );
};

export const toDateOnlyString = (value: string | Date | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }
    const year = value.getFullYear();
    const month = value.getMonth() + 1;
    const day = value.getDate();
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const candidate = trimmed.split(/[T\s]/)[0];
  const match = candidate.match(DATE_ONLY_REGEX);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidDateOnly(year, month, day)) {
    return null;
  }

  return `${year}-${pad2(month)}-${pad2(day)}`;
};

export const normalizeDateInputValue = (value: string | Date | null | undefined): string => {
  return toDateOnlyString(value) ?? '';
};

export const formatDateOnlyForDisplay = (
  value: string | Date | null | undefined,
  fallback = '-'
): string => {
  const normalized = toDateOnlyString(value);
  if (!normalized) {
    return fallback;
  }

  const [year, month, day] = normalized.split('-');
  return `${month}/${day}/${year}`;
};

export const formatDateOnlyTokensForDisplay = (
  value: string | null | undefined,
  fallback = '-'
): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.replace(DATE_ONLY_TOKEN_REGEX, (dateToken) => formatDateOnlyForDisplay(dateToken, dateToken));
};

// This function formats a date-only value into a long format for display, e.g. "Jan 01, 2024".
export const formatDateOnlyLongForDisplay = (
  value: string | Date | null | undefined,
  fallback = '-'
): string => {
  const normalized = toDateOnlyString(value);
  if (!normalized) {
    return fallback;
  }

  const [year, month, day] = normalized.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
};
