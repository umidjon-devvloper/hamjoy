-- Phase 5D: paid promotion tiers.
-- Each listing can hold multiple promotion rows over time; "currently
-- promoted" is any row whose expires_at is still in the future.

DO $$ BEGIN
  CREATE TYPE promo_tier AS ENUM ('bronze', 'silver', 'gold');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS promotions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  tier            promo_tier NOT NULL,
  duration_days   integer NOT NULL,
  paid_amount     numeric(12, 2),
  paid_currency   currency,
  paid_at         timestamptz,
  started_at      timestamptz NOT NULL DEFAULT NOW(),
  expires_at      timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS promotions_listing_expires_idx
  ON promotions (listing_id, expires_at);
