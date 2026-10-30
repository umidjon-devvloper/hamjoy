'use client';

import React, { useState } from 'react';
import { AlertTriangle, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { AdminPageHeader, Panel } from '@/components/admin/ui';
import { adminService } from '@/services/admin.service';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { useRolePermissions } from '@/lib/admin/access';
import { useListingModeration } from '@/lib/listings/moderation';
import { appToast } from '@/lib/feedback/toast';
import { cn } from '@/lib/utils';

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[ʻʼ'`'']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const inputClass =
  'h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-[var(--color-primary)]' : 'bg-slate-200'
        )}
      >
        <span className={cn(
          'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-5'
        )} />
      </button>
    </label>
  );
}

function ModerationSettings() {
  const [manualReview, setManualReview] = useState(true);
  const [phoneBlocking, setPhoneBlocking] = useState(false);
  const [expiryDays, setExpiryDays] = useState('30');

  return (
    <Panel title="Moderatsiya">
      <div className="space-y-5 p-5">
        <Toggle checked={manualReview} onChange={setManualReview} label="Barcha eʼlonlarni qoʻlda tekshirish" />
        <Toggle checked={phoneBlocking} onChange={setPhoneBlocking} label="Telefon raqamlarni bloklash" />
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-700">Eʼlon muddati (kun)</span>
          <select
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="15">15 kun</option>
            <option value="30">30 kun</option>
            <option value="60">60 kun</option>
            <option value="90">90 kun</option>
          </select>
        </div>
      </div>
    </Panel>
  );
}

function TopListingsSettings() {
  const [price, setPrice] = useState('50000');
  const [slots, setSlots] = useState('10');

  return (
    <Panel title="TOP eʼlonlar">
      <div className="space-y-4 p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Narxi (soʻm/kun)</label>
          <input type="text" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Joylar soni</label>
          <input type="text" value={slots} onChange={(e) => setSlots(e.target.value)} className={inputClass} />
        </div>
      </div>
    </Panel>
  );
}

function CategoriesSettings() {
  const categories = useAsyncQuery(() => adminService.listCategories(), [], []);
  const [newCat, setNewCat] = useState('');
  const [busy, setBusy] = useState(false);

  const addCategory = async () => {
    if (!newCat.trim()) return;
    setBusy(true);
    try {
      await adminService.createCategory({ name: newCat.trim(), slug: slugify(newCat.trim()), icon: 'Briefcase' });
      appToast.success('Kategoriya qoʻshildi');
      setNewCat('');
      categories.refetch();
    } catch (err) {
      appToast.error(err, 'Qoʻshib boʻlmadi');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Kategoriyalar">
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {categories.data.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pl-3.5 pr-2 text-sm font-medium text-slate-700">
              {c.icon && <span className="text-sm">{c.icon === 'Briefcase' ? '💼' : c.icon}</span>}
              {c.name}
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm(`"${c.name}" oʻchirilsinmi?`)) return;
                  await adminService.deleteCategory(c.id);
                  appToast.success('Kategoriya oʻchirildi');
                  categories.refetch();
                }}
                className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); addCategory(); }}
          className="mt-4 flex gap-2"
        >
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Yangi kategoriya"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={busy || !newCat.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Qoʻshish
          </button>
        </form>
      </div>
    </Panel>
  );
}

function LocationsSettings() {
  const locations = useAsyncQuery(() => adminService.listLocations(), [], []);
  const [newLoc, setNewLoc] = useState('');
  const [busy, setBusy] = useState(false);

  const addLocation = async () => {
    if (!newLoc.trim()) return;
    setBusy(true);
    try {
      await adminService.createLocation(newLoc.trim());
      appToast.success('Hudud qoʻshildi');
      setNewLoc('');
      locations.refetch();
    } catch (err) {
      appToast.error(err, 'Qoʻshib boʻlmadi');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Hududlar">
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {locations.data.map((l) => (
            <span key={l.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1.5 pl-3.5 pr-2 text-sm font-medium text-slate-700">
              {l.label}
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm(`"${l.label}" oʻchirilsinmi?`)) return;
                  await adminService.deleteLocation(l.id);
                  appToast.success('Hudud oʻchirildi');
                  locations.refetch();
                }}
                className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); addLocation(); }}
          className="mt-4 flex gap-2"
        >
          <input
            value={newLoc}
            onChange={(e) => setNewLoc(e.target.value)}
            placeholder="Yangi hudud nomi"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={busy || !newLoc.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Qoʻshish
          </button>
        </form>
      </div>
    </Panel>
  );
}

function DangerZone() {
  const { reset: resetRoles } = useRolePermissions();
  const { reset: resetModeration } = useListingModeration();
  const [maintenance, setMaintenance] = useState(false);

  return (
    <div className="rounded-[20px] border-2 border-red-200 bg-white">
      <div className="flex items-center gap-2 border-b border-red-100 px-5 py-4">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <h2 className="font-semibold text-red-700">Texnik ishlar rejimi</h2>
      </div>
      <div className="space-y-4 p-5">
        <Toggle checked={maintenance} onChange={setMaintenance} label="Texnik ishlar rejimini yoqish" />
        {maintenance && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            Diqqat: Sayt foydalanuvchilar uchun yopiladi. Faqat adminlar kirishi mumkin.
          </p>
        )}
        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => {
              if (!window.confirm('Rollar imtiyozlari va moderatsiya standart holatga qaytarilsinmi?')) return;
              resetRoles();
              resetModeration();
              appToast.success('Demo maʼlumotlar tiklandi');
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <RotateCcw className="h-4 w-4" /> Admin oʻzgarishlarini tiklash
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader title="Sozlamalar" subtitle="Sayt sozlamalari va boshqaruv" />
      <div className="space-y-6">
        <ModerationSettings />
        <TopListingsSettings />
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoriesSettings />
          <LocationsSettings />
        </div>
        <DangerZone />
      </div>
    </>
  );
}
