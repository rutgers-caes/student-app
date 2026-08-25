import type { ReactNode } from 'react';
import { Button } from '@radix-ui/themes';
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppNavbar } from '@/components/AppNavbar';
import { iconSizes } from '@/styles/iconography';

export function PageShell({
  children,
  firstName = 'Student',
  profileHref = '/profile',
  profileImage = '',
  showAuthLoginButton = true,
  variant = 'app',
}: {
  children: ReactNode;
  firstName?: string;
  profileHref?: string;
  profileImage?: string;
  showAuthLoginButton?: boolean;
  variant?: 'app' | 'auth';
}) {
  if (variant === 'auth') {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_50%_18%,rgb(96_122_168_/_8%),transparent_28%),linear-gradient(180deg,#fff_0%,#f8fafc_100%)]">
        <header className="mx-auto flex min-h-[76px] w-full max-w-[1180px] items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <Link className="inline-flex min-w-0 items-center text-slate-950 no-underline" to="/" aria-label="ITAC Student Portal login">
            <img className="block w-[58px] shrink-0" src="/Docs/DOE_blue_seal_logo-head.png" alt="U.S. Department of Energy" />
            <span className="ml-3 text-section-title font-bold leading-tight tracking-normal max-sm:text-lg">ITAC Student and Alumni Portal</span>
          </Link>
          {showAuthLoginButton && (
            <Button asChild size="3">
              <Link to="/">
                <LogIn aria-hidden="true" size={iconSizes.sm} />
                Back to Login
              </Link>
            </Button>
          )}
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppNavbar firstName={firstName} profileHref={profileHref} profileImage={profileImage} />
      {children}
    </div>
  );
}
