import type { Category } from '@/types';
import { getJoymeeClient } from './client';

interface JoymeeCategoryNode {
  id: number;
  parentId: number | null;
  slug: string;
  nameUz: string;
  nameRu: string;
  icon: string | null;
  children: JoymeeCategoryNode[];
}

function flatten(nodes: JoymeeCategoryNode[]): Category[] {
  const out: Category[] = [];
  const walk = (list: JoymeeCategoryNode[]) => {
    for (const n of list) {
      out.push({
        id: String(n.id),
        name: n.nameUz,
        slug: n.slug,
        icon: n.icon ?? 'tag',
        jobCount: 0,
      });
      if (n.children.length) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

export const joymeeCategoriesRepository = {
  async list(): Promise<Category[]> {
    // Call the raw endpoint — SDK doesn't expose categories yet.
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4001';
    const res = await fetch(`${base}/categories`);
    if (!res.ok) throw new Error(`Categories ${res.status}`);
    const tree = (await res.json()) as JoymeeCategoryNode[];
    return flatten(tree);
  },

  async getById(id: string): Promise<Category | undefined> {
    const all = await this.list();
    return all.find((c) => c.id === id);
  },

  async getBySlug(slug: string): Promise<Category | undefined> {
    const all = await this.list();
    return all.find((c) => c.slug === slug);
  },
};

void getJoymeeClient;
