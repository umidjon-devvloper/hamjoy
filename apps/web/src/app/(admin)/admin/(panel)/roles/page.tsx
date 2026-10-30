'use client';

import React from 'react';
import { Check, Lock, Minus, Plus, RotateCcw } from 'lucide-react';
import { AdminPageHeader, Badge, Panel, thClass, tdClass } from '@/components/admin/ui';
import {
  ADMIN_ROLES,
  DEMO_ACCOUNTS,
  PERMISSION_GROUPS,
  PERMISSIONS,
  ROLE_META,
  roleCan,
  useCan,
  useRolePermissions,
  type AdminRole,
  type Permission,
} from '@/lib/admin/access';
import { appToast } from '@/lib/feedback/toast';
import { cn } from '@/lib/utils';

export default function AdminRolesPage() {
  const can = useCan();
  const { permissions, setRolePermissions, reset } = useRolePermissions();
  const editable = can('roles.manage');

  const toggle = (role: AdminRole, permission: Permission) => {
    const has = permissions[role].includes(permission);
    setRolePermissions(role, has ? permissions[role].filter((p) => p !== permission) : [...permissions[role], permission]);
  };

  return (
    <>
      <AdminPageHeader
        title="Rollar va imtiyozlar"
        subtitle={editable ? 'Har bir rol nimalarni qila olishini belgilang' : 'Rollar imtiyozlari (faqat koʻrish)'}
        action={
          editable && (
            <button
              type="button"
              onClick={() => {
                reset();
                appToast.success('Standart imtiyozlar tiklandi');
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Standartga qaytarish
            </button>
          )
        }
      />

      {/* Permission matrix */}
      <Panel title="Imtiyozlar jadvali">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr>
                <th className={thClass}>Imtiyoz</th>
                {ADMIN_ROLES.map((role) => (
                  <th key={role} className={`${thClass} text-center`}>
                    <div className="flex flex-col items-center gap-1">
                      <Badge tone={ROLE_META[role].tone}>{ROLE_META[role].label}</Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.map((group) => (
                <React.Fragment key={group.label}>
                  <tr>
                    <td colSpan={ADMIN_ROLES.length + 1} className="border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {group.label}
                    </td>
                  </tr>
                  {group.permissions.map((permission) => (
                    <tr key={permission} className="hover:bg-slate-50/40">
                      <td className={cn(tdClass, 'font-medium')}>{PERMISSIONS[permission]}</td>
                      {ADMIN_ROLES.map((role) => {
                        const allowed = roleCan(permissions, role, permission);
                        const locked = role === 'super_admin' || !editable;
                        return (
                          <td key={role} className={`${tdClass} text-center`}>
                            {locked ? (
                              <span className="inline-flex items-center justify-center">
                                {allowed ? (
                                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                                    <Check className="h-4 w-4 text-emerald-600" />
                                  </span>
                                ) : (
                                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50">
                                    <Minus className="h-4 w-4 text-slate-300" />
                                  </span>
                                )}
                                {role === 'super_admin' && <Lock className="ml-0.5 h-2.5 w-2.5 text-slate-300" />}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggle(role, permission)}
                                className={cn(
                                  'flex h-7 w-7 items-center justify-center rounded-lg transition-colors mx-auto',
                                  allowed
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                    : 'bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-500'
                                )}
                                aria-label={`${ROLE_META[role].label}: ${PERMISSIONS[permission]}`}
                              >
                                {allowed ? <Check className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Team members */}
      <div className="mt-6">
        <Panel title="Jamoa aʼzolari" action={
          editable && (
            <button type="button" className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]">
              <Plus className="h-4 w-4" /> Xodim qoʻshish
            </button>
          )
        }>
          <div className="divide-y divide-slate-100">
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.username} className="flex items-center gap-4 px-5 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-bold text-[var(--color-primary)]">
                  {account.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{account.name}</p>
                  <p className="text-sm text-slate-500">{account.username}</p>
                </div>
                <Badge tone={ROLE_META[account.role].tone}>{ROLE_META[account.role].label}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
