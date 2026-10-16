import { Suspense } from 'react';
import { PageLoadingState } from '@/components/ui/LoadingState';
import { createPageMetadata } from '@/lib/seo/metadata';
import SearchContent from './SearchContent';

export const metadata = createPageMetadata({
  title: 'Search jobs',
  description: 'Filter and search job listings by category, location, salary, and work type.',
  path: '/search',
});

export default function SearchPage() {
  return (
    <Suspense fallback={<PageLoadingState showBanner={false} />}>
      <SearchContent />
    </Suspense>
  );
}
