import { toast } from 'sonner';
import { formatUserError } from '@/lib/errors/format-user-error';

export const appToast = {
  success(message: string) {
    toast.success(message);
  },

  error(error: unknown, fallback = 'Something went wrong. Please try again.') {
    toast.error(formatUserError(error, fallback));
  },

  info(message: string) {
    toast.info(message);
  },

  validation(message: string) {
    toast.error(message);
  },

  saved(resource = 'Changes') {
    toast.success(`${resource} saved`);
  },

  favoriteToggled(saved: boolean) {
    if (saved) {
      toast.success('Job saved to Favorites');
    } else {
      toast.info('Job removed from Favorites');
    }
  },
};
