'use client';

import { useState, FormEvent, useCallback } from 'react';
import type { User, UserProfileUpdate } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FormErrorSummary } from '@/components/ui/FormErrorSummary';
import { ProfileRoleSelector } from './ProfileRoleSelector';
import { LanguageSelector } from './LanguageSelector';
import { UserAvatar } from './UserAvatar';
import {
  validateProfileUpdate,
  hasProfileErrors,
  type ProfileFormErrors,
} from '@/lib/validations/profile.validation';
import { appToast } from '@/lib/feedback/toast';

interface ProfileFormProps {
  user: User;
  onSubmit: (patch: UserProfileUpdate) => void;
  isSubmitting?: boolean;
}

export function ProfileForm({ user, onSubmit, isSubmitting }: ProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [title, setTitle] = useState(user.title ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [profileRole, setProfileRole] = useState(user.profileRole);
  const [language, setLanguage] = useState(user.language);
  const [errors, setErrors] = useState<ProfileFormErrors>({});

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const patch: UserProfileUpdate = {
      name,
      phone,
      title,
      avatarUrl,
      profileRole,
      language,
    };
    const validation = validateProfileUpdate(patch);
    setErrors(validation);
    if (hasProfileErrors(validation)) {
      const first = Object.values(validation).find(Boolean);
      if (first) appToast.validation(String(first));
      return;
    }
    onSubmit(patch);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormErrorSummary errors={errors} />

      <div className="flex flex-col items-center gap-3">
        <UserAvatar src={avatarUrl} alt={name} size="xl" />
        <Input
          label="Avatar URL"
          value={avatarUrl}
          onChange={(e) => {
            setAvatarUrl(e.target.value);
            clearError('avatarUrl');
          }}
          error={errors.avatarUrl}
          placeholder="https://..."
          hint="Paste an image URL for your profile photo"
        />
      </div>

      <Input
        label="Full name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          clearError('name');
        }}
        error={errors.name}
        autoComplete="name"
      />

      <Input
        label="Phone"
        type="tel"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          clearError('phone');
        }}
        error={errors.phone}
        placeholder="+1 (555) 123-4567"
        autoComplete="tel"
      />

      <Input
        label="Professional title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Product Designer"
      />

      <ProfileRoleSelector
        value={profileRole}
        onChange={(value) => {
          setProfileRole(value);
          clearError('profileRole');
        }}
        error={errors.profileRole}
      />

      <LanguageSelector value={language} onChange={setLanguage} />

      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Save changes
      </Button>
    </form>
  );
}
