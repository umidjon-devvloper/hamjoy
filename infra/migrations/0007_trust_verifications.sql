CREATE TABLE IF NOT EXISTS trust_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id_document_url text NOT NULL,
  selfie_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  note text,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trust_verifications_user_idx
  ON trust_verifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS trust_verifications_pending_idx
  ON trust_verifications (status, created_at DESC)
  WHERE status = 'pending';
