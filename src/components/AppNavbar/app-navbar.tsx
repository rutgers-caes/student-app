const navItems = ['Metrics', 'Statistics', 'Centers', 'Students', 'Tools', 'Resources'];

export function AppNavbar() {
  return (
    <header className="flex min-h-[76px] items-center gap-9 bg-primary px-6 pl-2.5 text-primary-text shadow-[0_2px_10px_rgb(20_30_44_/_18%)]">
      <a className="inline-flex items-center no-underline" href="/" aria-label="U.S. Department of Energy student portal">
        <img className="block w-[245px]" src="/Docs/DOE_Logo_white_color.png" alt="U.S. Department of Energy" />
      </a>

      <nav className="flex flex-1 items-center justify-end gap-2" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            className="rounded-md px-3.5 py-2.5 text-lg font-semibold text-white no-underline hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none"
            href={'/' + item.toLowerCase()}
            key={item}
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}
