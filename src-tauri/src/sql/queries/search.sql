SELECT *
FROM tasks
WHERE completed IS NULL
  AND title LIKE ?
