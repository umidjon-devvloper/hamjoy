'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Briefcase,
  ChevronDown,
  ExternalLink,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareWarning,
  Settings,
  ShieldCheck,
  Star,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { logoutAdmin, ROLE_META, useAdminSession, useCan, type Permission } from '@/lib/admin/access';
import { adminService } from '@/services/admin.service';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { ROUTES } from '@/lib/navigation/routes';
import { cn } from '@/lib/utils';
import { NoAccess } from './ui';

export const ADMIN_NAV: { href: string; label: string; icon: LucideIcon; permission?: Permission; badgeKey?: string }[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users, permission: 'users.view' },
  { href: '/admin/listings', label: 'Eʼlonlar', icon: Home, permission: 'listings.view', badgeKey: 'listings' },
  { href: '/admin/jobs', label: 'Vakansiyalar', icon: Briefcase, permission: 'jobs.view', badgeKey: 'jobs' },
  { href: '/admin/reports', label: 'Shikoyatlar', icon: MessageSquareWarning, permission: 'reports.view', badgeKey: 'reports' },
  { href: '/admin/reviews', label: 'Sharhlar', icon: Star, permission: 'reports.view' },
  { href: '/admin/verifications', label: 'Verifikatsiyalar', icon: ShieldCheck, permission: 'reports.view' },
  { href: '/admin/roles', label: 'Rollar', icon: ShieldCheck },
  { href: '/admin/settings', label: 'Sozlamalar', icon: Settings, permission: 'settings.manage' },
];

/** First page the signed-in role may open — where login lands. */
export function firstAllowedAdminHref(can: (p: Permission) => boolean): string {
  return ADMIN_NAV.find((n) => !n.permission || can(n.permission))?.href ?? '/admin/roles';
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const can = useCan();
  const { session } = useAdminSession();

  return (
    <div className="flex h-full flex-col bg-[#0F1F16] text-white/80">
      <Link href="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 px-5 pb-5 pt-6 text-white">
        <Image src="/brand/hamjoy-logo.png" alt="" width={36} height={36} className="h-9 w-9 rounded-[10px]" />
        <span className="flex flex-col leading-tight">
          <span className="font-extrabold tracking-[0.04em]">HAMJOY</span>
          <span className="text-[11px] font-bold tracking-[0.18em] text-[var(--color-brand-gold)]">ADMIN</span>
        </span>
      </Link>

      <nav aria-label="Admin menyu" className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {ADMIN_NAV.filter((n) => !n.permission || can(n.permission)).map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-11 items-center gap-2.5 rounded-xl px-2.5 text-sm font-semibold transition-colors',
                active ? 'bg-[var(--color-brand-green)] text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
              )}
            >
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]', active ? 'bg-white/15' : 'bg-white/[0.06]')}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {session && (
        <div className="m-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-gold)] font-extrabold text-[var(--color-ink-on-gold)]">
            {session.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{session.name}</p>
            <p className="text-xs text-white/70">{ROLE_META[session.role].label}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileMenu() {
  const router = useRouter();
  const { session } = useAdminSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!session) return null;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-slate-100"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F1F16] font-bold text-white">
          {session.name.charAt(0)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold text-slate-900">{session.name}</span>
          <span className="block text-xs text-slate-500">{ROLE_META[session.role].label}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <Link href={ROUTES.home} target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
            <ExternalLink className="h-4 w-4" /> Saytni ochish
          </Link>
          <button
            type="button"
            onClick={() => {
              logoutAdmin();
              router.replace('/admin/login');
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Chiqish
          </button>
        </div>
      )}
    </div>
  );
}

/** Admin layout: session gate, sidebar (drawer on mobile), top bar and a per-page permission check. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, ready } = useAdminSession();
  const can = useCan();
  const [drawer, setDrawer] = useState(false);
  const reports = useAsyncQuery(() => adminService.listReports(), [], []);
  const pendingReports = reports.data.filter((r) => r.status === 'pending').length;

  useEffect(() => {
    if (ready && !session) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, session, pathname, router]);

  if (!ready || !session) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] text-sm text-slate-500">Yuklanmoqda…</div>;
  }

  const current = ADMIN_NAV.find((n) => pathname.startsWith(n.href));
  const allowed = !current?.permission || can(current.permission);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar onNavigate={() => {}} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menyu">
          <button type="button" aria-label="Menyuni yopish" onClick={() => setDrawer(false)} className="absolute inset-0 bg-slate-900/50" />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw]">
            <Sidebar onNavigate={() => setDrawer(false)} />
            <button type="button" onClick={() => setDrawer(false)} aria-label="Yopish" className="absolute right-3 top-5 text-slate-300">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button type="button" onClick={() => setDrawer(true)} aria-label="Menyuni ochish" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <p className="truncate text-sm font-semibold text-slate-500">{current?.label ?? 'Admin Panel'}</p>
          <div className="ml-auto flex items-center gap-2">
            {can('reports.view') && (
              <Link href="/admin/reports" aria-label={`Murojaatlar, ${pendingReports} ta yangi`} className="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100">
                <Bell className="h-5 w-5" />
                {pendingReports > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {pendingReports}
                  </span>
                )}
              </Link>
            )}
            <ProfileMenu />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{allowed ? children : <NoAccess />}</main>
      </div>
    </div>
  );
}
