import Link from 'next/link';
import { Briefcase, Building2, CalendarDays, Home, SearchCheck, Warehouse, type LucideIcon } from 'lucide-react';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';

const CATEGORIES: { label: string; hint: string; href: string; icon: LucideIcon; gold?: boolean }[] = [
  { label: 'Kvartira', hint: 'Sotuv va ijara', href: `${ROUTES.uyJoy.sale}?tur=kvartira`, icon: Building2 },
  { label: 'Hovli / dacha', hint: 'Yer bilan', href: `${ROUTES.uyJoy.sale}?tur=uy`, icon: Home },
  { label: 'Kunlik ijara', hint: 'Mehmon va sayyohlar', href: `${ROUTES.uyJoy.rent}?muddat=kunlik`, icon: CalendarDays, gold: true },
  { label: 'Ofis va tijorat', hint: 'Biznes uchun', href: `${ROUTES.uyJoy.sale}?tur=tijorat`, icon: Briefcase },
  { label: 'Turar joy majmualari', hint: 'Yangi binolar', href: ROUTES.uyJoy.newBuildings, icon: Warehouse },
  { label: 'Xaridor soʻrovlari', hint: 'Kim nima qidiryapti', href: ROUTES.uyJoy.buy, icon: SearchCheck },
];

export function HomeCategories() {
  return (
    <section aria-labelledby="home-cat-heading" className="mt-12">
      <h2 id="home-cat-heading" className="mb-4 text-[22px] font-bold tracking-[-0.02em] text-[var(--color-secondary)]">
        Nima qidiryapsiz?
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map(({ label, hint, href, icon: Icon, gold }) => (
          <Link
            key={label}
            href={href}
            className="card card-hover flex items-center gap-3 rounded-[18px] p-3.5"
          >
            <span
              className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]',
                gold ? 'bg-[var(--color-accent-light)] text-[#7A5A12]' : 'bg-[var(--color-primary-light)] text-[var(--color-brand-green)]'
              )}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-[var(--color-secondary)]">{label}</span>
              <span className="truncate text-[13px] text-[var(--color-muted)]">{hint}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
