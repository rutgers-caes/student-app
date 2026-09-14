import { Link } from 'react-router-dom';
import { Badge, Button } from '@radix-ui/themes';
import { ArrowLeft, Users } from 'lucide-react';
import { Card } from '@/components/ui';
import { studentProfilePath } from '@/data/navigation';
import { iconSizes } from '@/styles/iconography';
import { formatValue } from '../../center-students-formatters';
import type { PortalStudent } from '../../center-students-types';
import { getVisibleCenterStudents } from '../../center-students-utils';
import { AssessmentCountBadge } from '../AssessmentBadges';
import { StudentStatusDot } from '../StudentStatus';

const directoryGridColumns = 'grid-cols-[120px_minmax(220px,1.15fr)_170px_120px_82px_82px_82px_minmax(260px,1.2fr)]';

export function CenterStudentDirectory({ portalStudent }: { portalStudent: PortalStudent }) {
  const centerStudents = getVisibleCenterStudents(portalStudent);
  const profileHref = studentProfilePath(portalStudent.name);

  return (
    <Card as="section">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-950">
            <Users aria-hidden="true" size={iconSizes.lg} />
            List of All Center Students
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">{portalStudent.center} students only</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge color="blue" size="2" variant="soft">
            {centerStudents.length} students
          </Badge>
          <Button asChild color="gray" variant="soft">
            <Link to={profileHref}>
              <ArrowLeft aria-hidden="true" size={iconSizes.sm} />
              Back to Profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className={`grid min-w-[1140px] ${directoryGridColumns} items-center border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-[0.06em] text-slate-500`}>
          <div className="text-center">Role</div>
          <div>Name</div>
          <div>Type</div>
          <div>Grad Year</div>
          <div className="text-center">Lead</div>
          <div className="text-center">Safety</div>
          <div className="text-center">Other</div>
          <div>Email</div>
        </div>

        {centerStudents.map((student, index) => (
          <div
            className={`grid min-w-[1140px] ${directoryGridColumns} items-center border-b border-slate-200 px-5 py-4 last:border-b-0 ${
              index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
            }`}
            key={student.id}
          >
            <div className="flex justify-center">
              <StudentStatusDot status={student.status} />
            </div>
            <Link className="w-fit rounded-md text-base font-bold text-doe-blue underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-200" to={`/students/${student.id}`}>
              {student.name}
            </Link>
            <div className="text-sm font-semibold text-slate-700">{formatValue(student.type)}</div>
            <div className="text-sm font-semibold text-slate-700">{formatValue(student.graduationYear)}</div>
            <div className="flex justify-center"><AssessmentCountBadge value={student.assessmentCounts.lead} /></div>
            <div className="flex justify-center"><AssessmentCountBadge value={student.assessmentCounts.safety} /></div>
            <div className="flex justify-center"><AssessmentCountBadge value={student.assessmentCounts.other} /></div>
            <a className="truncate text-sm font-semibold text-doe-blue underline underline-offset-4" href={`mailto:${student.email}`}>
              {formatValue(student.email)}
            </a>
          </div>
        ))}
      </div>
    </Card>
  );
}
