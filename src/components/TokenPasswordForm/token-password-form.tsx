import type { FormEvent } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import { Check } from 'lucide-react';
import { PasswordRequirements, PasswordRule } from '@/components/PasswordRequirements';
import { iconSizes } from '@/styles/iconography';

export function TokenPasswordForm({
  confirmPassword,
  confirmPasswordMatches,
  isSubmitting,
  onConfirmPasswordChange,
  onPasswordChange,
  onSubmit,
  password,
  passwordStarted,
  passwordValid,
  submitLabel,
  submittingLabel,
  introText,
}: {
  confirmPassword: string;
  confirmPasswordMatches: boolean;
  isSubmitting: boolean;
  onConfirmPasswordChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  password: string;
  passwordStarted: boolean;
  passwordValid: boolean;
  submitLabel: string;
  submittingLabel: string;
  introText?: string;
}) {
  return (
    <form className="mx-auto mt-8 w-full max-w-[560px] border-t border-slate-200 pt-7" onSubmit={onSubmit}>
      {introText && <p className="mb-5 text-slate-700">{introText}</p>}
      <TextField.Root
        type="password"
        size="3"
        autoComplete="new-password"
        placeholder="New password"
        required
        minLength={8}
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
      />
      {passwordStarted && <PasswordRequirements password={password} />}
      <div className="mt-3">
        <TextField.Root
          type="password"
          size="3"
          autoComplete="new-password"
          placeholder="Confirm new password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
        />
      </div>
      {passwordStarted && <PasswordRule complete={confirmPasswordMatches} label={confirmPasswordMatches ? 'Passwords match' : 'Passwords must match'} />}
      <div className="mt-5 flex justify-center">
        <Button size="3" type="submit" disabled={isSubmitting || !passwordValid || !confirmPasswordMatches}>
          <Check aria-hidden="true" size={iconSizes.sm} />
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
