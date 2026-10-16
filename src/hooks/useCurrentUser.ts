import { usersService } from '@/services';

export function useCurrentUser() {
  return usersService.getCurrentUser();
}
