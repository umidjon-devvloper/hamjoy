import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { count, desc, eq, sql } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { listings, listingMedia, profiles, reports, reviews, users } from '../../db/schema';

@Injectable()
export class AdminService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  async getStats() {
    const [[usersCount], [listingsCount], [pendingListings], [reportsOpen], [reviewsRow]] =
      await Promise.all([
        this.db.select({ count: count() }).from(users),
        this.db.select({ count: count() }).from(listings),
        this.db.select({ count: count() }).from(listings).where(eq(listings.status, 'pending')),
        this.db.select({ count: count() }).from(reports).where(eq(reports.status, 'open')),
        this.db.select({ count: count() }).from(reviews),
      ]);

    return {
      totalUsers: usersCount?.count ?? 0,
      totalListings: listingsCount?.count ?? 0,
      pendingListings: pendingListings?.count ?? 0,
      openReports: reportsOpen?.count ?? 0,
      totalReviews: reviewsRow?.count ?? 0,
    };
  }

  async listUsers(params?: { status?: string; search?: string }) {
    let query = this.db
      .select({
        id: users.id,
        phone: users.phone,
        email: users.email,
        role: users.role,
        status: users.status,
        trusted: users.trusted,
        createdAt: users.createdAt,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .orderBy(desc(users.createdAt))
      .limit(500)
      .$dynamic();

    if (params?.status) {
      query = query.where(eq(users.status, params.status as 'active' | 'blocked' | 'pending'));
    }

    const rows = await query;
    return rows.map((r) => ({
      id: r.id,
      phone: r.phone,
      email: r.email,
      role: r.role,
      status: r.status,
      trusted: r.trusted,
      createdAt: r.createdAt.toISOString(),
      name: r.fullName ?? 'Nomsiz',
      avatarUrl: r.avatarUrl,
    }));
  }

  async setUserStatus(userId: string, status: 'active' | 'blocked') {
    const [updated] = await this.db
      .update(users)
      .set({ status })
      .where(eq(users.id, userId))
      .returning();
    if (!updated) throw new NotFoundException({ code: 'user_not_found', message: 'Topilmadi' });
    return { id: updated.id, status: updated.status };
  }

  async listListings(params?: { status?: string }) {
    let where: ReturnType<typeof eq> | undefined;
    if (params?.status) {
      where = eq(listings.status, params.status as 'draft' | 'pending' | 'active' | 'sold' | 'archived' | 'blocked');
    }

    const rows = await this.db
      .select({
        id: listings.id,
        userId: listings.userId,
        type: listings.type,
        vertical: listings.vertical,
        title: listings.title,
        status: listings.status,
        priceAmount: listings.priceAmount,
        priceCurrency: listings.priceCurrency,
        locationId: listings.locationId,
        viewsCount: listings.viewsCount,
        createdAt: listings.createdAt,
        publishedAt: listings.publishedAt,
        ownerName: profiles.fullName,
      })
      .from(listings)
      .leftJoin(profiles, eq(profiles.userId, listings.userId))
      .where(where ?? sql`true`)
      .orderBy(desc(listings.createdAt))
      .limit(500);

    const listingIds = rows.map((r) => r.id);
    let mediaMap = new Map<string, string>();
    if (listingIds.length > 0) {
      const mediaRows = await this.db
        .select({ listingId: listingMedia.listingId, url: listingMedia.url })
        .from(listingMedia)
        .where(sql`${listingMedia.listingId} = ANY(${listingIds})`)
        .orderBy(listingMedia.order);
      for (const m of mediaRows) {
        if (!mediaMap.has(m.listingId)) mediaMap.set(m.listingId, m.url);
      }
    }

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      type: r.type,
      vertical: r.vertical,
      title: r.title,
      status: r.status,
      priceAmount: r.priceAmount,
      priceCurrency: r.priceCurrency,
      locationId: r.locationId,
      viewsCount: r.viewsCount,
      createdAt: r.createdAt.toISOString(),
      publishedAt: r.publishedAt?.toISOString() ?? null,
      ownerName: r.ownerName ?? 'Nomsiz',
      image: mediaMap.get(r.id) ?? null,
    }));
  }
}
