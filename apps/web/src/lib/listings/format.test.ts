import { describe, expect, it } from 'vitest';
import { DEMO_LISTINGS } from '@/data/listings';
import {
  activeBrowseIntent,
  filterListings,
  formatListingDate,
  formatListingPrice,
  INTENT_BROWSE_HREFS,
  propertyTypeHref,
} from '@/lib/listings/format';
import { MEGA_MENUS } from '@/lib/navigation/mega-menu';

describe('listing format', () => {
  it('formats prices and dates deterministically', () => {
    expect(formatListingPrice({ price: 89000, currency: 'USD' })).toBe('$89 000');
    expect(formatListingPrice({ price: 4500000, currency: 'UZS', rentPeriod: 'oy' })).toBe('4 500 000 soʻm / oy');
    expect(formatListingDate('2026-10-11')).toBe('11-oktabr');
  });

  it('filters by deal, type and rooms', () => {
    expect(filterListings(DEMO_LISTINGS, 'ijara').every((l) => l.deal === 'ijara')).toBe(true);
    expect(filterListings(DEMO_LISTINGS, 'sotuv', { tur: 'uy' }).every((l) => l.type === 'uy')).toBe(true);
    expect(filterListings(DEMO_LISTINGS, 'sotuv', { xona: '5+' }).every((l) => (l.rooms ?? 0) >= 5)).toBe(true);
  });

  it('has unique listing ids', () => {
    expect(new Set(DEMO_LISTINGS.map((l) => l.id)).size).toBe(DEMO_LISTINGS.length);
  });
});

describe('Ish menu', () => {
  it('lists every category once, including Kunlik ishlar', () => {
    const ish = MEGA_MENUS.find((m) => m.id === 'ish')!;
    const labels = [...ish.columns.flat().flatMap((g) => g.items.map((i) => i.label)), ...(ish.more ?? []).map((i) => i.label)];
    expect(new Set(labels).size).toBe(labels.length);
    expect(ish.more?.[0].label).toBe('Kunlik ishlar');
  });
});

describe('browse menu', () => {
  it('splits offers from buyer requests', () => {
    expect(filterListings(DEMO_LISTINGS, 'sotuv').some((l) => l.seeking)).toBe(false);
    const requests = filterListings(DEMO_LISTINGS, 'olish', { bitim: 'ijara' });
    expect(requests.length).toBeGreaterThan(0);
    expect(requests.every((l) => l.seeking && l.deal === 'ijara')).toBe(true);
  });

  it('maps pages to the active intent and back', () => {
    expect(activeBrowseIntent('ijara', { muddat: 'kunlik' })).toBe('kunlik-ijara');
    expect(activeBrowseIntent('olish', { bitim: 'sotuv' })).toBe('sotib-olish');
    expect(activeBrowseIntent('olish', {})).toBeNull();
    expect(INTENT_BROWSE_HREFS['kunlik-ijara']).toBe('/uy-joy/ijara?muddat=kunlik');
  });

  it('keeps the intent when switching property type', () => {
    expect(propertyTypeHref('ijara', { muddat: 'kunlik', xona: '2' }, 'uy')).toBe('/uy-joy/ijara?muddat=kunlik&tur=uy');
    expect(propertyTypeHref('sotuv', { tur: 'yer' })).toBe('/uy-joy/sotuv');
  });
});
