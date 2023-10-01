SELECT *
FROM tasks
WHERE completed IS NULL
  AND deleted IS NULL
  AND title LIKE ?
