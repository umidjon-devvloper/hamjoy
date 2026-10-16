'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DESKTOP_NAV_ITEMS, isRouteActive, ROUTES } from '@/lib/navigation/routes';
import { usersService } from '@/services';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { PostListingButton } from '@/components/layout/PostListingButton';

export function DesktopNavigation() {
  const pathname = usePathname();
  const currentUser = usersService.getCurrentUser();

  return (
    <aside className="hidden md:flex flex-col w-[17.5rem] lg:w-72 h-screen border-r border-[var(--color-border)] bg-white sticky top-0 shrink-0">
      <div className="p-6 border-b border-[var(--color-border)]">
        <Link href={ROUTES.home} className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[var(--color-primary)] text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/25">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold text-[var(--color-secondary)] tracking-tight block leading-tight">
              HamJoy
            </span>
            <span className="text-[10px] font-medium text-[var(--color-success)] uppercase tracking-wider">
              Ish topish oson
            </span>
          </div>
        </Link>
      </div>

      <div className="p-4">
        <PostListingButton />
      </div>

      <nav className="flex-1 px-3 overflow-y-auto hide-scrollbar" aria-label="Desktop navigation">
        <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2 px-3">
          Menyu
        </p>
        <div className="flex flex-col gap-0.5">
          {DESKTOP_NAV_ITEMS.map((item) => {
            const isActive = isRouteActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
                  isActive
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'text-[var(--color-muted)] hover:bg-gray-50 hover:text-[var(--color-secondary)]'
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-[var(--color-border)]">
        <Link href={ROUTES.profile} className="card card-hover p-3 flex items-center gap-3">
          <UserAvatar src={currentUser.avatarUrl} alt={currentUser.name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-secondary)] truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-[var(--color-success)] font-medium truncate">
              {currentUser.badge}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
