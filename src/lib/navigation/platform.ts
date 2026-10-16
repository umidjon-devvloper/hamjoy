import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Bookmark,
  Briefcase,
  Building2,
  ClipboardList,
  FileUser,
  HandCoins,
  KeyRound,
  MessageCircle,
  PlusCircle,
  Search,
  Tag,
  UserRound,
} from 'lucide-react';
import { isRouteActive, ROUTES } from './routes';

/**
 * The platform tree — the hub (/home), the navbar tabs and the mobile menu all
 * render from this, so adding a section or a sub-page is a one-line change here.
 *
 *   PLATFORM
 *   ├── UY-JOY  → Sotuv | Ijara | Sotib olish
 *   ├── ISH     → Ish qidirish | Vakansiya joylash | CV joylash
 *   └── HISOBIM → Profil | Eʼlonlarim | Saqlanganlar | Chat | Xabarlar
 */

export type PlatformSectionId = 'uy-joy' | 'ish' | 'account';

export interface PlatformLink {
  label: string;
  description: string;
  icon: LucideIcon;
  /** Omitted while the page is not built yet — rendered disabled as "Tez orada". */
  href?: string;
  /** The page exists but only as a "tez orada" placeholder — still linked, but labelled. */
  soon?: boolean;
  /** Kept out of the home-page card (it only shows the main actions). */
  navOnly?: boolean;
}

export interface PlatformSection {
  id: PlatformSectionId;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Section landing page; omitted while the section is not built yet. */
  href?: string;
  /** Tailwind classes for the section's icon tile. */
  tone: string;
  /** Path prefixes owned by this section — drives the active navbar tab. */
  paths: string[];
  links: PlatformLink[];
}

export const PLATFORM_SECTIONS: PlatformSection[] = [
  {
    id: 'uy-joy',
    title: 'Uy-joy',
    description: 'Uy-joy sotuvi, ijarasi va xarid soʻrovlari',
    icon: Building2,
    tone: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
    paths: ['/uy-joy'],
    links: [
      {
        label: 'Sotuv',
        description: 'Sotiladigan kvartira, hovli va yerlar',
        icon: Tag,
        href: ROUTES.uyJoy.sale,
      },
      {
        label: 'Ijara',
        description: 'Ijaraga beriladigan uy-joylar',
        icon: KeyRound,
        href: ROUTES.uyJoy.rent,
      },
      {
        label: 'Sotib olish',
        description: 'Xaridorlarning uy-joy soʻrovlari',
        icon: HandCoins,
        href: ROUTES.uyJoy.buy,
      },
    ],
  },
  {
    id: 'ish',
    title: 'Ish',
    description: 'Ish qidiring yoki vakansiya va CV joylang',
    icon: Briefcase,
    href: ROUTES.jobs,
    tone: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
    paths: [
      ROUTES.jobs,
      ROUTES.search,
      ROUTES.map,
      ROUTES.create,
      ROUTES.categories,
      ROUTES.applications,
      ROUTES.applicants,
      '/job',
    ],
    links: [
      {
        label: 'Ish qidirish',
        description: 'Filtr va xarita bilan vakansiyalar',
        icon: Search,
        href: ROUTES.jobs,
      },
      {
        label: 'Vakansiya joylash',
        description: 'Xodim topish uchun eʼlon bering',
        icon: PlusCircle,
        href: ROUTES.createJob,
      },
      { label: 'CV joylash', description: 'Rezyumeingizni eʼlon qiling', icon: FileUser },
    ],
  },
  {
    id: 'account',
    title: 'Hisobim',
    description: 'Profil, eʼlonlaringiz va xabarlar',
    icon: UserRound,
    href: ROUTES.profile,
    tone: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
    paths: [
      ROUTES.profile,
      ROUTES.myJobs,
      ROUTES.favorites,
      ROUTES.chat,
      ROUTES.notifications,
      ROUTES.settings,
    ],
    links: [
      { label: 'Profil', description: 'Shaxsiy maʼlumotlar', icon: UserRound, href: ROUTES.profile },
      {
        label: 'Eʼlonlarim',
        description: 'Joylagan eʼlonlaringiz',
        icon: ClipboardList,
        href: ROUTES.myJobs,
      },
      {
        label: 'Saqlanganlar',
        description: 'Saqlab qoʻygan eʼlonlaringiz',
        icon: Bookmark,
        href: ROUTES.favorites,
        navOnly: true,
      },
      { label: 'Chat', description: 'Suhbatlar', icon: MessageCircle, href: ROUTES.chat },
      {
        label: 'Xabarlar va bildirishnomalar',
        description: 'Yangiliklar va eslatmalar',
        icon: Bell,
        href: ROUTES.notifications,
        navOnly: true,
      },
    ],
  },
];

/** Home-page cards — Hisobim is reached from the navbar's profile button instead. */
export const HUB_SECTIONS = PLATFORM_SECTIONS.filter((s) => s.id !== 'account');

/** Which section the current page belongs to — null on the hub and on unrelated pages. */
export function getActiveSectionId(pathname: string | null): PlatformSectionId | null {
  const section = PLATFORM_SECTIONS.find((s) => s.paths.some((p) => isRouteActive(pathname, p)));
  return section?.id ?? null;
}

/** The platform navbar shows either housing or jobs, never both at once. */
export type PlatformMode = 'uy-joy' | 'ish';

/** Ish mode = /home/ish and its views (list, map); every other platform page is Uy-joy. */
export function getPlatformMode(pathname: string | null): PlatformMode {
  return isRouteActive(pathname, ROUTES.jobs) ? 'ish' : 'uy-joy';
}
