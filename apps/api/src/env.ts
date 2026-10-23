import { z } from 'zod';

const emptyToUndef = (v: unknown) => (v === '' ? undefined : v);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ORIGINS: z.string().transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)).default('http://localhost:3000'),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  MEILI_URL: z.string().url().default('http://localhost:7700'),
  MEILI_MASTER_KEY: z.string().default('joymee-dev-master-key'),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  // S3 / Cloudflare R2 — bucket is accessed via the S3 API; public URL base
  // is where uploaded objects are read from (usually the public R2 domain or
  // a custom domain in front of it).
  S3_ENDPOINT: z.preprocess(emptyToUndef, z.string().url().optional()),
  S3_BUCKET: z.preprocess(emptyToUndef, z.string().optional()),
  S3_ACCESS_KEY: z.preprocess(emptyToUndef, z.string().optional()),
  S3_SECRET_KEY: z.preprocess(emptyToUndef, z.string().optional()),
  S3_REGION: z.preprocess(emptyToUndef, z.string().optional()),
  S3_PUBLIC_URL: z.preprocess(emptyToUndef, z.string().url().optional()),

  ESKIZ_EMAIL: z.preprocess(emptyToUndef, z.string().email().optional()),
  ESKIZ_PASSWORD: z.preprocess(emptyToUndef, z.string().optional()),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
