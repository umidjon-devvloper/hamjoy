import type { UserProfileUpdate } from '@/types';
import type { ProfileRole, AppLanguage } from '@/types';

export type ProfileFormErrors = Partial<Record<string, string>>;

export function validateProfileUpdate(data: UserProfileUpdate): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (data.name !== undefined) {
    if (!data.name.trim()) errors.name = 'Name is required';
    else if (data.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  }

  if (data.phone !== undefined && data.phone.trim()) {
    const phone = data.phone.replace(/\s/g, '');
    if (!/^\+?[\d\-()]{7,20}$/.test(phone)) {
      errors.phone = 'Enter a valid phone number';
    }
  }

  if (data.avatarUrl !== undefined && data.avatarUrl.trim()) {
    try {
      new URL(data.avatarUrl);
    } catch {
      errors.avatarUrl = 'Enter a valid image URL';
    }
  }

  return errors;
}

export function hasProfileErrors(errors: ProfileFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export const LANGUAGE_OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'uz', label: 'Uzbek' },
  { value: 'ru', label: 'Russian' },
];

export const PROFILE_ROLE_OPTIONS: { value: ProfileRole; label: string }[] = [
  { value: 'seeker', label: 'Ish izlovchi' },
  { value: 'poster', label: 'Ish beruvchi' },
  { value: 'both', label: 'Ikkalasi' },
];
