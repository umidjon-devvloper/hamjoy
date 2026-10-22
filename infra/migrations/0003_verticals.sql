-- Phase 5C: four product verticals (uy-joy / ish / avto / bepul).

-- 1. New enum values for listing_type.
ALTER TYPE listing_type ADD VALUE IF NOT EXISTS 'worker_offer';
ALTER TYPE listing_type ADD VALUE IF NOT EXISTS 'car_sale';
ALTER TYPE listing_type ADD VALUE IF NOT EXISTS 'car_salon';
ALTER TYPE listing_type ADD VALUE IF NOT EXISTS 'free_give';

-- 2. New enum: vertical.
DO $$ BEGIN
  CREATE TYPE vertical AS ENUM ('uy-joy', 'ish', 'avto', 'bepul');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Add vertical to categories (default to 'uy-joy', will be re-seeded).
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS vertical vertical NOT NULL DEFAULT 'uy-joy';

-- 4. Add vertical to listings. Default stays 'uy-joy' so existing rows get
--    a sensible value — then backfill from type below.
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS vertical vertical NOT NULL DEFAULT 'uy-joy';

-- 5. Backfill vertical from existing listing_type so old rows land in the
--    right bucket.
UPDATE listings SET vertical = 'ish'    WHERE type IN ('job', 'service', 'worker_offer');
UPDATE listings SET vertical = 'avto'   WHERE type IN ('car_sale', 'car_salon');
UPDATE listings SET vertical = 'bepul'  WHERE type = 'free_give';
-- 'rent' and 'sale' remain in 'uy-joy'.
