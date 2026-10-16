import { ApplicationsContent } from './ApplicationsContent';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Mening arizalarim',
  description: "HamJoy orqali yuborgan ish arizalaringizni kuzating.",
  path: '/applications',
  noIndex: true,
});

export default function ApplicationsPage() {
  return <ApplicationsContent />;
}
