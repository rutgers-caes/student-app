import { User } from 'lucide-react';
import { iconSizes } from '@/styles/iconography';

export function ProfileImage({ className, imageSrc, label }: { className: string; imageSrc: string; label: string }) {
  if (imageSrc) {
    return <img className={`${className} object-cover`} src={imageSrc} alt={label} />;
  }

  return (
    <span className={`${className} grid place-items-center bg-slate-100 text-slate-400`} aria-label={label || undefined} aria-hidden={!label}>
      <User aria-hidden="true" size={iconSizes.xl} />
    </span>
  );
}
