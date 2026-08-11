import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { CircleHelp, ClipboardList, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AboutStudentPortalModal } from '@/components/AboutStudentPortalModal';
import { AuthServiceApi } from '@/services/auth-service';
import { profilePath, studentProfilePath } from '@/data/navigation';

export default function LoginPage() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const result = await AuthServiceApi.login(email, password);
      if (result.temporaryPasswordRequired) {
        setStatusMessage('Temporary password accepted. Please update your password from Edit Profile after login.');
      }
      const student = result.student as { name?: string };
      navigate(student.name ? studentProfilePath(student.name) : profilePath);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to log in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_18%,rgb(96_122_168_/_8%),transparent_28%),linear-gradient(180deg,#fff_0%,#f8fafc_100%)] px-5 py-8">
      <section className="flex w-full max-w-[760px] flex-col items-center" aria-labelledby="login-title">
        <img className="block w-[min(430px,76vw)]" src={`${import.meta.env.BASE_URL}Docs/DOE_blue_seal_logo.png`} alt="U.S. Department of Energy" />
        
        <div className="w-full max-w-[680px] px-[34px] py-7 max-sm:px-[18px]">
          <p className="mb-5 mt-6 w-full whitespace-nowrap text-center text-[clamp(18px,3.2vw,28px)] font-semibold leading-tight tracking-normal text-slate-800">
            Industrial Training and Assessment Centers
          </p>
          <h2 className="mb-7 mt-0 text-center text-[clamp(34px,4.2vw,50px)] font-semibold leading-tight tracking-normal text-slate-950" id="login-title">
            Student and Alumni Portal
          </h2>
          <form className="mx-auto w-full max-w-[540px]" onSubmit={handleSubmit}>
            <label className="mb-3 grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-2">
              <span className="text-right text-[17px] text-slate-700 max-sm:text-left">Email Address</span>
              <TextField.Root type="email" size="3" autoComplete="email" placeholder="name@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>

            <label className="mb-3 grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-2">
              <span className="text-right text-[17px] text-slate-700 max-sm:text-left">Password</span>
              <TextField.Root type="password" size="3" autoComplete="current-password" placeholder="Enter your password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>

            <div className="mb-5.5 ml-[90px] mt-1 flex flex-wrap items-center justify-center gap-3 max-sm:ml-0">
              <Button asChild color="gray" highContrast>
                <Link to="/register">
                  <ClipboardList aria-hidden="true" size={20} />
                  Register
                </Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <LogIn aria-hidden="true" size={21} />
                {isSubmitting ? 'Logging in' : 'Login'}
              </Button>
              <a
                className="rounded-md px-1 py-2 text-base font-semibold text-doe-blue underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-200 max-sm:w-full max-sm:text-center"
                href="/password/reset"
                target="_blank"
                rel="noreferrer"
              >
                Forgot Password?
              </a>
            </div>
            {statusMessage && (
              <p className="mx-auto mb-5 max-w-[430px] rounded-md border border-red-100 bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-700">
                {statusMessage}
              </p>
            )}
          </form>

          <footer className="border-t border-slate-200 pt-5 text-center">
            <button
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border-0 bg-transparent px-1.5 py-1 text-lg font-semibold text-doe-blue focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-200 max-sm:text-[19px]"
              type="button"
              onClick={() => setIsAboutOpen(true)}
            >
              What is the ITAC Student and Alumni Portal
              <CircleHelp aria-hidden="true" size={21} />
            </button>
            <p className="mt-3 text-[15px] font-bold leading-normal text-slate-800">
              For information about the ITAC program, please visit:{' '}
              <a className="text-doe-blue underline underline-offset-4" href="https://itacs.university/home" target="_blank" rel="noreferrer">
                ITACS.university
              </a>
            </p>
          </footer>
        </div>
      </section>

      {isAboutOpen && <AboutStudentPortalModal onClose={() => setIsAboutOpen(false)} />}
    </main>
  );
}
