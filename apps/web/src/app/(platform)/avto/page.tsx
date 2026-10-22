import { VerticalFeed } from '@/components/platform/VerticalFeed';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Avto',
  description:
    "Avto sotuv, avtosalonlar, ijara va haridorlar — barcha avtomobil eʼlonlari.",
  path: '/avto',
});

export default function AvtoPage() {
  return (
    <VerticalFeed
      vertical="avto"
      title="Avto bozori"
      subtitle="Avto sotuv, salonlar, ijara va haridorlar."
      emptyHint="Birinchi mashina eʼlonini joylash uchun “Eʼlon joylash” tugmasini bosing."
      accent="#1e40af"
    />
  );
}
