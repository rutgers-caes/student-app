import type { ReactNode } from 'react';

type StatusNoticeTone = 'error' | 'info' | 'success';

const toneClassNames: Record<StatusNoticeTone, string> = {
  error: 'border-status-error-border bg-status-error-bg font-semibold text-status-error-text',
  info: 'border-status-info-border bg-status-info-bg text-slate-800',
  success: 'border-green-100 bg-green-50 font-semibold text-status-success-text',
};

export function StatusNotice({
  children,
  className = '',
  role = 'status',
  tone = 'info',
}: {
  children: ReactNode;
  className?: string;
  role?: 'alert' | 'status';
  tone?: StatusNoticeTone;
}) {
  return (
    <div
      className={`rounded-md border px-4 py-3 text-center text-sm leading-6 ${toneClassNames[tone]} ${className}`.trim()}
      role={role}
    >
      {children}
    </div>
  );
}
