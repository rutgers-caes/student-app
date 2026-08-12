import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Button } from '@radix-ui/themes';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { AppNavbar } from '@/components/AppNavbar';
import { CenterBrandingBanner } from '@/components/CenterBrandingBanner';
import { profilePath, studentProfilePath } from '@/data/navigation';
import { AuthServiceApi } from '@/services/auth-service';
import type { StudentProfile } from '@/types/student-profile';

type AssessmentMetricMode = 'all' | 'lead';

type AssessmentMetricValue = {
  label: string;
  value: number | null;
  savings: number | null;
};

type AssessmentMetricRow = {
  recommended: AssessmentMetricValue;
  implemented: AssessmentMetricValue;
};

type AssessmentEnergyRow = {
  label: string;
  recommended: { units: number; savings: number };
  implemented: { units: number; savings: number };
};

type AssessmentMetrics = {
  mode: AssessmentMetricMode;
  metadata: {
    center: string;
    student: string;
    date: string;
  };
  summaryRows: AssessmentMetricRow[];
  energyRows: AssessmentEnergyRow[];
  totalRows: AssessmentMetricRow[];
};

export default function AssessmentMetricsPage() {
  const { mode } = useParams();
  const metricsMode = mode === 'all' || mode === 'lead' ? mode : null;
  const [portalStudent, setPortalStudent] = useState<StudentProfile | null>(null);
  const [metrics, setMetrics] = useState<AssessmentMetrics | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');

  useEffect(() => {
    let isMounted = true;

    if (!metricsMode) return undefined;

    Promise.all([
      AuthServiceApi.getMyProfile<StudentProfile>(),
      AuthServiceApi.getAssessmentMetrics<AssessmentMetrics>(metricsMode),
    ])
      .then(([profile, assessmentMetrics]) => {
        if (!isMounted) return;
        setPortalStudent(profile);
        setMetrics(assessmentMetrics);
        setLoadState('ready');
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadState(error instanceof Error && error.message.toLowerCase().includes('no ') ? 'empty' : 'error');
      });

    return () => {
      isMounted = false;
    };
  }, [metricsMode]);

  if (!metricsMode) {
    return <Navigate to={profilePath} replace />;
  }

  const profileHref = portalStudent ? studentProfilePath(portalStudent.name) : profilePath;
  const pageTitle = metricsMode === 'lead' ? 'As Lead Metrics' : 'All Assessments Metrics';

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <AppNavbar firstName={portalStudent?.firstName || 'Student'} profileHref={profileHref} profileImage={portalStudent?.photoBase64 || ''} />
      {portalStudent && (
        <CenterBrandingBanner
          actions={
            <Button asChild className="!bg-white !text-slate-950 hover:!bg-white/90" size="3">
              <Link to={profileHref}>
                <ArrowLeft aria-hidden="true" size={18} />
                Back to Profile
              </Link>
            </Button>
          }
          student={portalStudent}
        />
      )}

      <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-950">
                <BarChart3 aria-hidden="true" size={24} />
                {pageTitle}
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                View Student Related Metrics
              </p>
            </div>
          </div>

          {loadState === 'loading' && <PageNotice message="Loading assessment metrics..." />}
          {loadState === 'error' && <PageNotice tone="error" message="Unable to load assessment metrics." />}
          {loadState === 'empty' && <PageNotice message={metricsMode === 'lead' ? 'No lead assessment metrics were found.' : 'No assessment metrics were found.'} />}
          {loadState === 'ready' && metrics && <MetricsContent metrics={metrics} />}
        </section>
      </main>
    </div>
  );
}

