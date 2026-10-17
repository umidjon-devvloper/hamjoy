import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/navigation/routes';

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Uy-joy',
    links: [
      { label: 'Sotuv', href: ROUTES.uyJoy.sale },
      { label: 'Ijara', href: ROUTES.uyJoy.rent },
      { label: 'Kunlik ijara', href: `${ROUTES.uyJoy.rent}?muddat=kunlik` },
    ],
  },
  {
    title: 'Ish',
    links: [
      { label: 'Vakansiyalar', href: ROUTES.jobs },
      { label: 'Kunlik ish', href: `${ROUTES.jobs}?q=kunlik` },
      { label: 'Xaritadan qidirish', href: ROUTES.map },
    ],
  },
  {
    title: 'HamJoy',
    links: [
      { label: 'Maxfiylik siyosati', href: '/legal/privacy' },
      { label: 'Foydalanish shartlari', href: '/legal/terms' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-10 px-4 py-10 sm:px-6">
        <div className="flex max-w-xs flex-col gap-3">
          <span className="flex items-center gap-2.5">
            <Image src="/brand/hamjoy-logo.png" alt="" width={36} height={36} className="h-9 w-9 rounded-[10px]" />
            <span className="font-extrabold tracking-[0.04em] text-[var(--color-secondary)]">HAMJOY</span>
          </span>
          <p className="text-sm text-[var(--color-muted)]">
            Uy-joy ijarasi va savdosi, ish qidirish va eʼlon joylash — barchasi bir joyda.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-2 text-sm">
            <span className="font-bold text-[var(--color-secondary)]">{col.title}</span>
            {col.links.map((l) => (
              <Link key={l.label} href={l.href} className="text-[var(--color-muted)] hover:text-[var(--color-brand-green)]">
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="mx-auto max-w-7xl border-t border-[#EEEFEA] px-4 pb-7 pt-4 text-[13px] text-[var(--color-muted)] sm:px-6">
        © {new Date().getFullYear()} HamJoy
      </div>
    </footer>
  );
}
