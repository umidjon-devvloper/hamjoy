'use client';

import { useMemo } from 'react';
import type { CreateJobFormData, CreateJobFormErrors } from '@/types';
import { hasErrors, validateCreateJobForm } from '@/lib/validations/create-job.validation';
import { formDataToPreviewItem } from '@/lib/mappers/create-job.mapper';
import { parseLines } from '@/lib/validations/create-job.validation';
import { useFavorites } from '@/context/FavoritesContext';
import { useCategories } from '@/hooks/useCategories';
import { WORK_TYPE_LABELS, SCHEDULE_TYPE_LABELS } from '@/types';
import { JobPreviewCard } from './JobPreviewCard';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step4PreviewProps {
  form: CreateJobFormData;
  errors: CreateJobFormErrors;
}

export function Step4Preview({ form, errors }: Step4PreviewProps) {
  const { favoriteIds } = useFavorites();
  const { data: categories } = useCategories();
  const previewJob = useMemo(
    () => formDataToPreviewItem(form, favoriteIds),
    [form, favoriteIds]
  );

  const validationErrors = useMemo(() => validateCreateJobForm(form), [form]);
  const isValid = !hasErrors(validationErrors);
  const category = categories.find((c) => c.id === form.categoryId);

  const checklist = [
    { label: 'Lavozim nomi', ok: Boolean(form.title.trim()) },
    { label: 'Kategoriya', ok: Boolean(form.categoryId) },
    { label: 'Ish turi va jadval', ok: Boolean(form.workType && form.scheduleType) },
    { label: 'Maosh', ok: Boolean(form.salaryMin && form.salaryMax) },
    { label: 'Tavsif', ok: form.description.trim().length >= 20 },
    {
      label: 'Majburiyatlar',
      ok: parseLines(form.responsibilities).length > 0,
    },
    { label: 'Talablar', ok: parseLines(form.requirements).length > 0 },
    { label: 'Telefon', ok: Boolean(form.phone.trim()) },
    {
      label: 'Joylashuv',
      ok: form.workType === 'remote' ? Boolean(form.cityDistrict.trim()) : Boolean(form.address.trim() && form.cityDistrict.trim()),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-secondary)]">Koʻrib chiqish va eʼlon</h2>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Eʼlon qanday koʻrinishini joylashdan oldin koʻrib chiqing.
        </p>
      </div>

      <JobPreviewCard job={previewJob} />

      <div className="card p-4 sm:p-5 space-y-4">
        <h3 className="font-semibold text-[var(--color-secondary)] text-sm">Eʼlon xulosasi</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[var(--color-muted)]">Kategoriya</dt>
            <dd className="font-medium text-[var(--color-secondary)]">{category?.name ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Ish turi</dt>
            <dd className="font-medium text-[var(--color-secondary)]">
              {form.workType ? WORK_TYPE_LABELS[form.workType] : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Jadval</dt>
            <dd className="font-medium text-[var(--color-secondary)]">
              {form.scheduleType ? SCHEDULE_TYPE_LABELS[form.scheduleType] : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Telefon</dt>
            <dd className="font-medium text-[var(--color-secondary)]">{form.phone || '—'}</dd>
          </div>
        </dl>

        {form.description && (
          <div>
            <p className="text-[var(--color-muted)] text-sm mb-1">Tavsif</p>
            <p className="text-sm text-[var(--color-secondary)] whitespace-pre-wrap line-clamp-4">
              {form.description}
            </p>
          </div>
        )}
      </div>

      <div
        className={cn(
          'rounded-xl border p-4',
          isValid
            ? 'border-[var(--color-success)]/30 bg-[var(--color-success)]/5'
            : 'border-amber-300/60 bg-amber-50'
        )}
      >
        <div className="flex items-start gap-2 mb-3">
          {isValid ? (
            <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold text-sm text-[var(--color-secondary)]">
              {isValid ? 'Eʼlonga tayyor' : 'Joylashdan oldin shularni tuzating'}
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              {isValid
                ? 'Barcha majburiy maydonlar toʻldirilgan.'
                : 'Baʼzi maydonlarga eʼtibor bering.'}
            </p>
          </div>
        </div>

        <ul className="space-y-1.5">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              {item.ok ? (
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className={item.ok ? 'text-[var(--color-secondary)]' : 'text-amber-800'}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        {!isValid && Object.keys(errors).length > 0 && (
          <p className="mt-3 text-xs text-amber-800" role="alert">
            Belgilangan maydonlarni tuzatish uchun avvalgi qadamlarga qayting.
          </p>
        )}
      </div>
    </div>
  );
}
