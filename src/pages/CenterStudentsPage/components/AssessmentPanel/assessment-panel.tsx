import { Link } from 'react-router-dom';
import { Button } from '@radix-ui/themes';
import { Eye, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui';
import { iconSizes } from '@/styles/iconography';
import { getAssessmentDisplayDates } from '../../center-students-formatters';
import type { CenterStudent, PortalStudent } from '../../center-students-types';
import {
  getAssessmentTotal,
  getFacultyStaffParticipants,
  getStudentAssessmentRecords,
  sortParticipantsByRole,
} from '../../center-students-utils';
import { AssessmentTypeIcon } from '../AssessmentBadges';
import { PersonPill } from '../PersonPill';

export function AssessmentPanel({ allowDownloads = false, portalStudent, student }: { allowDownloads?: boolean; portalStudent: PortalStudent; student: CenterStudent | PortalStudent }) {
  const hasLeadAssessments = student.assessmentCounts.lead > 0;
  const assessmentRecordsForStudent = getStudentAssessmentRecords(portalStudent, student);
  const assessmentTotalForStudent = getAssessmentTotal(student.assessmentCounts);
  const hasAssessments = assessmentTotalForStudent > 0;

  return (
    <Card as="section">
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-950">
            <ShieldCheck aria-hidden="true" size={iconSizes.md} />
            Approved Assessments
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {hasAssessments ? `${assessmentTotalForStudent} connected assessments` : 'Not currently connected with any assessments.'}
          </p>
        </div>

        {allowDownloads && (
          <div className="text-left sm:text-center">
            <p className="mb-2 text-base font-bold text-slate-800">View Student Related Metrics</p>
            <div className="flex flex-wrap gap-2 sm:justify-center">
              {hasAssessments ? (
                <Button asChild color="blue">
                  <Link to="/assessments/metrics/all">
                    <Eye aria-hidden="true" size={iconSizes.sm} />
                    All Assessments Metrics
                  </Link>
                </Button>
              ) : (
                <span title="No assessments yet">
                  <Button type="button" color="blue" disabled>
                    <Eye aria-hidden="true" size={iconSizes.sm} />
                    All Assessments Metrics
                  </Button>
                </span>
              )}
              {hasLeadAssessments && (
                <Button asChild color="blue">
                  <Link to="/assessments/metrics/lead">
                    <Eye aria-hidden="true" size={iconSizes.sm} />
                    As Lead Metrics
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {hasAssessments ? (
        <div className="overflow-x-auto">
          <div className="grid min-w-[820px] grid-cols-[190px_260px_minmax(360px,1fr)] border-b border-slate-200 px-5 py-3 text-sm font-bold uppercase tracking-[0.04em] text-slate-500">
            <div>ID</div>
            <div>Faculty/Staff</div>
            <div>Student Participants</div>
          </div>
          {assessmentRecordsForStudent.map((assessment, index) => {
            const displayDates = getAssessmentDisplayDates(assessment);

            return (
              <div
                className={`grid min-w-[820px] grid-cols-[190px_260px_minmax(360px,1fr)] gap-4 border-b border-slate-200 px-5 py-4 last:border-b-0 ${
                  index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                }`}
                key={assessment.id}
              >
                <div>
                  <div className="grid grid-cols-[105px_32px] items-center gap-2">
                    <a
                      className="text-lg font-bold text-doe-blue underline underline-offset-4"
                      href={`https://itac.university/assessment/${assessment.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {assessment.id}
                    </a>
                    <AssessmentTypeIcon assessmentType={assessment.assessmentType} />
                  </div>
                  <div className="mt-1 flex flex-col gap-0.5 text-base font-semibold text-slate-950">
                    {displayDates.length > 0
                      ? displayDates.map((date) => <span key={`${assessment.id}-${date}`}>{date}</span>)
                      : '-'}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {getFacultyStaffParticipants(assessment).map((facultyStaff) => (
                    <PersonPill key={`${assessment.id}-${facultyStaff.participantId}-${facultyStaff.name}`} name={facultyStaff.name} role={facultyStaff.role} />
                  ))}
                </div>
                <div className="flex flex-wrap content-start items-start gap-2">
                  {sortParticipantsByRole(assessment.participants).map((participant) => (
                    <PersonPill
                      highlighted={String(participant.participantId) === student.id}
                      imageSrc={participant.photoBase64}
                      key={`${assessment.id}-${participant.participantId}`}
                      muted={String(participant.participantId) !== student.id}
                      name={participant.name}
                      role={participant.role}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-5 py-5 text-slate-600">Not currently connected with any assessments.</p>
      )}
    </Card>
  );
}
