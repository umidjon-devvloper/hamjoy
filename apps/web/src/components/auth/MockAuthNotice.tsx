import { AlertTriangle } from 'lucide-react';

export function MockAuthNotice() {
  return (
    <div
      className="flex gap-3 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      role="note"
    >
      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
      <div>
        <p className="font-semibold">Development mock authentication</p>
        <p className="text-xs mt-1 text-amber-800/90 leading-relaxed">
          Passwords are not verified or stored. Use <strong>demo@jobmarket.app</strong> or{' '}
          <strong>admin@jobmarket.app</strong> for admin access in mock mode.
        </p>
      </div>
    </div>
  );
}
