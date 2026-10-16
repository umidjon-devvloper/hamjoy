import type { LoginCredentials, RegisterCredentials } from '@/types';
import type { ProfileRole } from '@/types';

export type AuthFormErrors = Partial<Record<string, string>>;

export function validateLogin(credentials: LoginCredentials): AuthFormErrors {
  const errors: AuthFormErrors = {};
  const email = credentials.email.trim();

  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';

  if (!credentials.password) errors.password = 'Password is required';

  return errors;
}

export function validateRegister(
  credentials: RegisterCredentials & { confirmPassword?: string }
): AuthFormErrors {
  const errors: AuthFormErrors = { ...validateLogin(credentials) };

  if (!credentials.name.trim()) errors.name = 'Name is required';
  else if (credentials.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (credentials.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (credentials.confirmPassword !== undefined && credentials.password !== credentials.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!credentials.profileRole) errors.profileRole = 'Select how you will use HamJoy';

  return errors;
}

export function hasAuthErrors(errors: AuthFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export const PROFILE_ROLE_OPTIONS: { value: ProfileRole; label: string; description: string }[] = [
  { value: 'seeker', label: 'Ish izlovchi', description: 'Ishlarni koʻrish va ariza yuborish' },
  { value: 'poster', label: 'Ish beruvchi', description: 'Eʼlon joylash va xodim yollash' },
  { value: 'both', label: 'Ikkalasi', description: 'Ish izlash va eʼlon joylash' },
];
