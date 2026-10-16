import type { User } from '@/types';
import { users as usersData } from '@/data';
import { authService } from '@/services/auth.service';

export const usersService = {
  getById(id: string): User | undefined {
    return authService.getUserByIdSync(id) ?? usersData.find((u) => u.id === id);
  },

  getCurrentUser(): User {
    return authService.getCurrentUser();
  },

  getCurrentUserId(): string {
    return authService.getCurrentUserId();
  },

  listUsers(): User[] {
    return [...usersData];
  },
};
