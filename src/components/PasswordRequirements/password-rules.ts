export type PasswordRuleKey = 'length' | 'number' | 'symbol';
export type PasswordRules = Record<PasswordRuleKey, boolean>;

export function getPasswordRules(password: string): PasswordRules {
  return {
    length: password.length >= 8,
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordValid(password: string) {
  return Object.values(getPasswordRules(password)).every(Boolean);
}
