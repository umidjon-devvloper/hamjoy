'use client';

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Lock, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BadgeTone } from '@/lib/admin/access';
import { cn } from '@/lib/utils';

export const BADGE_TONES: Record<BadgeTone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  orange: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-red-50 text-red-600 ring-red-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200',
  gray: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', BADGE_TONES[tone])}>
      {children}
    </span>
  );
}

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const STAT_TONES = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  purple: 'bg-violet-50 text-violet-600',
  orange: 'bg-amber-50 text-amber-600',
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  tone: keyof typeof STAT_TONES;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', STAT_TONES[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {hint && <p className="mt-2 text-xs font-medium text-slate-500">{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1.5">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
            value === t.id ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 opacity-80">({t.count})</span>}
        </button>
      ))}
    </div>
  );
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block w-full sm:w-72">
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
    </label>
  );
}

/** Client-side paging; resets to page 1 when the list shrinks below the current page. */
export function usePaged<T>(items: T[], pageSize = 8) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount);
  const rows = useMemo(() => items.slice((current - 1) * pageSize, current * pageSize), [items, current, pageSize]);
  return { rows, page: current, pageCount, setPage, offset: (current - 1) * pageSize };
}

export function Pagination({ page, pageCount, total, onChange, unit = 'ta' }: { page: number; pageCount: number; total: number; onChange: (p: number) => void; unit?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
      <span>
        Jami: {total} {unit}
      </span>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Oldingi sahifa" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn('h-8 min-w-8 rounded-lg px-2 font-semibold', p === page ? 'bg-blue-600 text-white' : 'hover:bg-slate-100')}
          >
            {p}
          </button>
        ))}
        <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Keyingi sahifa" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 disabled:opacity-40">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export const tableClass = 'w-full min-w-[720px] text-left text-sm';
export const thClass = 'bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500';
export const tdClass = 'border-t border-slate-100 px-4 py-3 align-middle text-slate-700';

export function ActionButton({
  onClick,
  icon: Icon,
  label,
  tone = 'gray',
  disabled,
}: {
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  tone?: 'gray' | 'green' | 'red' | 'blue';
  disabled?: boolean;
}) {
  const tones = {
    gray: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
    green: 'text-emerald-600 hover:bg-emerald-50',
    red: 'text-red-600 hover:bg-red-50',
    blue: 'text-blue-600 hover:bg-blue-50',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:pointer-events-none disabled:opacity-30', tones[tone])}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-slate-500">
        {text}
      </td>
    </tr>
  );
}

export function NoAccess() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Lock className="h-5 w-5" />
      </span>
      <p className="font-semibold text-slate-900">Bu boʻlimga ruxsatingiz yoʻq</p>
      <p className="mt-1 text-sm text-slate-500">Imtiyozlar Super Admin tomonidan beriladi.</p>
    </div>
  );
}

/** Minimal multi-series line chart (SVG, no dependencies). */
export function LineChart({ labels, series }: { labels: string[]; series: { label: string; color: string; values: number[] }[] }) {
  const W = 600;
  const H = 220;
  const pad = { l: 32, r: 12, t: 12, b: 28 };
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const step = Math.ceil(max / 4);
  const top = step * 4;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, labels.length - 1);
  const y = (v: number) => pad.t + (1 - v / top) * (H - pad.t - pad.b);

  return (
    <figure>
      <figcaption className="mb-3 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
        {series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}: {s.values.reduce((a, b) => a + b, 0)}
          </span>
        ))}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={series.map((s) => `${s.label}: ${s.values.join(', ')}`).join('; ')}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={pad.l} x2={W - pad.r} y1={y(step * i)} y2={y(step * i)} stroke="#E2E8F0" strokeDasharray={i ? '3 4' : undefined} />
            <text x={pad.l - 8} y={y(step * i) + 4} textAnchor="end" fontSize="11" fill="#64748B">
              {step * i}
            </text>
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={l} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#64748B">
            {l}
          </text>
        ))}
        {series.map((s) => (
          <g key={s.label}>
            <polyline fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
            {s.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="#fff" stroke={s.color} strokeWidth="2">
                <title>{`${labels[i]} — ${s.label}: ${v}`}</title>
              </circle>
            ))}
          </g>
        ))}
      </svg>
    </figure>
  );
}
