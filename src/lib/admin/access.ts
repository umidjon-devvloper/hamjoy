import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { createLocalStore } from '@/lib/local-store';

/**
 * Admin panel access — demo only. Staff accounts, roles and permissions live in the browser
 * until a backend exists; then `loginAdmin` and the role store become API calls. Nothing here
 * is a security boundary: it is a working model of the real rules.
 */

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'operator';

export const ADMIN_ROLES: AdminRole[] = ['super_admin', 'admin', 'moderator', 'operator'];

export const ROLE_META: Record<AdminRole, { label: string; description: string; tone: BadgeTone }> = {
  super_admin: { label: 'Super Admin', description: 'Toʻliq boshqaruv, rollarni ham', tone: 'red' },
  admin: { label: 'Admin', description: 'Asosiy boshqaruv', tone: 'blue' },
  moderator: { label: 'Moderator', description: 'Eʼlonlarni tekshirish', tone: 'purple' },
  operator: { label: 'Operator', description: 'Murojaatlar bilan ishlash', tone: 'orange' },
};

export type BadgeTone = 'green' | 'orange' | 'red' | 'blue' | 'purple' | 'gray';

export const PERMISSIONS = {
  'dashboard.view': 'Statistikani koʻrish',
  'users.view': 'Foydalanuvchilarni koʻrish',
  'users.block': 'Bloklash va blokdan chiqarish',
  'listings.view': 'Uy-joy eʼlonlarini koʻrish',
  'listings.moderate': 'Tasdiqlash va tekshiruvga qaytarish',
  'listings.delete': 'Uy-joy eʼlonini oʻchirish',
  'jobs.view': 'Ish eʼlonlarini koʻrish',
  'jobs.moderate': 'Tasdiqlash va yopish',
  'jobs.delete': 'Ish eʼlonini oʻchirish',
  'reports.view': 'Murojaatlarni koʻrish',
  'reports.resolve': 'Murojaatga javob berish',
  'roles.manage': 'Rollar va imtiyozlarni boshqarish',
  'settings.manage': 'Kategoriya va hududlarni boshqarish',
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  { label: 'Dashboard', permissions: ['dashboard.view'] },
  { label: 'Foydalanuvchilar', permissions: ['users.view', 'users.block'] },
  { label: 'Uy-joy eʼlonlari', permissions: ['listings.view', 'listings.moderate', 'listings.delete'] },
  { label: 'Ish eʼlonlari', permissions: ['jobs.view', 'jobs.moderate', 'jobs.delete'] },
  { label: 'Murojaatlar', permissions: ['reports.view', 'reports.resolve'] },
  { label: 'Rollar va imtiyozlar', permissions: ['roles.manage'] },
  { label: 'Sozlamalar', permissions: ['settings.manage'] },
];

const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

export const DEFAULT_ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS.filter((p) => p !== 'roles.manage'),
  moderator: [
    'dashboard.view',
    'users.view',
    'listings.view',
    'listings.moderate',
    'jobs.view',
    'jobs.moderate',
    'reports.view',
    'reports.resolve',
  ],
  operator: ['dashboard.view', 'listings.view', 'jobs.view', 'reports.view', 'reports.resolve'],
};

/** Demo staff accounts, one per role. Shown on the login page; replace with real auth later. */
export const DEMO_ACCOUNTS: { username: string; password: string; name: string; role: AdminRole }[] = [
  { username: 'admin', password: 'Admin123!', name: 'Admin', role: 'super_admin' },
  { username: 'menejer', password: 'Menejer123!', name: 'Menejer', role: 'admin' },
  { username: 'moderator', password: 'Moder123!', name: 'Moderator', role: 'moderator' },
  { username: 'operator', password: 'Oper123!', name: 'Operator', role: 'operator' },
];

export interface AdminSession {
  username: string;
  name: string;
  role: AdminRole;
}

// ---- Session: localStorage when "Meni eslab qolish" is on, sessionStorage otherwise ----

const SESSION_KEY = 'hamjoy:admin-session';
const sessionListeners = new Set<() => void>();
const SERVER = '__server__';

function readSessionRaw(): string {
  try {
    return localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY) ?? '';
  } catch {
    return '';
  }
}

function subscribeSession(listener: () => void) {
  sessionListeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    sessionListeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

export function findDemoAccount(username: string, password: string) {
  const name = username.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((a) => a.username === name && a.password === password);
}

export function loginAdmin(username: string, password: string, remember: boolean): AdminSession {
  const account = findDemoAccount(username, password);
  if (!account) throw new Error('Login yoki parol notoʻgʻri');
  const session: AdminSession = { username: account.username, name: account.name, role: account.role };
  logoutAdmin();
  (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
  sessionListeners.forEach((l) => l());
  return session;
}

export function logoutAdmin() {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
  sessionListeners.forEach((l) => l());
}

function parseSession(raw: string): AdminSession | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as AdminSession;
    return ADMIN_ROLES.includes(value.role) ? value : null;
  } catch {
    return null;
  }
}

/** `ready` is false during SSR / the first client render, so pages can tell "loading" from "logged out". */
export function useAdminSession(): { session: AdminSession | null; ready: boolean } {
  const raw = useSyncExternalStore(subscribeSession, readSessionRaw, () => SERVER);
  return useMemo(
    () => ({ session: raw === SERVER ? null : parseSession(raw), ready: raw !== SERVER }),
    [raw]
  );
}

// ---- Role permissions (editable on the Roles page) ----

const rolePermissionStore = createLocalStore<Partial<Record<AdminRole, Permission[]>>>(
  'hamjoy:admin-role-permissions',
  {}
);

export function roleCan(
  permissions: Record<AdminRole, Permission[]>,
  role: AdminRole,
  permission: Permission
): boolean {
  // Super Admin can never lock itself out.
  return role === 'super_admin' || permissions[role].includes(permission);
}

export function useRolePermissions() {
  const overrides = rolePermissionStore.useValue();
  const permissions = useMemo(
    () => ({ ...DEFAULT_ROLE_PERMISSIONS, ...overrides, super_admin: ALL_PERMISSIONS }),
    [overrides]
  );
  const setRolePermissions = useCallback(
    (role: AdminRole, next: Permission[]) => {
      if (role === 'super_admin') return;
      rolePermissionStore.write({ ...rolePermissionStore.read(), [role]: next });
    },
    []
  );
  return { permissions, setRolePermissions, reset: rolePermissionStore.clear };
}

/** `can('jobs.delete')` for the signed-in staff member. */
export function useCan() {
  const { session } = useAdminSession();
  const { permissions } = useRolePermissions();
  return useCallback(
    (permission: Permission) => Boolean(session && roleCan(permissions, session.role, permission)),
    [session, permissions]
  );
}
