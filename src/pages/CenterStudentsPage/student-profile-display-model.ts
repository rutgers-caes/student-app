import { formatDateOnlyTokensForDisplay } from '@/utils/date-only-utils';
import {
  formatAssessmentsBeforeLead,
  formatTimeInItac,
  getAssessmentDateRange,
  getAssessmentsBeforeLead,
  getSatelliteCenter,
} from './center-students-formatters';
import type { CenterStudent, PortalStudent } from './center-students-types';
import { getAssessmentTotal, getStudentAssessmentRecords } from './center-students-utils';

export type StudentDisplayModel = {
  assessmentCounts: Array<{ label: string; value: number }>;
  assessmentDateRange: {
    first: string;
    last: string;
  };
  assessmentTotal: number;
  assessmentsBeforeLeadLabel: string;
  center: string;
  certificate: {
    hasCertificate: boolean;
    status: string;
  };
  email: string;
  id: string;
  isPortalStudent: boolean;
  linkedin: string;
  name: string;
  photoBase64: string;
  satelliteCenter: string;
  timeInItac: string;
  type: string;
};

export function toStudentDisplayModel({
  portalStudent,
  student,
}: {
  portalStudent: PortalStudent;
  student: CenterStudent | PortalStudent;
}): StudentDisplayModel {
  const assessmentTotal = getAssessmentTotal(student.assessmentCounts);
  const assessmentRecords = getStudentAssessmentRecords(portalStudent, student);
  const assessmentsBeforeLead = getAssessmentsBeforeLead(assessmentRecords);
  const certificateStatus = formatDateOnlyTokensForDisplay(student.certificateStatus);
  const hasCertificate = Boolean(student.certificateStatus) && student.certificateStatus.toLowerCase() !== 'no certificate';

  return {
    assessmentCounts: [
      { label: 'Lead', value: student.assessmentCounts.lead },
      { label: 'Safety', value: student.assessmentCounts.safety },
      { label: 'Other', value: student.assessmentCounts.other },
      { label: 'Total', value: assessmentTotal },
    ],
    assessmentDateRange: getAssessmentDateRange(assessmentRecords),
    assessmentTotal,
    assessmentsBeforeLeadLabel: formatAssessmentsBeforeLead(assessmentsBeforeLead),
    center: student.center,
    certificate: {
      hasCertificate,
      status: certificateStatus,
    },
    email: student.email,
    id: student.id,
    isPortalStudent: student.id === portalStudent.id,
    linkedin: student.linkedin,
    name: student.name,
    photoBase64: student.photoBase64,
    satelliteCenter: student.satelliteCenterName || getSatelliteCenter(student.centerCode),
    timeInItac: formatTimeInItac(student.timeInItac),
    type: student.type,
  };
}
