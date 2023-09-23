SELECT *
FROM tasks
WHERE scheduled IS NOT NULL
  AND scheduled <= ?
