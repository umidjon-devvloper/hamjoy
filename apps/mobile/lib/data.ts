import { useQuery } from '@tanstack/react-query';
import type { ImageSourcePropType } from 'react-native';
import { getApi } from './api';
import { fallbackPhoto, photos } from './images';

export type Deal = 'sotuv' | 'ijara' | 'kunlik';

export interface Home {
  id: string;
  userId?: string;
  title: string;
  deal: Deal;
  top: boolean;
  price: string;
  unit: string;
  district: string;
  facts: string[];
  specs: { label: string; value: string }[];
  images: ImageSourcePropType[];
  description: string;
  features: string[];
  owner: string;
  distance?: string;
  postedAt: string;
  isDemo: boolean;
}

export interface Job {
  id: string;
  userId?: string;
  kind: 'vakansiya' | 'kunlik';
  title: string;
  company: string;
  place: string;
  mode: string;
  salary: string;
  isNew: boolean;
  time?: string;
  distance?: string;
  description: string;
  requirements: string[];
  postedAt: string;
  isDemo: boolean;
}

export const DEAL_LABEL: Record<Deal, string> = { sotuv: 'Sotuv', ijara: 'Ijara', kunlik: 'Kunlik' };

/* ---------------------------------------------------------------- demo */

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export const DEMO_HOMES: Home[] = [
  {
    id: 'demo-a', title: 'Zamonaviy hovli, Qibray', deal: 'sotuv', top: true, price: '$265 000', unit: '',
    district: 'Qibray tumani, Toshkent viloyati', facts: ['5 xona', '240 m²', '6 sotix'],
    specs: [{ label: 'Xona', value: '5' }, { label: 'Maydon', value: '240 m²' }, { label: 'Yer', value: '6 sotix' }, { label: 'm² narxi', value: '$1 104' }],
    images: [photos.hovliZamonaviy, photos.hovliBasseyn, photos.oshxona],
    description: 'Yangi qurilgan ikki qavatli hovli: keng mehmonxona, 5 ta yotoqxona, yopiq avtoturargoh va bogʻ. Hujjatlari toʻliq, ipoteka mumkin. Shahar markaziga 20 daqiqa.',
    features: ['Yevroremont', 'Avtoturargoh', 'Bogʻ', 'Isitish tizimi'], owner: 'Dilshod A.', postedAt: daysAgo(1), isDemo: true,
  },
  {
    id: 'demo-b', title: '3 xonali kvartira, Yunusobod', deal: 'sotuv', top: true, price: '$89 000', unit: '',
    district: 'Yunusobod tumani, Minor metro', facts: ['3 xona', '78 m²', '5/9'],
    specs: [{ label: 'Xona', value: '3' }, { label: 'Maydon', value: '78 m²' }, { label: 'Qavat', value: '5/9' }, { label: 'm² narxi', value: '$1 141' }],
    images: [photos.kvartira, photos.oshxona, photos.studiya],
    description: 'Metroga 5 daqiqa. Yevroremont, konditsioner, oshxona mebeli qoladi. Uy sokin hovliga qaraydi, yonida maktab va bogʻcha bor. Hujjatlar tayyor, tez rasmiylashtirish mumkin.',
    features: ['Yevroremont', 'Konditsioner', 'Lift', 'Avtoturargoh'], owner: 'Dilshod A.', postedAt: daysAgo(3), isDemo: true,
  },
  {
    id: 'demo-c', title: 'Basseynli villa, Bektemir', deal: 'sotuv', top: false, price: '$420 000', unit: '',
    district: 'Bektemir tumani, Toshkent', facts: ['6 xona', '380 m²', '10 sotix'],
    specs: [{ label: 'Xona', value: '6' }, { label: 'Maydon', value: '380 m²' }, { label: 'Yer', value: '10 sotix' }, { label: 'm² narxi', value: '$1 105' }],
    images: [photos.villa1, photos.villa2, photos.villa3],
    description: 'Basseyn, sauna va mehmon uyi bilan villa. Landshaft dizayni, 24/7 qoʻriqlanadigan hudud.',
    features: ['Basseyn', 'Sauna', 'Qoʻriqlash', 'Mehmon uyi'], owner: 'Malika R.', postedAt: daysAgo(6), isDemo: true,
  },
  {
    id: 'demo-d', title: '2 xonali kvartira, Mirzo Ulugʻbek', deal: 'ijara', top: false, price: '4,5 mln', unit: 'soʻm / oy',
    district: 'Mirzo Ulugʻbek tumani', facts: ['2 xona', '56 m²', 'mebel bilan'], distance: '1,2 km',
    specs: [{ label: 'Xona', value: '2' }, { label: 'Maydon', value: '56 m²' }, { label: 'Qavat', value: '3/9' }, { label: 'Depozit', value: '1 oy' }],
    images: [photos.studiya, photos.oshxona, photos.kvartira],
    description: 'Toʻliq jihozlangan, maishiy texnika bilan. Oilaga yoki talabalarga beriladi. Kommunal xizmatlar alohida.',
    features: ['Mebel', 'Kir yuvish mashinasi', 'Wi-Fi', 'Konditsioner'], owner: 'Sardor T.', postedAt: daysAgo(0), isDemo: true,
  },
  {
    id: 'demo-e', title: '4 xonali hovli, Chilonzor', deal: 'ijara', top: false, price: '12 mln', unit: 'soʻm / oy',
    district: 'Chilonzor tumani', facts: ['4 xona', '180 m²', 'basseyn'], distance: '3,4 km',
    specs: [{ label: 'Xona', value: '4' }, { label: 'Maydon', value: '180 m²' }, { label: 'Yer', value: '4 sotix' }, { label: 'Depozit', value: '2 oy' }],
    images: [photos.hovliBasseyn, photos.hovliYogoch, photos.oshxona],
    description: 'Hovlida basseyn va oʻyin maydonchasi. Uzoq muddatga oilaga beriladi.',
    features: ['Basseyn', 'Avtoturargoh', 'Bogʻ'], owner: 'Nodira K.', postedAt: daysAgo(2), isDemo: true,
  },
  {
    id: 'demo-f', title: 'Kunlik studiya, Samarqand', deal: 'kunlik', top: false, price: '450 ming', unit: 'soʻm / kun',
    district: 'Samarqand shahri, Registon yaqinida', facts: ['1 xona', '34 m²', 'Wi-Fi'], distance: '—',
    specs: [{ label: 'Xona', value: '1' }, { label: 'Maydon', value: '34 m²' }, { label: 'Mehmon', value: '2' }, { label: 'Kirish', value: '14:00' }],
    images: [photos.mehmonxona1, photos.mehmonxona2, photos.mehmonxona3],
    description: 'Registonga 10 daqiqa piyoda. Toza choyshab, sochiq va nonushta bilan.',
    features: ['Wi-Fi', 'Nonushta', 'Konditsioner', 'Choyshab'], owner: 'Aziz M.', postedAt: daysAgo(1), isDemo: true,
  },
];

