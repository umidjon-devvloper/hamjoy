import type { Category } from '@/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase/client';
import { mapCategoryRow } from '@/lib/firebase/mappers';
import type { CategoryRow, JobRow } from '@/lib/firebase/document.types';

const COLLECTION = 'categories';

function categoryRef(id: string) {
  return doc(getFirestoreDb(), COLLECTION, id);
}

function rowFromSnap(id: string, data: Record<string, unknown>): CategoryRow {
  return { id, ...data } as CategoryRow;
}

export const firebaseCategoriesRepository = {
  async list(): Promise<Category[]> {
    const db = getFirestoreDb();
    const [categoriesSnap, jobsSnap] = await Promise.all([
      getDocs(collection(db, COLLECTION)),
      getDocs(query(collection(db, 'jobs'), where('status', '==', 'active'))),
    ]);

    const counts = new Map<string, number>();
    jobsSnap.docs.forEach((d) => {
      const job = d.data() as Pick<JobRow, 'category_id'>;
      counts.set(job.category_id, (counts.get(job.category_id) ?? 0) + 1);
    });

    return categoriesSnap.docs
      .map((d) => mapCategoryRow(rowFromSnap(d.id, d.data()), counts.get(d.id) ?? 0))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string): Promise<Category | undefined> {
    const snap = await getDoc(categoryRef(id));
    if (!snap.exists()) return undefined;
    return mapCategoryRow(rowFromSnap(snap.id, snap.data()));
  },

  async getBySlug(slug: string): Promise<Category | undefined> {
    const q = query(collection(getFirestoreDb(), COLLECTION), where('slug', '==', slug));
    const snap = await getDocs(q);
    const first = snap.docs[0];
    if (!first) return undefined;
    return mapCategoryRow(rowFromSnap(first.id, first.data()));
  },

  async create(input: { id: string; name: string; slug: string; icon: string }): Promise<Category> {
    const row: CategoryRow = {
      ...input,
      created_at: new Date().toISOString(),
    };
    await setDoc(categoryRef(input.id), row);
    return mapCategoryRow(row);
  },

  async update(
    id: string,
    input: Partial<{ name: string; slug: string; icon: string }>
  ): Promise<Category> {
    await updateDoc(categoryRef(id), input);
    const updated = await this.getById(id);
    if (!updated) throw new Error('Category not found');
    return updated;
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(categoryRef(id));
  },
};
