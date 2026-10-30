'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Briefcase,
  Building2,
  Car,
  Check,
  ChevronDown,
  Gift,
  Globe,
  Heart,
  LogIn,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  UserRound,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/navigation/routes';
import { getPlatformMode, PLATFORM_SECTIONS, type PlatformLink, type PlatformMode } from '@/lib/navigation/platform';
import { useNotifications } from '@/context/NotificationsContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { appToast } from '@/lib/feedback/toast';
import { useTheme } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';
import type { AppLanguage } from '@/types';
import { CategoryBar, MobileCategoryMenu } from './CategoryBar';

function getPostLinks(t: { nav_post_rent: string; nav_post_rent_desc: string; nav_post_job: string; nav_post_job_desc: string }): PlatformLink[] {
  return [
    {
      label: t.nav_post_rent,
      description: t.nav_post_rent_desc,
      icon: Building2,
      href: `${ROUTES.createListing}&bitim=ijara`,
    },
    { label: t.nav_post_job, description: t.nav_post_job_desc, icon: Briefcase, href: ROUTES.createJob },
  ];
}

const LANGUAGES: { code: AppLanguage; display: string; label: string }[] = [
  { code: 'uz', display: 'UZ', label: 'Oʻzbekcha' },
  { code: 'ru', display: 'RU', label: 'Русский' },
  { code: 'en', display: 'EN', label: 'English' },
];

type MenuId = 'lang' | 'post';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-green)]/50';

const iconButton = cn(
  'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--nav-fg-muted)] transition-colors hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)]',
  focusRing
);

const panelMotion = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
  transition: { duration: 0.14, ease: 'easeOut' as const },
};

const panelClass =
  'absolute top-full z-50 mt-2 rounded-2xl border border-[var(--nav-border)] bg-[var(--nav-panel)] p-1.5 text-[var(--nav-fg)] shadow-[0_18px_45px_-10px_var(--nav-shadow)]';

function Tooltip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      role="tooltip"
      className={cn(
        'pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--nav-fg)] px-2 py-1 text-xs font-medium text-[var(--nav-bg)] opacity-0 shadow-lg transition-opacity delay-300 group-hover:opacity-100 group-focus-visible:opacity-100',
        className
      )}
    >
      {label}
    </span>
  );
}

function MenuLink({ link, onNavigate }: { link: PlatformLink; onNavigate: () => void }) {
  const Icon = link.icon;
  const { t } = useI18n();
  const body = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--nav-hover)] text-[var(--nav-accent)]">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{link.label}</span>
        <span className="block truncate text-xs text-[var(--nav-fg-subtle)]">{link.description}</span>
      </span>
      {!link.href && (
        <span className="shrink-0 rounded-full bg-[var(--nav-hover)] px-2 py-0.5 text-[10px] font-semibold text-[var(--nav-fg-subtle)]">
          {t.coming_soon}
        </span>
      )}
    </>
  );

  if (!link.href) {
    return (
      <div
        aria-disabled="true"
        className="flex cursor-not-allowed items-center gap-3 rounded-xl px-2.5 py-2 opacity-70"
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)]',
        focusRing
      )}
    >
      {body}
    </Link>
  );
}

/**
 * Header shortcut: icon + label (+ count), like a store's "Kirish · Saralangan · Savat".
 * Below xl the label collapses into a tooltip and the count moves onto the icon.
 */