function MetricsContent({ metrics }: { metrics: AssessmentMetrics }) {
  return (
    <div className="px-5 py-5">
      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700 md:grid-cols-3">
        <div>
          <span className="block text-xs uppercase tracking-[0.06em] text-slate-500">Center</span>
          {metrics.metadata.center || '-'}
        </div>
        <div>
          <span className="block text-xs uppercase tracking-[0.06em] text-slate-500">Student</span>
          {metrics.metadata.student || '-'}
        </div>
        <div>
          <span className="block text-xs uppercase tracking-[0.06em] text-slate-500">Date</span>
          {metrics.metadata.date || '-'}
        </div>
      </div>

      <SpreadsheetMetrics metrics={metrics} />
    </div>
  );
}

function SpreadsheetMetrics({ metrics }: { metrics: AssessmentMetrics }) {
  const recommendedSummaryRows = metrics.summaryRows.map((row) => row.recommended);
  const implementedSummaryRows = metrics.summaryRows.map((row) => row.implemented);
  const recommendedAssessmentRows = recommendedSummaryRows.slice(0, 4);
  const implementedAssessmentRows = implementedSummaryRows.slice(0, 4);
  const recommendedSavingsRows = recommendedSummaryRows.slice(4);
  const implementedSavingsRows = implementedSummaryRows.slice(4);
  const recommendedEnergyRows = metrics.energyRows.map((row) => ({
    label: row.label,
    units: row.recommended.units,
    savings: row.recommended.savings,
  }));
  const implementedEnergyRows = metrics.energyRows.map((row) => ({
    label: row.label,
    units: row.implemented.units,
    savings: row.implemented.savings,
  }));
  const recommendedTotalRows = metrics.totalRows.map((row) => row.recommended);
  const implementedTotalRows = metrics.totalRows.map((row) => row.implemented);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-6">
        <UnitTable rows={recommendedAssessmentRows} title="Recommended (TOTAL)" />
        <SavingsTable rows={recommendedSavingsRows} title="Recommended Waste and Productivity Savings" />
        <EnergyTable rows={recommendedEnergyRows} title="Recommended Energy Savings" />
        <MetricTable emphasized rows={recommendedTotalRows} title="Recommended Totals" />
      </div>
      <div className="space-y-6">
        <UnitTable rows={implementedAssessmentRows} title="Implemented (TOTAL)" />
        <SavingsTable rows={implementedSavingsRows} title="Implemented Waste and Productivity Savings" />
        <EnergyTable rows={implementedEnergyRows} title="Implemented Energy Savings" />
        <MetricTable emphasized rows={implementedTotalRows} title="Implemented Totals" />
      </div>
    </div>
  );
}

function TableShell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-900 px-4 py-3 text-sm font-bold text-white">
        {title}
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

function MetricTable({ emphasized = false, rows, title }: { emphasized?: boolean; rows: AssessmentMetricValue[]; title: string }) {
  return (
    <TableShell title={title}>
      <div className="min-w-[520px]">
        <ReportHeader />
        {rows.map((row) => (
          <ReportRow emphasized={emphasized} key={row.label} label={row.label} savings={row.savings} units={row.value} />
        ))}
      </div>
    </TableShell>
  );
}

function UnitTable({ rows, title }: { rows: AssessmentMetricValue[]; title: string }) {
  return (
    <TableShell title={title}>
      <div className="min-w-[400px]">
        <UnitHeader />
        {rows.map((row) => (
          <UnitRow key={row.label} label={row.label} units={row.value} />
        ))}
      </div>
    </TableShell>
  );
}

function SavingsTable({ rows, title }: { rows: AssessmentMetricValue[]; title: string }) {
  return (
    <TableShell title={title}>
      <div className="min-w-[400px]">
        <SavingsHeader />
        {rows.map((row) => (
          <SavingsRow key={row.label} label={row.label} savings={row.value} />
        ))}
      </div>
    </TableShell>
  );
}

