export const profilePath = '/profile';

export function studentProfilePath(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `/${slug || 'student'}/profile/detail`;
}

export const navItems = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Open Job Postings', href: 'https://itacs.university/jobs', external: true },
  { label: 'Portal Survey', href: '/portal-survey' },
  { label: 'Entry Survey', href: '/entry-survey' },
  { label: 'Exit Survey', href: '/exit-survey' },
  { label: 'Email Us', href: 'mailto:students@iac.university' },
];
