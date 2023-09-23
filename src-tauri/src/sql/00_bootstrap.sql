CREATE TABLE IF NOT EXISTS database_metadata (
       version INTEGER PRIMARY KEY
);

-- Bootstrap the version to be 0, if a row does not yet exist.
INSERT INTO database_metadata (version)
SELECT 0
WHERE NOT EXISTS (SELECT * FROM database_metadata);

CREATE TABLE IF NOT EXISTS tasks (
       id INTEGER PRIMARY KEY,
       title TEXT NOT NULL,
       description TEXT NOT NULL,
       scheduled TEXT -- ISO 8601 encoded timezone-naive date.
);

CREATE TABLE IF NOT EXISTS links (
       from_id INTEGER,
       to_id INTEGER,

       FOREIGN KEY (from_id) REFERENCES tasks(id) ON DELETE CASCADE,
       FOREIGN KEY (to_id) REFERENCES tasks(id) ON DELETE CASCADE
);
