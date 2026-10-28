import type { ReactNode } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Button } from '@radix-ui/themes';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { CenterBrandingBanner } from '@/components/CenterBrandingBanner';
import { Card, PageShell, StatusNotice } from '@/components/ui';
import { profilePath, studentProfilePath } from '@/data/navigation';
import { AuthServiceApi } from '@/services/auth-service';
import { queryKeys } from '@/services/query-client';
import { iconSizes } from '@/styles/iconography';
import type { StudentProfile } from '@/types/student-profile';
import { comparisonMetricValue } from './metric-display-value';

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
  const [profileQuery, metricsQuery] = useQueries({
    queries: [
      {
        queryKey: queryKeys.myProfile,
        queryFn: () => AuthServiceApi.getMyProfile<StudentProfile>(),
        enabled: Boolean(metricsMode),
      },
      {
        queryKey: metricsMode ? queryKeys.assessmentMetrics(metricsMode) : ['assessmentMetrics', 'invalid'],
        queryFn: () => AuthServiceApi.getAssessmentMetrics<AssessmentMetrics>(metricsMode as AssessmentMetricMode),
        enabled: Boolean(metricsMode),
      },
    ],
  });

  if (!metricsMode) {
    return <Navigate to={profilePath} replace />;
  }

  const portalStudent = profileQuery.data ?? null;
  const metrics = metricsQuery.data ?? null;
  const metricsError = metricsQuery.error;
  const metricsEmpty = metricsError instanceof Error && metricsError.message.toLowerCase().includes('no ');
  const profileHref = portalStudent ? studentProfilePath(portalStudent.name) : profilePath;
  const pageTitle = metricsMode === 'lead' ? 'As Lead Metrics' : 'All Assessments Metrics';

  return (
    <PageShell firstName={portalStudent?.firstName || 'Student'} profileHref={profileHref} profileImage={portalStudent?.photoBase64 || ''}>
      {portalStudent && (
        <CenterBrandingBanner
          actions={
            <Button asChild className="!bg-white !text-slate-950 hover:!bg-white/90" size="3">
              <Link to={profileHref}>
                <ArrowLeft aria-hidden="true" size={iconSizes.sm} />
                Back to Profile
              </Link>
            </Button>
          }
          student={portalStudent}
        />
      )}

      <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
        <Card as="section">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-950">
                <BarChart3 aria-hidden="true" size={iconSizes.lg} />
                {pageTitle}
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                View Student Related Metrics
              </p>
            </div>
          </div>

          {(profileQuery.isLoading || metricsQuery.isLoading) && <PageNotice message="Loading assessment metrics..." />}
          {(profileQuery.isError || (metricsQuery.isError && !metricsEmpty)) && <PageNotice tone="error" message="Unable to load assessment metrics." />}
          {metricsEmpty && <PageNotice message={metricsMode === 'lead' ? 'No lead assessment metrics were found.' : 'No assessment metrics were found.'} />}
          {metrics && <MetricsContent metrics={metrics} />}
        </Card>
      </main>
    </PageShell>
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
  return (
    <div className="space-y-5">
      <ComparisonTable rows={metrics.summaryRows.slice(0, 4)} title="Assessment Totals" valueType="number" />
      <ComparisonTable rows={metrics.summaryRows.slice(4)} title="Waste and Productivity Savings" valueType="currency" />
      <EnergyComparisonTable rows={metrics.energyRows} />
      <ComparisonTable emphasized rows={metrics.totalRows} showSavings title="Totals" valueType="number" />
    </div>
  );
}

function TableShell({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Card className="overflow-hidden shadow-none">
      <div className="border-b border-primary bg-primary px-4 py-3 text-sm font-bold text-white">
        {title}
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </Card>
  );
}