function NavAction({
  href,
  label,
  icon: Icon,
  count = 0,
  countLabel,
  active,
  onClick,
  className,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  /** Screen-reader suffix for the count, e.g. "ta oʻqilmagan". */
  countLabel?: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  const badge = count > 99 ? '99+' : String(count);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      aria-label={count > 0 ? `${label}, ${count} ${countLabel ?? 'ta'}` : label}
      className={cn(
        'group relative flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-2.5 text-[var(--nav-fg-muted)] transition-colors hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)] 2xl:px-3',
        active && 'bg-[var(--nav-hover)] text-[var(--nav-accent)]',
        focusRing,
        className
      )}
    >
      <span className="relative flex">
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
        {count > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-brand-green)] px-1 text-[10px] font-bold text-white ring-2 ring-[var(--nav-bg)] 2xl:hidden">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </span>
      <span className="hidden whitespace-nowrap text-[15px] font-medium 2xl:inline">{label}</span>
      {count > 0 && (
        <span
          aria-hidden
          className="hidden h-5 min-w-5 items-center justify-center rounded-md bg-[var(--color-brand-green)] px-1.5 text-xs font-bold text-white 2xl:inline-flex"
        >
          {badge}
        </span>
      )}
      <Tooltip label={label} className="2xl:hidden" />
    </Link>
  );
}

/** Mobile: the desktop tab row is hidden, so the Uy-joy / Ish switch sits above the search. */
function ModeSwitch({ mode, onNavigate }: { mode: PlatformMode; onNavigate: () => void }) {
  const options: { id: PlatformMode; href: string; label: string; icon: typeof Building2 }[] = [
    { id: 'uy-joy', href: ROUTES.home, label: 'Uy-joy', icon: Building2 },
    { id: 'ish', href: ROUTES.jobs, label: 'Ish', icon: Briefcase },
  ];
  return (
    <nav aria-label="Boʻlim" className="mb-3 grid grid-cols-2 gap-1 rounded-xl border border-[var(--nav-border)] p-1">
      {options.map(({ id, href, label, icon: Icon }) => (
        <Link
          key={id}
          href={href}
          onClick={onNavigate}
          aria-current={mode === id ? 'page' : undefined}
          className={cn(
            'flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors',
            mode === id
              ? 'bg-[var(--nav-accent)] text-[var(--nav-bg)]'
              : 'text-[var(--nav-fg-muted)] hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)]',
            focusRing
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function NavSearch({
  className,
  onSubmitted,
  placeholder,
  enableShortcut = false,
}: {
  className?: string;
  onSubmitted: () => void;
  placeholder: string;
  /** Focus with "/" — only on the desktop instance so two inputs don't compete. */
  enableShortcut?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!enableShortcut) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enableShortcut]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    // Results open in Ish mode, under this navbar.
    router.push(q ? `${ROUTES.jobs}?q=${encodeURIComponent(q)}` : ROUTES.jobs);
    inputRef.current?.blur();
    onSubmitted();
  };

  return (
    <form role="search" onSubmit={submit} className={cn('group/search relative', className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--nav-fg-subtle)] transition-colors group-focus-within/search:text-[var(--nav-accent)]" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Qidirish"
        enterKeyHint="search"
        className="h-11 w-full rounded-[14px] border border-transparent bg-[var(--nav-field)] pl-11 pr-12 text-sm text-[var(--nav-fg)] outline-none transition-[border-color,background-color,box-shadow] placeholder:text-[var(--nav-fg-subtle)] hover:border-[var(--nav-fg-subtle)]/40 focus:border-[var(--color-brand-green)]/50 focus:bg-[var(--nav-field-focus)] focus:shadow-[0_0_0_4px_rgb(31_107_63/0.12)] [&::-webkit-search-cancel-button]:hidden"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          aria-label="Tozalash"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--nav-fg-subtle)] hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)]"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        enableShortcut && (
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-[var(--nav-border)] px-1.5 py-0.5 font-sans text-[11px] text-[var(--nav-fg-subtle)]">
            /
          </kbd>
        )
      )}
    </form>
  );
}

