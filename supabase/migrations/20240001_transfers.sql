CREATE TABLE transfers (
  code         TEXT PRIMARY KEY,
  file_paths   TEXT[] NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  downloaded   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
-- All access is via Edge Functions using service_role key, not direct client access
