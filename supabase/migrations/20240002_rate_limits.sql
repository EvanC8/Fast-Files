CREATE TABLE rate_limits (
  ip          TEXT PRIMARY KEY,
  count       INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
