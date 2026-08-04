import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fallbackProfileImage } from '@/data/demo-student';
import { navItems, profilePath } from '@/data/navigation';

type AppNavbarProps = {
  firstName?: string;
  profileImage?: string;
};

export function AppNavbar({ firstName = 'Student', profileImage = fallbackProfileImage }: AppNavbarProps) {
  return (
    <header className="grid min-h-[76px] grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)] items-center gap-6 bg-primary px-5 text-primary-text shadow-[0_2px_10px_rgb(20_30_44_/_18%)] max-lg:grid-cols-1 max-lg:gap-3 max-lg:py-4">
      <Link className="inline-flex items-center justify-self-start no-underline max-lg:justify-self-center" to={profilePath} aria-label="U.S. Department of Energy student portal">
        <img className="block w-[75px]" src="/Docs/DOE_blue_seal_logo-head.png" alt="U.S. Department of Energy" />
        <span className="ml-3 text-lg font-semibold tracking-tight">ITAC Student/Alumni Portal</span>
      </Link>

      <nav className="flex items-center justify-center gap-2 max-md:flex-wrap" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            className="rounded-md px-3.5 py-2.5 text-base font-semibold text-white no-underline hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none"
            href={item.href}
            key={item.label}
            rel={item.external ? 'noreferrer' : undefined}
            target={item.external ? '_blank' : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center justify-end gap-3 max-lg:justify-center">
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
    </header>
  );
}
