import type { ReactNode } from 'react';
import { formatNode, formatValue } from '../../center-students-formatters';

export function ProfileRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <>
      <dt className="flex min-h-14 items-center border-b border-slate-200 py-2.5 text-xs font-bold uppercase tracking-[0.04em] text-slate-500">{label}</dt>
      <dd className="flex min-h-14 items-center border-b border-slate-200 py-2.5 text-base text-slate-950">{formatNode(value)}</dd>
    </>
  );
}

export function EmailLink({ email }: { email: string }) {
  if (!email) return '-';

  return (
    <a className="font-semibold text-doe-blue underline underline-offset-4" href={`mailto:${email}`}>
      {email}
    </a>
  );
}

export function CenterValue({ center, satelliteCenter }: { center: string; satelliteCenter: string }) {
  return (
    <div>
      <div>{formatValue(center)}</div>
      {satelliteCenter && (
        <div className="mt-1">
          Satellite Center: <span className="font-semibold">{satelliteCenter}</span>
        </div>
      )}
    </div>
  );
}
