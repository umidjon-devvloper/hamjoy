import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Briefcase,
  Building2,
  House,
  LayoutGrid,
  Map as MapIcon,
  Signpost,
  type LucideIcon,
} from 'lucide-react';
import { createPageMetadata } from '@/lib/seo/metadata';
import { ROUTES } from '@/lib/navigation/routes';
import { PLATFORM_SECTIONS } from '@/lib/navigation/platform';
import { cn } from '@/lib/utils';
import { ListingResults } from '@/components/listings/ListingResults';
import { DemoBadge } from '@/components/listings/DemoBadge';
import {
  activeBrowseIntent,
  INTENT_BROWSE_HREFS,
  PROPERTY_TYPE_LABELS,
  propertyTypeHref,
  SUPPORTED_LISTING_FILTERS,
  type ListingSection,
} from '@/lib/listings/format';
import { IntentNav } from '@/components/listings/IntentNav';
import {
  sideAsideScrollClass,
  sideIconClass,
  sideItemClass,
  sideRowClass,
} from '@/components/listings/side-nav-styles';
import type { ListingPropertyType } from '@/types/listing';

const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS) as ListingPropertyType[];
const TYPE_ICONS: Record<ListingPropertyType, LucideIcon> = {
  kvartira: Building2,
  uy: House,
  tijorat: MapIcon,
  yer: Signpost,
};

/** Sotuv | Ijara | Sotib olish — the same links as the Uy-joy navbar tab. */
const UY_JOY_LINKS = PLATFORM_SECTIONS.find((s) => s.id === 'uy-joy')?.links ?? [];

const SECTIONS: Record<string, string> = {
  sotuv: 'Sotuv',
  ijara: 'Ijara',
  olish: 'Sotib olish',
  'yangi-uylar': 'Turar joy majmuasi',
};

const FILTER_LABELS: Record<string, string> = {
  tur: 'Turi',
  xona: 'Xonalar',
  sotix: 'Sotix',
  qavat: 'Qavat',
  kategoriya: 'Kategoriya',
  maqsad: 'Maqsad',
  muddat: 'Muddat',
  bitim: 'Bitim',
  holat: 'Holati',
  sotuvchi: 'Sotuvchi',
  narx: 'Narx (mln soʻm)',
  topshirish: 'Topshirish',
  maydon: 'Maydon (m²)',
  hudud: 'Hudud',
  planirovka: 'Planirovka',
  tolov: 'Toʻlov',
  tamir: 'Taʼmir',
};

export async function generateMetadata(props: PageProps<'/uy-joy/[bolim]'>) {
  const { bolim } = await props.params;
  return createPageMetadata({
    title: `Uy-joy — ${SECTIONS[bolim] ?? 'Eʼlonlar'}`,
    description: 'Uy-joy ijarasi, sotuvi va yangi turar joy majmualari eʼlonlari.',
    path: `/uy-joy/${bolim}`,
  });
}

/**
 * Placeholder for the real-estate listings. The category menus already link here
 * with their final filter params; the listing UI replaces this page later.
 */
