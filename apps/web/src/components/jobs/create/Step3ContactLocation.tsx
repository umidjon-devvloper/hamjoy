'use client';

import { useEffect } from 'react';
import type { CreateJobFormData, CreateJobFormErrors } from '@/types';
import { Input } from '@/components/ui/Input';
import { MapLocationPicker } from '@/components/map/MapLocationPicker';

interface Step3ContactLocationProps {
  form: CreateJobFormData;
  errors: CreateJobFormErrors;
  onChange: <K extends keyof CreateJobFormData>(key: K, value: CreateJobFormData[K]) => void;
  onChangeFields: (patch: Partial<CreateJobFormData>) => void;
}

export function Step3ContactLocation({
  form,
  errors,
  onChange,
  onChangeFields,
}: Step3ContactLocationProps) {
  const isRemote = form.workType === 'remote';

  useEffect(() => {
    if (!isRemote) return;
    const patch: Partial<CreateJobFormData> = {};
    if (form.address) patch.address = '';
    if (!form.cityDistrict.trim()) patch.cityDistrict = 'Masofaviy';
    if (Object.keys(patch).length > 0) onChangeFields(patch);
  }, [form.address, form.cityDistrict, isRemote, onChangeFields]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
        <h2 className="text-lg font-bold text-[var(--color-secondary)]">Aloqa va joylashuv</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
          Nomzodlar bog'lana olishi uchun telefon raqami va ish joylashuvini aniq kiriting.
        </p>
      </div>

      <Input
        label="Telefon raqami"
        type="tel"
        placeholder="+998 90 123 45 67"
        value={form.phone}
        onChange={(e) => onChange('phone', e.target.value)}
        error={errors.phone}
        autoComplete="tel"
        hint="Nomzodlar shu raqam orqali bog'lanadi."
      />

      {isRemote && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-[var(--color-muted)]">
          Masofaviy ish tanlangan. Aniq ofis manzili talab qilinmaydi.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Shahar / tuman"
          placeholder={isRemote ? 'Masofaviy' : 'Masalan: Toshkent, Chilonzor'}
          value={form.cityDistrict}
          onChange={(e) => onChange('cityDistrict', e.target.value)}
          error={errors.cityDistrict}
        />

        <Input
          label="Manzil"
          placeholder={isRemote ? 'Masofaviy ish uchun ixtiyoriy' : 'Ko\'cha, uy'}
          value={form.address}
          onChange={(e) => onChange('address', e.target.value)}
          error={errors.address}
          disabled={isRemote}
        />
      </div>

      <MapLocationPicker
        lat={form.mapLat}
        lng={form.mapLng}
        disabled={isRemote}
        onSelect={(lat, lng) => onChangeFields({ mapLat: lat, mapLng: lng })}
      />
    </div>
  );
}
