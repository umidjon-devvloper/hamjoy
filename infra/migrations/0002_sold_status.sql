-- Add 'sold' value to listing_status enum. Postgres enums are append-only;
-- we insert it after 'active' so the natural order reads
-- draft → pending → active → sold → archived → blocked.
ALTER TYPE listing_status ADD VALUE IF NOT EXISTS 'sold' AFTER 'active';
