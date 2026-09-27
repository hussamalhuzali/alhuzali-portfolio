CREATE TABLE IF NOT EXISTS studio_content (
  id TEXT PRIMARY KEY CHECK (id = 'portfolio'),
  draft TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  published TEXT,
  published_at TEXT,
  commit_sha TEXT,
  publish_lock TEXT,
  publish_lock_at INTEGER
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  csrf TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS oauth_attempts (
  state TEXT PRIMARY KEY,
  verifier TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
