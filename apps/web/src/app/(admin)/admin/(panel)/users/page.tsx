'use client';

import React, { useMemo, useState } from 'react';
import { Ban, CheckCircle2 } from 'lucide-react';
import {
  ActionButton,
  AdminPageHeader,
  Badge,
  EmptyRow,
  Pagination,
  Panel,
  SearchField,
  tableClass,
  tdClass,
  thClass,
  usePaged,
} from '@/components/admin/ui';
import { adminService } from '@/services/admin.service';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { useCan, type BadgeTone } from '@/lib/admin/access';
import { appToast } from '@/lib/feedback/toast';
import type { AdminUserRow } from '@/types';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'owners' | 'employers' | 'blocked';

const ROLE_BADGE: Record<AdminUserRow['role'], { label: string; tone: BadgeTone }> = {
  seeker: { label: 'Ish izlovchi', tone: 'blue' },
  poster: { label: 'Ish beruvchi', tone: 'purple' },
  admin: { label: 'Admin', tone: 'red' },
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Barchasi' },
  { id: 'owners', label: 'Mulkdorlar' },
  { id: 'employers', label: 'Ish beruvchilar' },
  { id: 'blocked', label: 'Bloklangan' },
];

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-bold text-[var(--color-primary)]">
      {initials || '?'}
    </span>
  );
}

export default function AdminUsersPage() {
  const can = useCan();
  const users = useAsyncQuery(() => adminService.listUsers(), [], []);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.data.filter((u) => {
      if (filter === 'blocked' && !u.blocked) return false;
      if (filter === 'owners' && u.role !== 'seeker') return false;
      if (filter === 'employers' && u.role !== 'poster') return false;
      if (q && ![u.name, u.email, u.phone ?? ''].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [users.data, filter, query]);
  const { rows, page, pageCount, setPage, offset } = usePaged(filtered);

  const toggleBlock = async (user: AdminUserRow) => {
    try {
      await adminService.setUserBlocked(user.id, !user.blocked);
      appToast.success(user.blocked ? `${user.name} blokdan chiqarildi` : `${user.name} bloklandi`);
      users.refetch();
    } catch (err) {
      appToast.error(err, 'Holatni oʻzgartirib boʻlmadi');
    }
  };

  return (
    <>
      <AdminPageHeader title="Foydalanuvchilar" subtitle="Saytdagi barcha foydalanuvchilar roʻyxati" />
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                  filter === f.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <SearchField value={query} onChange={setQuery} placeholder="Ism, email yoki telefon" />
        </div>

        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Foydalanuvchi</th>
                <th className={thClass}>Aloqa</th>
                <th className={thClass}>Rol</th>
                <th className={thClass}>Holat</th>
                <th className={`${thClass} text-right`}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {users.isLoading ? (
                <EmptyRow colSpan={6} text="Yuklanmoqda…" />
              ) : rows.length === 0 ? (
                <EmptyRow colSpan={6} text="Foydalanuvchi topilmadi" />
              ) : (
                rows.map((u, i) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className={tdClass}>{offset + i + 1}</td>
                    <td className={tdClass}>
                      <span className="flex items-center gap-3">
                        <Avatar name={u.name} />
                        <span className="font-semibold text-slate-900">{u.name}</span>
                      </span>
                    </td>
                    <td className={tdClass}>
                      <span className="block text-slate-700">{u.email}</span>
                      {u.phone && <span className="block text-xs text-slate-500">{u.phone}</span>}
                    </td>
                    <td className={tdClass}>
                      <Badge tone={ROLE_BADGE[u.role]?.tone ?? 'gray'}>{ROLE_BADGE[u.role]?.label ?? u.role}</Badge>
                    </td>
                    <td className={tdClass}>
                      <span className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        u.blocked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                      )}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', u.blocked ? 'bg-red-500' : 'bg-emerald-500')} />
                        {u.blocked ? 'Bloklangan' : 'Faol'}
                      </span>
                    </td>
                    <td className={`${tdClass} text-right`}>
                      {can('users.block') ? (
                        <span className="inline-flex justify-end">
                          {u.blocked ? (
                            <ActionButton icon={CheckCircle2} label="Blokdan chiqarish" tone="green" onClick={() => toggleBlock(u)} />
                          ) : (
                            <ActionButton icon={Ban} label="Bloklash" tone="red" onClick={() => toggleBlock(u)} />
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageCount={pageCount} total={filtered.length} onChange={setPage} unit="ta foydalanuvchi" />
      </Panel>
    </>
  );
}
