-- Enable PostGIS and add geo columns Drizzle schema cannot express directly.
-- Run this once after `pnpm --filter @joymee/api db:migrate` (or manually via psql).

CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE listings ADD COLUMN IF NOT EXISTS geo GEOGRAPHY(POINT, 4326);
CREATE INDEX IF NOT EXISTS listings_geo_gist ON listings USING GIST (geo);

ALTER TABLE locations ADD COLUMN IF NOT EXISTS geo GEOGRAPHY(POINT, 4326);
CREATE INDEX IF NOT EXISTS locations_geo_gist ON locations USING GIST (geo);