function EnergyTable({ rows, title }: { rows: Array<{ label: string; units: number; savings: number }>; title: string }) {
  return (
    <TableShell title={title}>
      <div className="min-w-[520px]">
        <ReportHeader />
        {rows.slice(0, 3).map((row) => (
          <ReportRow key={row.label} label={row.label} savings={row.savings} units={row.units} />
        ))}
        <MmbtuRow />
        {rows.slice(3).map((row) => (
          <ReportRow key={row.label} label={row.label} savings={row.savings} units={row.units} />
        ))}
      </div>
    </TableShell>
  );
}

function ReportHeader() {
  return (
    <div className="grid grid-cols-[minmax(240px,1fr)_120px_140px] border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
      <ReportCell>Metric</ReportCell>
      <ReportCell align="right">Units</ReportCell>
      <ReportCell align="right">Savings</ReportCell>
    </div>
  );
}

function UnitHeader() {
  return (
    <div className="grid grid-cols-[minmax(240px,1fr)_120px] border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
      <ReportCell>Metric</ReportCell>
      <ReportCell align="right">Units</ReportCell>
    </div>
  );
}

function SavingsHeader() {
  return (
    <div className="grid grid-cols-[minmax(240px,1fr)_140px] border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
      <ReportCell>Metric</ReportCell>
      <ReportCell align="right">Savings</ReportCell>
    </div>
  );
}

function ReportRow({ emphasized = false, label, savings, units }: { emphasized?: boolean; label: string; savings: number | null; units: number | null }) {
  return (
    <div className={`grid grid-cols-[minmax(240px,1fr)_120px_140px] border-b border-slate-200 text-sm last:border-b-0 ${emphasized ? 'bg-slate-50 font-bold text-slate-950' : 'text-slate-700'}`}>
      <ReportCell>{label}</ReportCell>
      <ReportCell align="right">{formatMetricNumber(units)}</ReportCell>
      <ReportCell align="right">{formatMetricCurrency(savings)}</ReportCell>
    </div>
  );
}

function UnitRow({ label, units }: { label: string; units: number | null }) {
  return (
    <div className="grid grid-cols-[minmax(240px,1fr)_120px] border-b border-slate-200 text-sm text-slate-700 last:border-b-0">
      <ReportCell>{label}</ReportCell>
      <ReportCell align="right">{formatMetricNumber(units)}</ReportCell>
    </div>
  );
}

function SavingsRow({ label, savings }: { label: string; savings: number | null }) {
  return (
    <div className="grid grid-cols-[minmax(240px,1fr)_140px] border-b border-slate-200 text-sm text-slate-700 last:border-b-0">
      <ReportCell>{label}</ReportCell>
      <ReportCell align="right">{formatCurrency(savings)}</ReportCell>
    </div>
  );
}

function MmbtuRow() {
  return (
    <div className="grid grid-cols-[minmax(240px,1fr)_120px_140px] border-b border-slate-200 bg-slate-200 text-sm font-bold text-slate-800">
      <ReportCell />
      <ReportCell align="center">MMBTU</ReportCell>
      <ReportCell />
    </div>
  );
}

function ReportCell({ align = 'left', children }: { align?: 'left' | 'center' | 'right'; children?: ReactNode }) {
  const alignment = align === 'right' ? 'text-right tabular-nums' : align === 'center' ? 'text-center' : '';

  return <div className={`min-h-9 px-4 py-2 leading-snug ${alignment}`}>{children}</div>;
}

function PageNotice({ message, tone = 'info' }: { message: string; tone?: 'info' | 'error' }) {
  return (
    <p className={tone === 'error' ? 'px-5 py-6 text-sm font-semibold text-red-700' : 'px-5 py-6 text-sm font-semibold text-slate-600'}>
      {message}
    </p>
  );
}

function formatNumber(value: number | null) {
  if (value == null) return '';
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatCurrency(value: number | null) {
  if (value == null) return '';
  return value.toLocaleString(undefined, {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency',
  });
}

function formatMetricNumber(value: number | null) {
  return value == null ? '' : formatNumber(value);
}

function formatMetricCurrency(value: number | null) {
  return value == null ? '' : formatCurrency(value);
}
