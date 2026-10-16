import { Inject, Injectable } from '@nestjs/common';
import { DB, type DbClient } from '../../db/db.module';
import { categories } from '../../db/schema';

export interface CategoryNode {
  id: number;
  parentId: number | null;
  slug: string;
  nameUz: string;
  nameRu: string;
  icon: string | null;
  children: CategoryNode[];
}

@Injectable()
export class CategoriesService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  async tree(): Promise<CategoryNode[]> {
    const rows = await this.db.select().from(categories);
    const byId = new Map<number, CategoryNode>();
    for (const r of rows) {
      byId.set(r.id, { ...r, children: [] });
    }
    const roots: CategoryNode[] = [];
    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }
}
