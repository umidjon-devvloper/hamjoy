import Link from 'next/link';
import { Briefcase } from 'lucide-react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-11 h-11 bg-[var(--color-primary)] text-white rounded-xl flex items-center justify-center shadow-md">
            <Briefcase className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-[var(--color-secondary)]">HamJoy</span>
        </Link>

        <div className="card p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[var(--color-secondary)]">{title}</h1>
            <p className="text-sm text-[var(--color-muted)] mt-1">{subtitle}</p>
          </div>
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-[var(--color-muted)]">{footer}</div>}
      </div>
    </div>
  );
}
