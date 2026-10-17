import { AlertTriangle } from 'lucide-react';

export function MockAuthNotice() {
  return (
    <div
      className="flex gap-3 rounded-xl border border-[var(--color-brand-gold)]/50 bg-[var(--color-accent-light)] px-4 py-3 text-sm text-[#3D2E07]"
      role="note"
    >
      <AlertTriangle className="w-5 h-5 shrink-0 text-[#7A5A12] mt-0.5" />
      <div>
        <p className="font-semibold">Development mock authentication</p>
        <p className="text-xs mt-1 text-[#3D2E07] leading-relaxed">
          Passwords are not verified or stored. Use <strong>demo@jobmarket.app</strong> or{' '}
          <strong>admin@jobmarket.app</strong> for admin access in mock mode.
        </p>
      </div>
    </div>
  );
}
