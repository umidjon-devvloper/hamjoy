'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Bell,
  Shield,
  CircleHelp,
  LogOut,
  ChevronRight,
  Globe,
  Briefcase,
  Pencil,
} from 'lucide-react';
import { appToast } from '@/lib/feedback/toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { NotificationSettingsPanel } from '@/components/profile/NotificationSettingsPanel';
import { LanguageSelector } from '@/components/profile/LanguageSelector';
import { useAuth } from '@/context/AuthContext';
import { isAuthOptional } from '@/lib/auth/config';
import { LANGUAGE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

export function SettingsContent() {
  const router = useRouter();
  const { user, isAuthenticated, isMockAuth, isAdmin, logout, updateProfile } = useAuth();

  const menuItems = [
    { icon: User, label: 'Profilni koʻrish', href: '/profile', description: 'Ommaviy profilingiz' },
    { icon: Pencil, label: 'Profilni tahrirlash', href: '/profile/edit', description: 'Ism, telefon, rasm, rol' },
    { icon: Briefcase, label: 'Mening eʼlonlarim', href: '/my-jobs', description: 'Eʼlonlaringizni boshqaring' },
    ...(isAdmin
      ? [{ icon: Shield, label: 'Admin panel', href: '/admin', description: 'Moderatsiya va boshqaruv' }]
      : [{ icon: Shield, label: 'Maxfiylik va xavfsizlik', href: '#', description: 'Parol, maʼlumotlar (tez orada)' }]),
    { icon: CircleHelp, label: 'Yordam', href: '#', description: 'Savol-javob, biz bilan aloqa' },
  ];

  const handleLogout = async () => {
    await logout();
    appToast.success('Chiqildi');
    router.push('/login');
  };

  const handleNotificationChange = async (
    key: keyof typeof user.notifications,
    value: boolean
  ) => {
    try {
      await updateProfile({ notifications: { [key]: value } });
      appToast.saved('Notification preference');
    } catch (err) {
      appToast.error(err, 'Could not save preference');
    }
  };

  const handleLanguageChange = async (language: typeof user.language) => {
    try {
      await updateProfile({ language });
      appToast.saved('Language preference');
    } catch (err) {
      appToast.error(err, 'Could not save language');
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="Sozlamalar" subtitle="Hisob, bildirishnomalar va sozlamalar" />

      <Link href="/profile" className="card p-6 mb-6 flex items-center gap-4 card-hover">
        <UserAvatar
          src={user.avatarUrl}
          alt={user.name}
          size="xl"
          className="ring-2 ring-[var(--color-primary-light)] shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-[var(--color-secondary)] truncate">{user.name}</h2>
          <p className="text-[var(--color-muted)] truncate">{user.email}</p>
          {user.badge && (
            <span className="inline-flex mt-2 bg-[var(--color-success-light)] text-[var(--color-success)] px-3 py-1 rounded-full text-xs font-semibold">
              {user.badge}
            </span>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
      </Link>

      {isMockAuth && (
        <div className="card p-4 mb-6 border-amber-200 bg-amber-50 text-sm text-amber-900">
          Mock auth is active. Set Firebase env vars and NEXT_PUBLIC_AUTH_PROVIDER=firebase for production.
        </div>
      )}

      <div className="card overflow-hidden mb-6 divide-y divide-[var(--color-border)]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-[var(--color-secondary)] block text-sm">
                    {item.label}
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">{item.description}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>

      <div className="card p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-secondary)]">Bildirishnomalar</h3>
        </div>
        <NotificationSettingsPanel
          settings={user.notifications}
          onChange={handleNotificationChange}
        />
      </div>

      <div className="card p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-[var(--color-primary)]" />
          <h3 className="font-semibold text-[var(--color-secondary)]">Til</h3>
        </div>
        <LanguageSelector value={user.language} onChange={handleLanguageChange} />
        <p className="text-xs text-[var(--color-muted)] mt-2">
          Joriy: {LANGUAGE_LABELS[user.language]}
        </p>
      </div>

      {isAuthOptional() ? null : isAuthenticated ? (
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'w-full py-3.5 card flex items-center justify-center gap-2',
            'text-red-500 font-semibold hover:bg-red-50 hover:border-red-200 transition-colors'
          )}
        >
          <LogOut className="w-5 h-5" />
          <span>Chiqish</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Link href="/login" className="block">
            <button
              type="button"
              className="w-full py-3.5 card font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/30 transition-colors"
            >
              Kirish
            </button>
          </Link>
          <Link href="/register" className="block">
            <button
              type="button"
              className="w-full py-3.5 card font-semibold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Roʻyxatdan oʻtish
            </button>
          </Link>
        </div>
      )}

      <p className="text-center text-xs text-[var(--color-muted)] mt-8">
        <Link href="/legal/privacy" className="hover:text-[var(--color-primary)]">
          Maxfiylik
        </Link>
        {' · '}
        <Link href="/legal/terms" className="hover:text-[var(--color-primary)]">
          Shartlar
        </Link>
      </p>
    </div>
  );
}
