import type { Timestamp, UUID } from './common';

export type UserRole = 'user' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'blocked' | 'pending';

export interface User {
  id: UUID;
  phone: string | null;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  /** Admin-granted trust mark (Telegram-style ✓). */
  trusted?: boolean;
  createdAt: Timestamp;
}

export interface Profile {
  userId: UUID;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  rating: number;
  cityId: number | null;
}
