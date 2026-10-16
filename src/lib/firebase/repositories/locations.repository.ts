import type { LocationRecord } from '@/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase/client';
import type { LocationRow } from '@/lib/firebase/document.types';

const COLLECTION = 'locations';

function mapLocationRow(row: LocationRow): LocationRecord {
  return {
    id: row.id,
    label: row.label,
    slug: row.slug,
    isActive: row.is_active,
  };
}

function locationRef(id: string) {
  return doc(getFirestoreDb(), COLLECTION, id);
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const firebaseLocationsRepository = {
  async list(): Promise<LocationRecord[]> {
    const snap = await getDocs(collection(getFirestoreDb(), COLLECTION));
    return snap.docs
      .map((d) => mapLocationRow({ id: d.id, ...d.data() } as LocationRow))
      .sort((a, b) => a.label.localeCompare(b.label));
  },

  async create(label: string): Promise<LocationRecord> {
    const row: LocationRow = {
      id: `loc-${Date.now()}`,
      label: label.trim(),
      slug: slugify(label),
      is_active: true,
      created_at: new Date().toISOString(),
    };
    await setDoc(locationRef(row.id), row);
    return mapLocationRow(row);
  },

  async update(
    id: string,
    patch: Partial<Pick<LocationRecord, 'label' | 'isActive'>>
  ): Promise<LocationRecord> {
    const updates: Partial<LocationRow> = {};
    if (patch.label !== undefined) {
      updates.label = patch.label;
      updates.slug = slugify(patch.label);
    }
    if (patch.isActive !== undefined) updates.is_active = patch.isActive;

    const ref = locationRef(id);
    await updateDoc(ref, updates);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Location not found');
    return mapLocationRow({ id: snap.id, ...snap.data() } as LocationRow);
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(locationRef(id));
  },
};
