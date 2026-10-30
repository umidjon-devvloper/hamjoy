import type { PropertyListing, ListingDeal, ListingPropertyType, ListingCurrency } from '@/types/listing';

export function apiListingToProperty(raw: any): PropertyListing {
  const priceAmount = raw.price?.amount ?? (raw.priceAmount != null ? Number(raw.priceAmount) : 0);
  const priceCurrency: ListingCurrency = (raw.price?.currency ?? raw.priceCurrency ?? 'UZS') as ListingCurrency;

  const typeMap: Record<string, ListingDeal> = { rent: 'ijara', sale: 'sotuv' };
  const deal: ListingDeal = typeMap[raw.type] ?? 'sotuv';

  const propTypeMap: Record<string, ListingPropertyType> = { apartment: 'kvartira', house: 'uy', commercial: 'tijorat', land: 'yer' };
  const propertyType: ListingPropertyType = propTypeMap[raw.attrs?.propertyType] ?? 'kvartira';

  const images: string[] = Array.isArray(raw.media)
    ? raw.media
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((m: any) => m.url)
        .filter(Boolean)
    : Array.isArray(raw.images) ? raw.images : [];

  const publishedAt = raw.publishedAt ?? raw.createdAt ?? '';
  const postedAt = typeof publishedAt === 'string' ? publishedAt.slice(0, 10) : '';

  const a = raw.attrs ?? {};
  const num = (v: unknown) => (v != null ? Number(v) : undefined);

  return {
    id: raw.id,
    deal,
    type: propertyType,
    title: raw.title ?? '',
    description: raw.description ?? '',
    price: Number.isFinite(priceAmount) ? priceAmount : 0,
    currency: priceCurrency,
    rentPeriod: deal === 'ijara' ? (a.rentPeriod ?? 'oy') : undefined,
    rooms: num(a.rooms ?? a.xonalar),
    area: num(a.area ?? a.maydon),
    landArea: num(a.landArea ?? a.yerMaydoni),
    floor: num(a.floor ?? a.qavat),
    totalFloors: num(a.totalFloors ?? a.qavatlar),
    region: a.region ?? a.viloyat ?? '',
    district: a.district ?? a.tuman ?? '',
    images,
    features: Array.isArray(a.features) ? a.features : [],
    postedAt,
    seller: {
      name: a.sellerName ?? 'Egasi',
      type: a.sellerType === 'agentlik' ? 'agentlik' : 'mulkdor',
      phone: a.phone ?? '',
    },
    ownerId: raw.userId,
    sold: raw.status === 'sold',
  };
}