function ComparisonTable({
  emphasized = false,
  rows,
  showSavings = false,
  title,
  valueType,
}: {
  emphasized?: boolean;
  rows: AssessmentMetricRow[];
  showSavings?: boolean;
  title: string;
  valueType: 'currency' | 'number';
}) {
  const formatValue = valueType === 'currency' ? formatCurrency : formatNumber;

  return (
    <TableShell title={title}>
      <table className={`w-full border-collapse text-sm ${showSavings ? 'min-w-[760px]' : 'min-w-[560px]'}`}>
        <thead>
          {showSavings ? (
            <>
              <tr className="border-b border-slate-200 bg-blue-50 text-xs font-bold uppercase tracking-[0.06em] text-black">
                <th className="px-4 py-2 text-left" rowSpan={2} scope="col">Metric</th>
                <th className="border-l border-slate-200 px-4 py-2 text-center" colSpan={2} scope="colgroup">Recommended</th>
                <th className="border-l border-slate-200 px-4 py-2 text-center" colSpan={2} scope="colgroup">Implemented</th>
              </tr>
              <tr className="border-b border-slate-200 bg-blue-50 text-xs font-bold uppercase tracking-[0.06em] text-black">
                <th className="border-l border-slate-200 px-4 py-2 text-right" scope="col">Units</th>
                <th className="px-4 py-2 text-right" scope="col">Savings</th>
                <th className="border-l border-slate-200 px-4 py-2 text-right" scope="col">Units</th>
                <th className="px-4 py-2 text-right" scope="col">Savings</th>
              </tr>
            </>
          ) : (
            <tr className="border-b border-slate-200 bg-blue-50 text-xs font-bold uppercase tracking-[0.06em] text-black">
              <th className="px-4 py-2 text-left" scope="col">Metric</th>
              <th className="border-l border-slate-200 px-4 py-2 text-right" scope="col">Recommended</th>
              <th className="border-l border-slate-200 px-4 py-2 text-right" scope="col">Implemented</th>
            </tr>
          )}
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className={`border-b border-slate-200 last:border-b-0 ${emphasized ? 'bg-blue-50/60 font-bold text-slate-950' : 'text-slate-700'}`} key={`${row.recommended.label}-${row.implemented.label}`}>
              <MetricLabel>{getSharedMetricLabel(row)}</MetricLabel>
              <MetricValue divided>{formatValue(comparisonMetricValue(row.recommended, valueType))}</MetricValue>
              {showSavings && <MetricValue>{formatCurrency(row.recommended.savings)}</MetricValue>}
              <MetricValue divided>{formatValue(comparisonMetricValue(row.implemented, valueType))}</MetricValue>
              {showSavings && <MetricValue>{formatCurrency(row.implemented.savings)}</MetricValue>}
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function EnergyComparisonTable({ rows }: { rows: AssessmentEnergyRow[] }) {
  return (
    <TableShell title="Energy Savings">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-blue-50 text-xs font-bold uppercase tracking-[0.06em] text-black">
            <th className="px-4 py-2 text-left" rowSpan={2} scope="col">Metric</th>
            <th className="border-l border-slate-200 px-4 py-2 text-center" colSpan={2} scope="colgroup">Recommended</th>
            <th className="border-l border-slate-200 px-4 py-2 text-center" colSpan={2} scope="colgroup">Implemented</th>
          </tr>
          <tr className="border-b border-slate-200 bg-blue-50 text-xs font-bold uppercase tracking-[0.06em] text-black">
            <th className="border-l border-slate-200 px-4 py-2 text-right" scope="col">Units</th>
            <th className="px-4 py-2 text-right" scope="col">Savings</th>
            <th className="border-l border-slate-200 px-4 py-2 text-right" scope="col">Units</th>
            <th className="px-4 py-2 text-right" scope="col">Savings</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <EnergyComparisonRow key={row.label} row={row} showMmbtuDivider={index === 3} />
          ))}
        </tbody>
      </table>
    </TableShell>
  );
}

function EnergyComparisonRow({ row, showMmbtuDivider }: { row: AssessmentEnergyRow; showMmbtuDivider: boolean }) {
  return (
    <>
      {showMmbtuDivider && (
        <tr className="border-y border-blue-200 bg-blue-100/70 text-xs font-bold uppercase tracking-[0.06em] text-slate-700">
          <td className="px-4 py-1.5">Direct energy</td>
          <td className="border-l border-slate-200 px-4 py-1.5 text-right">MMBTU</td>
          <td />
          <td className="border-l border-slate-200 px-4 py-1.5 text-right">MMBTU</td>
          <td />
        </tr>
      )}
      <tr className="border-b border-slate-200 text-slate-700 last:border-b-0">
        <MetricLabel>{row.label}</MetricLabel>
        <MetricValue divided>{formatNumber(row.recommended.units)}</MetricValue>
        <MetricValue>{formatCurrency(row.recommended.savings)}</MetricValue>
        <MetricValue divided>{formatNumber(row.implemented.units)}</MetricValue>
        <MetricValue>{formatCurrency(row.implemented.savings)}</MetricValue>
      </tr>
    </>
  );
}

function MetricLabel({ children, divided = false }: { children: ReactNode; divided?: boolean }) {
  return (
    <th className={`px-4 py-2 text-left font-medium leading-snug ${divided ? 'border-l border-slate-200' : ''}`} scope="row">
      {children}
    </th>
  );
}

function MetricValue({ children, divided = false }: { children: ReactNode; divided?: boolean }) {
  return <td className={`whitespace-nowrap px-4 py-2 text-right tabular-nums ${divided ? 'border-l border-slate-200' : ''}`}>{children}</td>;
}

function getSharedMetricLabel(row: AssessmentMetricRow) {
  const recommendedLabel = row.recommended.label.replace(/^Recommended\s+/i, '');
  const implementedLabel = row.implemented.label.replace(/^Implemented\s+/i, '');

  return recommendedLabel === implementedLabel
    ? recommendedLabel
    : `${recommendedLabel} / ${implementedLabel}`;
}

function PageNotice({ message, tone = 'info' }: { message: string; tone?: 'info' | 'error' }) {
  return (
    <StatusNotice className="m-5" tone={tone}>
      {message}
    </StatusNotice>
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
