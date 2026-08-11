import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { LogIn, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedEmail(email.trim());
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_18%,rgb(96_122_168_/_8%),transparent_28%),linear-gradient(180deg,#fff_0%,#f8fafc_100%)]">
      <header className="mx-auto flex min-h-[76px] w-full max-w-[1180px] items-center justify-between gap-4 px-5 py-4">
        <Link className="inline-flex min-w-0 items-center text-slate-950 no-underline" to="/" aria-label="ITAC Student Portal login">
          <img className="block w-[58px] shrink-0" src="/Docs/DOE_blue_seal_logo-head.png" alt="U.S. Department of Energy" />
          <span className="ml-3 text-[clamp(20px,2.2vw,28px)] font-bold leading-tight tracking-normal max-sm:text-lg">ITAC Student and Alumni Portal</span>
        </Link>
        <Button asChild size="3">
          <Link to="/">
            <LogIn aria-hidden="true" size={18} />
            Back to Login
          </Link>
        </Button>
      </header>

      <main className="grid place-items-center px-5 pb-8 pt-3">
        <section className="w-full max-w-[680px]" aria-labelledby="reset-title">
          <div className="mt-5 w-full">
            <h1 className="text-[clamp(32px,4vw,46px)] font-bold leading-tight tracking-normal text-slate-950" id="reset-title">
              Reset Password
            </h1>

            <div className="pt-6">
              <div className="grid gap-4 text-[17px] leading-8 text-slate-800">
                <p>Please enter an email address that exactly matches your ITAC student record.</p>
                <p>If this email matches an approved record, you will receive an email with a link to reset your password.</p>
              </div>
            </div>

            <form className="mx-auto mt-8 w-full max-w-[560px] border-t border-slate-200 pt-7" onSubmit={handleSubmit}>
              <label className="mb-3 grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-2">
                <span className="text-right text-[17px] font-medium text-slate-700 max-sm:text-left">Email Address</span>
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

              <div className="mb-2 grid grid-cols-[150px_minmax(0,1fr)] gap-4 max-sm:grid-cols-1 max-sm:gap-2">
                <span aria-hidden="true" />
                <Button size="3" type="submit">
                  <Send aria-hidden="true" size={19} />
                  Reset Password
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {submittedEmail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-5" role="dialog" aria-modal="true" aria-labelledby="reset-confirmation-title">
          <div className="w-full max-w-[460px] rounded-lg border border-slate-200 bg-white p-6 text-center shadow-[0_24px_70px_rgb(15_23_42_/_22%)]">
            <h2 className="text-2xl font-bold text-slate-950" id="reset-confirmation-title">
              Reset Email Sent
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-700">
              If the email address entered matches an approved ITAC student record, an email has been sent with instructions to reset your password.
            </p>
            <Button className="mt-5" size="3" type="button" onClick={() => setSubmittedEmail('')}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
