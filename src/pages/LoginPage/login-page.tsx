import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@radix-ui/themes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircleHelp, ClipboardList, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AboutStudentPortalModal } from '@/components/AboutStudentPortalModal';
import { FormField, StatusNotice } from '@/components/ui';
import { AuthServiceApi } from '@/services/auth-service';
import { queryKeys } from '@/services/query-client';
import { profilePath, studentProfilePath } from '@/data/navigation';
import { iconSizes } from '@/styles/iconography';
import { typographyClassNames } from '@/styles/typography';

const notRegisteredMessage = 'Not registered yet. Please register.';

export default function LoginPage() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const loginMutation = useMutation({
    mutationFn: () => AuthServiceApi.login(email, password),
    onSuccess: (result) => {
      queryClient.clear();
      queryClient.setQueryData(queryKeys.myProfile, result.student);
      const studentName = getLoginStudentName(result.student);
      navigate(studentName ? studentProfilePath(studentName) : profilePath);
    },
    onError: (error) => {
      setStatusMessage(formatLoginError(error));
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage('');
    loginMutation.mutate();
  }

  return (
    <main className="auth-page-background grid min-h-screen place-items-center px-5 py-8">
      <section className="flex w-full max-w-[760px] flex-col items-center" aria-labelledby="login-title">
        <img className="block w-[min(430px,76vw)]" src={`${import.meta.env.BASE_URL}Docs/DOE_blue_seal_logo.png`} alt="U.S. Department of Energy" />
        
        <div className="w-full max-w-[680px] px-[34px] py-7 max-sm:px-[18px]">
          <p className="mb-5 mt-6 w-full whitespace-nowrap text-center text-section-title font-semibold leading-tight tracking-normal text-slate-800">
            Industrial Training and Assessment Centers
          </p>
          <h2 className={`mb-7 mt-0 text-center ${typographyClassNames.display}`} id="login-title">
            Student and Alumni Portal
          </h2>
          <form className="mx-auto w-full max-w-[540px]" onSubmit={handleSubmit}>
            <div className="mb-3">
              <FormField
                autoComplete="email"
                label="Email Address"
                layout="row"
                onChange={setEmail}
                placeholder="name@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="mb-3">
              <FormField
                autoComplete="current-password"
                label="Password"
                layout="row"
                onChange={setPassword}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </div>

            <div className="mb-5.5 ml-[90px] mt-1 flex flex-wrap items-center justify-center gap-3 max-sm:ml-0">
              <Button asChild color="gray" highContrast>
                <Link to="/register">
                  <ClipboardList aria-hidden="true" size={iconSizes.md} />
                  Register
                </Link>
              </Button>
              <Button type="submit" disabled={loginMutation.isPending}>
                <LogIn aria-hidden="true" size={iconSizes.md} />
                {loginMutation.isPending ? 'Logging in' : 'Login'}
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
              <StatusNotice className="mx-auto mb-5 max-w-[430px] px-3 py-2" tone="error">
                {statusMessage}
              </StatusNotice>
            )}
          </form>

          <footer className="border-t border-slate-200 pt-5 text-center">
            <button
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border-0 bg-transparent px-1.5 py-1 text-lg font-semibold text-doe-blue focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-200 max-sm:text-[19px]"
              type="button"
              onClick={() => setIsAboutOpen(true)}
            >
              What is the ITAC Student and Alumni Portal
              <CircleHelp aria-hidden="true" size={iconSizes.md} />
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

function getLoginStudentName(student: unknown) {
  if (!student || typeof student !== 'object') return '';
  const name = (student as { name?: unknown }).name;
  return typeof name === 'string' ? name : '';
}

function formatLoginError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes('not registered') ||
    normalizedMessage.includes('not found') ||
    normalizedMessage.includes('no student') ||
    normalizedMessage.includes('email not in database')
  ) {
    return notRegisteredMessage;
  }

  return message || 'Unable to log in.';
}
