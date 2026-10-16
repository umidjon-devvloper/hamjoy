import { AdminShell } from '@/components/admin/AdminShell';

/** Every admin page except /admin/login: sidebar, top bar, session and permission checks. */
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
