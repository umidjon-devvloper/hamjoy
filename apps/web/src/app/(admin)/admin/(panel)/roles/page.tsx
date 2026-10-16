'use client';

import React from 'react';
import { Check, Lock, RotateCcw, X } from 'lucide-react';
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
        subtitle={editable ? 'Har bir rol nimalarni qila olishini belgilang — oʻzgarish darhol kuchga kiradi' : 'Rollar imtiyozlari (faqat koʻrish)'}
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

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_ROLES.map((role) => {
          const account = DEMO_ACCOUNTS.find((a) => a.role === role);
          return (
            <div key={role} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <Badge tone={ROLE_META[role].tone}>{ROLE_META[role].label}</Badge>
              <p className="mt-3 text-sm text-slate-600">{ROLE_META[role].description}</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {permissions[role].length}
                <span className="text-sm font-medium text-slate-500"> / {Object.keys(PERMISSIONS).length} imtiyoz</span>
              </p>
              {account && <p className="mt-2 font-mono text-xs text-slate-500">Demo: {account.username}</p>}
            </div>
          );
        })}
      </div>

      <Panel title="Imtiyozlar jadvali">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr>
                <th className={thClass}>Boʻlim / amal</th>
                {ADMIN_ROLES.map((role) => (
                  <th key={role} className={`${thClass} text-center`}>
                    {ROLE_META[role].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.map((group) => (
                <React.Fragment key={group.label}>
                  <tr>
                    <td colSpan={ADMIN_ROLES.length + 1} className="border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                      {group.label}
                    </td>
                  </tr>
                  {group.permissions.map((permission) => (
                    <tr key={permission}>
                      <td className={tdClass}>{PERMISSIONS[permission]}</td>
                      {ADMIN_ROLES.map((role) => {
                        const allowed = roleCan(permissions, role, permission);
                        const locked = role === 'super_admin' || !editable;
                        return (
                          <td key={role} className={`${tdClass} text-center`}>
                            {locked ? (
                              <span className="inline-flex items-center justify-center" title={role === 'super_admin' ? 'Super Admin har doim toʻliq huquqli' : undefined}>
                                {allowed ? <Check className="h-5 w-5 text-emerald-600" /> : <X className="h-5 w-5 text-red-500" />}
                                {role === 'super_admin' && <Lock className="ml-1 h-3 w-3 text-slate-300" />}
                              </span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={allowed}
                                onChange={() => toggle(role, permission)}
                                aria-label={`${ROLE_META[role].label}: ${PERMISSIONS[permission]}`}
                                className="h-4 w-4 accent-blue-600"
                              />
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
    </>
  );
}
