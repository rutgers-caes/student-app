import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TokenPasswordForm } from '@/components/TokenPasswordForm';
import { FormActionRow, FormField, PageShell, StatusNotice } from '@/components/ui';
import { useTokenGatedPasswordForm } from '@/hooks/use-token-gated-password-form';
import { ApiRequestError, AuthServiceApi } from '@/services/auth-service';
import { iconSizes } from '@/styles/iconography';
import { typographyClassNames } from '@/styles/typography';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailNotFoundMessage = 'Not registered yet. Please register.';
const retryMessage = 'Unable to verify that email right now. Please try again in a moment.';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [setupToken, setSetupToken] = useState('');
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isRegisterAllowed, setIsRegisterAllowed] = useState(false);
  const {
    activeToken,
    confirmPassword,
    confirmPasswordMatches,
    password,
    passwordStarted,
    passwordValid,
    resetPasswordFields,
    setConfirmPassword,
    setPassword,
  } = useTokenGatedPasswordForm(setupToken);
  const emailIsValid = emailPattern.test(email.trim());
  const requestRegistrationMutation = useMutation({
    mutationFn: () => AuthServiceApi.requestRegistration(email.trim()),
    onSuccess: (result) => {
      // TEMPORARY LAUNCH FALLBACK:
      // Direct setup is allowed only when the backend explicitly returns a token.
      // Turn this off once Postmark email links are ready.
      if (result.approved && result.directPasswordSetupAllowed && result.setupToken) {
        setSetupToken(result.setupToken);
      }
      setIsRegisterAllowed(Boolean(result.approved));
      setStatusMessage(result.message || emailNotFoundMessage);
    },
    onError: (error) => {
      setStatusMessage(isEmailNotFoundError(error) ? emailNotFoundMessage : retryMessage);
    },
  });
  const completeRegistrationMutation = useMutation({
    mutationFn: () => AuthServiceApi.completeRegistration(activeToken, password),
    onSuccess: (result) => {
      setStatusMessage(`${result.message} You can now log in.`);
      setTimeout(() => navigate('/'), 900);
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to complete registration.');
    },
  });
  const isSubmitting = requestRegistrationMutation.isPending || completeRegistrationMutation.isPending;

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!emailIsValid) return;

    setStatusMessage('');
    setIsRegisterAllowed(false);
    setSetupToken('');
    resetPasswordFields();

    requestRegistrationMutation.mutate();
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordValid || !confirmPasswordMatches) {
      setStatusMessage('Please complete the password rules before creating your account.');
      return;
    }

    setStatusMessage('');
    completeRegistrationMutation.mutate();
  };

  return (
    <PageShell variant="auth">
      <main className="grid place-items-center px-5 pb-8 pt-3">
        <section className="flex w-full max-w-[760px] flex-col items-center" aria-labelledby="register-title">
          <div className="mt-5 w-full max-w-[680px]">
            <h1
              className={typographyClassNames.pageTitle}
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

                <FormActionRow>
                  <Button type="submit" disabled={isSubmitting || !emailIsValid}>
                  <Send aria-hidden="true" size={iconSizes.sm} />
                    {isSubmitting ? 'Checking' : 'Request Registration'}
                  </Button>
                </FormActionRow>
              </form>

              {activeToken && (
                <TokenPasswordForm
                  confirmPassword={confirmPassword}
                  confirmPasswordMatches={confirmPasswordMatches}
                  isSubmitting={isSubmitting}
                  onConfirmPasswordChange={setConfirmPassword}
                  onPasswordChange={setPassword}
                  onSubmit={handlePasswordSubmit}
                  password={password}
                  passwordStarted={passwordStarted}
                  passwordValid={passwordValid}
                  submitLabel="Create Password"
                  submittingLabel="Creating"
                />
              )}

              {statusMessage && (
                <StatusNotice className="mt-4" tone={isRegisterAllowed ? 'info' : 'error'}>
                  {statusMessage}
                </StatusNotice>
              )}
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function isEmailNotFoundError(error: unknown) {
  if (error instanceof ApiRequestError && error.status >= 500) return false;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  return message.includes('not registered') || message.includes('not found') || message.includes('no student') || message.includes('email not in database');
}