export const DEMO_JOBS: Job[] = [
  {
    id: 'demo-g1', kind: 'kunlik', title: 'Yuk tashish yordamchisi', company: 'Express Pereezd', place: 'Yunusobod', mode: 'Bugun',
    salary: '350 000 soʻm', isNew: true, time: '09:00–17:00', distance: '1,8 km',
    description: 'Kvartira koʻchishida mebel va yuklarni tashishga yordam kerak. Tushlik beriladi.',
    requirements: ['Jismoniy baquvvat', 'Vaqtida kelish'], postedAt: daysAgo(0), isDemo: true,
  },
  {
    id: 'demo-g2', kind: 'kunlik', title: 'Ofisni tozalash', company: 'CleanPro', place: 'Mirobod', mode: 'Bugun',
    salary: '280 000 soʻm', isNew: false, time: '18:00–22:00', distance: '3,1 km',
    description: '150 m² ofisni kechki tozalash. Vositalar beriladi.', requirements: ['Tajriba afzal'], postedAt: daysAgo(0), isDemo: true,
  },
  {
    id: 'demo-g3', kind: 'kunlik', title: 'Toʻyda ofitsiant', company: 'Navroʻz restorani', place: 'Chilonzor', mode: 'Ertaga',
    salary: '400 000 soʻm', isNew: true, time: '16:00–00:00', distance: '4,6 km',
    description: '300 kishilik toʻy uchun ofitsiantlar jamoasiga qoʻshiling.', requirements: ['Ozoda kiyim', 'Muloyimlik'], postedAt: daysAgo(0), isDemo: true,
  },
  {
    id: 'demo-j1', kind: 'vakansiya', title: 'Sotuv menejeri (koʻchmas mulk)', company: 'Golden House', place: 'Toshkent', mode: 'Ofisda',
    salary: '8–15 mln', isNew: true,
    description: 'Yangi turar joy majmuasi uchun mijozlar bilan ishlash, uchrashuvlar oʻtkazish va shartnomalarni yuritish.',
    requirements: ['1 yildan ortiq savdo tajribasi', 'Rus va oʻzbek tillari', 'CRM bilan ishlash'], postedAt: daysAgo(1), isDemo: true,
  },
  {
    id: 'demo-j2', kind: 'vakansiya', title: 'Frontend dasturchi (React)', company: 'Uzum Tech', place: 'Toshkent', mode: 'Gibrid',
    salary: '$1 500–2 500', isNew: false,
    description: 'Mahsulot jamoasida React va TypeScript bilan interfeyslar yaratish.',
    requirements: ['React, TypeScript', '2+ yil tajriba', 'Ingliz tili B1'], postedAt: daysAgo(3), isDemo: true,
  },
  {
    id: 'demo-j3', kind: 'vakansiya', title: 'Qurilish ustasi (pardozlash)', company: 'Murad Buildings', place: 'Toshkent viloyati', mode: 'Obyektda',
    salary: '10–12 mln', isNew: false,
    description: 'Yangi bino kvartiralarida pardozlash ishlarini bajarish. Turar joy beriladi.',
    requirements: ['Gipsokarton va shpaklyovka', '3+ yil tajriba'], postedAt: daysAgo(4), isDemo: true,
  },
];

