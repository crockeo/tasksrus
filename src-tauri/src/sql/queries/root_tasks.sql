SELECT *
FROM tasks
WHERE completed IS NULL
  AND deleted IS NULL
  AND EXISTS (SELECT * FROM links WHERE links.from_id = tasks.id)
  AND NOT EXISTS (SELECT * FROM links WHERE links.to_id = tasks.id)
