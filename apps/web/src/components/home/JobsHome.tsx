'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Bookmark, FileText, Search, SearchX, SlidersHorizontal, Users, X } from 'lucide-react';
import { JobRowCard, JobRowSkeleton } from '@/components/jobs/JobRowCard';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { useFeaturedJobs } from '@/hooks/useJobs';
import { useJobSearch } from '@/hooks/useJobSearch';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';
import { JobsViewToggle } from './JobsViewToggle';

const CATEGORY_CHIP_COUNT = 15;

const QUICK_LINKS = [
  { href: ROUTES.favorites, label: 'Saqlangan', icon: Bookmark },
  { href: ROUTES.applications, label: 'Arizalarim', icon: FileText },
  { href: ROUTES.applicants, label: 'Nomzodlar', icon: Users },
];

const chipClass = (active: boolean) =>
  cn(
    'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors',
    active
      ? 'bg-[var(--color-secondary)] text-white'
      : 'border border-[#DADBD5] bg-white text-[var(--color-secondary)] hover:border-[var(--color-brand-green)]/40 hover:text-[var(--color-brand-green)]'
  );

/** Dark green band: headline, search and the list/map switch. */
function JobsHero({ initialQuery, categorySlug }: { initialQuery?: string; categorySlug?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery ?? '');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (q.trim()) params.set('q', q.trim());
    const qs = params.toString();
    router.push(qs ? `${ROUTES.jobs}?${qs}` : ROUTES.jobs);
  };

  return (
    <section className="bg-[var(--color-brand-green-deep)] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 pb-9 pt-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
              Oʻzingizga mos ishni toping
            </h1>
            <p className="text-[17px] text-white/80">
              Vakansiyalar, kunlik ish va masofaviy loyihalar — uyingizga yaqinini xaritada koʻring.
            </p>
          </div>
          <JobsViewToggle tone="dark" />
        </div>
        <form onSubmit={submit} role="search" className="flex flex-wrap gap-2 rounded-[20px] bg-white p-2">
          <label className="flex h-[52px] flex-[2_1_280px] items-center gap-2.5 rounded-[14px] bg-[var(--color-background)] px-4 text-[var(--color-muted)] focus-within:ring-2 focus-within:ring-[var(--color-brand-green)]/30">
            <Search className="h-[18px] w-[18px]" aria-hidden />
            <span className="sr-only">Kasb yoki kompaniya</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Kasb, lavozim yoki kompaniya"
              className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[var(--color-secondary)] outline-none placeholder:text-[var(--color-muted)]"
            />
          </label>
          <button
            type="submit"
            className="h-[52px] flex-[0_1_auto] rounded-[14px] bg-[var(--color-brand-green)] px-7 font-bold text-white transition-colors hover:bg-[var(--color-brand-green-deep)]"
          >
            Qidirish
          </button>
        </form>
      </div>
    </section>
  );
}

/**
 * Home in Ish mode (/home/ish): only jobs — no Uy-joy content. Category and text filters come
 * from the URL (?category=slug, ?q=text), so navbar links and shared links land on the same view.
 */
