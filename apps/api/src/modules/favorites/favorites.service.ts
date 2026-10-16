import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { favorites, listings } from '../../db/schema';

@Injectable()
export class FavoritesService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  async toggle(userId: string, listingId: string): Promise<{ favorited: boolean }> {
    const existing = await this.db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)))
      .limit(1);

    if (existing.length) {
      await this.db
        .delete(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.listingId, listingId)));
      await this.db
        .update(listings)
        .set({ favoritesCount: sql`greatest(${listings.favoritesCount} - 1, 0)` })
        .where(eq(listings.id, listingId));
      return { favorited: false };
    }

    await this.db.insert(favorites).values({ userId, listingId });
    await this.db
      .update(listings)
      .set({ favoritesCount: sql`${listings.favoritesCount} + 1` })
      .where(eq(listings.id, listingId));
    return { favorited: true };
  }

  async listMine(userId: string) {
    return this.db
      .select({ listing: listings, favoritedAt: favorites.createdAt })
      .from(favorites)
      .innerJoin(listings, eq(listings.id, favorites.listingId))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt))
      .limit(100);
  }
}
