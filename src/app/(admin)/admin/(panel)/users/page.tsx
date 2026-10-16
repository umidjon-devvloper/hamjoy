'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
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
  Tabs,
  tdClass,
  thClass,
  usePaged,
} from '@/components/admin/ui';
import { adminService } from '@/services/admin.service';
import { useAsyncQuery } from '@/hooks/useAsyncQuery';
import { useCan, type BadgeTone } from '@/lib/admin/access';
import { appToast } from '@/lib/feedback/toast';
import type { AdminUserRow } from '@/types';

type Tab = 'all' | 'active' | 'blocked';

const ROLE_BADGE: Record<AdminUserRow['role'], { label: string; tone: BadgeTone }> = {
  seeker: { label: 'Ish izlovchi', tone: 'blue' },
  poster: { label: 'Ish beruvchi', tone: 'purple' },
  admin: { label: 'Admin', tone: 'red' },
};

export default function AdminUsersPage() {
  const can = useCan();
  const users = useAsyncQuery(() => adminService.listUsers(), [], []);
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.data.filter(
      (u) =>
        (tab === 'all' || (tab === 'blocked') === u.blocked) &&
        (!q || [u.name, u.email, u.phone ?? ''].some((v) => v.toLowerCase().includes(q)))
    );
  }, [users.data, tab, query]);
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

  const blockedCount = users.data.filter((u) => u.blocked).length;

  return (
    <>
      <AdminPageHeader title="Foydalanuvchilar" subtitle="Saytdagi barcha foydalanuvchilar roʻyxati" />
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <Tabs<Tab>
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'all', label: 'Barchasi', count: users.data.length },
              { id: 'active', label: 'Faol', count: users.data.length - blockedCount },
              { id: 'blocked', label: 'Bloklangan', count: blockedCount },
            ]}
          />
          <SearchField value={query} onChange={setQuery} placeholder="Ism, email yoki telefon" />
        </div>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>#</th>
                <th className={thClass}>Ism</th>
                <th className={thClass}>Email / Telefon</th>
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
                        <Image src={u.avatarUrl} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" unoptimized />
                        <span className="font-semibold text-slate-900">{u.name}</span>
                      </span>
                    </td>
                    <td className={tdClass}>
                      <span className="block">{u.email}</span>
                      {u.phone && <span className="block text-xs text-slate-500">{u.phone}</span>}
                    </td>
                    <td className={tdClass}>
                      <Badge tone={ROLE_BADGE[u.role].tone}>{ROLE_BADGE[u.role].label}</Badge>
                    </td>
                    <td className={tdClass}>
                      <Badge tone={u.blocked ? 'red' : 'green'}>{u.blocked ? 'Bloklangan' : 'Faol'}</Badge>
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
