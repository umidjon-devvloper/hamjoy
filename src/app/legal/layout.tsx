import Link from 'next/link';
import { ROUTES } from '@/lib/navigation/routes';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="page-container py-4 flex items-center justify-between gap-4">
          <Link href={ROUTES.home} className="text-sm font-semibold text-[var(--color-primary)]">
            ← Back to HamJoy
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/legal/privacy" className="text-[var(--color-muted)] hover:text-[var(--color-primary)]">
              Privacy
            </Link>
            <Link href="/legal/terms" className="text-[var(--color-muted)] hover:text-[var(--color-primary)]">
              Terms
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
