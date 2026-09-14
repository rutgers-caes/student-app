import { HelpCircle, Mail } from 'lucide-react';
import { Card, PageShell } from '@/components/ui';
import { studentProfilePath } from '@/data/navigation';
import { AuthServiceApi } from '@/services/auth-service';
import { iconSizes } from '@/styles/iconography';
import { typographyClassNames } from '@/styles/typography';
import type { StudentProfile } from '@/types/student-profile';

const faqItems = [
  {
    question: 'How are "Recent/Active" students determined?',
    answer:
      'A student is automatically considered "Recent/Active" if they are either associated with an assessment that took place in the last 365 days or if a new student has just been entered and has never been associated with an assessment.',
  },
  {
    question: 'What is ABL (or Assessments Before Lead)?',
    answer:
      'Assessments Before Lead is the number of assessments a student participated in before being assigned as Lead student on an assessment.',
  },
  {
    question: 'How are "Days in ITAC" (or ITAC Days) calculated?',
    answer:
      'The "Days in ITAC" is estimated based on the number of days from the first to last assessment plus 60 days. The additional 60 is the approximate time to produce the last report.',
  },
  {
    question: 'Why do student statistics only go back to 2002?',
    answer:
      'The ITAC database added tracking of students in 2002. Even for centers that were established before 2002, student related data is only currently available since 2002.',
  },
];

export default function FAQPage() {
  const portalStudent = AuthServiceApi.getStoredStudentProfile<StudentProfile>();

  return (
    <PageShell firstName={portalStudent?.firstName || 'Student'} profileHref={portalStudent ? studentProfilePath(portalStudent.name) : '/profile'} profileImage={portalStudent?.photoBase64 || ''}>
      <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
        <Card as="section" className="overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-doe-blue">
                <HelpCircle aria-hidden="true" size={iconSizes.md} />
              </span>
              <div>
                <p className={typographyClassNames.eyebrow}>Student Portal</p>
                <h1 className="text-2xl font-semibold text-slate-950">FAQ</h1>
              </div>
            </div>
          </header>

          <div className="px-6 py-5">
            <p className="flex flex-wrap items-center gap-2 text-xl text-slate-800">
              <Mail aria-hidden="true" className="text-doe-blue" size={iconSizes.md} />
              Still have a question not covered below? Email us at:
              <a className="font-semibold text-doe-blue underline underline-offset-4" href="mailto:students@iac.university">
                students@iac.university
              </a>
            </p>
          </div>

          <div className="divide-y divide-slate-200 border-t border-slate-200">
            {faqItems.map((item) => (
              <article className="grid gap-5 px-6 py-7 md:grid-cols-[minmax(260px,360px)_minmax(0,1fr)]" key={item.question}>
                <h2 className="text-lg font-bold leading-snug text-slate-950">{item.question}</h2>
                <p className="text-lg leading-relaxed text-slate-700">{item.answer}</p>
              </article>
            ))}
          </div>
        </Card>
      </main>
    </PageShell>
  );
}
