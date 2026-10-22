-- Phase 5E: admin-granted trust badge (Telegram-style ✓).
ALTER TABLE users ADD COLUMN IF NOT EXISTS trusted boolean NOT NULL DEFAULT false;
