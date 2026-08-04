import { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fallbackProfileImage } from '@/data/demo-student';
import { navItems, profilePath } from '@/data/navigation';

type AppNavbarProps = {
  firstName?: string;
  profileImage?: string;
};

export function AppNavbar({ firstName = 'Student', profileImage = fallbackProfileImage }: AppNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-primary px-5 text-primary-text shadow-[0_2px_10px_rgb(20_30_44_/_18%)]">
      <div className="grid min-h-[76px] grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)] items-center gap-6 max-xl:grid-cols-[1fr_auto]">
        <Link className="inline-flex min-w-0 items-center justify-self-start no-underline" to={profilePath} aria-label="U.S. Department of Energy student portal">
          <img className="block w-[75px] shrink-0 max-sm:w-[56px]" src="/Docs/DOE_blue_seal_logo-head.png" alt="U.S. Department of Energy" />
          <span className="ml-3 text-lg font-semibold tracking-tight max-sm:text-base">ITAC Student/Alumni Portal</span>
        </Link>

        <nav className="flex items-center justify-center gap-2 max-xl:hidden" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavItemLink
              className="rounded-md px-3.5 py-2.5 text-base font-semibold text-white no-underline hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none"
              item={item}
              key={item.label}
            />
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3 max-xl:hidden">
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-white/12 py-1.5 pl-1.5 pr-3 text-sm font-semibold text-white no-underline hover:bg-white/20 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white/50"
            to={profilePath}
          >
            <img className="h-9 w-9 rounded-full border border-white/50 bg-white object-cover" src={profileImage} alt="" />
            <span>{firstName}</span>
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-white no-underline hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none"
            to="/"
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
                className="rounded-md px-3.5 py-3 text-base font-semibold text-white no-underline hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none"
                item={item}
                key={item.label}
                onClick={() => setIsMenuOpen(false)}
              />
            ))}
          </nav>

          <div className="mt-4 grid gap-2 border-t border-white/20 pt-4">
            <Link
              className="inline-flex items-center gap-3 rounded-md bg-white/12 px-3.5 py-3 text-base font-semibold text-white no-underline hover:bg-white/20 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              to={profilePath}
              onClick={() => setIsMenuOpen(false)}
            >
              <img className="h-9 w-9 rounded-full border border-white/50 bg-white object-cover" src={profileImage} alt="" />
              <span>{firstName}</span>
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-md px-3.5 py-3 text-base font-semibold text-white no-underline hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none"
              to="/"
              onClick={() => setIsMenuOpen(false)}
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

function NavItemLink({
  className,
  item,
  onClick,
}: {
  className: string;
  item: (typeof navItems)[number];
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
