ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS reviews_visible_idx
  ON reviews (to_user_id, created_at DESC)
  WHERE hidden = false;
