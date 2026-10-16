'use client';

import type { ProfileRole } from '@/types';
import { PROFILE_ROLE_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import { PROFILE_ROLE_OPTIONS } from '@/lib/validations/profile.validation';

interface ProfileRoleSelectorProps {
  value: ProfileRole;
  onChange: (role: ProfileRole) => void;
  error?: string;
}

export function ProfileRoleSelector({ value, onChange, error }: ProfileRoleSelectorProps) {
  return (
    <div>
      <p className="text-sm font-medium text-[var(--color-secondary)] mb-2">Role</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {PROFILE_ROLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
              value === opt.value
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-secondary)] hover:bg-gray-50'
            )}
          >
            {PROFILE_ROLE_LABELS[opt.value]}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
