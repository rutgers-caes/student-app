import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isPasswordValid } from '@/components/PasswordRequirements';

export function useTokenGatedPasswordForm(devSetupToken = '') {
  const [searchParams] = useSearchParams();
  // TEMPORARY LAUNCH FALLBACK:
  // Allows direct password setup/reset when the backend intentionally returns a
  // one-time token. Remove this fallback once Postmark email delivery is ready.
  const activeToken = searchParams.get('token') || devSetupToken;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const passwordStarted = Boolean(password || confirmPassword);
  const passwordValid = isPasswordValid(password);
  const confirmPasswordMatches = Boolean(password) && password === confirmPassword;

  function resetPasswordFields() {
    setPassword('');
    setConfirmPassword('');
  }

  return {
    activeToken,
    confirmPassword,
    confirmPasswordMatches,
    password,
    passwordStarted,
    passwordValid,
    resetPasswordFields,
    setConfirmPassword,
    setPassword,
  };
}