/* ---------------------------------------------------------------- API normalisation */

interface RawListing {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  type: 'job' | 'rent' | 'sale' | 'service' | string;
  priceAmount?: number | string | null;
  priceCurrency?: string | null;
  price?: { amount: number; currency: string } | null;
  media?: { url: string; kind?: string }[];
  attrs?: Record<string, string | number | boolean>;
  createdAt: string;
}

function groupDigits(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatMoney(amount: number, currency: string): string {
  if (currency === 'USD') return `$${groupDigits(amount)}`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(amount % 1_000_000 ? 1 : 0).replace('.', ',')} mln`;
  if (amount >= 1_000) return `${groupDigits(amount / 1_000)} ming`;
  return `${groupDigits(amount)} soʻm`;
}

function priceOf(raw: RawListing): { amount: number; currency: string } | null {
  if (raw.price) return raw.price;
  if (raw.priceAmount != null) return { amount: Number(raw.priceAmount), currency: raw.priceCurrency ?? 'UZS' };
  return null;
}

function toHome(raw: RawListing): Home {
  const attrs = raw.attrs ?? {};
  const deal: Deal = raw.type === 'sale' ? 'sotuv' : attrs.period === 'kun' ? 'kunlik' : 'ijara';
  const p = priceOf(raw);
  const facts = [
    attrs.rooms ? `${attrs.rooms} xona` : null,
    attrs.area ? `${attrs.area} m²` : null,
    attrs.floor ? String(attrs.floor) : null,
  ].filter((x): x is string => Boolean(x));
  const media = (raw.media ?? []).filter((m) => m.kind !== 'video').map((m) => ({ uri: m.url }));
  return {
    id: raw.id,
    userId: raw.userId,
    title: raw.title,
    deal,
    top: false,
    price: p ? formatMoney(p.amount, p.currency) : 'Kelishiladi',
    unit: p && p.currency !== 'USD' && deal !== 'sotuv' ? (deal === 'kunlik' ? 'soʻm / kun' : 'soʻm / oy') : '',
    district: typeof attrs.district === 'string' ? attrs.district : 'Toshkent',
    facts,
    specs: facts.map((f, i) => ({ label: ['Xona', 'Maydon', 'Qavat'][i] ?? '', value: f.replace(' xona', '') })),
    images: media.length ? media : [fallbackPhoto(raw.id)],
    description: raw.description ?? '',
    features: [],
    owner: 'HamJoy foydalanuvchisi',
    postedAt: raw.createdAt,
    isDemo: false,
  };
}

function toJob(raw: RawListing): Job {
  const attrs = raw.attrs ?? {};
  const p = priceOf(raw);
  return {
    id: raw.id,
    userId: raw.userId,
    kind: attrs.kind === 'kunlik' ? 'kunlik' : 'vakansiya',
    title: raw.title,
    company: typeof attrs.company === 'string' ? attrs.company : 'Ish beruvchi',
    place: typeof attrs.district === 'string' ? attrs.district : 'Toshkent',
    mode: typeof attrs.mode === 'string' ? attrs.mode : 'Ofisda',
    salary: p ? formatMoney(p.amount, p.currency) : 'Kelishiladi',
    isNew: Date.now() - new Date(raw.createdAt).getTime() < 2 * 86_400_000,
    description: raw.description ?? '',
    requirements: [],
    postedAt: raw.createdAt,
    isDemo: false,
  };
}

async function searchRaw(params: {
  q?: string;
  type?: 'job' | 'rent' | 'sale' | 'car_sale' | 'car_salon' | 'free_give' | 'worker_offer' | 'service';
  vertical?: 'uy-joy' | 'ish';
}): Promise<RawListing[]> {
  try {
    const res = await getApi().listings.search({ ...params, limit: 30 } as never);
    return res.items as unknown as RawListing[];
  } catch {
    // API offline → the app still works on demo data.
    return [];
  }
}


const matches = (q: string | undefined, ...fields: string[]) =>
  !q || fields.some((f) => f.toLowerCase().includes(q.trim().toLowerCase()));

/* ---------------------------------------------------------------- hooks */

export function useHomes(opts: { q?: string; deal?: Deal | 'all' } = {}) {
  const { q, deal = 'all' } = opts;
  return useQuery({
    queryKey: ['homes', q ?? '', deal],
    queryFn: async () => {
      const raw = await searchRaw({
        q: q || undefined,
        vertical: 'uy-joy',
        type: deal === 'sotuv' ? 'sale' : deal === 'all' ? undefined : 'rent',
      });
      const live = raw.filter((r) => r.type === 'sale' || r.type === 'rent').map(toHome);
      const demo = DEMO_HOMES.filter((h) => matches(q, h.title, h.district));
      return [...live, ...demo].filter((h) => deal === 'all' || h.deal === deal);
    },
  });
}

export function useHome(id: string | undefined) {
  return useQuery({
    queryKey: ['home', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const demo = DEMO_HOMES.find((h) => h.id === id);
      if (demo) return demo;
      return toHome((await getApi().listings.get(id!)) as unknown as RawListing);
    },
  });
}

export function useJobs(q?: string) {
  return useQuery({
    queryKey: ['jobs', q ?? ''],
    queryFn: async () => {
      const live = (await searchRaw({ q: q || undefined, vertical: 'ish' })).map(toJob);
      const demo = DEMO_JOBS.filter((j) => matches(q, j.title, j.company));
      return [...live, ...demo];
    },
  });
}

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: ['job', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const demo = DEMO_JOBS.find((j) => j.id === id);
      if (demo) return demo;
      return toJob((await getApi().listings.get(id!)) as unknown as RawListing);
    },
  });
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'hozirgina';
  if (s < 3600) return `${Math.floor(s / 60)} daq oldin`;
  if (s < 86400) return `${Math.floor(s / 3600)} soat oldin`;
  if (s < 2 * 86400) return 'kecha';
  return `${Math.floor(s / 86400)} kun oldin`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Xayrli tun';
  if (h < 12) return 'Xayrli tong';
  if (h < 18) return 'Xayrli kun';
  return 'Xayrli kech';
}
