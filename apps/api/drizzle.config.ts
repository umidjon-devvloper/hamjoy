import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: '../../infra/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://joymee:joymee@localhost:5432/joymee',
  },
  strict: true,
  verbose: true,
} satisfies Config;
