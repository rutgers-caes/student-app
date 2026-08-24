import { CheckCircle2, Circle } from 'lucide-react';
import { getPasswordRules } from './password-rules';

export function PasswordRequirements({ password }: { password: string }) {
  const rules = getPasswordRules(password);

  return (
    <div className="mt-3 space-y-1">
      <PasswordRule complete={rules.length} label="At least 8 characters" />
      <PasswordRule complete={rules.number} label="At least 1 number" />
      <PasswordRule complete={rules.symbol} label="At least 1 special symbol" />
    </div>
  );
}

export function PasswordRule({ complete, label }: { complete: boolean; label: string }) {
  const Icon = complete ? CheckCircle2 : Circle;

  return (
    <p className={complete ? 'flex items-center gap-2 text-sm font-semibold text-green-700' : 'flex items-center gap-2 text-sm font-semibold text-slate-500'}>
      <Icon aria-hidden="true" size={14} />
      {label}
    </p>
  );
}
