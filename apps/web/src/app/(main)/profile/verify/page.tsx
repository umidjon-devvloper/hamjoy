'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, Clock, Upload, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { appToast } from '@/lib/feedback/toast';
import { joymeeTokens } from '@/lib/joymee/client';
import { joymeeUploads } from '@/lib/joymee/uploads';
import { useAuth } from '@/context/AuthContext';
import { isRestBackendEnabled } from '@/lib/api/config';
import { cn } from '@/lib/utils';

const base = () => process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';

async function authHeader(): Promise<Record<string, string>> {
  const token = await joymeeTokens.getAccess();
  return token
    ? { authorization: `Bearer ${token}`, 'content-type': 'application/json' }
    : { 'content-type': 'application/json' };
}

interface Verification {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  note: string | null;
  idDocumentUrl: string;
  selfieUrl: string;
  createdAt: string;
}

const STATUS_UI: Record<Verification['status'], { label: string; icon: typeof Clock; cls: string }> = {
  pending: {
    label: 'Tekshiruvda',
    icon: Clock,
    cls: 'bg-[var(--color-accent-light)] text-[var(--color-accent)]',
  },
  approved: {
    label: 'Tasdiqlangan',
    icon: BadgeCheck,
    cls: 'bg-[var(--color-primary-light)] text-[var(--color-brand-green)]',
  },
  rejected: {
    label: 'Rad etilgan',
    icon: XCircle,
    cls: 'bg-[#FBECEB] text-[#B42318]',
  },
};

function VerifyForm() {
  const { user } = useAuth();
  const [current, setCurrent] = useState<Verification | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [idDoc, setIdDoc] = useState('');
  const [selfie, setSelfie] = useState('');
  const [uploading, setUploading] = useState<'id' | 'selfie' | null>(null);
  const [uploadsEnabled, setUploadsEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const idRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isRestBackendEnabled()) return;
    void joymeeUploads.enabled().then(setUploadsEnabled);
  }, []);

  const pickAndUpload = async (which: 'id' | 'selfie', file: File) => {
    setUploading(which);
    try {
      const url = await joymeeUploads.upload('verify', file);
      if (which === 'id') setIdDoc(url);
      else setSelfie(url);
      appToast.success('Yuklandi');
    } catch (err) {
      appToast.error(err, "Yuklab bo'lmadi");
    } finally {
      setUploading(null);
    }
  };

  const load = async () => {
    try {
      const res = await fetch(`${base()}/users/me/verify`, { headers: await authHeader() });
      if (res.ok) {
        const row = (await res.json()) as Verification | null;
        setCurrent(row);
      }
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (!isRestBackendEnabled()) {
      setLoaded(true);
      return;
    }
    void load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      new URL(idDoc);
      new URL(selfie);
    } catch {
      appToast.error(null, 'URL manzillarini to\'g\'ri kiriting (https://…)');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${base()}/users/me/verify`, {
        method: 'POST',
        headers: await authHeader(),
        body: JSON.stringify({ idDocumentUrl: idDoc, selfieUrl: selfie }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({ message: res.statusText })) as { message?: string }).message ?? res.statusText);
      appToast.success('So\'rov yuborildi. Moderator ko\'rib chiqadi.');
      setIdDoc('');
      setSelfie('');
      await load();
    } catch (err) {
      appToast.error(err, 'Yuborib bo\'lmadi');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isRestBackendEnabled()) {
    return (
      <div className="page-container">
        <p className="text-center text-sm text-[var(--color-muted)]">
          Haqiqiy backend yoqilmagan — verifikatsiya demo rejimda ko'rinmaydi.
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link href="/profile" className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-brand-green)]">
        <ArrowLeft className="h-4 w-4" />
        Profil
      </Link>

      <PageHeader
        title="Ishonchli hisob"
        subtitle='Pasport yoki ID + selfie yuboring. Moderator tasdiqlagach, profilingizda ko‘k ✓ belgisi paydo bo‘ladi.'
      />

      {user.trusted ? (
        <div className="card mb-6 flex items-center gap-3 rounded-2xl p-5">
          <BadgeCheck className="h-6 w-6 text-[var(--color-brand-green)]" />
          <p className="text-sm font-medium text-[var(--color-secondary)]">
            Hisobingiz allaqachon ishonchli deb tasdiqlangan.
          </p>
        </div>
      ) : null}

      {!loaded ? (
        <p className="text-sm text-[var(--color-muted)]">Yuklanmoqda…</p>
      ) : current ? (
        <section className="card mb-6 rounded-2xl p-5">
          {(() => {
            const s = STATUS_UI[current.status];
            const Icon = s.icon;
            return (
              <>
                <div className={cn('mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold', s.cls)}>
                  <Icon className="h-3.5 w-3.5" />
                  {s.label}
                </div>
                <p className="text-xs text-[var(--color-muted)]">
                  Yuborilgan: {new Date(current.createdAt).toLocaleString('uz-UZ')}
                </p>
                {current.note ? (
                  <p className="mt-3 rounded-xl bg-[var(--color-background)] p-3 text-sm text-[var(--color-secondary)]">
                    <span className="font-semibold">Moderator izohi:</span> {current.note}
                  </p>
                ) : null}
                {current.status === 'rejected' ? (
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    Yangi urinish uchun quyida qayta yuboring.
                  </p>
                ) : null}
              </>
            );
          })()}
        </section>
      ) : null}

      {current?.status !== 'pending' ? (
        <form onSubmit={submit} className="card space-y-4 rounded-2xl p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-secondary)]">
              Pasport yoki ID rasm
            </label>
            {uploadsEnabled ? (
              <div className="space-y-2">
                <input
                  ref={idRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void pickAndUpload('id', f);
                    if (idRef.current) idRef.current.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => idRef.current?.click()}
                  isLoading={uploading === 'id'}
                  className="w-full gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {idDoc ? 'Qayta yuklash' : 'Rasm yuklash'}
                </Button>
                {idDoc ? (
                  <a
                    href={idDoc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-xs text-[var(--color-brand-green)] hover:underline"
                  >
                    {idDoc}
                  </a>
                ) : null}
              </div>
            ) : (
              <>
                <Input
                  value={idDoc}
                  onChange={(e) => setIdDoc(e.target.value)}
                  type="url"
                  placeholder="https://…"
                  required
                />
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Yuklash xizmati sozlanmagan — URL kiriting.
                </p>
              </>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-secondary)]">
              Hujjat ushlagan holdagi selfie
            </label>
            {uploadsEnabled ? (
              <div className="space-y-2">
                <input
                  ref={selfieRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void pickAndUpload('selfie', f);
                    if (selfieRef.current) selfieRef.current.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => selfieRef.current?.click()}
                  isLoading={uploading === 'selfie'}
                  className="w-full gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {selfie ? 'Qayta yuklash' : 'Selfie yuklash'}
                </Button>
                {selfie ? (
                  <a
                    href={selfie}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-xs text-[var(--color-brand-green)] hover:underline"
                  >
                    {selfie}
                  </a>
                ) : null}
              </div>
            ) : (
              <Input
                value={selfie}
                onChange={(e) => setSelfie(e.target.value)}
                type="url"
                placeholder="https://…"
                required
              />
            )}
          </div>
          <Button type="submit" variant="primary" size="lg" isLoading={submitting} disabled={!idDoc || !selfie} className="w-full">
            So'rovni yuborish
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <RequireAuth>
      <VerifyForm />
    </RequireAuth>
  );
}
