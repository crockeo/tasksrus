SELECT *
FROM tasks
WHERE completed IS NOT NULL
  AND deleted IS NULL
ORDER BY completed DESC
