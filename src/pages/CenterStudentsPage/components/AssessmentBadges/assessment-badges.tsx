import { Building, Factory } from 'lucide-react';
import { iconSizes } from '@/styles/iconography';
import type { StudentAssessment } from '@/types/student-profile';

export function AssessmentCountBadge({ value }: { value: number }) {
  return <span className="inline-flex h-8 w-10 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-800">{value}</span>;
}

export function AssessmentTypeIcon({ assessmentType }: { assessmentType: StudentAssessment['assessmentType'] }) {
  const isCommercial = assessmentType === 'Commercial';
  const Icon = isCommercial ? Building : Factory;
  const label = isCommercial ? 'Commercial Assessment' : 'Industrial Assessment';

  return (
    <span
      className="group relative inline-flex h-7 w-7 shrink-0 items-center justify-center text-slate-950"
      aria-label={label}
      title={label}
    >
      <Icon aria-hidden="true" size={iconSizes.md} strokeWidth={2.75} />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
        {label}
      </span>
    </span>
  );
}
