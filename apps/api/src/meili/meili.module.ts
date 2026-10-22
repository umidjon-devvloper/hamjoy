import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { env } from '../env';

export const MEILI = Symbol('MEILI');
export type MeiliClient = MeiliSearch;

export const LISTINGS_INDEX = 'listings';

@Global()
@Module({
  providers: [
    {
      provide: MEILI,
      useFactory: () => new MeiliSearch({ host: env.MEILI_URL, apiKey: env.MEILI_MASTER_KEY }),
    },
  ],
  exports: [MEILI],
})
export class MeiliModule implements OnModuleInit {
  private readonly logger = new Logger('MeiliModule');

  async onModuleInit() {
    const client = new MeiliSearch({ host: env.MEILI_URL, apiKey: env.MEILI_MASTER_KEY });
    try {
      const existing = await client.getIndexes({ limit: 100 });
      const has = existing.results.some((i) => i.uid === LISTINGS_INDEX);
      if (!has) {
        await client.createIndex(LISTINGS_INDEX, { primaryKey: 'id' });
        this.logger.log(`Created Meili index "${LISTINGS_INDEX}"`);
      }
      await client.index(LISTINGS_INDEX).updateSettings({
        searchableAttributes: ['title', 'description'],
        filterableAttributes: ['type', 'vertical', 'categoryId', 'locationId', 'status', 'priceAmount', 'currency'],
        sortableAttributes: ['publishedAt', 'priceAmount', 'viewsCount'],
      });
    } catch (err) {
      this.logger.warn(`Meili not reachable at ${env.MEILI_URL}: ${(err as Error).message}`);
    }
  }
}
