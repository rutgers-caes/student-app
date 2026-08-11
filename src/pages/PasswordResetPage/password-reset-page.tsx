import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { Check, LogIn, Send } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  const activeToken = linkToken || setupToken;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');
    try {
      const result = await AuthServiceApi.requestPasswordReset(email.trim());
      setSubmittedEmail(email.trim());
      if (result.directPasswordSetupAllowed && result.setupToken) setSetupToken(result.setupToken);
      setStatusMessage(result.message);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to request password reset.');
    } finally { setIsSubmitting(false); }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) { setStatusMessage('Passwords do not match.'); return; }
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
        <section className="w-full max-w-[760px]" aria-labelledby="reset-title">
          <div className="mt-5 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_50px_rgb(15_23_42_/_8%)]">
            <h1
              className="border-b border-slate-200 bg-slate-50 px-7 py-4 text-[clamp(24px,3vw,30px)] font-normal leading-tight tracking-normal text-slate-950 max-sm:px-5"
              id="reset-title"
            >
              Reset Password
            </h1>

            {!linkToken && <form className="px-7 py-6 max-sm:px-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-3 block text-[17px] font-medium text-slate-700">E-Mail Address</span>
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

              <div className="mt-5 flex justify-center">
                <Button size="3" type="submit" disabled={isSubmitting}>
                  <Send aria-hidden="true" size={19} />
                  Send Password Reset Link
                </Button>
              </div>

              {submittedEmail && !setupToken && (
                <div className="mt-5 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-center text-[15px] leading-6 text-slate-800" role="status">
                  If <strong>{submittedEmail}</strong> matches an approved ITAC account, a password reset link will be sent.
                </div>
              )}
            </form>}

            {activeToken && <form className="px-7 py-6 max-sm:px-5" onSubmit={handlePasswordSubmit}>
              <p className="mb-5 text-slate-700">Create a new password for your student account.</p>
              <TextField.Root type="password" size="3" autoComplete="new-password" placeholder="New password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
              <div className="mt-3"><TextField.Root type="password" size="3" autoComplete="new-password" placeholder="Confirm new password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div>
              <p className="mt-3 text-sm text-slate-600">Use at least 8 characters with at least 1 number and 1 special symbol.</p>
              <div className="mt-5 flex justify-center"><Button size="3" type="submit" disabled={isSubmitting || !password || password !== confirmPassword}><Check size={19} />Update Password</Button></div>
            </form>}
            {statusMessage && <div className="mx-7 mb-6 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-center text-sm text-slate-800" role="status">{statusMessage}</div>}
          </div>
        </section>
      </main>
    </div>
  );
}
