CREATE TABLE IF NOT EXISTS database_metadata (
  version INTEGER PRIMARY KEY
);

-- Bootstrap the version to be 0, if a row does not yet exist.
INSERT INTO database_metadata (version)
SELECT 1
WHERE NOT EXISTS (SELECT * FROM database_metadata);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  scheduled TEXT NOT NULL, -- One of: `anytime`, `someday`, or ISO 8601 encoded timezone-naive date.
  completed TEXT
);

CREATE TABLE IF NOT EXISTS links (
  from_id INTEGER,
  to_id INTEGER,

  UNIQUE(from_id, to_id),
  FOREIGN KEY (from_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (to_id) REFERENCES tasks(id) ON DELETE CASCADE
);
