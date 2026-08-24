import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { Check, LogIn, Send } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PasswordRequirements, PasswordRule, isPasswordValid } from '@/components/PasswordRequirements';
import { AuthServiceApi } from '@/services/auth-service';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const linkToken = searchParams.get('token') || '';
  const localSetupToken = import.meta.env.DEV ? setupToken : '';
  const activeToken = linkToken || localSetupToken;
  const passwordStarted = Boolean(password || confirmPassword);
  const passwordValid = isPasswordValid(password);
  const confirmPasswordMatches = Boolean(password) && password === confirmPassword;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');
    try {
      const result = await AuthServiceApi.requestPasswordReset(email.trim());
      setSubmittedEmail(email.trim());
      if (import.meta.env.DEV && result.directPasswordSetupAllowed && result.setupToken) {
        setSetupToken(result.setupToken);
      }
      setStatusMessage(result.message);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to request password reset.');
    } finally { setIsSubmitting(false); }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordValid || !confirmPasswordMatches) { setStatusMessage('Please complete the password rules before updating your password.'); return; }
    setIsSubmitting(true);
    try {
      const result = await AuthServiceApi.completePasswordReset(activeToken, password);
      setStatusMessage(result.message);
      setTimeout(() => navigate('/'), 900);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to update password.');
    } finally { setIsSubmitting(false); }
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

            {!activeToken && <>
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
                  <Button size="3" type="submit" disabled={isSubmitting}>
                  <Send aria-hidden="true" size={19} />
                    {isSubmitting ? 'Requesting' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            </>}

            {activeToken && <form className="mx-auto mt-8 w-full max-w-[560px] border-t border-slate-200 pt-7" onSubmit={handlePasswordSubmit}>
              <p className="mb-5 text-slate-700">Create a new password for your student account.</p>
              <TextField.Root type="password" size="3" autoComplete="new-password" placeholder="New password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
              {passwordStarted && <PasswordRequirements password={password} />}
              <div className="mt-3"><TextField.Root type="password" size="3" autoComplete="new-password" placeholder="Confirm new password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div>
              {passwordStarted && <PasswordRule complete={confirmPasswordMatches} label={confirmPasswordMatches ? 'Passwords match' : 'Passwords must match'} />}
              <div className="mt-5 flex justify-center"><Button size="3" type="submit" disabled={isSubmitting || !passwordValid || !confirmPasswordMatches}><Check size={19} />Update Password</Button></div>
            </form>}
            {statusMessage && <div className="mx-7 mb-6 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-center text-sm text-slate-800" role="status">{statusMessage}</div>}
          </div>
        </section>
      </main>

      {submittedEmail && !activeToken && (
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