export function JobsHome({ categorySlug, query }: { categorySlug?: string; query?: string }) {
  useScrollRestore();
  const search = useJobSearch(categorySlug, query);
  const featured = useFeaturedJobs(2);

  const hasFilter = Boolean(categorySlug || query);
  const category = search.categories.find((c) => c.slug === categorySlug);

  // Top categories as chips; keep the selected one visible even when it's further down the list.
  const chips = useMemo(() => {
    const top = search.categories.slice(0, CATEGORY_CHIP_COUNT);
    return category && !top.includes(category) ? [category, ...top] : top;
  }, [search.categories, category]);

  // Featured jobs lead the list (marked TOP) when no filter is applied.
  const jobs = useMemo(() => {
    if (hasFilter) return search.jobs;
    const top = featured.data;
    const shown = new Set(top.map((j) => j.id));
    return [...top, ...search.jobs.filter((j) => !shown.has(j.id))];
  }, [hasFilter, featured.data, search.jobs]);

  const refreshAll = useCallback(async () => {
    await Promise.all([search.refetch(), featured.refetch()]);
  }, [search, featured]);
  usePullToRefresh(refreshAll);

  const isLoading = search.isLoading || (!hasFilter && featured.isLoading);
  const error = search.error ?? featured.error;
  const title = query ? `“${query}” boʻyicha` : category ? category.name : 'Barcha vakansiyalar';

  return (
    <>
      <JobsHero key={query ?? ''} initialQuery={query} categorySlug={categorySlug} />

      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6">
        <nav aria-label="Ish kategoriyalari" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 hide-scrollbar sm:mx-0 sm:px-0">
          <Link href={ROUTES.jobs} scroll={false} aria-current={!categorySlug ? 'page' : undefined} className={chipClass(!categorySlug)}>
            Barchasi
          </Link>
          {chips.map((c) => (
            <Link
              key={c.id}
              href={`${ROUTES.jobs}?category=${encodeURIComponent(c.slug)}`}
              scroll={false}
              aria-current={c.slug === categorySlug ? 'page' : undefined}
              className={chipClass(c.slug === categorySlug)}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-start gap-7">
          <div className="min-w-0 flex-[999_1_560px]">
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-extrabold tracking-[-0.025em] text-[var(--color-secondary)]">{title}</h2>
                {!isLoading && (
                  <p className="text-[var(--color-muted)]">
                    <span className="tabular font-bold text-[var(--color-secondary)]">{search.jobs.length}</span> ta vakansiya
                  </p>
                )}
              </div>
              <RefreshButton onRefresh={refreshAll} label="Yangilash" />
            </div>

            {query && (
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary-light)] px-3 py-1.5 text-sm font-semibold text-[var(--color-brand-green)]">
                  Qidiruv: {query}
                  <Link
                    href={categorySlug ? `${ROUTES.jobs}?category=${encodeURIComponent(categorySlug)}` : ROUTES.jobs}
                    aria-label="Qidiruvni tozalash"
                    className="rounded-full p-0.5 hover:bg-[var(--color-brand-green)]/15"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Link>
                </span>
              </div>
            )}

            <QueryErrorBanner message={error} onRetry={refreshAll} className="mb-4" />

            {isLoading ? (
              <JobRowSkeleton count={5} />
            ) : jobs.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                {jobs.map((job, i) => (
                  <JobRowCard key={job.id} job={job} isNew={!hasFilter && i < 2} />
                ))}
              </div>
            ) : (
              <div className="card flex flex-col items-center rounded-[22px] px-6 py-12 text-center">
                <SearchX className="mb-3 h-10 w-10 text-[var(--color-muted)]" />
                <p className="font-semibold text-[var(--color-secondary)]">Bu boʻyicha hozircha ish topilmadi</p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">Boshqa kategoriyani tanlang yoki barcha ishlarni koʻring.</p>
                <Link
                  href={ROUTES.jobs}
                  className="mt-4 rounded-xl bg-[var(--color-brand-green)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-brand-green-deep)]"
                >
                  Barcha ishlar
                </Link>
              </div>
            )}
          </div>

          <aside className="flex min-w-0 flex-[1_1_280px] flex-col gap-3.5">
            <nav aria-label="Mening ishlarim" className="card flex flex-col rounded-[22px] p-2">
              {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex h-12 items-center gap-3 rounded-[14px] px-3.5 font-semibold text-[var(--color-secondary)] transition-colors hover:bg-[var(--color-primary-light)] hover:text-[var(--color-brand-green)]"
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                  {label}
                </Link>
              ))}
              <Link
                href={ROUTES.search}
                className="flex h-12 items-center gap-3 rounded-[14px] px-3.5 font-semibold text-[var(--color-brand-green)] transition-colors hover:bg-[var(--color-primary-light)]"
              >
                <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden />
                Kengaytirilgan filtr
              </Link>
            </nav>
            <div className="flex gap-3 rounded-[20px] bg-[var(--color-brand-gold-soft)] p-[18px] text-[var(--color-ink-on-gold)]">
              <Bell className="h-[22px] w-[22px] shrink-0" aria-hidden />
              <span className="flex flex-col gap-1.5">
                <span className="font-bold">Yangi ishlardan xabardor boʻling</span>
                <span className="text-sm">Shu filtr boʻyicha yangi vakansiya chiqsa — bildirishnoma yuboramiz.</span>
                <Link href={ROUTES.notifications} className="text-sm font-bold underline-offset-2 hover:underline">
                  Kuzatishni yoqish
                </Link>
              </span>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
