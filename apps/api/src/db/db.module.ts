import { Global, Logger, Module, OnModuleDestroy } from '@nestjs/common';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';
import { env } from '../env';
import * as schema from './schema';

export const DB = Symbol('DB');
export type DbClient = PostgresJsDatabase<typeof schema>;

@Global()
@Module({
  providers: [
    {
      provide: DB,
      useFactory: () => {
        const sql: Sql = postgres(env.DATABASE_URL, {
          max: 10,
          idle_timeout: 20,
          onnotice: () => {},
        });
        return drizzle(sql, { schema });
      },
    },
    { provide: 'DB_SQL', useFactory: () => postgres(env.DATABASE_URL, { max: 1 }) },
  ],
  exports: [DB],
})
export class DbModule implements OnModuleDestroy {
  private readonly logger = new Logger('DbModule');

  async onModuleDestroy() {
    this.logger.log('Closing Postgres pool…');
  }
}
