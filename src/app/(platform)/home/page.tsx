import { PlatformHub } from '@/components/home/PlatformHub';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Bosh sahifa',
  description: "Uy-joy ijarasi va savdosi, ish qidirish va e'lon joylash — barchasi HamJoy'da.",
  path: '/home',
});

/**
 * Asosiy ekran, Uy-joy rejimi (standart). The navbar comes from the (platform) layout;
 * its "Ish" tab switches to Ish mode at /home/ish.
 */
export default function Homepage() {
  return <PlatformHub />;
}
