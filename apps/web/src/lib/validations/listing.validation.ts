import type { ListingCurrency, ListingIntent, ListingPropertyType, PropertyListing } from '@/types/listing';
import { LISTING_INTENTS } from '@/lib/listings/format';

export interface ListingFormData {
  intent: ListingIntent;
  type: ListingPropertyType;
  title: string;
  description: string;
  /** Digits only. */
  price: string;
  currency: ListingCurrency;
  rooms: string;
  area: string;
  landArea: string;
  floor: string;
  totalFloors: string;
  region: string;
  district: string;
  features: string[];
  images: string[];
  sellerName: string;
  sellerType: 'mulkdor' | 'agentlik';
  phone: string;
}

export type ListingFormErrors = Partial<Record<keyof ListingFormData, string>>;

export const MAX_LISTING_IMAGES = 8;

export const EMPTY_LISTING_FORM: ListingFormData = {
  intent: 'sotuv',
  type: 'kvartira',
  title: '',
  description: '',
  price: '',
  currency: 'USD',
  rooms: '',
  area: '',
  landArea: '',
  floor: '',
  totalFloors: '',
  region: '',
  district: '',
  features: [],
  images: [],
  sellerName: '',
  sellerType: 'mulkdor',
  phone: '+998 ',
};

const PHONE_RE = /^\+998\d{9}$/;
const num = (v: string) => Number(v.replace(/\s/g, ''));
const normalizePhone = (v: string) => v.replace(/[\s()-]/g, '');

const intentOf = (form: ListingFormData) => LISTING_INTENTS.find((i) => i.id === form.intent) ?? LISTING_INTENTS[2];

/** Buyer/renter requests describe what they want: photos and exact rooms are optional. */
export const isSeekingForm = (form: ListingFormData) => intentOf(form).seeking;

export function validateListingForm(form: ListingFormData): ListingFormErrors {
  const e: ListingFormErrors = {};
  const seeking = isSeekingForm(form);
  const title = form.title.trim();
  const description = form.description.trim();

  if (title.length < 10) e.title = 'Sarlavha kamida 10 belgidan iborat boʻlsin';
  else if (title.length > 80) e.title = 'Sarlavha 80 belgidan oshmasin';

  if (description.length < 30) e.description = 'Tavsif kamida 30 belgidan iborat boʻlsin';
  else if (description.length > 2000) e.description = 'Tavsif 2000 belgidan oshmasin';

  if (!(num(form.price) > 0)) e.price = seeking ? 'Byudjetni kiriting' : 'Narxni kiriting';

  if (form.type === 'yer') {
    if (!(num(form.landArea) > 0)) e.landArea = 'Yer maydonini kiriting (sotix)';
  } else {
    const area = num(form.area);
    if (form.area || !seeking) {
      if (!(area > 0)) e.area = 'Maydonni kiriting';
      else if (area > 100000) e.area = 'Maydon juda katta';
    }
  }

  if ((form.type === 'kvartira' || form.type === 'uy') && (form.rooms || !seeking)) {
    const rooms = num(form.rooms);
    if (!Number.isInteger(rooms) || rooms < 1 || rooms > 50) e.rooms = 'Xonalar sonini kiriting (1–50)';
  }

  if (form.type === 'kvartira' || form.type === 'tijorat') {
    const floor = num(form.floor);
    const total = num(form.totalFloors);
    if (form.floor && (!Number.isInteger(floor) || floor < 0)) e.floor = 'Qavat notoʻgʻri';
    if (form.totalFloors && (!Number.isInteger(total) || total < 1)) e.totalFloors = 'Qavatlar soni notoʻgʻri';
    if (!e.floor && !e.totalFloors && form.floor && form.totalFloors && floor > total) {
      e.floor = 'Qavat binoning qavatlar sonidan oshmasin';
    }
  }

  if (form.type === 'uy' && form.landArea && !(num(form.landArea) > 0)) e.landArea = 'Yer maydoni notoʻgʻri';

  if (!form.region) e.region = 'Viloyatni tanlang';
  if (form.district.trim().length < 2) e.district = 'Tuman yoki shaharni kiriting';

  if (form.images.length === 0 && !seeking) e.images = 'Kamida bitta rasm yuklang';
  else if (form.images.length > MAX_LISTING_IMAGES) e.images = `Koʻpi bilan ${MAX_LISTING_IMAGES} ta rasm`;

  if (form.sellerName.trim().length < 2) e.sellerName = 'Ismingizni kiriting';
  if (!PHONE_RE.test(normalizePhone(form.phone))) e.phone = 'Telefon: +998 XX XXX XX XX';

  return e;
}

/** Turns a valid form into a listing (id/date assigned here, like an API would). */
export function toPropertyListing(form: ListingFormData, ownerId: string, now = new Date()): PropertyListing {
  const optional = (v: string) => (v.trim() ? num(v) : undefined);
  const intent = intentOf(form);
  const hasFloors = form.type === 'kvartira' || form.type === 'tijorat';
  const digits = normalizePhone(form.phone).slice(4);
  return {
    id: `u-${now.getTime().toString(36)}`,
    deal: intent.deal,
    type: form.type,
    title: form.title.trim(),
    description: form.description.trim(),
    price: num(form.price),
    currency: form.currency,
    rentPeriod: intent.rentPeriod,
    rooms: form.type === 'yer' ? undefined : optional(form.rooms),
    area: form.type === 'yer' ? undefined : optional(form.area),
    landArea: form.type === 'uy' || form.type === 'yer' ? optional(form.landArea) : undefined,
    floor: hasFloors ? optional(form.floor) : undefined,
    totalFloors: form.type === 'yer' ? undefined : optional(form.totalFloors),
    region: form.region,
    district: form.district.trim(),
    images: form.images,
    features: form.features,
    postedAt: now.toISOString().slice(0, 10),
    seller: {
      name: form.sellerName.trim(),
      type: form.sellerType,
      phone: `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`,
    },
    seeking: intent.seeking || undefined,
    ownerId,
  };
}
