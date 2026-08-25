import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isPasswordValid } from '@/components/PasswordRequirements';

export function useTokenGatedPasswordForm(devSetupToken = '') {
  const [searchParams] = useSearchParams();
  // TODO: Remove the DEV fallback before production; password setup must come only from emailed links.
  const activeToken = searchParams.get('token') || (import.meta.env.DEV ? devSetupToken : '');
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
