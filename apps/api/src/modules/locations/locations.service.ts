import { Inject, Injectable } from '@nestjs/common';
import { DB, type DbClient } from '../../db/db.module';
import { locations } from '../../db/schema';

export interface LocationNode {
  id: number;
  parentId: number | null;
  nameUz: string;
  nameRu: string;
  children: LocationNode[];
}

@Injectable()
export class LocationsService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  async tree(): Promise<LocationNode[]> {
    const rows = await this.db.select().from(locations);
    const byId = new Map<number, LocationNode>();
    for (const r of rows) byId.set(r.id, { ...r, children: [] });
    const roots: LocationNode[] = [];
    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) byId.get(node.parentId)!.children.push(node);
      else roots.push(node);
    }
    return roots;
  }
}
