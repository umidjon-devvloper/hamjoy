import { describe, expect, it } from 'vitest';
import { DEFAULT_ROLE_PERMISSIONS, DEMO_ACCOUNTS, findDemoAccount, roleCan } from '@/lib/admin/access';

describe('admin demo access', () => {
  it('accepts each demo account and rejects a wrong password', () => {
    for (const a of DEMO_ACCOUNTS) expect(findDemoAccount(` ${a.username.toUpperCase()} `, a.password)?.role).toBe(a.role);
    expect(findDemoAccount('admin', 'admin123')).toBeUndefined();
  });

  it('gives the main demo login full rights', () => {
    expect(findDemoAccount('admin', 'Admin123!')?.role).toBe('super_admin');
  });

  it('keeps role management with Super Admin only by default', () => {
    expect(roleCan(DEFAULT_ROLE_PERMISSIONS, 'super_admin', 'roles.manage')).toBe(true);
    expect(roleCan(DEFAULT_ROLE_PERMISSIONS, 'admin', 'roles.manage')).toBe(false);
    expect(roleCan(DEFAULT_ROLE_PERMISSIONS, 'operator', 'jobs.delete')).toBe(false);
    expect(roleCan(DEFAULT_ROLE_PERMISSIONS, 'operator', 'reports.resolve')).toBe(true);
  });

  it('never lets Super Admin lose a permission', () => {
    expect(roleCan({ ...DEFAULT_ROLE_PERMISSIONS, super_admin: [] }, 'super_admin', 'settings.manage')).toBe(true);
  });
});
