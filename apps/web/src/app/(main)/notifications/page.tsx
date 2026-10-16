import { NotificationsContent } from './NotificationsContent';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Bildirishnomalar',
  description: 'HamJoy bildirishnomalari — arizalar, xabarlar va mos ishlar.',
  path: '/notifications',
  noIndex: true,
});

export default function NotificationsPage() {
  return <NotificationsContent />;
}
