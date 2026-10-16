'use client';

import React, { useState } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { ActionButton, AdminPageHeader, Badge, Panel, Tabs } from '@/components/admin/ui';
import { adminService } from '@/services/admin.service';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { useRolePermissions } from '@/lib/admin/access';
import { useListingModeration } from '@/lib/listings/moderation';
import { appToast } from '@/lib/feedback/toast';

type Tab = 'categories' | 'locations' | 'demo';

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/[ʻʼ'`‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const inputClass =
  'h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

function AddForm({ placeholder, onAdd }: { placeholder: string; onAdd: (value: string) => Promise<void> }) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!value.trim()) return;
        setBusy(true);
        try {
          await onAdd(value.trim());
          setValue('');
        } catch (err) {
          appToast.error(err, 'Qoʻshib boʻlmadi');
        } finally {
          setBusy(false);
        }
      }}
      className="flex gap-2 border-b border-slate-100 p-4"
    >
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={inputClass} />
      <button type="submit" disabled={busy || !value.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
        <Plus className="h-4 w-4" /> Qoʻshish
      </button>
    </form>
  );
}

function Categories() {
  const categories = useAsyncQuery(() => adminService.listCategories(), [], []);
  return (
    <Panel>
      <AddForm
        placeholder="Yangi kategoriya nomi"
        onAdd={async (name) => {
          await adminService.createCategory({ name, slug: slugify(name), icon: 'Briefcase' });
          appToast.success('Kategoriya qoʻshildi');
          categories.refetch();
        }}
      />
      <ul className="divide-y divide-slate-100">
        {categories.data.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
            <span>
              <span className="font-medium text-slate-900">{c.name}</span>
              <span className="ml-2 font-mono text-xs text-slate-400">{c.slug}</span>
            </span>
            <ActionButton
              icon={Trash2}
              label="Oʻchirish"
              tone="red"
              onClick={async () => {
                if (!window.confirm(`“${c.name}” kategoriyasi oʻchirilsinmi?`)) return;
                await adminService.deleteCategory(c.id);
                appToast.success('Kategoriya oʻchirildi');
                categories.refetch();
              }}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Locations() {
  const locations = useAsyncQuery(() => adminService.listLocations(), [], []);
  return (
    <Panel>
      <AddForm
        placeholder="Yangi hudud nomi"
        onAdd={async (label) => {
          await adminService.createLocation(label);
          appToast.success('Hudud qoʻshildi');
          locations.refetch();
        }}
      />
      <ul className="divide-y divide-slate-100">
        {locations.data.map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
            <span className="font-medium text-slate-900">{l.label}</span>
            <span className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await adminService.updateLocation(l.id, { isActive: !l.isActive });
                  locations.refetch();
                }}
                aria-pressed={l.isActive}
                title={l.isActive ? 'Oʻchirib qoʻyish' : 'Yoqish'}
              >
                <Badge tone={l.isActive ? 'green' : 'gray'}>{l.isActive ? 'Faol' : 'Oʻchiq'}</Badge>
              </button>
              <ActionButton
                icon={Trash2}
                label="Oʻchirish"
                tone="red"
                onClick={async () => {
                  if (!window.confirm(`“${l.label}” oʻchirilsinmi?`)) return;
                  await adminService.deleteLocation(l.id);
                  appToast.success('Hudud oʻchirildi');
                  locations.refetch();
                }}
              />
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function DemoData() {
  const { reset: resetRoles } = useRolePermissions();
  const { reset: resetModeration } = useListingModeration();
  return (
    <Panel>
      <div className="space-y-3 p-5 text-sm text-slate-600">
        <p>Backend ulanmaguncha admin oʻzgarishlari shu brauzerda saqlanadi.</p>
        <button
          type="button"
          onClick={() => {
            if (!window.confirm('Rollar imtiyozlari va uy-joy moderatsiyasi standart holatga qaytarilsinmi?')) return;
            resetRoles();
            resetModeration();
            appToast.success('Demo maʼlumotlar tiklandi');
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 font-semibold text-red-600 hover:bg-red-50"
        >
          <RotateCcw className="h-4 w-4" /> Admin oʻzgarishlarini tiklash
        </button>
      </div>
    </Panel>
  );
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('categories');
  return (
    <>
      <AdminPageHeader title="Sozlamalar" subtitle="Kategoriyalar, hududlar va demo maʼlumotlar" />
      <div className="mb-4">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'categories', label: 'Ish kategoriyalari' },
            { id: 'locations', label: 'Hududlar' },
            { id: 'demo', label: 'Demo maʼlumotlar' },
          ]}
        />
      </div>
      {tab === 'categories' && <Categories />}
      {tab === 'locations' && <Locations />}
      {tab === 'demo' && <DemoData />}
    </>
  );
}
