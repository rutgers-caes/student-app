import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@radix-ui/themes';
import { useMutation } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TokenPasswordForm } from '@/components/TokenPasswordForm';
import { Card, FormActionRow, FormField, PageShell, StatusNotice } from '@/components/ui';
import { useTokenGatedPasswordForm } from '@/hooks/use-token-gated-password-form';
import { AuthServiceApi } from '@/services/auth-service';
import { iconSizes } from '@/styles/iconography';
import { typographyClassNames } from '@/styles/typography';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();
  const {
    activeToken,
    confirmPassword,
    confirmPasswordMatches,
    password,
    passwordStarted,
    passwordValid,
    setConfirmPassword,
    setPassword,
  } = useTokenGatedPasswordForm(setupToken);
  const requestResetMutation = useMutation({
    mutationFn: () => AuthServiceApi.requestPasswordReset(email.trim()),
    onSuccess: (result) => {
      // TEMPORARY LAUNCH FALLBACK:
      // Direct reset is allowed only when the backend explicitly returns a token.
      // Turn this off once Postmark email links are ready.
      if (result.directPasswordSetupAllowed && result.setupToken) {
        setSetupToken(result.setupToken);
      }
      setSubmittedEmail(email.trim());
      setStatusMessage(result.message);
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to request password reset.');
    },
  });
  const completeResetMutation = useMutation({
    mutationFn: () => AuthServiceApi.completePasswordReset(activeToken, password),
    onSuccess: (result) => {
      setStatusMessage(result.message);
      setTimeout(() => navigate('/'), 900);
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to update password.');
    },
  });
  const isSubmitting = requestResetMutation.isPending || completeResetMutation.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage('');
    setSetupToken('');
    requestResetMutation.mutate();
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordValid || !confirmPasswordMatches) {
      setStatusMessage('Please complete the password rules before updating your password.');
      return;
    }

    setStatusMessage('');
    completeResetMutation.mutate();
  }

  return (
    <PageShell variant="auth">
      <main className="px-5 pb-12 pt-3">
        <section className="mx-auto w-full max-w-[760px]" aria-labelledby="reset-title">
          <Card className="mt-5 px-6 py-7 sm:px-8 sm:py-8">
            <h1 className={typographyClassNames.pageTitle} id="reset-title">
              Reset Password for the ITAC Student Portal
            </h1>

            {!activeToken && (
              <>
                <div className="pt-6">
                  <div className="grid gap-4 text-[17px] leading-8 text-slate-800">
                    <p>Please enter an email address that exactly matches your ITAC student record.</p>
                    <p>If this email matches an approved record, you will receive an email with a link to reset your password.</p>
                  </div>
                </div>

                <form className="mx-auto mt-8 w-full max-w-[560px] border-t border-slate-200 pt-7" onSubmit={handleSubmit}>
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
                    <Button size="3" type="submit" disabled={isSubmitting}>
                      <Send aria-hidden="true" size={iconSizes.sm} />
                      {isSubmitting ? 'Requesting' : 'Reset Password'}
                    </Button>
                  </FormActionRow>
                </form>
              </>
            )}

            {activeToken && (
              <TokenPasswordForm
                confirmPassword={confirmPassword}
                confirmPasswordMatches={confirmPasswordMatches}
                introText="Reset your password for your ITAC Student Portal."
                isSubmitting={isSubmitting}
                onConfirmPasswordChange={setConfirmPassword}
                onPasswordChange={setPassword}
                onSubmit={handlePasswordSubmit}
                password={password}
                passwordStarted={passwordStarted}
                passwordValid={passwordValid}
                submitLabel="Update Password"
                submittingLabel="Updating"
              />
            )}
            {statusMessage && <StatusNotice className="mt-6">{statusMessage}</StatusNotice>}
          </Card>
        </section>
      </main>

      {submittedEmail && !activeToken && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-5" role="dialog" aria-modal="true" aria-labelledby="reset-confirmation-title">
          <Card className="w-full max-w-[460px] p-6 text-center shadow-[0_24px_70px_rgb(15_23_42_/_22%)]">
            <h2 className="text-2xl font-bold text-slate-950" id="reset-confirmation-title">
              Reset Email Sent
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-700">
              If the email address entered matches an approved ITAC student record, an email has been sent with instructions to reset your password.
            </p>
            <Button className="mt-5" size="3" type="button" onClick={() => setSubmittedEmail('')}>
              Close
            </Button>
          </Card>
        </div>
      )}
    </PageShell>
  );
}
