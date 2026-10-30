import { ListingsMapView } from '@/components/home/ListingsMapView';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Uy-joy xaritasi',
  description: "Uy-joy eʼlonlarini xaritada koʻring — HamJoy.",
  path: '/uy-joy/xarita',
});

export default function ListingsMapPage() {
  return (
    <>
      <style>{'.map-fullscreen ~ footer { display: none !important }'}</style>
      <div className="map-fullscreen min-h-0 flex-1">
        <ListingsMapView />
      </div>
    </>
  );
}
