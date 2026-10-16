import { Inject, Injectable, Logger } from '@nestjs/common';
import type { MeiliSearch, SearchParams } from 'meilisearch';
import { MEILI, LISTINGS_INDEX } from '../../meili/meili.module';
import type { SearchQueryDto } from './dto';

export interface ListingSearchDoc {
  id: string;
  type: string;
  categoryId: number;
  locationId: number;
  title: string;
  description: string;
  priceAmount: number | null;
  currency: string | null;
  status: string;
  publishedAt: number | null;
  viewsCount: number;
  geo?: { lat: number; lng: number } | null;
}

@Injectable()
export class ListingsSearch {
  private readonly logger = new Logger('ListingsSearch');

  constructor(@Inject(MEILI) private readonly meili: MeiliSearch) {}

  private get index() {
    return this.meili.index<ListingSearchDoc>(LISTINGS_INDEX);
  }

  async upsert(doc: ListingSearchDoc): Promise<void> {
    try {
      await this.index.addDocuments([doc], { primaryKey: 'id' });
    } catch (err) {
      this.logger.warn(`Meili upsert failed: ${(err as Error).message}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.index.deleteDocument(id);
    } catch (err) {
      this.logger.warn(`Meili delete failed: ${(err as Error).message}`);
    }
  }

  async search(q: SearchQueryDto): Promise<{ ids: string[]; total: number }> {
    const filters: string[] = ['status = "active"'];
    if (q.type) filters.push(`type = "${q.type}"`);
    if (q.categoryId) filters.push(`categoryId = ${q.categoryId}`);
    if (q.locationId) filters.push(`locationId = ${q.locationId}`);
    if (q.currency) filters.push(`currency = "${q.currency}"`);
    if (q.priceMin != null) filters.push(`priceAmount >= ${q.priceMin}`);
    if (q.priceMax != null) filters.push(`priceAmount <= ${q.priceMax}`);

    const params: SearchParams = {
      limit: q.limit,
      offset: q.cursor ? Number(q.cursor) : 0,
      filter: filters.join(' AND '),
      sort: ['publishedAt:desc'],
      attributesToRetrieve: ['id'],
    };

    try {
      const res = await this.index.search(q.q ?? '', params);
      return {
        ids: res.hits.map((h) => h.id),
        total: res.estimatedTotalHits ?? res.hits.length,
      };
    } catch (err) {
      this.logger.warn(`Meili search failed, falling back empty: ${(err as Error).message}`);
      return { ids: [], total: 0 };
    }
  }
}
