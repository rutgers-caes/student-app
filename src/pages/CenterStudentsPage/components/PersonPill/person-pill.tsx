import { getRoleStyle } from '../../center-students-utils';
import { ProfileImage } from '../ProfileImage';

export function PersonPill({
  highlighted = false,
  imageSrc,
  muted = false,
  name,
  role,
}: {
  highlighted?: boolean;
  imageSrc?: string;
  muted?: boolean;
  name: string;
  role?: string;
}) {
  const roleStyle = getRoleStyle(role, highlighted);

  return (
    <div className={`inline-flex h-11 w-60 max-w-full items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-semibold ${roleStyle.container}`}>
      <span className={`h-7 w-7 shrink-0 rounded-full ${highlighted || roleStyle.isColorCoded ? 'bg-white' : 'bg-slate-200'}`}>
        <ProfileImage className="h-full w-full rounded-full" imageSrc={imageSrc || ''} label="" />
      </span>
      {role && <span className={`text-xs font-bold ${roleStyle.roleText}`}>{role}</span>}
      <span className={muted ? 'truncate text-slate-600' : 'truncate'}>{name}</span>
    </div>
  );
}
