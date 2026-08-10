import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { LogIn, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthServiceApi } from '@/services/auth-service';

const supportEmail = 'students@iac.university';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');
    setTemporaryPassword('');

    try {
      const result = await AuthServiceApi.requestRegistration(email.trim());
      setStatusMessage(result.message);
      setTemporaryPassword(result.temporaryPassword || '');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to request registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_18%,rgb(96_122_168_/_8%),transparent_28%),linear-gradient(180deg,#fff_0%,#f8fafc_100%)]">
      <header className="mx-auto flex min-h-[76px] w-full max-w-[1180px] items-center justify-between gap-4 px-5 py-4">
        <Link className="inline-flex min-w-0 items-center text-slate-950 no-underline" to="/" aria-label="ITAC Student Portal login">
          <img className="block w-[58px] shrink-0" src="/Docs/DOE_blue_seal_logo-head.png" alt="U.S. Department of Energy" />
          <span className="ml-3 text-lg font-semibold tracking-tight max-sm:text-base">ITAC Student/Alumni Portal</span>
        </Link>
        <Button asChild color="gray" variant="soft">
          <Link to="/">
            <LogIn aria-hidden="true" size={18} />
            Login
          </Link>
        </Button>
      </header>

      <main className="grid place-items-center px-5 pb-8 pt-3">
        <section className="flex w-full max-w-[760px] flex-col items-center" aria-labelledby="register-title">
          <div className="mt-5 w-full max-w-[680px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgb(15_23_42_/_8%)]">
            <h1
              className="border-b border-slate-200 bg-slate-50 px-7 py-4 text-[clamp(24px,3vw,30px)] font-normal leading-tight tracking-normal text-slate-950 max-sm:px-5"
              id="register-title"
            >
              Request Registration
            </h1>

            <div className="px-7 py-6 max-sm:px-5">
              <div className="grid gap-4 text-[16px] leading-7 text-slate-800">
                <p>
                  To register, we need to verify that you are already entered as a current or former student in the ITAC database. Enter an email
                  address below that matches your ITAC student record. If this email matches an approved record, you will receive an email with a
                  link to complete your registration.
                </p>

                <p>
                  <strong className="font-bold text-slate-950">
                    If needed, contact your center to verify they have created your student record and entered your email correctly.
                  </strong>{' '}
                  If your center is no longer operating or you were a student a long time ago, contact the{' '}
                  <a className="font-semibold text-doe-blue underline underline-offset-4" href={`mailto:${supportEmail}`}>
                    Rutgers ITAC field management
                  </a>{' '}
                  to update your student record.
                </p>
              </div>

              <form className="mx-auto mt-6 w-full max-w-[540px] border-t border-slate-200 pt-6" onSubmit={handleSubmit}>
                <label className="mb-3 grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-2">
                  <span className="text-right text-[17px] text-slate-700 max-sm:text-left">E-Mail Address</span>
                  <TextField.Root
                    type="email"
                    size="3"
                    autoComplete="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>

                <div className="mb-2 ml-[90px] mt-1 flex flex-wrap items-center justify-center gap-3 max-sm:ml-0">
                  <Button type="submit" disabled={isSubmitting}>
                    <Send aria-hidden="true" size={19} />
                    {isSubmitting ? 'Checking' : 'Request Registration'}
                  </Button>
                </div>
              </form>

              {statusMessage && (
                <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-center text-[15px] leading-6 text-slate-800" role="status">
                  {statusMessage}
                  {temporaryPassword && (
                    <p className="mt-2 font-semibold">
                      Local temporary password: <span className="font-mono">{temporaryPassword}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
