import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TokenPasswordForm } from '@/components/TokenPasswordForm';
import { Card, PageShell, StatusNotice } from '@/components/ui';
import { useTokenGatedPasswordForm } from '@/hooks/use-token-gated-password-form';
import { AuthServiceApi } from '@/services/auth-service';
import { typographyClassNames } from '@/styles/typography';

export default function CreatePasswordPage() {
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
  } = useTokenGatedPasswordForm();

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

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordValid || !confirmPasswordMatches) {
      setStatusMessage('Please complete the password rules before creating your password.');
      return;
    }

    setStatusMessage('');
    completeRegistrationMutation.mutate();
  }

  return (
    <PageShell variant="auth" showAuthLoginButton={false}>
      <main className="px-5 pb-12 pt-3">
        <section className="mx-auto w-full max-w-[760px]" aria-labelledby="create-password-title">
          <Card className="mt-5 px-6 py-7 sm:px-8 sm:py-8">
            <h1 className={typographyClassNames.pageTitle} id="create-password-title">
              Create Password
            </h1>

            <TokenPasswordForm
              confirmPassword={confirmPassword}
              confirmPasswordMatches={confirmPasswordMatches}
              introText="Create a new password for your student account."
              isSubmitting={completeRegistrationMutation.isPending}
              onConfirmPasswordChange={setConfirmPassword}
              onPasswordChange={setPassword}
              onSubmit={handlePasswordSubmit}
              password={password}
              passwordStarted={passwordStarted}
              passwordValid={passwordValid}
              submitLabel="Create Password"
              submittingLabel="Creating"
            />
            {!activeToken && (
              <StatusNotice className="mt-6" tone="error">
                This setup link is missing or invalid. Please use the email link sent to you or request a new registration link.
              </StatusNotice>
            )}
            {statusMessage && (
              <StatusNotice className="mt-6" tone={statusMessage.includes('now log in') ? 'info' : 'error'}>
                {statusMessage}
              </StatusNotice>
            )}
          </Card>
        </section>
      </main>
    </PageShell>
  );
}
