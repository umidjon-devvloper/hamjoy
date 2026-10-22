-- Phase 5F: public reviews — 5-star rating + short comment per transaction.

CREATE TABLE IF NOT EXISTS reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_user_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id    uuid REFERENCES listings(id) ON DELETE SET NULL,
  rating        integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text,
  created_at    timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reviews_to_user_idx ON reviews (to_user_id, created_at DESC);
-- Each (from, to, listing) tuple gets exactly one review. listing_id can be
-- NULL and NULL != NULL in btree, so profile-only reviews are unlimited; the
-- product rule only applies to per-listing reviews.
CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_pair
  ON reviews (from_user_id, to_user_id, listing_id);
