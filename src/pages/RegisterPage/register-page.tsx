import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { Check, CheckCircle2, Circle, LogIn, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthServiceApi } from '@/services/auth-service';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailNotFoundMessage = 'Email Not In Database, Please Contact Center';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isRegisterAllowed, setIsRegisterAllowed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailIsValid = emailPattern.test(email.trim());
  const passwordRules = {
    length: password.length >= 8,
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const passwordStarted = Boolean(password || confirmPassword);
  const passwordValid = Object.values(passwordRules).every(Boolean);
  const confirmPasswordMatches = Boolean(password) && password === confirmPassword;

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!emailIsValid) return;

    setIsSubmitting(true);
    setStatusMessage('');
    setIsRegisterAllowed(false);
    setSetupToken('');
    setPassword('');
    setConfirmPassword('');

    try {
      const result = await AuthServiceApi.requestRegistration(email.trim());
      const canSetPasswordDirectly = Boolean(result.approved && result.directPasswordSetupAllowed && result.setupToken);
      setIsRegisterAllowed(canSetPasswordDirectly);
      if (canSetPasswordDirectly) {
        setStatusMessage(result.message);
        setSetupToken(result.setupToken || '');
      } else {
        setStatusMessage(result.message || emailNotFoundMessage);
      }
    } catch (error) {
      setStatusMessage(emailNotFoundMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordValid || !confirmPasswordMatches) {
      setStatusMessage('Please complete the password rules before creating your account.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const result = await AuthServiceApi.completeRegistration(setupToken, password);
      setStatusMessage(`${result.message} You can now log in.`);
      setTimeout(() => navigate('/'), 900);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to complete registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <section className="flex w-full max-w-[760px] flex-col items-center" aria-labelledby="register-title">
          <div className="mt-5 w-full max-w-[680px]">
            <h1
              className="text-[clamp(32px,4vw,46px)] font-bold leading-tight tracking-normal text-slate-950"
              id="register-title"
            >
              Request Registration
            </h1>

            <div className="pt-6">
              <div className="grid gap-4 text-[17px] leading-8 text-slate-800">
                <p>
                  To register for this portal, we first need to verify that you are already entered as a student in the ITAC database.
                </p>

                <p>
                  Please enter an email address below that exactly matches your ITAC student record (you may update this later).
                </p>

                <p>
                  If this email matches an approved record, you will receive an email with a link to complete your registration.
                </p>

                <p>
                  <strong className="font-bold text-slate-950">
                    If needed, please contact your center to verify they have created your student record and make sure your email has been entered in the system correctly.
                  </strong>
                </p>
              </div>

              <form className="mx-auto mt-8 w-full max-w-[560px] border-t border-slate-200 pt-7" onSubmit={handleEmailSubmit}>
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
                  <Button type="submit" disabled={isSubmitting || !emailIsValid}>
                    <Send aria-hidden="true" size={19} />
                    {isSubmitting ? 'Checking' : 'Request Registration'}
                  </Button>
                </div>
              </form>

              {isRegisterAllowed && setupToken && (
                <form className="mx-auto mt-6 w-full max-w-[540px] border-t border-slate-200 pt-6" onSubmit={handlePasswordSubmit}>
                  <label className="mb-3 grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-2">
                    <span className="text-right text-[17px] text-slate-700 max-sm:text-left">Password</span>
                    <div>
                      <TextField.Root
                        type="password"
                        size="3"
                        autoComplete="new-password"
                        placeholder="Create a password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                      {passwordStarted && <PasswordRuleList rules={passwordRules} />}
                    </div>
                  </label>

                  <label className="mb-3 grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-2">
                    <span className="text-right text-[17px] text-slate-700 max-sm:text-left">Confirm</span>
                    <div>
                      <TextField.Root
                        type="password"
                        size="3"
                        autoComplete="new-password"
                        placeholder="Confirm password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                      />
                      {passwordStarted && (
                        <PasswordRule complete={confirmPasswordMatches} label={confirmPasswordMatches ? 'Passwords match' : 'Passwords must match'} />
                      )}
                    </div>
                  </label>

                  <p className="mb-4 ml-[166px] text-sm leading-6 text-slate-600 max-sm:ml-0">
                    At least 8 characters<br />
                    At least 1 number<br />
                    At least 1 special symbol
                  </p>

                  <div className="mb-2 ml-[90px] mt-1 flex flex-wrap items-center justify-center gap-3 max-sm:ml-0">
                    <Button type="submit" disabled={isSubmitting || !passwordValid || !confirmPasswordMatches}>
                      <Check aria-hidden="true" size={19} />
                      {isSubmitting ? 'Creating' : 'Create Password'}
                    </Button>
                  </div>
                </form>
              )}

              {statusMessage && (
                <div
                  className={`mt-4 rounded-md border px-4 py-3 text-center text-[15px] leading-6 ${
                    isRegisterAllowed ? 'border-blue-100 bg-blue-50 text-slate-800' : 'border-red-100 bg-red-50 font-semibold text-red-700'
                  }`}
                  role="status"
                >
                  {statusMessage}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function PasswordRuleList({ rules }: { rules: Record<'length' | 'number' | 'symbol', boolean> }) {
  return (
    <div className="mt-3 space-y-1">
      <PasswordRule complete={rules.length} label="At least 8 characters" />
      <PasswordRule complete={rules.number} label="At least 1 number" />
      <PasswordRule complete={rules.symbol} label="At least 1 special symbol" />
    </div>
  );
}

function PasswordRule({ complete, label }: { complete: boolean; label: string }) {
  const Icon = complete ? CheckCircle2 : Circle;

  return (
    <p className={complete ? 'flex items-center gap-2 text-sm font-semibold text-green-700' : 'flex items-center gap-2 text-sm font-semibold text-slate-500'}>
      <Icon aria-hidden="true" size={14} />
      {label}
    </p>
  );
}
