import { ListingsSection } from '@/components/listings/ListingsSection';
import { HomeHero } from './HomeHero';
import { HomeCategories } from './HomeCategories';
import { BuyerRequests } from './BuyerRequests';
import { HomeCtaBand } from './HomeCtaBand';

/** Home in Uy-joy mode (the default). Jobs live in Ish mode: /home/ish. */
export function PlatformHub() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <HomeHero />
      <HomeCategories />
      <ListingsSection />
      <BuyerRequests />
      <HomeCtaBand />
    </div>
  );
}
