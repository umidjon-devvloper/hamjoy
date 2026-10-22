import type { User, UserProfileUpdate } from '@/types';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/types';
import { getJoymeeClient } from './client';

function mapMe(me: Awaited<ReturnType<ReturnType<typeof getJoymeeClient>['users']['me']>>): User {
  const trusted = (me.user as { trusted?: boolean }).trusted ?? false;
  return {
    id: me.user.id,
    email: me.user.email ?? '',
    name: me.profile?.fullName ?? 'Yangi foydalanuvchi',
    role: me.user.role === 'admin' ? 'admin' : 'seeker',
    profileRole: 'both',
    phone: me.user.phone ?? undefined,
    title: undefined,
    avatarUrl: me.profile?.avatarUrl ?? '',
    language: 'uz',
    notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
    blocked: me.user.status === 'blocked',
    trusted,
  };
}

export const joymeeProfilesRepository = {
  async getById(userId: string): Promise<User | undefined> {
    try {
      const me = await getJoymeeClient().users.me();
      if (me.user.id !== userId) return undefined;
      return mapMe(me);
    } catch {
      return undefined;
    }
  },

  async update(userId: string, patch: UserProfileUpdate): Promise<User | undefined> {
    try {
      await getJoymeeClient().users.updateProfile({
        fullName: patch.name ?? undefined,
        avatarUrl: patch.avatarUrl ?? undefined,
      });
      const me = await getJoymeeClient().users.me();
      if (me.user.id !== userId) return undefined;
      return mapMe(me);
    } catch {
      return undefined;
    }
  },
};
