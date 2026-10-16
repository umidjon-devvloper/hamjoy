'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart3, Eye, EyeOff, FileText, Home, Info, Loader2, Lock, Settings, User, Users } from 'lucide-react';
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
  'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20';

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
    <div className="flex min-h-screen bg-slate-100 p-0 sm:items-center sm:justify-center sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden bg-white shadow-xl sm:rounded-3xl lg:grid-cols-2">
        <section className="relative hidden flex-col justify-between bg-[#0B1B3F] p-10 text-white lg:flex">
          <div>
            <Home className="mb-6 h-10 w-10" />
            <h1 className="text-3xl font-bold">Boshqaruv paneli</h1>
            <p className="mt-3 max-w-xs text-slate-300">Saytingizni boshqaring — oddiy, tez va qulay.</p>
          </div>
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm font-medium">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mb-8 text-center">
            <Home className="mx-auto mb-3 h-9 w-9 text-[#0B1B3F]" />
            <h2 className="text-2xl font-bold text-slate-900">Admin Panel</h2>
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
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-blue-600" />
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
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0B1B3F] font-semibold text-white transition hover:bg-[#13275A] disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Kirish
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Info className="h-4 w-4 text-blue-600" /> Demo kirish maʼlumotlari
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
