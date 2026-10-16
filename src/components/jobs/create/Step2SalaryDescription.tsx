'use client';

import type { CreateJobFormData, CreateJobFormErrors } from '@/types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { parseLines } from '@/lib/validations/create-job.validation';
import { DollarSign } from 'lucide-react';

interface Step2SalaryDescriptionProps {
  form: CreateJobFormData;
  errors: CreateJobFormErrors;
  onChange: <K extends keyof CreateJobFormData>(key: K, value: CreateJobFormData[K]) => void;
}

export function Step2SalaryDescription({ form, errors, onChange }: Step2SalaryDescriptionProps) {
  const responsibilityCount = parseLines(form.responsibilities).length;
  const requirementCount = parseLines(form.requirements).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3">
        <h2 className="text-lg font-bold text-[var(--color-secondary)]">Maosh va tavsif</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
          Nomzod ish sharoiti, maosh va vazifalarni tez tushunishi uchun qisqa, lekin aniq
          yozing.
        </p>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-[var(--color-secondary)]">
          <DollarSign className="h-3.5 w-3.5 text-[var(--color-success)]" />
          Oylik maosh oralig'i (USD)
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Dan"
            type="number"
            min={0}
            placeholder="500"
            value={form.salaryMin}
            onChange={(e) => onChange('salaryMin', e.target.value)}
            error={errors.salaryMin}
          />
          <Input
            label="Gacha"
            type="number"
            min={0}
            placeholder="1500"
            value={form.salaryMax}
            onChange={(e) => onChange('salaryMax', e.target.value)}
            error={errors.salaryMax}
          />
        </div>
      </div>

      <Textarea
        label="Tavsif"
        rows={5}
        placeholder="Ish joyi, sharoitlar, kimni izlayotganingiz va asosiy vazifalarni yozing..."
        value={form.description}
        onChange={(e) => onChange('description', e.target.value)}
        error={errors.description}
        hint={`${form.description.trim().length} ta belgi / kamida 20`}
      />

      <Textarea
        label="Majburiyatlar"
        rows={5}
        placeholder={'Har bir qatorga bitta band yozing\nMasalan: Mijozlarga xizmat ko\'rsatish\nMahsulotlarni tartibga keltirish'}
        value={form.responsibilities}
        onChange={(e) => onChange('responsibilities', e.target.value)}
        error={errors.responsibilities}
        hint={`${responsibilityCount} ta band / har bir qatorga bitta band`}
      />

      <Textarea
        label="Talablar"
        rows={5}
        placeholder={'Har bir qatorga bitta talab yozing\nMasalan: Mas\'uliyatli va hushmuomala bo\'lish\nShu sohada tajriba bo\'lishi'}
        value={form.requirements}
        onChange={(e) => onChange('requirements', e.target.value)}
        error={errors.requirements}
        hint={`${requirementCount} ta band / har bir qatorga bitta talab`}
      />
    </div>
  );
}
