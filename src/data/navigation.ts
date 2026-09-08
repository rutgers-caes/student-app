export const profilePath = '/profile';

export function studentProfilePath(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `/${slug || 'student'}/profile/detail`;
}

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export function getNavItems(jobPostingCount?: number) {
  const jobPostingLabel =
    typeof jobPostingCount === 'number' ? `${jobPostingCount} ${jobPostingCount === 1 ? 'Job Posting' : 'Job Postings'}` : 'Job Postings';

  return [
    { label: 'FAQ', href: '/faq' },
    { label: jobPostingLabel, href: 'https://itacs.university/jobs', external: true },
    { label: 'Entry Survey', href: '/entry-survey' },
    { label: 'Exit Survey', href: '/exit-survey' },
    { label: 'Email Us', href: 'mailto:students@iac.university' },
  ] satisfies NavItem[];
}

export const navItems = getNavItems();
