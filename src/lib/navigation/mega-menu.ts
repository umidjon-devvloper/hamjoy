import { categories as jobCategories } from '@/data/categories';
import { ROUTES } from './routes';

/**
 * Category mega-menus shown in the bar under the platform navbar.
 *
 * Real-estate links already carry their final filter params
 * (`/uy-joy/sotuv?tur=kvartira&xona=2`) so they keep working once the
 * listing pages exist; until then /uy-joy/* renders a "tez orada" page.
 */

export interface MegaMenuItem {
  label: string;
  href: string;
}

export interface MegaMenuGroup {
  title: string;
  /** Optional "see all" link on the group title. */
  href?: string;
  items: MegaMenuItem[];
}

export interface MegaMenu {
  id: string;
  label: string;
  /** Extra links revealed by a "Yana" button under the columns. */
  more?: MegaMenuItem[];
  /** Each column stacks one or more groups top-to-bottom. */
  columns: MegaMenuGroup[][];
  /** Shown as the panel footer ("Barchasini koʻrish"). */
  href: string;
}

/** Daily / one-off jobs — also a top-level tab in the category bar. */
export const DAILY_JOBS_HREF = `${ROUTES.jobs}?q=${encodeURIComponent('kunlik')}`;

/**
 * Fields not covered by the 18 categories already in the Ish menu (duplicates removed).
 * They open a text search until they exist as real categories.
 */
const MORE_JOB_CATEGORIES: [label: string, query: string][] = [
  ['Kunlik ishlar', 'kunlik'],
  ['Avtomobil taʼmirlash', 'avto'],
  ['Ombor va qadoqlash', 'qadoqlash'],
  ['Tozalash xizmatlari', 'tozalash'],
  ['Bolalar parvarishi', 'bola'],
  ['Keksalar parvarishi', 'keksa'],
  ['Sugʻurta', 'sugʻurta'],
  ['Ofis va maʼmuriy ishlar', 'ofis'],
  ['Kadrlar va rekruting', 'kadr'],
  ['Menejment', 'menejer'],
  ['Mijozlarga xizmat koʻrsatish', 'mijoz'],
  ['Call-markaz', 'call'],
  ['Haydovchilik', 'haydovchi'],
  ['Kuryerlik va yetkazib berish', 'kuryer'],
  ['Sartaroshlik', 'sartarosh'],
  ['Qishloq xoʻjaligi', 'qishloq'],
  ['Chorvachilik', 'chorva'],
  ['Tikuvchilik va toʻqimachilik', 'tikuvchi'],
  ['Elektrik va elektronika', 'elektrik'],
  ['Santexnika', 'santexnik'],
  ['Maishiy texnika taʼmirlash', 'texnika'],
  ['Mebel ishlab chiqarish', 'mebel'],
  ['Hunarmandchilik', 'hunarmand'],
  ['Media va jurnalistika', 'jurnalist'],
  ['Foto va videografiya', 'video'],
  ['Kontent yaratish', 'kontent'],
  ['Tarjima xizmatlari', 'tarjima'],
  ['Muhandislik', 'muhandis'],
  ['Energetika', 'energetika'],
];

const q = (base: string, params: Record<string, string>) =>
  `${base}?${new URLSearchParams(params).toString()}`;

/** Kvartira / Uy / Tijorat groups are the same for sale and rent — only the base path differs. */
function propertyGroups(base: string): MegaMenuGroup[][] {
  return [
    [
      {
        title: 'Kvartira',
        href: q(base, { tur: 'kvartira' }),
        items: [1, 2, 3, 4].map((n) => ({
          label: `${n} xonali`,
          href: q(base, { tur: 'kvartira', xona: String(n) }),
        })).concat({ label: '5+ xonali', href: q(base, { tur: 'kvartira', xona: '5+' }) }),
      },
    ],
    [
      {
        title: 'Hovli / uy',
        href: q(base, { tur: 'uy' }),
        items: [
          { label: '4 sotixdan kam', href: q(base, { tur: 'uy', sotix: '0-4' }) },
          { label: '4 dan 6 sotixgacha', href: q(base, { tur: 'uy', sotix: '4-6' }) },
          { label: '6 sotixdan koʻp', href: q(base, { tur: 'uy', sotix: '6+' }) },
          { label: 'Bir qavatli', href: q(base, { tur: 'uy', qavat: '1' }) },
          { label: 'Ikki qavatli', href: q(base, { tur: 'uy', qavat: '2' }) },
        ],
      },
    ],
    [
      {
        title: 'Tijorat uchun',
        href: q(base, { tur: 'tijorat' }),
        items: [
          { label: 'Ofis', href: q(base, { tur: 'tijorat', kategoriya: 'ofis' }) },
          { label: 'Bino', href: q(base, { tur: 'tijorat', kategoriya: 'bino' }) },
          { label: 'Ishlab chiqarish', href: q(base, { tur: 'tijorat', kategoriya: 'ishlab-chiqarish' }) },
          { label: 'Tayyor biznes', href: q(base, { tur: 'tijorat', kategoriya: 'tayyor-biznes' }) },
          { label: 'Ombor', href: q(base, { tur: 'tijorat', kategoriya: 'ombor' }) },
        ],
      },
    ],
  ];
}

const SALE = '/uy-joy/sotuv';
const RENT = '/uy-joy/ijara';
const NEW_BUILDINGS = '/uy-joy/yangi-uylar';

