import type { User, UserProfileUpdate } from '@/types';
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/types';
import { USER_PROFILES_STORAGE_KEY } from '@/data/constants';

function readProfiles(): Record<string, User> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USER_PROFILES_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, User>;
  } catch {
    return {};
  }
}

function writeProfiles(profiles: Record<string, User>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
}

export const profileStore = {
  getById(userId: string): User | undefined {
    return readProfiles()[userId];
  },

  getByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return Object.values(readProfiles()).find((p) => p.email.toLowerCase() === normalized);
  },

  listAll(): User[] {
    return Object.values(readProfiles());
  },

  save(profile: User): User {
    const profiles = readProfiles();
    profiles[profile.id] = profile;
    writeProfiles(profiles);
    return profile;
  },

  update(userId: string, patch: UserProfileUpdate): User | undefined {
    const existing = this.getById(userId);
    if (!existing) return undefined;

    const updated: User = {
      ...existing,
      ...patch,
      notifications: patch.notifications
        ? { ...existing.notifications, ...patch.notifications }
        : existing.notifications,
    };

    return this.save(updated);
  },

  createLocalProfile(input: {
    id: string;
    name: string;
    email: string;
    profileRole: User['profileRole'];
    avatarUrl?: string;
  }): User {
    const profile: User = {
      id: input.id,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      avatarUrl: input.avatarUrl ?? `https://i.pravatar.cc/150?u=${encodeURIComponent(input.email)}`,
      role: input.profileRole === 'poster' ? 'poster' : 'seeker',
      profileRole: input.profileRole,
      language: 'en',
      notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
      badge: 'Member',
    };
    return this.save(profile);
  },
};
