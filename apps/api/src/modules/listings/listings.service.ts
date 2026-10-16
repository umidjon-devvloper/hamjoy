import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { listingAttrs, listingMedia, listings } from '../../db/schema';
import type { AuthUser } from '../../common/current-user.decorator';
import type { CreateListingDto, SearchQueryDto, UpdateListingDto } from './dto';
import { ListingsSearch, type ListingSearchDoc } from './listings.search';

@Injectable()
export class ListingsService {
  constructor(@Inject(DB) private readonly db: DbClient, private readonly search: ListingsSearch) {}

  private async hydrate(ids: string[]) {
    if (ids.length === 0) return [];
    const rows = await this.db.select().from(listings).where(inArray(listings.id, ids));
    const media = await this.db.select().from(listingMedia).where(inArray(listingMedia.listingId, ids));
    const attrs = await this.db.select().from(listingAttrs).where(inArray(listingAttrs.listingId, ids));

    const mediaByListing = new Map<string, typeof media>();
    for (const m of media) {
      const bucket = mediaByListing.get(m.listingId) ?? [];
      bucket.push(m);
      mediaByListing.set(m.listingId, bucket);
    }
    const attrsByListing = new Map<string, Record<string, string>>();
    for (const a of attrs) {
      const bucket = attrsByListing.get(a.listingId) ?? {};
      bucket[a.key] = a.value;
      attrsByListing.set(a.listingId, bucket);
    }

    const byId = new Map(rows.map((r) => [r.id, r]));
    return ids
      .map((id) => byId.get(id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .map((r) => ({
        ...r,
        media: (mediaByListing.get(r.id) ?? []).sort((a, b) => a.order - b.order),
        attrs: attrsByListing.get(r.id) ?? {},
      }));
  }

  async create(user: AuthUser, dto: CreateListingDto) {
    const [row] = await this.db
      .insert(listings)
      .values({
        userId: user.id,
        type: dto.type,
        categoryId: dto.categoryId,
        locationId: dto.locationId,
        title: dto.title,
        description: dto.description,
        priceAmount: dto.price?.amount != null ? String(dto.price.amount) : null,
        priceCurrency: dto.price?.currency ?? null,
        priceNegotiable: dto.price?.negotiable ?? false,
      })
      .returning();

    if (dto.media.length) {
      await this.db.insert(listingMedia).values(
        dto.media.map((m, i) => ({ listingId: row!.id, url: m.url, kind: m.kind, order: i })),
      );
    }
    if (Object.keys(dto.attrs).length) {
      await this.db.insert(listingAttrs).values(
        Object.entries(dto.attrs).map(([key, value]) => ({ listingId: row!.id, key, value: String(value) })),
      );
    }
    if (dto.geo) {
      await this.db.execute(sql`
        UPDATE listings SET geo = ST_SetSRID(ST_MakePoint(${dto.geo.lng}, ${dto.geo.lat}), 4326)::geography
        WHERE id = ${row!.id}
      `);
    }

    return (await this.hydrate([row!.id]))[0]!;
  }

  async update(user: AuthUser, id: string, patch: UpdateListingDto) {
    const existing = await this.getOwned(user, id);
    const updates: Partial<typeof listings.$inferInsert> = {};
    if (patch.title !== undefined) updates.title = patch.title;
    if (patch.description !== undefined) updates.description = patch.description;
    if (patch.categoryId !== undefined) updates.categoryId = patch.categoryId;
    if (patch.locationId !== undefined) updates.locationId = patch.locationId;
    if (patch.type !== undefined) updates.type = patch.type;
    if (patch.price !== undefined) {
      updates.priceAmount = patch.price?.amount != null ? String(patch.price.amount) : null;
      updates.priceCurrency = patch.price?.currency ?? null;
      updates.priceNegotiable = patch.price?.negotiable ?? false;
    }

    if (Object.keys(updates).length) {
      await this.db.update(listings).set(updates).where(eq(listings.id, id));
    }
    if (existing.status === 'active') await this.indexOne(id);
    return (await this.hydrate([id]))[0]!;
  }

  async publish(user: AuthUser, id: string) {
    await this.getOwned(user, id);
    await this.db
      .update(listings)
      .set({ status: 'pending', publishedAt: new Date() })
      .where(eq(listings.id, id));
    return (await this.hydrate([id]))[0]!;
  }

  async remove(user: AuthUser, id: string) {
    await this.getOwned(user, id);
    await this.db.update(listings).set({ status: 'archived' }).where(eq(listings.id, id));
    await this.search.remove(id);
    return { ok: true as const };
  }

  async getById(id: string) {
    const [row] = await this.hydrate([id]);
    if (!row) throw new NotFoundException({ code: 'not_found', message: "E'lon topilmadi" });
    await this.db.update(listings).set({ viewsCount: sql`${listings.viewsCount} + 1` }).where(eq(listings.id, id));
    return row;
  }

  async searchActive(q: SearchQueryDto) {
    const { ids, total } = await this.search.search(q);
    const items = ids.length ? await this.hydrate(ids) : [];
    const offset = Number(q.cursor ?? 0);
    const nextOffset = offset + items.length;
    return {
      items,
      total,
      cursor: nextOffset < total ? String(nextOffset) : null,
    };
  }

  async mine(user: AuthUser, status?: string) {
    const where = status
      ? and(eq(listings.userId, user.id), eq(listings.status, status as 'draft' | 'pending' | 'active' | 'archived' | 'blocked'))
      : eq(listings.userId, user.id);
    const rows = await this.db.select().from(listings).where(where).orderBy(desc(listings.createdAt)).limit(100);
    return this.hydrate(rows.map((r) => r.id));
  }

  async moderate(id: string, decision: 'approve' | 'reject' | 'block') {
    const nextStatus = decision === 'approve' ? 'active' : decision === 'reject' ? 'draft' : 'blocked';
    await this.db.update(listings).set({ status: nextStatus }).where(eq(listings.id, id));
    if (nextStatus === 'active') await this.indexOne(id);
    else await this.search.remove(id);
    return (await this.hydrate([id]))[0]!;
  }

  private async getOwned(user: AuthUser, id: string) {
    const [row] = await this.db.select().from(listings).where(eq(listings.id, id)).limit(1);
    if (!row) throw new NotFoundException({ code: 'not_found', message: "E'lon topilmadi" });
    if (row.userId !== user.id && user.role === 'user') {
      throw new ForbiddenException({ code: 'forbidden', message: "Bu e'lon sizniki emas" });
    }
    return row;
  }

  async indexOne(id: string): Promise<void> {
    const [row] = await this.hydrate([id]);
    if (!row) return;
    const doc: ListingSearchDoc = {
      id: row.id,
      type: row.type,
      categoryId: row.categoryId,
      locationId: row.locationId,
      title: row.title,
      description: row.description,
      priceAmount: row.priceAmount != null ? Number(row.priceAmount) : null,
      currency: row.priceCurrency,
      status: row.status,
      publishedAt: row.publishedAt ? row.publishedAt.getTime() : null,
      viewsCount: row.viewsCount,
    };
    await this.search.upsert(doc);
  }
}
