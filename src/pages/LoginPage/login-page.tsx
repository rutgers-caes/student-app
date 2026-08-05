import { useState } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { CircleHelp, ClipboardList, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AboutStudentPortalModal } from '@/components/AboutStudentPortalModal';

export default function LoginPage() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_18%,rgb(96_122_168_/_8%),transparent_28%),linear-gradient(180deg,#fff_0%,#f8fafc_100%)] px-5 py-8">
      <section className="flex w-full max-w-[760px] flex-col items-center" aria-labelledby="login-title">
        <img className="block w-[min(430px,76vw)]" src={`${import.meta.env.BASE_URL}Docs/DOE_blue_seal_logo.png`} alt="U.S. Department of Energy" />
        
        <div className="w-full max-w-[680px] px-[34px] py-7 max-sm:px-[18px]">
          <p className="mb-2 mt-5 w-full whitespace-nowrap text-center text-[clamp(16px,3vw,26px)] font-semibold leading-tight tracking-normal text-slate-800">
            Industrial Training and Assessment Centers
          </p>
          <h2 className="mb-7 mt-3 text-center text-[clamp(32px,4vw,46px)] font-normal leading-tight tracking-normal text-slate-950" id="login-title">
            Student/Alumni Portal
          </h2>
          <form className="mx-auto w-full max-w-[540px]">
            <label className="mb-3 grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-2">
              <span className="text-right text-[17px] text-slate-700 max-sm:text-left">E-Mail Address</span>
              <TextField.Root type="email" size="3" autoComplete="email" placeholder="name@example.com" />
            </label>

            <label className="mb-3 grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-2">
              <span className="text-right text-[17px] text-slate-700 max-sm:text-left">Password</span>
              <TextField.Root type="password" size="3" autoComplete="current-password" placeholder="Enter your password" />
            </label>

            <div className="mb-5.5 ml-[90px] mt-1 flex flex-wrap items-center justify-center gap-3 max-sm:ml-0">
              <Button asChild color="gray" highContrast>
                <Link to="/register">
                  <ClipboardList aria-hidden="true" size={20} />
                  Register
                </Link>
              </Button>
              <Button type="submit">
                <LogIn aria-hidden="true" size={21} />
                Login
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
          </form>

          <footer className="border-t border-slate-200 pt-5 text-center">
            <button
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border-0 bg-transparent px-1.5 py-1 text-lg font-semibold text-doe-blue focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-200 max-sm:text-[19px]"
              type="button"
              onClick={() => setIsAboutOpen(true)}
            >
              What is the ITAC Student/Alumni Portal
              <CircleHelp aria-hidden="true" size={21} />
            </button>
            <p className="mt-3 text-[15px] font-bold leading-normal text-slate-800">
              For information about the ndustrial Training and Assessment Centers program, please visit:{' '}
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
