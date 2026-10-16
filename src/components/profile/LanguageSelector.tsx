'use client';

import type { AppLanguage } from '@/types';
import { Select } from '@/components/ui/Select';
import { LANGUAGE_OPTIONS } from '@/lib/validations/profile.validation';

interface LanguageSelectorProps {
  value: AppLanguage;
  onChange: (language: AppLanguage) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <Select
      label="Language"
      value={value}
      onChange={(e) => onChange(e.target.value as AppLanguage)}
      options={LANGUAGE_OPTIONS}
    />
  );
}
