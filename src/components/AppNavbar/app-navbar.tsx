import { useEffect, useMemo, useState } from 'react';
import { LogOut, Menu, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNavItems, profilePath } from '@/data/navigation';
import type { NavItem } from '@/data/navigation';
import { AuthServiceApi } from '@/services/auth-service';

type AppNavbarProps = {
  firstName?: string;
  profileHref?: string;
  profileImage?: string;
};

export function AppNavbar({ firstName = 'Student', profileHref = profilePath, profileImage = '' }: AppNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [jobPostingCount, setJobPostingCount] = useState<number>();
  const navItems = useMemo(() => getNavItems(jobPostingCount), [jobPostingCount]);

  useEffect(() => {
    let isMounted = true;

    AuthServiceApi.getPublicJobPostingCount()
      .then((count) => {
        if (isMounted && Number.isFinite(count)) {
          setJobPostingCount(count);
        }
      })
      .catch(() => {
        if (isMounted) {
          setJobPostingCount(undefined);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className="bg-primary px-5 text-primary-text shadow-[0_2px_10px_rgb(20_30_44_/_18%)]">
      <div className="grid min-h-[76px] grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)] items-center gap-6 max-xl:grid-cols-[1fr_auto]">
        <Link className="inline-flex min-w-0 items-center justify-self-start no-underline" to={profileHref} aria-label="U.S. Department of Energy student portal">
          <img className="block w-[48px] shrink-0 max-sm:w-[40px]" src="/Docs/DOE_blue_seal_logo-head.png" alt="U.S. Department of Energy" />
          <span className="ml-3 whitespace-nowrap text-base font-bold leading-tight tracking-normal max-sm:text-sm">ITAC Student and Alumni Portal</span>
        </Link>

        <nav className="flex items-center justify-center gap-2 max-xl:hidden" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavItemLink
              className="rounded-md border border-white/35 bg-white/12 px-3.5 py-2.5 text-base font-bold text-white no-underline shadow-sm transition hover:border-white/70 hover:bg-white/22 focus-visible:bg-white/22 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              item={item}
              key={item.label}
            />
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3 max-xl:hidden">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-white/12 py-1.5 pl-1.5 pr-3 text-sm font-semibold text-white no-underline hover:bg-white/20 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white/50"
            to={profileHref}
          >
            <Avatar imageSrc={profileImage} />
            <span>{firstName}</span>
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-white no-underline hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none"
            to="/"
            onClick={() => AuthServiceApi.logout()}
          >
            <LogOut aria-hidden="true" size={18} />
            Logout
          </Link>
        </div>
        <button
          className="hidden h-11 w-11 cursor-pointer place-items-center rounded-md border border-white/20 bg-white/10 text-white hover:bg-white/18 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white/50 max-xl:grid"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="student-mobile-menu"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <X aria-hidden="true" size={25} /> : <Menu aria-hidden="true" size={26} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="hidden border-t border-white/20 py-4 max-xl:block" id="student-mobile-menu">
          <nav className="grid gap-2" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <NavItemLink
                className="rounded-md border border-white/30 bg-white/10 px-3.5 py-3 text-base font-bold text-white no-underline hover:bg-white/18 focus-visible:bg-white/18 focus-visible:outline-none"
                item={item}
                key={item.label}
                onClick={() => setIsMenuOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-4 grid gap-2 border-t border-white/20 pt-4">
            <Link
              className="inline-flex items-center gap-3 rounded-md bg-white/12 px-3.5 py-3 text-base font-semibold text-white no-underline hover:bg-white/20 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              to={profileHref}
              onClick={() => setIsMenuOpen(false)}
            >
              <Avatar imageSrc={profileImage} />
              <span>{firstName}</span>
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-md px-3.5 py-3 text-base font-semibold text-white no-underline hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none"
              to="/"
              onClick={() => {
                AuthServiceApi.logout();
                setIsMenuOpen(false);
              }}
            >
              <LogOut aria-hidden="true" size={18} />
              Logout
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Avatar({ imageSrc }: { imageSrc: string }) {
  if (imageSrc) {
    return <img className="h-9 w-9 rounded-full border border-white/50 bg-white object-cover" src={imageSrc} alt="" />;
  }

  return (
    <span className="grid h-9 w-9 place-items-center rounded-full border border-white/50 bg-white/90 text-slate-500" aria-hidden="true">
      <User size={18} />
    </span>
  );
}

function NavItemLink({
  className,
  item,
  onClick,
}: {
  className: string;
  item: NavItem;
  onClick?: () => void;
}) {
  if (item.external || item.href.startsWith('mailto:')) {
    return (
      <a className={className} href={item.href} rel={item.external ? 'noreferrer' : undefined} target={item.external ? '_blank' : undefined} onClick={onClick}>
        {item.label}
      </a>
    );
  }

  return (
    <Link className={className} to={item.href} onClick={onClick}>
      {item.label}
    </Link>
  );
}
