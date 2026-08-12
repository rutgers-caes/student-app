import type { ReactNode } from 'react';
import { centers } from '@/data/CenterBranding';
import type { CenterStudentProfile, StudentProfile } from '@/types/student-profile';

export function CenterBrandingBanner({ actions, student }: { actions?: ReactNode; student: CenterStudentProfile | StudentProfile }) {
  const [centerCode, satelliteCode] = student.centerCode.split('-');
  const center = centers.find((centerOption) => centerOption.code === centerCode);
  const primaryColor = center?.colors[0] || '#607aa8';
  const centerName = center?.name || student.center.split('|')[1]?.trim() || student.center;
  const satellite = student.satelliteCenterName || getSatelliteCenter(satelliteCode);
  const website = center?.website.trim();
  const logoContent = center?.logos.main ? <img className="h-full w-full object-contain p-1" src={center.logos.main} alt="" /> : centerCode;
  const logoClassName =
    'flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/35 bg-white text-xs font-black tracking-normal shadow-sm';

  return (
    <section className="border-b border-slate-200" style={{ backgroundColor: primaryColor }}>
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-3 px-5 py-2.5">
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
            <h1 className="text-[clamp(18px,2vw,24px)] font-bold leading-tight tracking-normal text-white">{centerName}</h1>
            {satellite && <p className="mt-0.5 text-xs font-semibold text-white/80">Satellite Center: {satellite}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </section>
  );
}

function getSatelliteCenter(satelliteCode: string | undefined) {
  const satellite = satelliteCode?.trim();
  return satellite && satellite.toLowerCase() !== 'itac' ? satellite : '';
}
