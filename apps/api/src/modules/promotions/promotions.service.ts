import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, gt, inArray, sql } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { listings, promotions } from '../../db/schema';
import type { AuthUser } from '../../common/current-user.decorator';
import { PROMO_TARIFFS, type PromoTier } from './dto';

type ActivePromo = {
  listingId: string;
  tier: PromoTier;
  expiresAt: Date;
};

@Injectable()
export class PromotionsService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  async start(user: AuthUser, listingId: string, tier: PromoTier, options: { admin?: boolean } = {}) {
    const [listing] = await this.db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
    if (!listing) throw new NotFoundException({ code: 'listing_not_found', message: "E'lon topilmadi" });
    if (listing.userId !== user.id && user.role === 'user') {
      throw new ForbiddenException({ code: 'forbidden', message: "O'z e'loningizni promote qila olasiz" });
    }

    const tariff = PROMO_TARIFFS[tier];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + tariff.durationDays * 86_400_000);

    // Admin grants are paid-at-zero (free top); regular users would normally
    // go through a payment flow first — we mock that for now by marking the
    // row paid immediately. Real integration lands in a later phase.
    const paidAt = options.admin || user.role === 'admin' ? null : new Date();
    const paidAmount = options.admin || user.role === 'admin' ? null : String(tariff.priceUzs);
    const paidCurrency = options.admin || user.role === 'admin' ? null : ('UZS' as const);

    const [row] = await this.db
      .insert(promotions)
      .values({
        listingId,
        tier,
        durationDays: tariff.durationDays,
        paidAmount,
        paidCurrency,
        paidAt,
        startedAt: now,
        expiresAt,
      })
      .returning();

    return row!;
  }

  /** Current active promo per listing (if any), ordered by strength (gold > silver > bronze). */
  async activeForListings(listingIds: string[]): Promise<Map<string, ActivePromo>> {
    if (listingIds.length === 0) return new Map();
    const now = new Date();
    const rows = await this.db
      .select()
      .from(promotions)
      .where(and(inArray(promotions.listingId, listingIds), gt(promotions.expiresAt, now)));

    const rank: Record<PromoTier, number> = { gold: 3, silver: 2, bronze: 1 };
    const best = new Map<string, ActivePromo>();
    for (const r of rows) {
      const prev = best.get(r.listingId);
      if (!prev || rank[r.tier as PromoTier] > rank[prev.tier]) {
        best.set(r.listingId, { listingId: r.listingId, tier: r.tier as PromoTier, expiresAt: r.expiresAt });
      }
    }
    return best;
  }

  /** All currently-promoted listingIds, ordered gold → silver → bronze → newest. */
  async topListingIds(limit = 50): Promise<Array<{ id: string; tier: PromoTier; expiresAt: Date }>> {
    const now = new Date();
    const rows = await this.db
      .select({
        id: promotions.listingId,
        tier: promotions.tier,
        expiresAt: promotions.expiresAt,
        createdAt: promotions.createdAt,
      })
      .from(promotions)
      .innerJoin(listings, eq(listings.id, promotions.listingId))
      .where(and(gt(promotions.expiresAt, now), eq(listings.status, 'active')))
      .orderBy(
        // ORDER BY: gold first, then silver, then bronze, then newer first
        sql`CASE promotions.tier WHEN 'gold' THEN 3 WHEN 'silver' THEN 2 ELSE 1 END DESC`,
        desc(promotions.createdAt),
      )
      .limit(limit);

    const seen = new Set<string>();
    const out: Array<{ id: string; tier: PromoTier; expiresAt: Date }> = [];
    for (const r of rows) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push({ id: r.id, tier: r.tier as PromoTier, expiresAt: r.expiresAt });
    }
    return out;
  }
}