export const MEGA_MENUS: MegaMenu[] = [
  {
    id: 'sotuv',
    label: 'Sotuv',
    href: SALE,
    columns: [
      ...propertyGroups(SALE),
      [
        {
          title: 'Yer',
          href: q(SALE, { tur: 'yer' }),
          items: [
            { label: 'Turar joy uchun', href: q(SALE, { tur: 'yer', maqsad: 'turar-joy' }) },
            { label: 'Noturar joy uchun', href: q(SALE, { tur: 'yer', maqsad: 'noturar-joy' }) },
          ],
        },
      ],
    ],
  },
  {
    id: 'ijara',
    label: 'Ijara',
    href: RENT,
    columns: [
      ...propertyGroups(RENT),
      [
        {
          title: 'Xonalar',
          href: q(RENT, { tur: 'xona' }),
          items: [
            { label: 'Barcha xonalar', href: q(RENT, { tur: 'xona' }) },
            { label: 'Kunlik ijara', href: q(RENT, { muddat: 'kunlik' }) },
            { label: 'Oylik ijara', href: q(RENT, { muddat: 'oylik' }) },
          ],
        },
      ],
    ],
  },
  {
    id: 'yangi-uylar',
    label: 'Turar joy majmuasi',
    href: NEW_BUILDINGS,
    columns: [
      [
        {
          title: 'Turar joy majmuasi',
          items: [
            { label: 'Barcha majmualar', href: NEW_BUILDINGS },
            { label: 'Topshirilgan uylar', href: q(NEW_BUILDINGS, { holat: 'topshirilgan' }) },
            { label: 'Qurilayotgan uylar', href: q(NEW_BUILDINGS, { holat: 'qurilmoqda' }) },
            { label: 'Quruvchidan', href: q(NEW_BUILDINGS, { sotuvchi: 'quruvchi' }) },
          ],
        },
      ],
      [
        {
          title: 'Narx',
          items: [
            { label: '500 mln soʻmgacha', href: q(NEW_BUILDINGS, { narx: '0-500' }) },
            { label: '500 – 700 mln soʻm', href: q(NEW_BUILDINGS, { narx: '500-700' }) },
            { label: '700 – 900 mln soʻm', href: q(NEW_BUILDINGS, { narx: '700-900' }) },
            { label: '900 mln soʻmdan yuqori', href: q(NEW_BUILDINGS, { narx: '900+' }) },
          ],
        },
        {
          title: 'Topshirish muddati',
          items: [
            { label: 'Topshirilgan', href: q(NEW_BUILDINGS, { topshirish: 'tayyor' }) },
            { label: '2026-yilda', href: q(NEW_BUILDINGS, { topshirish: '2026' }) },
            { label: '2027-yilda', href: q(NEW_BUILDINGS, { topshirish: '2027' }) },
            { label: '2028-yil va keyin', href: q(NEW_BUILDINGS, { topshirish: '2028+' }) },
          ],
        },
      ],
      [
        {
          title: 'Maydon',
          items: [
            { label: '50 m² gacha', href: q(NEW_BUILDINGS, { maydon: '0-50' }) },
            { label: '50 – 70 m²', href: q(NEW_BUILDINGS, { maydon: '50-70' }) },
            { label: '70 – 100 m²', href: q(NEW_BUILDINGS, { maydon: '70-100' }) },
            { label: '100 m² dan katta', href: q(NEW_BUILDINGS, { maydon: '100+' }) },
          ],
        },
        {
          title: 'Joylashuv',
          items: [
            { label: 'Toshkent shahri', href: q(NEW_BUILDINGS, { hudud: 'toshkent-shahri' }) },
            { label: 'Toshkent viloyati', href: q(NEW_BUILDINGS, { hudud: 'toshkent-viloyati' }) },
            { label: 'Samarqand viloyati', href: q(NEW_BUILDINGS, { hudud: 'samarqand' }) },
            { label: 'Namangan viloyati', href: q(NEW_BUILDINGS, { hudud: 'namangan' }) },
          ],
        },
      ],
      [
        {
          title: 'Qoʻshimcha',
          items: [
            { label: 'Alohida planirovkali', href: q(NEW_BUILDINGS, { planirovka: 'alohida' }) },
            { label: 'Boʻlib-boʻlib toʻlash', href: q(NEW_BUILDINGS, { tolov: 'muddatli' }) },
            { label: 'Taʼmirlangan holda', href: q(NEW_BUILDINGS, { tamir: 'bor' }) },
          ],
        },
      ],
    ],
  },
  {
    id: 'ish',
    label: 'Ish',
    href: ROUTES.jobs,
    more: MORE_JOB_CATEGORIES.map(([label, query]) => ({
      label,
      href: `${ROUTES.jobs}?q=${encodeURIComponent(query)}`,
    })),
    columns: [
      ...chunk(jobCategories.slice(0, 18), 6).map((items, i) => [
        {
          title: i === 0 ? 'Kategoriyalar' : ' ',
          items: items.map((c) => ({
            label: c.name,
            href: `${ROUTES.jobs}?category=${encodeURIComponent(c.slug)}`,
          })),
        },
      ]),
      [
        {
          title: 'Tezkor',
          items: [
            { label: 'Barcha vakansiyalar', href: ROUTES.jobs },
            { label: 'Yaqinimdagi ishlar', href: ROUTES.map },
            { label: 'Barcha kategoriyalar', href: '/categories' },
            { label: 'Vakansiya joylash', href: ROUTES.createJob },
          ],
        },
      ],
    ],
  },
];

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}
