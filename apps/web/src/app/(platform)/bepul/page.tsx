import { VerticalFeed } from '@/components/platform/VerticalFeed';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Bepul',
  description: "Bepul beraman — kerakmas narsalaringizni boshqa odamlarga ulashing.",
  path: '/bepul',
});

export default function BepulPage() {
  return (
    <VerticalFeed
      vertical="bepul"
      title="Bepul beraman"
      subtitle="Kerakmas narsalaringizni boshqalarga ulashing."
      emptyHint="Birinchi bepul eʼlonni joylash uchun “Eʼlon joylash” tugmasini bosing."
      accent="#059669"
    />
  );
}
