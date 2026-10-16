'use client';

import { ProfileContent } from './ProfileContent';
import { RequireAuth } from '@/components/auth/RequireAuth';

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
