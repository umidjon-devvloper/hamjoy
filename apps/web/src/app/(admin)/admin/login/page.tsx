'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { BarChart3, Eye, EyeOff, FileText, Info, Loader2, Lock, Settings, User, Users } from 'lucide-react';
import {
  DEFAULT_ROLE_PERMISSIONS,
  DEMO_ACCOUNTS,
  loginAdmin,
  ROLE_META,
  roleCan,
  useAdminSession,
  useRolePermissions,
  type Permission,
} from '@/lib/admin/access';
import { firstAllowedAdminHref } from '@/components/admin/AdminShell';
import { Badge } from '@/components/admin/ui';

const FEATURES = [
  { icon: FileText, label: 'Eʼlonlarni boshqarish' },
  { icon: Users, label: 'Foydalanuvchilarni kuzatish' },
  { icon: BarChart3, label: 'Statistika va hisobotlar' },
  { icon: Settings, label: 'Sozlamalar' },
];

const inputClass =
  'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/20';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, ready } = useAdminSession();
  const { permissions } = useRolePermissions();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Only internal admin paths are accepted as a return target.
  const next = searchParams.get('next');
  const target = (role: keyof typeof DEFAULT_ROLE_PERMISSIONS) =>
    next?.startsWith('/admin/') && next !== '/admin/login'
      ? next
      : firstAllowedAdminHref((p: Permission) => roleCan(permissions, role, p));

  useEffect(() => {
    if (ready && session) router.replace(target(session.role));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- redirect once the session is known
  }, [ready, session]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('Login va parolni kiriting');
      return;
    }
    setPending(true);
    try {
      const s = loginAdmin(username, password, remember);
      router.replace(target(s.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kirib boʻlmadi');
      setPending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#0F1F16] p-0 sm:items-center sm:justify-center sm:p-6">
      <Image src="/carousel/uy-joy-hovli.webp" alt="" fill priority sizes="100vw" className="object-cover" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#0A1810]/95 via-[#0A1810]/80 to-[#0A1810]/35" />
      <div className="relative grid w-full max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
        <section className="relative hidden flex-col gap-10 p-6 text-white lg:flex">
          <div>
            <span className="mb-6 flex items-center gap-3">
              <Image src="/brand/hamjoy-logo.png" alt="" width={48} height={48} className="h-12 w-12 rounded-[14px] ring-4 ring-[#D9B25F]/20" />
              <span className="flex flex-col leading-tight">
                <span className="text-lg font-extrabold tracking-[0.06em]">HAMJOY</span>
                <span className="text-[11px] font-bold tracking-[0.24em] text-[var(--color-brand-gold)]">ADMIN PANEL</span>
              </span>
            </span>
            <h1 className="text-[clamp(2.125rem,4vw,3.25rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">Platformani <span className="text-[var(--color-brand-gold-soft)]">tartibda</span> saqlaymiz.</h1>
            <p className="mt-4 max-w-sm text-[17px] text-white/80">Moderatsiya, shikoyatlar va foydalanuvchilar — bitta boshqaruv panelida.</p>
          </div>
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm font-medium">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white/95 p-6 backdrop-blur-xl sm:rounded-[28px] sm:p-9 sm:shadow-[0_50px_100px_-30px_rgb(0_0_0/0.7)]">
          <div className="mb-8">
            <h2 className="text-[28px] font-extrabold tracking-[-0.03em] text-slate-900">Xodimlar uchun kirish</h2>
            <p className="mt-1 text-sm text-slate-500">Tizimga kirish uchun maʼlumotlaringizni kiriting</p>
          </div>

          <form onSubmit={submit} noValidate className="space-y-4">
            <label className="relative block">
              <span className="sr-only">Login</span>
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Login" autoComplete="username" autoFocus className={inputClass} />
            </label>
            <label className="relative block">
              <span className="sr-only">Parol</span>
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parol"
                autoComplete="current-password"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Parolni yashirish' : 'Parolni koʻrsatish'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-[var(--color-primary)]" />
              Meni eslab qolish
            </label>
            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--color-brand-green)] font-bold text-white transition hover:bg-[var(--color-brand-green-deep)] disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Kirish
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Info className="h-4 w-4 text-[var(--color-primary)]" /> Demo kirish maʼlumotlari
            </p>
            <ul className="space-y-1.5">
              {DEMO_ACCOUNTS.map((a) => (
                <li key={a.username}>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername(a.username);
                      setPassword(a.password);
                      setError(null);
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white"
                  >
                    <span className="font-mono text-slate-700">
                      {a.username} / {a.password}
                    </span>
                    <Badge tone={ROLE_META[a.role].tone}>{ROLE_META[a.role].label}</Badge>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">Hozircha backend yoʻq — maʼlumotlar faqat shu brauzerda saqlanadi.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
