'use client';

import { useState, useRef, FormEvent, useCallback } from 'react';
import { Camera, Loader2 } from 'lucide-react';
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
import { joymeeUploads } from '@/lib/joymee/uploads';
import { useI18n } from '@/lib/i18n';

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
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

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
        <div className="relative">
          <UserAvatar src={preview ?? avatarUrl} alt={name} size="xl" />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-white shadow-md transition-transform hover:scale-105 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const localUrl = URL.createObjectURL(file);
            setPreview(localUrl);
            setUploading(true);
            try {
              const url = await joymeeUploads.upload('avatar', file);
              setAvatarUrl(url);
              setPreview(null);
              clearError('avatarUrl');
              appToast.success(t.profile_image_uploaded);
            } catch (err) {
              setPreview(null);
              appToast.error(err, t.profile_image_failed);
            } finally {
              setUploading(false);
              URL.revokeObjectURL(localUrl);
              e.target.value = '';
            }
          }}
        />
        <p className="text-xs text-[var(--color-muted)]">{t.profile_change_avatar}</p>
        {errors.avatarUrl && (
          <p className="text-xs text-red-500">{errors.avatarUrl}</p>
        )}
      </div>

      <Input
        label={t.profile_full_name}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          clearError('name');
        }}
        error={errors.name}
        autoComplete="name"
      />

      <Input
        label={t.profile_phone}
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
        label={t.profile_title}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t.profile_title_placeholder}
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
        {t.save_changes}
      </Button>
    </form>
  );
}
