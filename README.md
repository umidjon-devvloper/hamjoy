# Joymee

Marketplace monorepo — Next.js web, Expo mobile, NestJS API, umumiy TS SDK.

## Tuzilish

```
apps/
  web/        Next.js 16 (mavjud UI)
  mobile/     Expo React Native
  api/        NestJS + Drizzle + PostGIS
packages/
  types/      umumiy TS tiplar
  sdk/        API klient (web + mobile)
  config/     tsconfig / eslint
infra/
  compose/    Docker Compose (postgres+postgis, redis, meili, minio)
  migrations/ Drizzle SQL + PostGIS kengaytmasi
```

## Ishga tushirish

Avval zarur asboblar: Node 20+, pnpm 9+, Docker.

```bash
# bog'liqliklar
pnpm install

# baza + sidecar servislar
pnpm db:up

# env fayllarini sozlash
cp apps/api/.env.example apps/api/.env

# bazani yaratish
pnpm --filter @joymee/api db:push
psql $DATABASE_URL -f infra/migrations/0001_postgis.sql

# ishga tushirish (hammasi parallel)
pnpm dev
```

Keyin:
- Web — http://localhost:3000
- API — http://localhost:4000  (docs: `/docs`)
- Meilisearch — http://localhost:7700
- MinIO console — http://localhost:9001

## Komandalar

| Komanda | Nima qiladi |
|---|---|
| `pnpm dev` | Hammasini parallel ishga tushiradi (Turborepo) |
| `pnpm build` | Barcha paketlarni build qiladi |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript tekshiruvi |
| `pnpm test` | Vitest testlar |
| `pnpm db:up` / `db:down` | Docker Compose |
| `pnpm --filter @joymee/api db:migrate` | Migratsiyalar |

## Faza 0 holati

- [x] Monorepo (pnpm + Turborepo)
- [x] Mavjud Next.js kod → `apps/web`
- [x] `packages/types`, `packages/sdk`, `packages/config` skeleton
- [x] NestJS API skeleton (health + Swagger)
- [x] Drizzle schema (14 jadval) + PostGIS SQL
- [x] Expo mobile skeleton
- [x] Docker Compose (Postgres+PostGIS, Redis, Meilisearch, MinIO, Mailhog)
- [x] GitHub Actions CI (lint, typecheck, test, build)

Keyingi — **Faza 1**: NestJS auth modullari, listings CRUD, Meilisearch sync.
