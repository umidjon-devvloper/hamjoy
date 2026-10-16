'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import type { CreateJobFormData, CreateJobFormErrors } from '@/types';
import { WORK_TYPE_LABELS, SCHEDULE_TYPE_LABELS } from '@/types';
import type { WorkType, ScheduleType } from '@/types';
import { Input } from '@/components/ui/Input';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

interface Step1BasicInfoProps {
  form: CreateJobFormData;
  errors: CreateJobFormErrors;
  onChange: <K extends keyof CreateJobFormData>(key: K, value: CreateJobFormData[K]) => void;
}

const WORK_TYPE_OPTIONS = (Object.entries(WORK_TYPE_LABELS) as [WorkType, string][]).map(
  ([value, label]) => ({ value, label })
);

const SCHEDULE_OPTIONS = (Object.entries(SCHEDULE_TYPE_LABELS) as [ScheduleType, string][]).map(
  ([value, label]) => ({ value, label })
);

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/['`]/g, '').trim();
}

function ChoiceGrid<T extends string>({
  label,
  value,
  options,
  error,
  onChange,
}: {
  label: string;
  value: T | '';
  options: { value: T; label: string }[];
  error?: string;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[var(--color-secondary)]">{label}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all',
                isSelected
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-sm'
                  : 'border-[var(--color-border)] bg-white text-[var(--color-secondary)] hover:border-blue-200 hover:bg-blue-50/50'
              )}
              aria-pressed={isSelected}
            >
              <span>{option.label}</span>
              {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Step1BasicInfo({ form, errors, onChange }: Step1BasicInfoProps) {
  const { data: categories, isLoading } = useCategories();
  const [categoryQuery, setCategoryQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const query = normalizeSearch(categoryQuery);
    if (!query) return categories;
    return categories.filter((category) => normalizeSearch(category.name).includes(query));
  }, [categories, categoryQuery]);

  const selectedCategory = categories.find((category) => category.id === form.categoryId);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
        <h2 className="text-lg font-bold text-[var(--color-secondary)]">Asosiy ma'lumot</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
          Qisqa va aniq yozing. Nomzodlar birinchi navbatda lavozim nomi, kategoriya va ish
          jadvaliga qaraydi.
        </p>
      </div>

      <Input
        label="Lavozim nomi"
        placeholder="Masalan: Sotuvchi, Haydovchi, Oshpaz yordamchisi"
        value={form.title}
        onChange={(e) => onChange('title', e.target.value)}
        error={errors.title}
        hint="Lavozim nomini ortiqcha so'zlarsiz yozing."
        autoFocus
      />

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--color-secondary)]">Kategoriya</p>
            {selectedCategory && (
              <p className="mt-0.5 text-xs font-medium text-[var(--color-primary)]">
                Tanlandi: {selectedCategory.name}
              </p>
            )}
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-[var(--color-muted)]">
            {categories.length} ta
          </span>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]"
            aria-hidden
          />
          <input
            type="search"
            value={categoryQuery}
            onChange={(e) => setCategoryQuery(e.target.value)}
            placeholder="Kategoriya qidirish"
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white py-3 pl-10 pr-4 text-sm font-medium text-[var(--color-secondary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>

        <div
          className={cn(
            'mt-3 grid max-h-72 grid-cols-1 gap-2 overflow-y-auto rounded-2xl border bg-white p-2 sm:grid-cols-2',
            errors.categoryId ? 'border-red-300' : 'border-[var(--color-border)]'
          )}
        >
          {isLoading ? (
            <p className="col-span-full px-3 py-5 text-center text-sm text-[var(--color-muted)]">
              Kategoriyalar yuklanmoqda...
            </p>
          ) : filteredCategories.length > 0 ? (
            filteredCategories.map((category) => {
              const isSelected = form.categoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onChange('categoryId', category.id)}
                  className={cn(
                    'flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all',
                    isSelected
                      ? 'bg-[var(--color-primary)] text-white shadow-sm'
                      : 'bg-gray-50 text-[var(--color-secondary)] hover:bg-blue-50 hover:text-[var(--color-primary)]'
                  )}
                  aria-pressed={isSelected}
                >
                  <span>{category.name}</span>
                  {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />}
                </button>
              );
            })
          ) : (
            <p className="col-span-full px-3 py-5 text-center text-sm text-[var(--color-muted)]">
              Mos kategoriya topilmadi.
            </p>
          )}
        </div>
        {errors.categoryId && (
          <p className="mt-1.5 text-xs text-red-600" role="alert">
            {errors.categoryId}
          </p>
        )}
      </div>

      <ChoiceGrid
        label="Ish turi"
        value={form.workType}
        options={WORK_TYPE_OPTIONS}
        error={errors.workType}
        onChange={(value) => onChange('workType', value)}
      />

      <ChoiceGrid
        label="Jadval"
        value={form.scheduleType}
        options={SCHEDULE_OPTIONS}
        error={errors.scheduleType}
        onChange={(value) => onChange('scheduleType', value)}
      />
    </div>
  );
}
