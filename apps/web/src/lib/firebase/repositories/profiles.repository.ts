import type { User, UserProfileUpdate } from '@/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  getCountFromServer,
} from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase/client';
import { mapProfileRow, mapProfileToRow } from '@/lib/firebase/mappers';
import type { ProfileRow } from '@/lib/firebase/document.types';

const COLLECTION = 'profiles';

function profileRef(id: string) {
  return doc(getFirestoreDb(), COLLECTION, id);
}

function rowFromSnap(id: string, data: Record<string, unknown>): ProfileRow {
  return { id, ...data } as ProfileRow;
}

export const firebaseProfilesRepository = {
  async getById(id: string): Promise<User | undefined> {
    const snap = await getDoc(profileRef(id));
    if (!snap.exists()) return undefined;
    return mapProfileRow(rowFromSnap(snap.id, snap.data()));
  },

  async upsert(user: User): Promise<User> {
    const row = mapProfileToRow(user);
    const now = new Date().toISOString();
    const existing = await getDoc(profileRef(user.id));
    const payload: ProfileRow = {
      ...(row as ProfileRow),
      created_at: existing.exists()
        ? String(existing.data().created_at ?? now)
        : now,
      updated_at: now,
    };
    await setDoc(profileRef(user.id), payload, { merge: true });
    return mapProfileRow(payload);
  },

  async update(id: string, patch: UserProfileUpdate): Promise<User> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Profile not found');

    const merged: User = {
      ...existing,
      ...patch,
      notifications: patch.notifications
        ? { ...existing.notifications, ...patch.notifications }
        : existing.notifications,
    };

    return this.upsert(merged);
  },

  async list(): Promise<User[]> {
    const snap = await getDocs(collection(getFirestoreDb(), COLLECTION));
    const users = snap.docs.map((d) => mapProfileRow(rowFromSnap(d.id, d.data())));
    return users.sort((a, b) => a.name.localeCompare(b.name));
  },

  async setBlocked(id: string, blocked: boolean): Promise<User> {
    await updateDoc(profileRef(id), { blocked, updated_at: new Date().toISOString() });
    const updated = await this.getById(id);
    if (!updated) throw new Error('Profile not found');
    return updated;
  },

  async count(): Promise<number> {
    const snap = await getCountFromServer(collection(getFirestoreDb(), COLLECTION));
    return snap.data().count;
  },
};
