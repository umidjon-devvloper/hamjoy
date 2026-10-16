'use client';

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, FileText, SearchX, SlidersHorizontal, Users, X } from 'lucide-react';
import { Carousel, type Slide } from '@/components/ui/Carousel';
import { JobGridCard, JobGridSkeleton } from '@/components/jobs/JobGridCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { useFeaturedJobs, useJobs } from '@/hooks/useJobs';
import { useJobSearch } from '@/hooks/useJobSearch';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';
import type { JobListItem } from '@/types';
import { JobsViewToggle } from './JobsViewToggle';

const HERO_SLIDE_COUNT = 5;
/** Same grid as the Uy-joy listing cards. */
const JOB_GRID = 'grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4';
const CATEGORY_CHIP_COUNT = 15;

const PROMO_SLIDE: Slide & { href: string } = {
  id: 'promo-ish',
  title: 'Oʻzingizga mos ishni toping',
  subtitle: 'Qurilish va boshqa sohalardagi vakansiyalar',
  image: '/carousel/ish-quruvchi.webp',
  cover: true,
  coverPosition: 'object-right',
  href: `${ROUTES.jobs}?category=qurilish-tamirlash`,
};

const QUICK_LINKS = [
  { href: ROUTES.favorites, label: 'Saqlangan', icon: Bookmark },
  { href: ROUTES.applications, label: 'Arizalarim', icon: FileText },
  { href: ROUTES.applicants, label: 'Nomzodlar', icon: Users },
];

/** Company "cover" for a slide — jobs have no photos, and logos are too small to upscale. */
function companyCover(company: string): string {
  const params = new URLSearchParams({
    name: company,
    size: '512',
    background: 'F3DE9C',
    color: '1F6B3F',
    bold: 'true',
    'font-size': '0.36',
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

/** Featured jobs first, then the best-paid ones, as hero slides. */
function toHeroSlides(jobs: JobListItem[]): Slide[] {
  return [...jobs]
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.salaryMax - a.salaryMax)
    .slice(0, HERO_SLIDE_COUNT)
    .map((job) => ({
      id: job.id,
      title: job.title,
      subtitle: job.region ? `${job.company} · ${job.region}` : job.company,
      price: job.salaryMax > 0 ? job.salaryMax : undefined,
      image: companyCover(job.company),
    }));
}

function JobsCarousel() {
  const router = useRouter();
  const { data: jobs, isLoading } = useJobs();
  const slides = useMemo(() => [PROMO_SLIDE, ...toHeroSlides(jobs)], [jobs]);

  if (isLoading) {
    // Same footprint as the carousel so the page doesn't jump when it loads.
    return (
      <div
        aria-hidden
        className="mb-8 h-48 animate-pulse rounded-3xl bg-gradient-to-r from-slate-200 via-teal-100 to-emerald-100 sm:h-64"
      />
    );
  }

  return (
    <Carousel
      slides={slides}
      currency="$ gacha"
      onSlideClick={(id) => router.push(id === PROMO_SLIDE.id ? PROMO_SLIDE.href : ROUTES.job(String(id)))}
    />
  );
}

const chipClass = (active: boolean) =>
  cn(
    'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all',
    active
      ? 'bg-[var(--color-primary)] text-white shadow-sm'
      : 'border border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:border-[var(--color-primary)]/40'
  );

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

  // Without filters the featured jobs get their own block, so don't repeat them below.
  const featuredJobs = useMemo(() => (hasFilter ? [] : featured.data), [hasFilter, featured.data]);
  const results = useMemo(() => {
    const shown = new Set(featuredJobs.map((j) => j.id));
    return search.jobs.filter((j) => !shown.has(j.id));
  }, [search.jobs, featuredJobs]);

  const refreshAll = useCallback(async () => {
    await Promise.all([search.refetch(), featured.refetch()]);
  }, [search, featured]);
  usePullToRefresh(refreshAll);

  const isLoading = search.isLoading || (!hasFilter && featured.isLoading);
  const error = search.error ?? featured.error;
  const title = query ? `“${query}” boʻyicha` : category ? category.name : 'Ish eʼlonlari';

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {!hasFilter && <JobsCarousel />}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-[var(--color-secondary)] sm:text-3xl">
            {title}
          </h1>
          {!isLoading && (
            <p className="mt-1 text-sm font-medium text-gray-600">{search.jobs.length} ta ish topildi</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={refreshAll} label="Yangilash" />
          <JobsViewToggle />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-secondary)] transition-colors hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <Link
          href={ROUTES.search}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[var(--color-primary)] hover:underline"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Kengaytirilgan filtr
        </Link>
      </div>

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

      {query && (
        <div className="mb-5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary-light)] px-3 py-1.5 text-sm font-semibold text-[var(--color-primary)]">
            Qidiruv: {query}
            <Link
              href={categorySlug ? `${ROUTES.jobs}?category=${encodeURIComponent(categorySlug)}` : ROUTES.jobs}
              aria-label="Qidiruvni tozalash"
              className="rounded-full p-0.5 hover:bg-[var(--color-primary)]/15"
            >
              <X className="h-3.5 w-3.5" />
            </Link>
          </span>
        </div>
      )}

      <QueryErrorBanner message={error} onRetry={refreshAll} className="mb-4" />

      {isLoading ? (
        <JobGridSkeleton count={8} />
      ) : (
        <>
          {featuredJobs.length > 0 && (
            <section className="mb-8">
              <SectionHeader title="Tavsiya etilgan" />
              <div className={JOB_GRID}>
                {featuredJobs.map((job) => (
                  <JobGridCard key={job.id} job={job} featured />
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeader title={hasFilter ? 'Natijalar' : 'Soʻnggi ishlar'} />
            {results.length > 0 ? (
              <div className={JOB_GRID}>
                {results.map((job) => (
                  <JobGridCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="card flex flex-col items-center px-6 py-12 text-center">
                <SearchX className="mb-3 h-10 w-10 text-[var(--color-muted)]" />
                <p className="font-semibold text-[var(--color-secondary)]">Bu boʻyicha hozircha ish topilmadi</p>
                <p className="mt-1 text-sm text-gray-600">Boshqa kategoriyani tanlang yoki barcha ishlarni koʻring.</p>
                <Link
                  href={ROUTES.jobs}
                  className="mt-4 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
                >
                  Barcha ishlar
                </Link>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
