import { JobsMapView } from '@/components/home/JobsMapView';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Ishlar xaritasi',
  description: 'Yaqiningizdagi ishlarni xaritada toping — HamJoy.',
  path: '/home/ish/xarita',
});

export default function JobsMapPage() {
  return <JobsMapView />;
}
