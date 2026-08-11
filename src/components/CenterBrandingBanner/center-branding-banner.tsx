import type { ReactNode } from 'react';
import { centers } from '@/data/CenterBranding';
import type { CenterStudentProfile, StudentProfile } from '@/types/student-profile';

export function CenterBrandingBanner({ actions, student }: { actions?: ReactNode; student: CenterStudentProfile | StudentProfile }) {
  const [centerCode, satelliteCode] = student.centerCode.split('-');
  const center = centers.find((centerOption) => centerOption.code === centerCode);
  const primaryColor = center?.colors[0] || '#607aa8';
  const centerName = center?.name || student.center.split('|')[1]?.trim() || student.center;
  const satellite = satelliteCode?.trim() || '-';
  const website = center?.website.trim();
  const logoContent = center?.logos.main ? <img className="h-full w-full object-contain p-1" src={center.logos.main} alt="" /> : centerCode;
  const logoClassName =
    'flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/35 bg-white text-sm font-black tracking-normal shadow-sm';

  return (
    <section className="border-b border-slate-200" style={{ backgroundColor: primaryColor }}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {website ? (
            <a
              className={`${logoClassName} transition hover:scale-[1.03] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white/70`}
              style={{ color: primaryColor }}
              href={website}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${centerName} website`}
            >
              {logoContent}
            </a>
          ) : (
            <div className={logoClassName} style={{ color: primaryColor }} aria-hidden="true">
              {logoContent}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-[clamp(20px,2.4vw,30px)] font-bold leading-tight tracking-normal text-white">{centerName}</h1>
            <p className="mt-1 text-sm font-semibold text-white/80">Satellite: {satellite}</p>
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </section>
  );
}
