'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { appToast } from '@/lib/feedback/toast';
import { ChevronLeft } from 'lucide-react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useAuth } from '@/context/AuthContext';
import type { UserProfileUpdate } from '@/types';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (patch: UserProfileUpdate) => {
    setIsSubmitting(true);
    try {
      await updateProfile(patch);
      appToast.saved('Profile');
      router.push('/profile');
    } catch (err) {
      appToast.error(err, 'Could not save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RequireAuth>
    <div className="page-container">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-secondary)] mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-xl font-bold text-[var(--color-secondary)] mb-1">Edit profile</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">Update your personal information</p>

      <div className="card p-5 sm:p-6">
        <ProfileForm user={user} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
    </RequireAuth>
  );
}
