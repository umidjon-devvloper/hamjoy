import { JobsHome } from '@/components/home/JobsHome';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Ishlar',
  description: "Tavsiya etilgan ishlar, kategoriyalar va so'nggi vakansiyalar — HamJoy.",
  path: '/home/ish',
});

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

/** Ish mode of the home page: jobs only, under the persistent platform navbar. */
export default async function JobsHomePage(props: PageProps<'/home/ish'>) {
  const params = await props.searchParams;
  const categorySlug = first(params.category);
  const query = first(params.q);
  // Re-keyed per filter so the search state starts fresh from the URL on every navbar link.
  return <JobsHome key={`${categorySlug ?? ''}|${query ?? ''}`} categorySlug={categorySlug} query={query} />;
}
