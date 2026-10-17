import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { DB, type DbClient } from '../../db/db.module';
import { applications, listings } from '../../db/schema';

@Injectable()
export class ApplicationsService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  async apply(userId: string, listingId: string, coverLetter: string | null) {
    const [listing] = await this.db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
    if (!listing) throw new NotFoundException({ code: 'listing_not_found', message: "E'lon topilmadi" });
    if (listing.userId === userId) {
      throw new BadRequestException({ code: 'self_apply', message: "O'z e'loningizga ariza bera olmaysiz" });
    }

    const [existing] = await this.db
      .select()
      .from(applications)
      .where(and(eq(applications.listingId, listingId), eq(applications.userId, userId)))
      .limit(1);
    if (existing) {
      throw new BadRequestException({ code: 'already_applied', message: 'Siz allaqachon ariza bergansiz' });
    }

    const [created] = await this.db
      .insert(applications)
      .values({ listingId, userId, coverLetter })
      .returning();
    return created!;
  }

  async listMine(userId: string) {
    return this.db
      .select({ app: applications, listing: listings })
      .from(applications)
      .leftJoin(listings, eq(listings.id, applications.listingId))
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt))
      .limit(100);
  }

  async listReceived(ownerId: string) {
    const myListings = await this.db
      .select({ id: listings.id })
      .from(listings)
      .where(eq(listings.userId, ownerId));
    if (myListings.length === 0) return [];

    const ids = myListings.map((l) => l.id);
    return this.db
      .select()
      .from(applications)
      .where(inArray(applications.listingId, ids))
      .orderBy(desc(applications.createdAt))
      .limit(200);
  }

  async updateStatus(ownerId: string, id: string, status: 'pending' | 'viewed' | 'accepted' | 'rejected') {
    const [app] = await this.db.select().from(applications).where(eq(applications.id, id)).limit(1);
    if (!app) throw new NotFoundException({ code: 'app_not_found', message: 'Ariza topilmadi' });

    const [listing] = await this.db.select().from(listings).where(eq(listings.id, app.listingId)).limit(1);
    if (!listing || listing.userId !== ownerId) {
      throw new ForbiddenException({ code: 'forbidden', message: 'Bu arizani boshqara olmaysiz' });
    }

    const [updated] = await this.db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return updated!;
  }
}
