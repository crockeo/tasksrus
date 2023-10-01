ALTER TABLE tasks
ADD deleted TEXT;

UPDATE database_metadata
SET version = 2;
