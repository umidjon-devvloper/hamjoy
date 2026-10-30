import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { chats, favorites, listingAttrs, listingMedia, listings } from '../../db/schema';
import type { AuthUser } from '../../common/current-user.decorator';
import type { CreateListingDto, SearchQueryDto, UpdateListingDto } from './dto';
import { ListingsSearch, type ListingSearchDoc } from './listings.search';
import { PromotionsService } from '../promotions/promotions.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ListingsService {
  constructor(
    @Inject(DB) private readonly db: DbClient,
    private readonly search: ListingsSearch,
    private readonly promotions: PromotionsService,
    private readonly notifications: NotificationsService,
  ) {}

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
    // Derive vertical from type when caller didn't supply it, so the client
    // never has to think about two overlapping concepts.
    const vertical =
      dto.vertical ??
      (dto.type === 'job' || dto.type === 'service' || dto.type === 'worker_offer'
        ? 'ish'
        : dto.type === 'car_sale' || dto.type === 'car_salon'
          ? 'avto'
          : dto.type === 'free_give'
            ? 'bepul'
            : 'uy-joy');

    const [row] = await this.db
      .insert(listings)
      .values({
        userId: user.id,
        type: dto.type,
        vertical,
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
      .set({ status: 'active', publishedAt: new Date() })
      .where(eq(listings.id, id));
    await this.indexOne(id);
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
    let items = ids.length ? await this.hydrate(ids) : [];

    // Geo radius filter: PostGIS is the source of truth for distance, Meili
    // doesn't know about it. If the caller passed lat/lng/radiusKm, cull the
    // Meili result set by whichever ids fall inside the circle.
    if (q.lat != null && q.lng != null && q.radiusKm != null && ids.length > 0) {
      const point = sql`ST_SetSRID(ST_MakePoint(${q.lng}, ${q.lat}), 4326)::geography`;
      const rows = await this.db
        .select({ id: listings.id })
        .from(listings)
        .where(
          and(
            inArray(listings.id, ids),
            sql`geo IS NOT NULL AND ST_DWithin(geo, ${point}, ${q.radiusKm * 1000})`,
          ),
        );
      const keep = new Set(rows.map((r) => r.id));
      items = items.filter((i) => keep.has(i.id));
    }

    // Decorate with active promotion tier so the UI can draw the right ramka.
    // On the first page, also pull promoted listings to the front so paid
    // Gold → Silver → Bronze always lands above the regular feed.
    const offset = Number(q.cursor ?? 0);
    const isFirstPage = offset === 0;

    let ordered = items;
    if (isFirstPage) {
      const top = await this.promotions.topListingIds(50);
      let matching = q.vertical
        ? await this.filterTopByVertical(top.map((t) => t.id), q.vertical)
        : new Set(top.map((t) => t.id));

      // Radius filter also applies to TOP — a promoted listing far away is
      // still useless to a nearby buyer.
      if (q.lat != null && q.lng != null && q.radiusKm != null && matching.size > 0) {
        const point = sql`ST_SetSRID(ST_MakePoint(${q.lng}, ${q.lat}), 4326)::geography`;
        const rows = await this.db
          .select({ id: listings.id })
          .from(listings)
          .where(
            and(
              inArray(listings.id, Array.from(matching)),
              sql`geo IS NOT NULL AND ST_DWithin(geo, ${point}, ${q.radiusKm * 1000})`,
            ),
          );
        matching = new Set(rows.map((r) => r.id));
      }

      const topIds = top.filter((t) => matching.has(t.id)).map((t) => t.id);
      if (topIds.length) {
        const hydratedTop = await this.hydrate(topIds);
        const seen = new Set(topIds);
        ordered = [...hydratedTop, ...items.filter((i) => !seen.has(i.id))];
      }
    }

    const promoMap = await this.promotions.activeForListings(ordered.map((i) => i.id));
    const withPromo = ordered.map((i) => {
      const p = promoMap.get(i.id);
      return {
        ...i,
        promotion: p ? { tier: p.tier, expiresAt: p.expiresAt.toISOString() } : null,
      };
    });

    const nextOffset = offset + items.length;
    return {
      items: withPromo,
      total,
      cursor: nextOffset < total ? String(nextOffset) : null,
    };
  }

  private async filterTopByVertical(ids: string[], vertical: string): Promise<Set<string>> {
    if (ids.length === 0) return new Set();
    const rows = await this.db
      .select({ id: listings.id })
      .from(listings)
      .where(and(inArray(listings.id, ids), eq(listings.vertical, vertical as 'uy-joy' | 'ish' | 'avto' | 'bepul')));
    return new Set(rows.map((r) => r.id));
  }

  async mine(user: AuthUser, status?: string) {
    const where = status
      ? and(eq(listings.userId, user.id), eq(listings.status, status as 'draft' | 'pending' | 'active' | 'sold' | 'archived' | 'blocked'))
      : eq(listings.userId, user.id);
    const rows = await this.db.select().from(listings).where(where).orderBy(desc(listings.createdAt)).limit(100);
    return this.hydrate(rows.map((r) => r.id));
  }

  async markSold(user: AuthUser, id: string) {
    const owned = await this.getOwned(user, id);
    await this.db.update(listings).set({ status: 'sold' }).where(eq(listings.id, id));
    // De-index so searches don't surface sold items, but the listing stays
    // reachable via its URL (and shows the SOTILDI stamp in the UI).
    await this.search.remove(id);
    // Notify everyone who was interested: favoriters + anyone with a chat
    // about this listing (excluding the owner). Fire-and-forget.
    void this.notifyInterested(id, owned.title, user.id).catch(() => {});
    return (await this.hydrate([id]))[0]!;
  }

  private async notifyInterested(listingId: string, title: string, sellerId: string) {
    const favRows = await this.db
      .select({ userId: favorites.userId })
      .from(favorites)
      .where(eq(favorites.listingId, listingId));
    const chatRows = await this.db
      .select({ buyerId: chats.buyerId })
      .from(chats)
      .where(eq(chats.listingId, listingId));
    const targets = new Set<string>();
    for (const r of favRows) if (r.userId !== sellerId) targets.add(r.userId);
    for (const r of chatRows) if (r.buyerId !== sellerId) targets.add(r.buyerId);
    for (const userId of targets) {
      await this.notifications.create(userId, 'listing_sold', { listingId, title });
    }
  }

  async reopen(user: AuthUser, id: string) {
    const existing = await this.getOwned(user, id);
    if (existing.status !== 'sold') return (await this.hydrate([id]))[0]!;
    await this.db.update(listings).set({ status: 'active' }).where(eq(listings.id, id));
    await this.indexOne(id);
    return (await this.hydrate([id]))[0]!;
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
      vertical: row.vertical,
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
