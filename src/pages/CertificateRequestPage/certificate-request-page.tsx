import { Button } from '@radix-ui/themes';
import { Award, Download, FileText, Mail, ShieldCheck } from 'lucide-react';
import { AppNavbar } from '@/components/AppNavbar';
import { demoStudent, profileImage } from '@/data/demo-student';

const certificateApplicationPath = `${import.meta.env.BASE_URL}application/Certificate%20Application.docx`;
const certificateEmail = 'certificates@iac.university';

export default function CertificateRequestPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <AppNavbar firstName={demoStudent.firstName} profileImage={profileImage} />
      <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-doe-blue">
                <Award aria-hidden="true" size={22} />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Student Certificate</p>
                <h1 className="text-2xl font-semibold text-slate-950">Current Student Certificate Request Process</h1>
              </div>
            </div>
          </header>

          <div className="grid gap-6 px-6 py-6 text-lg leading-8 text-slate-800">
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-950">
                <ShieldCheck aria-hidden="true" className="text-doe-blue" size={22} />
                Student Certificate Requirements
              </h2>
              <ol className="grid gap-2 pl-6">
                <li>Completion of a minimum of 2 semesters or summers with ITAC</li>
                <li>Completion of a minimum of 6 plant assessments</li>
                <li>
                  Demonstrates a minimum of 8 of the 10 Core Skills
                  <ul className="mt-2 grid gap-1 pl-6 text-base leading-7">
                    <li>Assessment Recommendation Identification</li>
                    <li>Report Writing</li>
                    <li>Energy Savings Calculations</li>
                    <li>ITAC Teamwork/Group Interaction</li>
                    <li>Client Interaction</li>
                    <li>Utility Data Analysis</li>
                    <li>Conceptual Assessment Recommendation Designs</li>
                    <li>Leadership</li>
                    <li>Understanding of ISO 50001 Energy Management Systems</li>
                    <li>Other, with justification</li>
                  </ul>
                </li>
                <li>Student has a complete and accurate record in the ITAC student registry</li>
              </ol>
            </section>

            <section className="border-t border-slate-200 pt-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-950">
                <FileText aria-hidden="true" className="text-doe-blue" size={22} />
                How to Request
              </h2>
              <ol className="grid gap-3 pl-6">
                <li>
                  Complete the student certificate request form and have it signed by your center director.
                  <div className="mt-3">
                    <Button asChild color="blue" size="3">
                      <a href={certificateApplicationPath}>
                        <Download aria-hidden="true" size={18} />
                        Student Certificate Request Form
                      </a>
                    </Button>
                  </div>
                </li>
                <li>
                  Your center director can then submit it directly through the ITAC website. If you have already received a certificate and would
                  like to request an updated one, email a new application to{' '}
                  <a className="inline-flex items-center gap-1 font-semibold text-doe-blue underline underline-offset-4" href={`mailto:${certificateEmail}`}>
                    <Mail aria-hidden="true" size={17} />
                    {certificateEmail}
                  </a>
                  .
                </li>
                <li>Rutgers will process the certificate if the requirements are met and send it to the DOE Office for signature.</li>
                <li>Once returned, certificates with a DOE signature will be sent directly to the ITAC director.</li>
              </ol>

              <p className="mt-6 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-base font-semibold text-slate-800">
                Rutgers and DOE review progress will be noted on your main profile page.
              </p>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
