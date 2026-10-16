'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Globe, Briefcase, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { UserAvatar } from '@/components/profile/UserAvatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { PROFILE_ROLE_LABELS, LANGUAGE_LABELS } from '@/types';

export function ProfileContent() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="page-container">
      <PageHeader
        title="Profil"
        subtitle={isAuthenticated ? 'Hisob maʼlumotlaringiz' : 'Mehmon sifatida koʻrilmoqda'}
      />

      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <UserAvatar
            src={user.avatarUrl}
            alt={user.name}
            size="xl"
            className="ring-2 ring-[var(--color-primary-light)]"
          />
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="text-xl font-bold text-[var(--color-secondary)]">{user.name}</h2>
            {user.title && (
              <p className="text-[var(--color-muted)] mt-0.5">{user.title}</p>
            )}
            <span className="inline-flex mt-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] px-3 py-1 rounded-full text-xs font-semibold">
              {PROFILE_ROLE_LABELS[user.profileRole]}
            </span>
          </div>
          <Button
            variant="outline"
            className="gap-2 shrink-0"
            onClick={() => router.push('/profile/edit')}
          >
            <Pencil className="w-4 h-4" />
            Tahrirlash
          </Button>
        </div>
      </div>

      <div className="card divide-y divide-[var(--color-border)]">
        <div className="p-4 flex items-center gap-3">
          <Mail className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-[var(--color-muted)]">Email</p>
            <p className="text-sm font-medium text-[var(--color-secondary)] truncate">{user.email}</p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-3">
          <Phone className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
          <div>
            <p className="text-xs text-[var(--color-muted)]">Telefon</p>
            <p className="text-sm font-medium text-[var(--color-secondary)]">
              {user.phone || 'Kiritilmagan'}
            </p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-3">
          <Globe className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
          <div>
            <p className="text-xs text-[var(--color-muted)]">Til</p>
            <p className="text-sm font-medium text-[var(--color-secondary)]">
              {LANGUAGE_LABELS[user.language]}
            </p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
          <div>
            <p className="text-xs text-[var(--color-muted)]">Hisob turi</p>
            <p className="text-sm font-medium text-[var(--color-secondary)]">
              {PROFILE_ROLE_LABELS[user.profileRole]}
            </p>
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="card p-5 mt-6 text-center">
          <p className="text-sm text-[var(--color-muted)] mb-4">
            Profilingizni saqlash uchun tizimga kiring.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button className="w-full sm:w-auto">Kirish</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full sm:w-auto">
                Roʻyxatdan oʻtish
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