export function PlatformNavbar() {
  const pathname = usePathname();
  // Ish mode shows jobs only: no Sotuv / Ijara tabs, posting, or housing menu entries.
  const mode = getPlatformMode(pathname);
  const { lang, setLang, t } = useI18n();
  const searchPlaceholder = mode === 'ish' ? t.nav_search_placeholder_jobs : t.nav_search_placeholder_home;
  const allPostLinks = getPostLinks(t);
  const postLinks = mode === 'ish' ? allPostLinks.filter((l) => l.href === ROUTES.createJob) : allPostLinks;
  const menuSections = mode === 'ish' ? PLATFORM_SECTIONS.filter((s) => s.id !== 'uy-joy') : PLATFORM_SECTIONS;
  const user = useCurrentUser();
  const { unreadCount } = useNotifications();
  const { favoriteIds } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const themeLabel = isDark ? t.nav_light_mode : t.nav_dark_mode;
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const langButtonRef = useRef<HTMLButtonElement>(null);
  const postButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  // Elevate the bar once the page scrolls under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on outside click and on Escape.
  useEffect(() => {
    if (!openMenu && !mobileOpen) return;
    const close = () => {
      setOpenMenu(null);
      setMobileOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const trigger =
        openMenu === 'lang'
          ? langButtonRef.current
          : openMenu === 'post'
            ? postButtonRef.current
            : mobileButtonRef.current;
      close();
      trigger?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openMenu, mobileOpen]);

  // The mobile sheet covers the page — stop the page behind it from scrolling.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const toggle = (id: MenuId) => setOpenMenu((current) => (current === id ? null : id));

  const pickLanguage = (code: AppLanguage) => {
    setLang(code);
    setOpenMenu(null);
  };


  return (
    <MotionConfig reducedMotion="user">
      <header
        ref={navRef}
        className={cn(
          'sticky top-0 z-40 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] text-[var(--nav-fg)] transition-[background-color,color,box-shadow] duration-300',
          scrolled ? 'shadow-[0_8px_24px_var(--nav-shadow)]' : 'shadow-none'
        )}
      >
        <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
          {/* Brand */}
          <Link
            href={ROUTES.home}
            onClick={closeAll}
            className={cn('flex shrink-0 items-center gap-3 rounded-xl', focusRing)}
            aria-label="HamJoy — bosh sahifa"
          >
            <Image
              src="/brand/hamjoy-logo.png"
              alt=""
              width={44}
              height={44}
              loading="eager"
              className="h-11 w-11 rounded-[10px] shadow-md shadow-black/20"
            />
            <span className="hidden flex-col leading-none min-[380px]:flex">
              <span className="text-[17px] font-extrabold tracking-wide">HAMJOY</span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--nav-accent)]">
                Uy-joy · Ish
              </span>
            </span>
          </Link>

          {/* Uy-joy / Ish — the two halves of the platform */}
          <nav
            aria-label="Boʻlimlar"
            className="ml-2 hidden items-center gap-0.5 rounded-full bg-[var(--nav-field)] p-1 lg:flex"
          >
            {(
              [
                { id: 'uy-joy', href: ROUTES.home, label: 'Uy-joy', icon: Building2 },
                { id: 'ish', href: ROUTES.jobs, label: 'Ish', icon: Briefcase },
              ] as const
            ).map(({ id, href, label, icon: Icon }) => (
              <Link
                key={id}
                href={href}
                onClick={closeAll}
                aria-current={mode === id ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors',
                  mode === id
                    ? 'bg-[var(--color-brand-green)] text-white'
                    : 'text-[var(--nav-fg-muted)] hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)]',
                  focusRing
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Language + theme, grouped in one pill */}
          <div className="ml-1 hidden items-center rounded-xl p-0.5 xl:flex">
            <div className="relative">
              <button
                type="button"
                ref={langButtonRef}
                onClick={() => toggle('lang')}
                aria-expanded={openMenu === 'lang'}
                aria-controls="nav-lang-panel"
                aria-label="Tilni tanlash"
                className={cn(
                  'inline-flex h-9 items-center gap-1.5 rounded-[10px] px-2.5 text-sm font-bold text-[var(--nav-fg-muted)] transition-colors hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)]',
                  openMenu === 'lang' && 'bg-[var(--nav-hover)] text-[var(--nav-fg)]',
                  focusRing
                )}
              >
                <Globe className="h-[18px] w-[18px]" />
                {LANGUAGES.find((l) => l.code === lang)?.display ?? 'UZ'}
                <ChevronDown
                  className={cn('h-3.5 w-3.5 transition-transform', openMenu === 'lang' && 'rotate-180')}
                />
              </button>
              <AnimatePresence>
                {openMenu === 'lang' && (
                  <motion.div id="nav-lang-panel" {...panelMotion} className={cn(panelClass, 'left-0 w-56 origin-top-left')}>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        aria-current={l.code === lang ? 'true' : undefined}
                        onClick={() => pickLanguage(l.code)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)]',
                          l.code === lang && 'bg-[var(--nav-hover)]',
                          focusRing
                        )}
                      >
                        <span className="w-7 text-xs font-bold">{l.display}</span>
                        <span className="flex-1">{l.label}</span>
                        {l.code === lang && (
                          <Check className="h-4 w-4 text-[var(--nav-accent)]" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="mx-0.5 h-5 w-px bg-[var(--nav-border)]" aria-hidden />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeLabel}
              aria-pressed={isDark}
              className={cn(
                'group relative flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--nav-fg-muted)] transition-colors hover:bg-[var(--nav-hover)] hover:text-[var(--nav-hover-fg)]',
                focusRing
              )}
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              <Tooltip label={themeLabel} />
            </button>
          </div>

          <NavSearch
            className="mx-3 hidden max-w-2xl flex-1 lg:block"
            onSubmitted={closeAll}
            placeholder={searchPlaceholder}
            enableShortcut
          />

          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            {isAuthenticated ? (
              <NavAction
                href={ROUTES.profile}
                label={t.nav_my_account}
                icon={UserRound}
                active={isActive(ROUTES.profile)}
                onClick={closeAll}
              />
            ) : (
              <NavAction
                href={ROUTES.login}
                label={t.nav_login}
                icon={UserRound}
                active={isActive(ROUTES.login)}
                onClick={closeAll}
              />
            )}
            {isAuthenticated && (
              <NavAction
                href={ROUTES.favorites}
                label={t.nav_saved}
                icon={Heart}
                count={favoriteIds.size}
                countLabel={t.saved_count}
                active={isActive(ROUTES.favorites)}
                onClick={closeAll}
                className="hidden sm:flex"
              />
            )}
            {isAuthenticated && (
              <NavAction
                href={ROUTES.notifications}
                label={t.nav_notifications}
                icon={Bell}
                count={unreadCount}
                countLabel={t.unread_count}
                active={isActive(ROUTES.notifications)}
                onClick={closeAll}
              />
            )}

            {/* Post a listing — the primary action. Non-authenticated viewers
                are routed to /login so posting is only ever attempted with an
                account; the dropdown of post kinds opens once signed in. */}
            <div className="relative ml-1">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    toggle('post');
                  }}
                  ref={postButtonRef}
                  aria-expanded={openMenu === 'post'}
                  aria-controls="nav-post-panel"
                  aria-label={t.nav_post}
                  className={cn(
                    'inline-flex h-10 items-center gap-2 rounded-[14px] bg-[var(--color-brand-green)] px-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-brand-green-deep)] sm:h-11 sm:px-5',
                    focusRing
                  )}
                >
                  <Plus className="h-[18px] w-[18px]" strokeWidth={2.75} />
                  <span className="hidden sm:inline">{t.nav_post}</span>
                </button>
              ) : (
                <Link
                  href={ROUTES.login}
                  onClick={closeAll}
                  aria-label={t.nav_login}
                  className={cn(
                    'inline-flex h-10 items-center gap-2 rounded-[14px] bg-[var(--color-brand-green)] px-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-brand-green-deep)] sm:h-11 sm:px-5',
                    focusRing
                  )}
                >
                  <LogIn className="h-[18px] w-[18px]" strokeWidth={2.5} />
                  <span className="hidden sm:inline">{t.nav_login}</span>
                </Link>
              )}
              <AnimatePresence>
                {isAuthenticated && openMenu === 'post' && (
                  <motion.div
                    id="nav-post-panel"
                    {...panelMotion}
                    className={cn(
                      panelClass,
                      'origin-top-right',
                      // Phones: pin to the viewport so the panel never overflows the left edge.
                      'max-sm:fixed max-sm:inset-x-4 max-sm:top-[4.5rem] max-sm:mt-0 sm:right-0 sm:w-80'
                    )}
                  >
                    <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-[var(--nav-fg-subtle)]">
                      {t.nav_post_what}
                    </p>
                    {postLinks.map((link) => (
                      <MenuLink key={link.label} link={link} onNavigate={closeAll} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                setMobileOpen((v) => !v);
              }}
              ref={mobileButtonRef}
              aria-expanded={mobileOpen}
              aria-controls="platform-mobile-menu"
              aria-label={mobileOpen ? t.nav_menu_close : t.nav_menu_open}
              className={cn(iconButton, 'lg:hidden', mobileOpen && 'bg-[var(--nav-hover)] text-[var(--nav-fg)]')}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>


        {/* Below lg the search gets its own full-width row */}
        <div className="px-4 pb-3 sm:px-6 lg:hidden">
          <ModeSwitch mode={mode} onNavigate={closeAll} />
          <NavSearch onSubmitted={closeAll} placeholder={searchPlaceholder} />
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="platform-mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden lg:hidden"
            >
              <div className="max-h-[calc(100dvh-8.5rem)] overflow-y-auto px-4 pb-6 pt-3 sm:px-6">
                {isAuthenticated ? (
                  <Link
                    href={ROUTES.profile}
                    onClick={closeAll}
                    className="mb-2 flex items-center gap-3 rounded-2xl bg-[var(--nav-hover)] p-3 sm:hidden"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--nav-hover)] text-[var(--nav-accent)]">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{user.name}</span>
                      <span className="block text-xs text-[var(--nav-fg-subtle)]">{t.nav_view_profile}</span>
                    </span>
                  </Link>
                ) : (
                  <Link
                    href={ROUTES.login}
                    onClick={closeAll}
                    className="mb-2 flex items-center gap-3 rounded-2xl bg-[var(--color-brand-green)] p-3 text-white sm:hidden"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                      <UserRound className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{t.nav_login_register}</span>
                      <span className="block text-xs text-white/80">{t.nav_login_register_desc}</span>
                    </span>
                  </Link>
                )}
                {isAuthenticated && (
                  <Link
                    href={ROUTES.favorites}
                    onClick={closeAll}
                    className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-semibold hover:bg-[var(--nav-hover)] sm:hidden hover:text-[var(--nav-hover-fg)]"
                  >
                    <Heart className="h-[18px] w-[18px] text-[var(--nav-accent)]" />
                    {t.nav_saved}
                  </Link>
                )}

                <MobileCategoryMenu mode={mode} onNavigate={closeAll} />

                {menuSections.map((section) => (
                  <div key={section.id} className="mt-3 border-t border-[var(--nav-border)] pt-3">
                    <p className="mb-1 px-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--nav-fg-subtle)]">
                      {section.title}
                    </p>
                    {section.links.map((link) => (
                      <MenuLink key={link.label} link={link} onNavigate={closeAll} />
                    ))}
                  </div>
                ))}

                                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--nav-border)] pt-4">
                  <button
                    type="button"
                    onClick={() => toggle('lang')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--nav-hover)] py-2.5 text-sm font-semibold"
                  >
                    <Globe className="h-4 w-4" /> {LANGUAGES.find((l) => l.code === lang)?.label}
                  </button>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-pressed={isDark}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--nav-hover)] py-2.5 text-sm font-semibold"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} {themeLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CategoryBar mode={mode} />
      </header>
    </MotionConfig>
  );
}
