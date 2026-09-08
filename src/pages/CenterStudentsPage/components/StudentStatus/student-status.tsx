export function StudentStatusBadge({ compact = false, status }: { compact?: boolean; status: string }) {
  const isActive = status.toLowerCase() === 'active';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 font-bold shadow-sm ${
        compact ? 'py-1 text-sm' : 'py-2 text-base'
      } ${isActive ? 'border-green-200 bg-green-100 text-green-800' : 'border-red-200 bg-red-100 text-red-800'}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-green-600' : 'bg-red-600'}`} aria-hidden="true" />
      {status}
    </span>
  );
}

export function StudentStatusDot({ status }: { status: string }) {
  const isActive = status.toLowerCase() === 'active';

  return (
    <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
      <span className={`h-3 w-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true" />
      {isActive ? 'Active' : 'Former'}
    </span>
  );
}
