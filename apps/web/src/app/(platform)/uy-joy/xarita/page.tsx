import { ListingsMapView } from '@/components/home/ListingsMapView';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Uy-joy xaritasi',
  description: "Uy-joy e'lonlarini xaritada ko'ring — HamJoy.",
  path: '/uy-joy/xarita',
});

export default function ListingsMapPage() {
  return <ListingsMapView />;
}
