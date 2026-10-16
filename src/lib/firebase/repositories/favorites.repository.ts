import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase/client';
import type { FavoriteRow } from '@/lib/firebase/document.types';

const COLLECTION = 'favorites';

function favoriteId(userId: string, jobId: string) {
  return `${userId}_${jobId}`;
}

function favoriteRef(userId: string, jobId: string) {
  return doc(getFirestoreDb(), COLLECTION, favoriteId(userId, jobId));
}

export const firebaseFavoritesRepository = {
  async getFavoriteIds(userId: string): Promise<Set<string>> {
    const q = query(collection(getFirestoreDb(), COLLECTION), where('user_id', '==', userId));
    const snap = await getDocs(q);
    return new Set(snap.docs.map((d) => (d.data() as FavoriteRow).job_id));
  },

  async toggle(userId: string, jobId: string): Promise<boolean> {
    const ref = favoriteRef(userId, jobId);
    const existing = await getDoc(ref);

    if (existing.exists()) {
      await deleteDoc(ref);
      return false;
    }

    const row: FavoriteRow = {
      user_id: userId,
      job_id: jobId,
      created_at: new Date().toISOString(),
    };
    await setDoc(ref, row);
    return true;
  },
};