export default async function UyJoySectionPage(props: PageProps<'/uy-joy/[bolim]'>) {
  const { bolim } = await props.params;
  const searchParams = await props.searchParams;
  const title = SECTIONS[bolim];
  if (!title) notFound();

  const filters = Object.entries(searchParams).flatMap(([key, value]) =>
    (Array.isArray(value) ? value : value ? [value] : []).map((v) => ({
      key,
      label: FILTER_LABELS[key] ?? key,
      value: v.replace(/-/g, ' '),
    })),
  );

  const section: ListingSection | null =
    bolim === 'sotuv' || bolim === 'ijara' || bolim === 'olish' ? bolim : null;
  const applied = (key: string) => (SUPPORTED_LISTING_FILTERS as readonly string[]).includes(key);

  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {!section && (
          <nav aria-label="Uy-joy boʻlimlari" className="mb-6 flex justify-center">
            <ul className="inline-flex max-w-full gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
              {UY_JOY_LINKS.map((link) => {
                const isCurrent = link.href === `/uy-joy/${bolim}`;
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href ?? ROUTES.home}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={cn(
                        'inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors sm:px-4',
                        isCurrent
                          ? 'bg-[var(--color-brand-green)] text-white'
                          : 'text-[var(--color-muted)] hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)]',
                      )}
                    >
                      <Icon className="hidden h-4 w-4 min-[380px]:block" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {section ? (
          <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-6">
            <aside
              className={cn(
                'mb-5 space-y-3 lg:sticky lg:top-36 lg:mb-0 lg:max-h-[calc(100dvh-10rem)] lg:space-y-0',
                sideAsideScrollClass
              )}
            >
              <div className="lg:card lg:rounded-2xl lg:p-3">
                <p className="mb-2 hidden px-3.5 pt-1 text-lg font-bold text-[var(--color-secondary)] lg:block">
                  Eʼlon turi
                </p>
                <IntentNav
                  variant="browse"
                  label="Eʼlon turi"
                  active={activeBrowseIntent(section, searchParams)}
                  hrefs={INTENT_BROWSE_HREFS}
                />
              </div>
              <div className="lg:card lg:mt-4 lg:rounded-2xl lg:p-3">
                <p className="mb-2 hidden px-3.5 pt-1 text-lg font-bold text-[var(--color-secondary)] lg:block">
                  Mulk turi
                </p>
                <nav aria-label="Mulk turi" className={sideRowClass}>
                  {[undefined, ...PROPERTY_TYPES].map((type) => {
                    const isActive =
                      (typeof searchParams.tur === 'string' ? searchParams.tur : undefined) === type;
                    const Icon = type ? TYPE_ICONS[type] : LayoutGrid;
                    return (
                      <Link
                        key={type ?? 'all'}
                        href={propertyTypeHref(section, searchParams, type)}
                        aria-current={isActive ? 'page' : undefined}
                        className={sideItemClass(isActive)}
                      >
                        <Icon className={sideIconClass} strokeWidth={2} />
                        {type ? PROPERTY_TYPE_LABELS[type] : 'Barchasi'}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>
            <section aria-labelledby="listings-heading" className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <h1 id="listings-heading" className="text-2xl font-bold text-[var(--color-secondary)]">
                  {section === 'olish'
                    ? 'Xaridor soʻrovlari'
                    : `${activeBrowseIntent(section, searchParams) === 'kunlik-ijara' ? 'Kunlik ijara' : title} eʼlonlari`}
                </h1>
                <DemoBadge />
              </div>
              {filters.length > 0 && (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {filters.map((f) => (
                    <span
                      key={`${f.key}-${f.value}`}
                      title={applied(f.key) ? undefined : 'Bu filtr demo rejimida qoʻllanmaydi'}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs',
                        applied(f.key)
                          ? 'border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                          : 'border-dashed border-[var(--color-border)] text-[var(--color-muted)]',
                      )}
                    >
                      {f.label}: {f.value}
                    </span>
                  ))}
                  <Link
                    href={`/uy-joy/${bolim}`}
                    className="text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
                  >
                    Filtrlarni tozalash
                  </Link>
                </div>
              )}
              <ListingResults section={section} params={searchParams} resetHref={`/uy-joy/${bolim}`} />
            </section>
          </div>
        ) : (
          <div className="card mx-auto flex max-w-3xl flex-col items-center px-6 py-12 text-center">
            <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <Building2 className="h-8 w-8" strokeWidth={1.75} />
            </span>
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-brand-green)]">
              Uy-joy · {title}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[var(--color-secondary)] sm:text-3xl">
              Bu boʻlim tez orada ochiladi
            </h1>
            <p className="mt-3 max-w-md text-sm text-[var(--color-muted)]">
              Uy-joy eʼlonlari ustida ishlayapmiz. Tanlagan filtrlaringiz saqlanadi va boʻlim ochilganda shu
              havola orqali natijalar koʻrinadi.
            </p>

            {filters.length > 0 && (
              <ul className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Tanlangan filtrlar">
                {filters.map((f) => (
                  <li
                    key={`${f.key}-${f.value}`}
                    className="rounded-full border border-[var(--color-border)] bg-gray-50 px-3 py-1 text-xs text-[var(--color-secondary)]"
                  >
                    <span className="text-[var(--color-muted)]">{f.label}:</span> {f.value}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={ROUTES.home}
                className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-secondary)] hover:bg-gray-50"
              >
                Bosh sahifa
              </Link>
              <Link
                href={ROUTES.jobs}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-secondary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
              >
                <Briefcase className="h-4 w-4" />
                Ish boʻlimiga oʻtish
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
