import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Bookmark,
  Plus,
  MessageCircle,
  Settings,
  Search,
  Map,
  FileText,
  Users,
  Briefcase,
} from 'lucide-react';

/** Single source of truth for app paths — avoids typos and eases Django deep-link parity later. */
export const ROUTES = {
  /** Platform hub — every section (Uy-joy, Ish, Account) branches out from here. */
  home: '/home',
  /** Ish rejimi — bosh sahifa navbar ostida faqat ish eʼlonlarini koʻrsatadi (`/ish` shu yerga yoʻnaltiriladi). */
  jobs: '/home/ish',
  search: '/search',
  /** Ishlar xaritasi, Ish rejimining bir koʻrinishi (`/map` shu yerga yoʻnaltiriladi). */
  map: '/home/ish/xarita',
  favorites: '/favorites',
  applications: '/applications',
  applicants: '/applicants',
  /** Single posting entry — asks Ish or Uy-joy first. */
  create: '/create',
  createJob: '/create?tur=ish',
  createListing: '/create?tur=uy-joy',
  chat: '/chat',
  settings: '/settings',
  profile: '/profile',
  myJobs: '/my-jobs',
  notifications: '/notifications',
  categories: '/categories',
  /** Uy-joy listings — placeholders until the listing UI ships (see app/uy-joy/[bolim]). */
  uyJoy: {
    sale: '/uy-joy/sotuv',
    rent: '/uy-joy/ijara',
    buy: '/uy-joy/olish',
    newBuildings: '/uy-joy/yangi-uylar',
  },
  login: '/login',
  register: '/register',
  job: (id: string) => `/job/${id}`,
  listing: (id: string) => `/uy-joy/elon/${id}`,
  chatThread: (id: string) => `/chat/${id}`,
} as const;

export interface NavItemConfig {
  href: string;
  icon: LucideIcon;
  label: string;
  /** Shown in mobile bottom bar as elevated center action */
  isCenter?: boolean;
}

export const MOBILE_NAV_ITEMS: NavItemConfig[] = [
  { href: ROUTES.home, icon: Home, label: 'Asosiy' },
  { href: ROUTES.jobs, icon: Briefcase, label: 'Ishlar' },
  { href: ROUTES.createJob, icon: Plus, label: 'Joylash', isCenter: true },
  { href: ROUTES.chat, icon: MessageCircle, label: 'Suhbat' },
  { href: ROUTES.settings, icon: Settings, label: 'Sozlama' },
];

export const DESKTOP_NAV_ITEMS: NavItemConfig[] = [
  { href: ROUTES.home, icon: Home, label: 'Bosh sahifa' },
  { href: ROUTES.jobs, icon: Briefcase, label: 'Ishlar' },
  { href: ROUTES.search, icon: Search, label: 'Qidiruv' },
  { href: ROUTES.map, icon: Map, label: 'Xarita' },
  { href: ROUTES.favorites, icon: Bookmark, label: 'Saqlangan' },
  { href: ROUTES.applications, icon: FileText, label: 'Arizalarim' },
  { href: ROUTES.applicants, icon: Users, label: 'Nomzodlar' },
  { href: ROUTES.chat, icon: MessageCircle, label: 'Xabarlar' },
  { href: ROUTES.settings, icon: Settings, label: 'Sozlamalar' },
];

/**
 * Active state for nav links. Home is exact-match only so /job/[id] does not highlight Home.
 */
export function isRouteActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === ROUTES.home) return pathname === ROUTES.home;
  return pathname === href || pathname.startsWith(`${href}/`);
}
