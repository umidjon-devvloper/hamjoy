import { favorites as favoritesData, FAVORITES_STORAGE_KEY } from '@/data';
import { isBackendEnabled } from '@/lib/backend/config';
import { isRestBackendEnabled } from '@/lib/api/config';
import { firebaseFavoritesRepository } from '@/lib/firebase/repositories/favorites.repository';
import { authService } from '@/services/auth.service';

function readStorage(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set(favoritesData.map((f) => f.jobId));
  }
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (raw) {
      const ids = JSON.parse(raw) as string[];
      return new Set(ids);
    }
  } catch {
    /* use seed */
  }
  return new Set(favoritesData.map((f) => f.jobId));
}

function writeStorage(jobIds: Set<string>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...jobIds]));
}

export const favoritesService = {
  getFavoriteJobIds(): Set<string> {
    return readStorage();
  },

  async getFavoriteJobIdsAsync(): Promise<Set<string>> {
    if (isRestBackendEnabled()) {
      const { restFavoritesRepository } = await import('@/lib/rest/repositories/favorites.repository');
      return restFavoritesRepository.getFavoriteIds(authService.getCurrentUserId());
    }
    if (isBackendEnabled()) {
      return firebaseFavoritesRepository.getFavoriteIds(authService.getCurrentUserId());
    }
    return readStorage();
  },

  isFavorite(jobId: string): boolean {
    return readStorage().has(jobId);
  },

  async isFavoriteAsync(jobId: string): Promise<boolean> {
    const ids = await this.getFavoriteJobIdsAsync();
    return ids.has(jobId);
  },

  toggleFavorite(jobId: string): boolean {
    const ids = readStorage();
    const isNowSaved = !ids.has(jobId);
    if (isNowSaved) ids.add(jobId);
    else ids.delete(jobId);
    writeStorage(ids);
    return isNowSaved;
  },

  async toggleFavoriteAsync(jobId: string): Promise<boolean> {
    if (isRestBackendEnabled()) {
      const { restFavoritesRepository } = await import('@/lib/rest/repositories/favorites.repository');
      return restFavoritesRepository.toggle(authService.getCurrentUserId(), jobId);
    }
    if (isBackendEnabled()) {
      return firebaseFavoritesRepository.toggle(authService.getCurrentUserId(), jobId);
    }
    return this.toggleFavorite(jobId);
  },

  getSeedIds(): string[] {
    return favoritesData.map((f) => f.jobId);
  },
};
