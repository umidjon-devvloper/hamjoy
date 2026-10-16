import { describe, expect, it } from 'vitest';
import {
  EMPTY_LISTING_FORM,
  toPropertyListing,
  validateListingForm,
  type ListingFormData,
} from '@/lib/validations/listing.validation';

const valid: ListingFormData = {
  ...EMPTY_LISTING_FORM,
  title: '2 xonali kvartira, Chilonzor',
  description: 'Taʼmirlangan, mebel bilan, metroga yaqin. Hujjatlar tayyor.',
  price: '65000',
  rooms: '2',
  area: '54',
  floor: '3',
  totalFloors: '9',
  region: 'Toshkent shahri',
  district: 'Chilonzor tumani',
  images: ['data:image/jpeg;base64,AAA'],
  sellerName: 'Akmal',
  phone: '+998 90 123 45 67',
};

describe('validateListingForm', () => {
  it('accepts a complete form', () => {
    expect(validateListingForm(valid)).toEqual({});
  });

  it('requires the core fields', () => {
    const errors = validateListingForm(EMPTY_LISTING_FORM);
    for (const key of ['title', 'description', 'price', 'area', 'rooms', 'region', 'district', 'images', 'sellerName', 'phone']) {
      expect(errors).toHaveProperty(key);
    }
  });

  it('rejects a floor above the building height and a bad phone', () => {
    const errors = validateListingForm({ ...valid, floor: '12', phone: '+998 12' });
    expect(errors.floor).toBeDefined();
    expect(errors.phone).toBeDefined();
  });

  it('lets buyer requests skip photos and exact rooms', () => {
    const errors = validateListingForm({ ...valid, intent: 'sotib-olish', images: [], rooms: '', area: '' });
    expect(errors).toEqual({});
  });

  it('asks land plots for sotix, not rooms or m²', () => {
    const errors = validateListingForm({ ...valid, type: 'yer', rooms: '', area: '', landArea: '' });
    expect(Object.keys(errors)).toEqual(['landArea']);
  });

  it('does not require rooms for commercial property', () => {
    expect(validateListingForm({ ...valid, type: 'tijorat', rooms: '' }).rooms).toBeUndefined();
  });
});

describe('toPropertyListing', () => {
  it('builds a listing owned by the poster', () => {
    const listing = toPropertyListing({ ...valid, intent: 'ijara' }, 'user-1', new Date('2026-10-12T10:00:00Z'));
    expect(listing.id.startsWith('u-')).toBe(true);
    expect(listing).toMatchObject({ ownerId: 'user-1', price: 65000, rentPeriod: 'oy', postedAt: '2026-10-12' });
    expect(listing.seller.phone).toBe('+998 90 123 45 67');
  });

  it('maps intents to deal, period and request flag', () => {
    expect(toPropertyListing({ ...valid, intent: 'kunlik-ijara' }, 'u')).toMatchObject({ deal: 'ijara', rentPeriod: 'kun' });
    const request = toPropertyListing({ ...valid, intent: 'sotib-olish' }, 'u');
    expect(request).toMatchObject({ deal: 'sotuv', seeking: true });
    expect(request.rentPeriod).toBeUndefined();
  });
});
